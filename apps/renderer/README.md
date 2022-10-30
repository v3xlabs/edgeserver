# edge-renderer

## Goals

* [ ] Docker Container
* [ ] CI/CD Pipeline
* [x] Redis Queue
* [x] Generate Screenshot
* [x] Store blobs in Redis

* [ ]  Store different resolution images, cache them for different amounts

### Resizing Example

Small resolution image for deployment previews
High resolution image for the latest deploy only (as app preview)


## Example Retrivieing Image

```ts
import fs from 'node:fs';
import { createClient } from 'redis';

// Create a client for Redis
const client = createClient({
    url: 'redis://localhost:6379',
});

// You _can_ get the type like this but this is hard to do for all types:
export type RedisClientType = ReturnType<typeof createClient>;

(async () => {
    // Connect to Redis
    await client.connect();

    // Get the raw image stroed in binary from from Redis
    const data = await client.hGet('images:example.com', '1920x1080');

    if (!data) return;

    // Create buffer from the raw image
    const result = Buffer.from(data, 'binary');

    // Write the buffer to a file
    fs.writeFileSync('result.webp', result);

    console.log('done');
    
    // Close the client
    await client.quit();
})();
```