import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { v4 as uuidv4 } from 'uuid';

export const generatePresignedUploadUrl = async (patientId, filename, contentType) => {
  try {
    const fileKey = `uploads/${patientId}/${uuidv4()}_${filename}`;
    const bucketName = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      uploadUrl,
      key: fileKey,
    };
  } catch (error) {
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

export const generatePresignedDownloadUrl = async (fileKey) => {
  try {
    const bucketName = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return downloadUrl;
  } catch (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
};

export default {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
};
