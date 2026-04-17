import express, { Request, Response } from "express";
import multer from "multer";
import { uploadFileToCloud } from "../utils/gcs";
import { protect, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

const router = express.Router();

// Configure multer to keep files in memory (perfect for direct passthrough to GCP)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// ─── POST /api/v1/upload/avatar ─────────────────────────────────
router.post(
  "/avatar",
  protect,
  upload.single("image"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image file provided" });
    }

    logger.info(`User ${req.userId} uploading avatar...`);
    
    // Upload the file to Cloud Storage
    const publicUrl = await uploadFileToCloud(req.file.buffer, req.file.originalname, "avatars");

    res.status(200).json({
      success: true,
      url: publicUrl,
      message: "Image uploaded successfully to Google Cloud Storage",
    });
  })
);

export default router;
