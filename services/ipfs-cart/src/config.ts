import { Config } from "./types";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

// Default configuration values
const defaultConfig: Config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "car",
    result_queue: process.env.RABBITMQ_RESULT_QUEUE || "car_results",
    reject_queue: process.env.RABBITMQ_REJECT_QUEUE || "car_rejects",
  },
  aws: {
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET_NAME || "",
    endpoint: process.env.S3_ENDPOINT_URL || undefined,
  },
  ipfsCluster: {
    url: process.env.IPFS_CLUSTER_URL || "http://0.0.0.0:9094",
  },
};

export default defaultConfig; 
