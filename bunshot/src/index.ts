import { connectRabbitMQ } from "./rabbitmq";
import { initDatabase, closeDatabase } from "./database";

async function main() {
  console.log("Starting bunshot service...");
  
  try {
    // Initialize database connection
    console.log("Initializing database connection...");
    await initDatabase();
    
    // Connect to RabbitMQ and start processing messages
    await connectRabbitMQ();
    console.log("Bunshot service is running. Press CTRL+C to exit.");
    
    // Set up graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('Shutting down gracefully...');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start bunshot service:", error);
    process.exit(1);
  }
}

// Start the application
main(); 