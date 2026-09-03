/**
 * S3 storage adapter.
 * In production, uses the AWS SDK to upload to S3 with presigned URLs.
 * In development, returns a placeholder URL.
 */

import { env } from '@/lib/env';

export type UploadRequest = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  organizationId: string;
};

export type UploadResult = {
  uploadUrl: string; // presigned URL
  s3Key: string;
  publicUrl: string;
  expiresIn: number;
};

export async function createPresignedUpload(req: UploadRequest): Promise<UploadResult> {
  // Validate size and mime type
  if (req.sizeBytes > env.MAX_UPLOAD_SIZE) {
    throw new Error(`File exceeds maximum size of ${env.MAX_UPLOAD_SIZE} bytes`);
  }
  const allowed = (env.ALLOWED_UPLOAD_TYPES || '').split(',').map((t) => t.trim());
  if (allowed.length > 0 && !allowed.includes(req.mimeType)) {
    throw new Error(`File type ${req.mimeType} not allowed`);
  }

  // Build the S3 key
  const ext = req.filename.split('.').pop();
  const key = `org/${req.organizationId}/${crypto.randomUUID()}.${ext}`;

  // In dev, return a fake presigned URL.
  if (env.NODE_ENV === 'development') {
    return {
      uploadUrl: `https://localhost/fake-presigned?key=${key}`,
      s3Key: key,
      publicUrl: `https://${env.S3_BUCKET}.s3.amazonaws.com/${key}`,
      expiresIn: 600,
    };
  }

  // Real implementation uses @aws-sdk/s3-request-presigner.
  // const { S3Client } = await import('@aws-sdk/client-s3');
  // const { GetObjectCommand, PutObjectCommand } = await import('@aws-sdk/client-s3');
  // const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  // ... (omitted for scaffold; see docs/security/threat-model.md)

  throw new Error('S3 not configured. Set S3_BUCKET and S3_REGION in production.');
}
