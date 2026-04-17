import { Storage } from "@google-cloud/storage";
import { logger } from "./logger";
import crypto from "crypto";

// Initialize storage client
// In GCP (Cloud Run), this automatically picks up the default service account credentials.
// For local development, it will look for GOOGLE_APPLICATION_CREDENTIALS environment variable.
const storage = new Storage();

// You should configure your bucket name in your .env / GCP Secrets
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "dene-media-bucket";

export const uploadFileToCloud = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "avatars"
): Promise<string> => {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Generate unique filename
    const ext = originalName.split(".").pop();
    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${folder}/${hash}-${Date.now()}.${ext}`;

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        logger.error(`Error uploading to GCS: ${err.message}`);
        reject(err);
      });

      blobStream.on("finish", () => {
        // Construct the public URL
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;
        resolve(publicUrl);
      });

      blobStream.end(fileBuffer);
    });
  } catch (error: any) {
    logger.error(`GCS Upload Exception: ${error.message}`);
    throw new Error("Failed to upload file to Cloud Storage");
  }
};
