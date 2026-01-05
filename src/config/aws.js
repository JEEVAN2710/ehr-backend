import { S3Client } from '@aws-sdk/client-s3';

// Support both AWS S3 and Cloudflare R2
const isR2 = !!process.env.R2_ENDPOINT;

export const s3Client = new S3Client({
  region: isR2 ? 'auto' : (process.env.AWS_REGION || 'us-east-1'),
  endpoint: process.env.R2_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
  // R2 requires path-style addressing
  forcePathStyle: isR2,
});

if (isR2) {
  console.log(`✓ R2 Storage configured`);
  console.log(`✓ Bucket: ${process.env.R2_BUCKET_NAME || process.env.S3_BUCKET}`);
} else {
  console.log(`✓ AWS S3 configured`);
  console.log(`✓ Region: ${process.env.AWS_REGION}`);
}

export default s3Client;
