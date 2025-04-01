import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import config from "./config";
import { tmpdir } from "os";
import { join } from "path/posix";
import { writeFile, mkdir } from "fs/promises";
import { randomBytes } from "crypto";

// Create S3 client
const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId || "",
        secretAccessKey: config.aws.secretAccessKey || "",
    },
    // Force path style addressing to prevent PermanentRedirect errors
    forcePathStyle: true,
    // Use endpoint if provided in config
    ...(config.aws.endpoint ? { endpoint: config.aws.endpoint } : {}),
    // Disable auto-region detection which can cause redirect issues
    useArnRegion: false,
    // Add additional options to handle different S3-compatible services
    followRegionRedirects: true,
    maxAttempts: 3
});

const mimeFromExtension = (extension: string) => {
    switch (extension) {
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'svg':
            return 'image/svg+xml';
        case 'ico':
            return 'image/x-icon';
        default:
            return 'image/webp';
    }
}

export async function uploadToS3(
    buffer: Buffer,
    deploymentId: string,
    suffix: string,
    mimeType?: string
): Promise<string> {
    try {
        // Generate a clean filename
        const key = `${deploymentId}/${suffix}`;

        // Log detailed info for debugging
        console.log(`S3 Upload Info - Bucket: ${config.aws.bucket}, Region: ${config.aws.region}`);
        if (config.aws.endpoint) {
            console.log(`Using custom endpoint: ${config.aws.endpoint}`);
        }

        // Create upload parameters
        const params = {
            Bucket: config.aws.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType ? mimeFromExtension(mimeType) : "image/webp",
        };

        // Upload to S3
        console.log(`Uploading screenshot to S3: ${key}`);
        const upload = new Upload({
            client: s3Client,
            params,
        });

        await upload.done();

        console.log(`Screenshot uploaded to S3: ${key}`);
        return key;
    } catch (error) {
        console.error("Error uploading to S3:", error);

        // Provide more detailed error information
        if (error.name === 'PermanentRedirect' && error.message.includes('endpoint')) {
            console.error(`S3 Redirect Error: The bucket must be accessed via a specific endpoint.`);
            console.error(`Try setting S3_ENDPOINT_URL with the endpoint mentioned in the error message.`);
            console.error(`Current region: ${config.aws.region}, Bucket: ${config.aws.bucket}`);
        }

        throw error;
    }
}

// output path
export async function downloadFromS3ToTempDir(key: string): Promise<[string, string]> {
    const params = {
        Bucket: config.aws.bucket,
        Key: key,
    };

    const tempDir = tmpdir();
    const randomDirName = randomBytes(16).toString('hex');
    const downloadDir = join(tempDir, randomDirName);
    
    // Create the random directory
    await mkdir(downloadDir, { recursive: true });
    
    const tempFilePath = join(downloadDir, "car.zip");

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const fileStream = response.Body?.transformToWebStream();
    if (!fileStream) {
        throw new Error("Failed to download file from S3");
    }
    await writeFile(tempFilePath, fileStream);
    return [downloadDir, tempFilePath];
}
