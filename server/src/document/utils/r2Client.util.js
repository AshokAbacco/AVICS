//server\src\document\utils\r2Client.util.js
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME

// Builds a traceable key: cases/2026/MVC-2026-000001/victim/<victimId>/aadhaar-card-<uuid>.pdf
export function buildObjectKey({ caseNumber, entityType, entityId, documentName, extension }) {
  const year = new Date().getFullYear()
  const slug = documentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const uid = Date.now().toString(36)
  const scope = entityType === 'case' ? 'case' : `${entityType}/${entityId}`
  return `cases/${year}/${caseNumber}/${scope}/${slug}-${uid}.${extension}`
}

export async function uploadToR2(buffer, objectKey, mimeType) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: mimeType,
  }))
  return { bucket: BUCKET, objectKey }
}

export async function deleteFromR2(objectKey) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey }))
}

// Bucket stays private — this is the only way the frontend gets a usable
// link, and it expires per R2_SIGNED_URL_EXPIRY.
export async function getSignedDownloadUrl(objectKey) {
  const expiresIn = Number(process.env.R2_SIGNED_URL_EXPIRY || 300)
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: objectKey })
  return getSignedUrl(r2, command, { expiresIn })
}