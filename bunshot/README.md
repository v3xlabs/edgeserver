# Bunshot

A Bun service that takes screenshots of websites and uploads them to S3.

## Overview

This service:

1. Connects to a RabbitMQ queue
2. Listens for messages in the format `{ domain: "", site_id: "", extra: "" }`
3. Takes a screenshot of the specified domain using Puppeteer
4. Uploads the screenshot to S3
5. Marks the item as processed in RabbitMQ
6. Implements a retry strategy (up to 4 retries) for failed requests

## Requirements

-   [Bun](https://bun.sh/) (for local development)
-   Docker (for containerized deployment)
-   RabbitMQ server
-   AWS S3 bucket with appropriate credentials

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```
# RabbitMQ Configuration
RABBITMQ_URL=amqp://user:password@localhost:5672
RABBITMQ_QUEUE=screenshots

# AWS S3 Configuration
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your-bucket-name
# Optional: Custom S3 endpoint for S3-compatible storage
S3_ENDPOINT_URL=https://your-custom-endpoint.com

# Screenshot Settings
SCREENSHOT_WIDTH=1920
SCREENSHOT_HEIGHT=1080
SCREENSHOT_QUALITY=80
SCREENSHOT_TIMEOUT=30000

# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/edgeserver
```

## Installation & Development

### Local Development

1. Install dependencies:

    ```bash
    bun install
    ```

2. Start the service:

    ```bash
    bun run start
    ```

3. For development with auto-restart:
    ```bash
    bun run dev
    ```

### Docker Deployment

1. Build the Docker image:

    ```bash
    docker build -t bunshot .
    ```

2. Run the container:
    ```bash
    docker run -d --name bunshot \
      --env-file .env \
      bunshot
    ```

## Message Format

Send messages to the RabbitMQ queue in the following format:

```json
{
    "domain": "example.com",
    "site_id": "unique-site-identifier",
    "deployment_id": "unique-deployment-identifier",
    "extra": "optional-metadata"
}
```

> **Note**: The `site_id` and `deployment_id` must exist in the database tables before the screenshot is saved.

## S3 Storage Format

Screenshots are stored in S3 with the following path structure:

```
{site_id}/{deployment_id}/{domain}_{timestamp}.jpg
```

## Database Integration

The service inserts records into the `deployment_previews` table with the following fields:
- `site_id` - The site identifier
- `deployment_id` - The deployment identifier
- `file_path` - The S3 path where the screenshot is stored
- `mime_type` - The MIME type of the file (always "image/jpeg")

## Architecture

-   `src/index.ts` - Entry point
-   `src/config.ts` - Configuration management
-   `src/rabbitmq.ts` - RabbitMQ connection and message handling
-   `src/screenshot.ts` - Puppeteer screenshot functionality
-   `src/s3.ts` - AWS S3 upload functionality
-   `src/database.ts` - PostgreSQL database operations
-   `src/types.ts` - TypeScript interfaces

## Retry Strategy

The service implements a robust retry strategy:

1. When a screenshot or upload fails, the message is retried up to 4 times
2. Each retry uses exponential backoff to avoid overwhelming services
3. After 4 failed retries, the message is moved to a "failed-screenshots" queue
4. Failed messages include metadata about the failure for debugging

## Troubleshooting

### Common Issues

1. **Connection Error**: Check RabbitMQ server URL and credentials
2. **S3 Upload Failure**:
    - Verify S3 credentials and bucket permissions
    - For PermanentRedirect errors, set the correct `S3_ENDPOINT_URL` for your bucket
    - Ensure the bucket region in `S3_REGION` matches the actual bucket region
3. **Screenshot Timeout**: Adjust `SCREENSHOT_TIMEOUT` for slow websites

### Logs

Check container logs for detailed error messages:

```bash
docker logs bunshot
```
