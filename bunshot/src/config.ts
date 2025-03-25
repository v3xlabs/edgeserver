import { Config } from "./types";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// Default configuration values
const defaultConfig: Config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "screenshots",
  },
  aws: {
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET_NAME || "",
    endpoint: process.env.S3_ENDPOINT_URL || undefined,
  },
  screenshot: {
    width: parseInt(process.env.SCREENSHOT_WIDTH || "1920", 10),
    height: parseInt(process.env.SCREENSHOT_HEIGHT || "1080", 10),
    quality: parseInt(process.env.SCREENSHOT_QUALITY || "80", 10),
    timeout: parseInt(process.env.SCREENSHOT_TIMEOUT || "30000", 10),
  },
  database: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/edgeserver",
  },
};

export default defaultConfig; 