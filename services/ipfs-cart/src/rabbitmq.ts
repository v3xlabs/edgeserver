/// <reference types="bun-types" />

import * as amqp from "amqplib";
import config from "./config";
import { downloadFromS3ToTempDir, uploadToS3 } from "./s3";
import { CarRequest, CarResponse } from "./types";
import { rm } from "fs/promises";
import { join } from "path/posix";
import AdmZip from "adm-zip";
import { readdir } from "fs/promises";
import { createCarFile } from "./car";
import { mkdir } from "fs/promises";
import { uploadCar } from "./uploadCar";

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

        await channel.assertQueue(config.rabbitmq.reject_queue, {
            durable: true,
        });
        await channel.assertQueue(config.rabbitmq.result_queue, {
            durable: true,
        });

        await channel.bindQueue(
            config.rabbitmq.reject_queue,
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
                    const content = JSON.parse(msg.content.toString()) as CarRequest;

                    // Check if message has retry count in headers
                    const headers = msg.properties.headers || {};
                    const retryCount = headers.retryCount || 0;

                    console.log(`Received message (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, content);

                    // Process screenshot request
                    const response = await processCarRequest(content);

                    if (response.success) {
                        // Output the response
                        console.log("Processing complete:", response);

                        // send response to rabbitmq
                        channel.publish(
                            "",
                            config.rabbitmq.result_queue,
                            Buffer.from(JSON.stringify(response)),
                            { headers: { retryCount: 0 } }
                        );

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
async function processCarRequest(
    request: CarRequest
): Promise<CarResponse> {
    console.log("Processing car request:", request);

    const [tempDir, zipPath] = await downloadFromS3ToTempDir(request.file_path);

    console.log("Downloaded car to temp dir:", tempDir);

    const deployment_id = request.deployment_id;

    let outputFilePath: string;
    let outputCID: string;

    try {
        const outputDir = join(tempDir, "output");
        await mkdir(outputDir, { recursive: true });

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(outputDir, true);
        
        // Clean up the zip file after extraction
        await rm(zipPath);

        // console log the contents of the temp dir
        console.log("Contents of temp dir:", await readdir(join(tempDir, "output")));

        // Create the CAR file from the output directory
        const carFilePath = join(tempDir, "output.car");
        const rootCID = await createCarFile(outputDir, carFilePath);

        // Upload the CAR file back to S3
        const s3Key = await uploadToS3(
            Buffer.from(await Bun.file(carFilePath).arrayBuffer()),
            request.deployment_id,
            "deploy.car",
        );

        console.log("CAR file uploaded to S3:", s3Key);
        console.log("Root CID:", rootCID);

        // upload to ipfs cluster
        console.log("Uploading CAR file to IPFS cluster...");
        
        const ipfsResponse = await uploadCar(carFilePath);

        console.log("IPFS response:", ipfsResponse);

        outputFilePath = s3Key;
        outputCID = rootCID;
    } catch (error) {
        console.error("Error processing car request:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error), deployment_id };
    } finally {
        // delete temp dir
        await rm(tempDir, { recursive: true, force: true });
    }

    if (!outputFilePath || !outputCID) {
        return { success: false, error: "Error processing car request", deployment_id };
    }

    return { success: true, cid: outputCID, file_path: outputFilePath, deployment_id };
} 
