import * as amqp from "amqplib";
import config from "./config";
import { ScreenshotRequest, ScreenshotResponse } from "./types";
import { takeScreenshot } from "./screenshot";
import { uploadToS3 } from "./s3";
import { insertDeploymentPreview } from "./database";

// Maximum number of retries before marking a message as failed
const MAX_RETRIES = 4;

// Connect to RabbitMQ
export async function connectRabbitMQ() {
  try {
    console.log(`Connecting to RabbitMQ at ${config.rabbitmq.url}`);
    const connection = await amqp.connect(config.rabbitmq.url);
    const channel = await connection.createChannel();

    // Create the main queue
    await channel.assertQueue(config.rabbitmq.queue, {
      durable: true,
    });

    // Create a dead letter exchange and queue for failed messages
    await channel.assertExchange("dead-letter-exchange", "direct", {
      durable: true,
    });
    
    await channel.assertQueue("failed-screenshots", {
      durable: true,
    });
    
    await channel.bindQueue(
      "failed-screenshots",
      "dead-letter-exchange",
      "screenshot-failure"
    );

    console.log(`Connected to RabbitMQ, consuming from queue: ${config.rabbitmq.queue}`);
    
    // Set prefetch to 1 so we only process one message at a time
    await channel.prefetch(1);

    // Start consuming messages
    await channel.consume(
      config.rabbitmq.queue,
      async (msg) => {
        if (!msg) return;

        try {
          // Parse the message content
          const content = JSON.parse(msg.content.toString()) as ScreenshotRequest;
          
          // Check if message has retry count in headers
          const headers = msg.properties.headers || {};
          const retryCount = headers.retryCount || 0;
          
          console.log(`Received message (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, content);

          // Process screenshot request
          const response = await processScreenshotRequest(content);
          
          if (response.success) {
            // Output the response
            console.log("Processing complete:", response);
            // Acknowledge the message
            channel.ack(msg);
          } else {
            console.error(`Processing failed: ${response.error}`);
            
            if (retryCount < MAX_RETRIES) {
              // Negative acknowledge and requeue with increased retry count
              const newHeaders = { ...headers, retryCount: retryCount + 1 };
              
              setTimeout(() => {
                channel.publish(
                  "",
                  config.rabbitmq.queue,
                  msg.content,
                  { headers: newHeaders }
                );
                // Ack the original message
                channel.ack(msg);
              }, 5000 * (retryCount + 1)); // Exponential backoff
            } else {
              console.error(`Message processing failed after ${MAX_RETRIES} retries`);
              
              // Send to dead letter queue
              channel.publish(
                "dead-letter-exchange",
                "screenshot-failure",
                msg.content,
                { 
                  headers: { 
                    ...headers,
                    failedAt: new Date().toISOString(),
                    error: response.error 
                  }
                }
              );
              
              // Acknowledge the original message since we've moved it to the failed queue
              channel.ack(msg);
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);
          
          // Get retry count
          const headers = msg.properties.headers || {};
          const retryCount = headers.retryCount || 0;
          
          if (retryCount < MAX_RETRIES) {
            // Negative acknowledge and requeue with increased retry count
            const newHeaders = { ...headers, retryCount: retryCount + 1 };
            
            setTimeout(() => {
              channel.publish(
                "",
                config.rabbitmq.queue,
                msg.content,
                { headers: newHeaders }
              );
              // Ack the original message
              channel.ack(msg);
            }, 5000 * (retryCount + 1)); // Exponential backoff
          } else {
            console.error(`Message processing failed after ${MAX_RETRIES} retries`);
            
            // Send to dead letter queue
            channel.publish(
              "dead-letter-exchange",
              "screenshot-failure",
              msg.content,
              { 
                headers: { 
                  ...headers,
                  failedAt: new Date().toISOString(),
                  error: error instanceof Error ? error.message : String(error)
                }
              }
            );
            
            // Acknowledge the original message
            channel.ack(msg);
          }
        }
      },
      { noAck: false }
    );

    // Handle connection close
    process.on("SIGINT", async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    });

    return { connection, channel };
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
}

// Process a screenshot request
async function processScreenshotRequest(
  request: ScreenshotRequest
): Promise<ScreenshotResponse> {
  const response: ScreenshotResponse = {
    domain: request.domain,
    site_id: request.site_id,
    deployment_id: request.deployment_id,
    success: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Take screenshot
    const screenshotResult = await takeScreenshot(request.domain);

    if (!screenshotResult.success || !screenshotResult.buffer || !screenshotResult.full_screenshot) {
      response.error = screenshotResult.error || "Failed to take screenshots";
      return response;
    }

    // Upload to S3
    const s3Path = await uploadToS3(
      screenshotResult.buffer,
      request.site_id,
      request.deployment_id,
      request.domain
    );

    const full_s3Path = await uploadToS3(
      screenshotResult.full_screenshot,
      request.site_id,
      request.deployment_id,
      request.domain,
      'full'
    );

    const favicon_s3Path = screenshotResult.favicon ? await uploadToS3(
      screenshotResult.favicon,
      request.site_id,
      request.deployment_id,
      request.domain,
      'favicon',
      screenshotResult.faviconType
    ) : null;

    // Update response
    response.success = true;
    response.s3Path = s3Path;

    console.log("Screenshot saved to S3: ", config.aws.endpoint + '/' + config.aws.bucket + '/' + s3Path);
    
    // Insert record into deployment_previews table
    try {
      await insertDeploymentPreview(
        request.site_id,
        request.deployment_id,
        s3Path,
        full_s3Path,
        favicon_s3Path,
        'image/webp'
      );
      console.log("Database record created for deployment preview");
    } catch (dbError) {
      console.error("Failed to save to database, but screenshot was successful:", dbError);
      // We still consider the operation a success since the screenshot and upload worked
    }

    return response;
  } catch (error) {
    console.error("Error processing screenshot request:", error);
    response.error = error instanceof Error ? error.message : String(error);
    return response;
  }
} 