import { connectRabbitMQ } from "./rabbitmq";

async function main() {
  console.log("Starting bunshot service...");

  try {
    // Connect to RabbitMQ and start processing messages
    await connectRabbitMQ();
    console.log("Bunshot service is running. Press CTRL+C to exit.");

  } catch (error) {
    console.error("Failed to start bunshot service:", error);
    process.exit(1);
  }
}

// Start the application
main(); 