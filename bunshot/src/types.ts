// RabbitMQ message structure
export interface ScreenshotRequest {
  domain: string;
  site_id: string;
  deployment_id: string;
  extra?: string;
}

// Response after processing
export interface ScreenshotResponse {
  domain: string;
  site_id: string;
  deployment_id: string;
  success: boolean;
  timestamp: string;
  s3Path?: string;
  error?: string;
}

// Screenshot result
export interface ScreenshotResult {
  success: boolean;
  buffer?: Buffer;
  full_screenshot?: Buffer;
  error?: string;
  favicon?: Buffer;
}

// Configuration interface
export interface Config {
  rabbitmq: {
    url: string;
    queue: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint?: string;
  };
  screenshot: {
    width: number;
    height: number;
    quality: number;
    timeout: number;
  };
  database: {
    url: string;
  };
}

// Database types
export interface DeploymentPreview {
  site_id: string;
  deployment_id: string;
  file_path: string;
  mime_type: string;
} 