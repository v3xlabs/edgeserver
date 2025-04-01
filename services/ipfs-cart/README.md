# ipfs-cart

> This service is optional. But required for ipfs functionality.

Converts a directory of files into a CAR file in preparation for uploading to IPFS-Cluster.

This crate runs a node environment that uses [ipfs-car](https://github.com/storacha/ipfs-car) to convert a directory of files into a CAR file.

## Overview

1. Await rabbitmq task
2. Download files from s3
3. Convert files to CAR using `ipfs-car pack path/to/files --output path/to/output.car`
4. Upload CAR file to IPFS-Cluster
5. Update rabbitmq task with IPFS-Cluster's returned CID payload

   ```json
   {
    "name": "output.car",
    "cid": "bafybeif2sldbfsczcctnh72hld76tfkftm3vrxw***",
    "bytes": 4849920,
    "allocations": [
        "12D3KooWCdQWewrApEbcCvkSyC8uj5fQLNkaUrnwEn929E***"
    ]
   }
   ```

## Environment Variables

- `RABBITMQ_URL`: The URL of the RabbitMQ server.
- `RABBITMQ_QUEUE`: The name of the queue to listen for messages on.

- `S3_BUCKET`: The name of the S3 bucket to upload the CAR file to.
- `S3_ENDPOINT_URL`: The URL of the S3 endpoint.
- `S3_REGION`: The region of the S3 endpoint.
- `S3_PATH_PREFIX`: The prefix of the path to upload the CAR file to (default to 'car/')
