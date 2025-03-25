import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import config from "./config";

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

export async function uploadToS3(
  buffer: Buffer,
  siteId: string,
  deploymentId: string,
  domain: string
): Promise<string> {
  try {
    // Generate a clean filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cleanDomain = domain.replace(/[^a-zA-Z0-9]/g, "-");
    const key = `${siteId}/${deploymentId}/${cleanDomain}_${timestamp}.webp`;

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
      ContentType: "image/webp",
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