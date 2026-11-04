import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { MediaItem } from "../types";
import { isMongoConnected, getMongoStatus, connectToMongoAtlas } from "../db/mongodb";
import { MediaAssetModel } from "../models/MediaAsset";
import { escapeRegex } from "../utils/search";
import { 
  isCloudinaryConfigured, 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  getCloudinaryStatus 
} from "../utils/cloudinary";

const router = Router();
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to check references of an image URL in properties and homepage content
export const checkImageUsage = (imageUrl: string): { inUse: boolean; count: number; places: string[] } => {
  const db = dbManager.getDb();
  const places: string[] = [];

  // Check properties
  db.properties.forEach((p) => {
    if (p.image === imageUrl) {
      places.push(`Property main image: "${p.title}"`);
    }
    if (p.gallery && p.gallery.includes(imageUrl)) {
      places.push(`Property gallery: "${p.title}"`);
    }
  });

  // Check homepage
  if (db.homepage?.hero?.backgroundImage === imageUrl) {
    places.push("Homepage Hero background");
  }
  if (db.homepage?.about?.ownerImage === imageUrl) {
    places.push("Homepage About Haji Saud portrait");
  }
  if (db.homepage?.gallery?.some((g) => g.url === imageUrl)) {
    places.push("Homepage Curated Gallery");
  }

  // Check branding
  if (db.settings?.branding?.mainLogo === imageUrl) {
    places.push("Global Website Logo");
  }

  return {
    inUse: places.length > 0,
    count: places.length,
    places,
  };
};

// GET /api/media/status - Cloudinary and database storage status
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    cloudinary: getCloudinaryStatus(),
    database: getMongoStatus(),
  });
});

// POST /api/media/retry-mongo - Attempt reconnecting to MongoDB Atlas
router.post("/retry-mongo", async (_req: Request, res: Response) => {
  const success = await connectToMongoAtlas();
  res.json({
    success,
    database: getMongoStatus(),
  });
});

// GET /api/media - Get media library items
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;

    if (isMongoConnected()) {
      const query: any = {};
      if (category && category !== "all") {
        query.category = category;
      }
      if (search && typeof search === "string" && search.trim() !== "") {
        const q = escapeRegex(search.trim());
        query.$or = [
          { title: { $regex: q, $options: "i" } },
          { fileName: { $regex: q, $options: "i" } },
          { altText: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ];
      }

      const mongoItems = await MediaAssetModel.find(query).sort({ createdAt: -1 }).lean();
      if (mongoItems && mongoItems.length > 0) {
        const enriched = mongoItems.map((item: any) => {
          const usage = checkImageUsage(item.url || item.secureUrl);
          return {
            ...item,
            id: item.id || String(item._id),
            url: item.secureUrl || item.url,
            usageCount: usage.count,
          };
        });

        res.json({
          success: true,
          source: "MongoDB Atlas",
          data: enriched,
          total: enriched.length,
        });
        return;
      }
    }

    // Fallback: Local database
    const db = dbManager.getDb();
    let list = [...db.media];

    if (category && category !== "all") {
      list = list.filter((m) => m.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.fileName.toLowerCase().includes(q) ||
          m.altText.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    const enriched = list.map((item) => {
      const usage = checkImageUsage(item.url);
      return {
        ...item,
        usageCount: usage.count,
      };
    });

    res.json({
      success: true,
      source: "Local Storage",
      data: enriched,
      total: enriched.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list media: " + err.message });
  }
});

// POST /api/media/upload - Upload a new image to Cloudinary
router.post("/upload", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { base64Data, fileName, title, altText, caption, category } = req.body;

    if (!base64Data || typeof base64Data !== "string") {
      res.status(400).json({ error: "Missing image data (base64Data is required)" });
      return;
    }

    // Validate MIME type
    const matches = base64Data.match(/^data:([A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!matches) {
      res.status(400).json({ error: "Image data must be a valid base64 data URI." });
      return;
    }

    const mimeType = matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], "base64");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!allowed.includes(mimeType)) {
      res.status(400).json({ error: "Unsupported image format. Supported formats: JPEG, PNG, WebP, AVIF, and GIF." });
      return;
    }

    const imageHeader = buffer
      .toString("utf8", 0, Math.min(buffer.length, 1024))
      .replace(/^\uFEFF/, "")
      .trimStart();
    if (/<svg\b|<!DOCTYPE\s+svg/i.test(imageHeader)) {
      res.status(400).json({ error: "SVG images are not supported." });
      return;
    }

    let ext = "jpg";
    if (mimeType === "image/png") ext = "png";
    else if (mimeType === "image/webp") ext = "webp";
    else if (mimeType === "image/avif") ext = "avif";
    else if (mimeType === "image/gif") ext = "gif";

    // Max 15MB file size limit
    if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
      if (buffer.length === 0) {
        res.status(400).json({ error: "Image data is empty." });
        return;
      }
      res.status(400).json({ error: "Image size exceeds 15MB limit." });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(503).json({ error: "Cloudinary storage is not configured. No media record was saved." });
      return;
    }

    const uniqueId = crypto.randomBytes(8).toString("hex");
    const sanitizedName = (fileName || "image").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const now = new Date().toISOString();
    let cloudResult: Awaited<ReturnType<typeof uploadToCloudinary>>;
    try {
      cloudResult = await uploadToCloudinary(base64Data, {
        folder: "bismillah_apartments",
        category: category || "General",
      });
    } catch (cloudErr) {
      console.error(
        "[Cloudinary] Image upload failed:",
        cloudErr instanceof Error ? cloudErr.name : "Unknown error"
      );
      res.status(502).json({ error: "Cloudinary image upload failed. No media record was saved." });
      return;
    }
    if (!cloudResult.secureUrl || !cloudResult.publicId) {
      res.status(502).json({ error: "Cloudinary returned incomplete image details. No media record was saved." });
      return;
    }

    const mediaRecord: MediaItem = {
      id: `med-${Date.now()}-${uniqueId}`,
      fileName: fileName || `${sanitizedName}.${ext}`,
      originalName: fileName || `${sanitizedName}.${ext}`,
      url: cloudResult.secureUrl,
      cloudinaryPublicId: cloudResult.publicId,
      mimeType,
      sizeBytes: buffer.length,
      category: category || "General",
      title: title || sanitizedName,
      altText: altText || title || "Bismillah Real Estate photo",
      caption: caption || "",
      uploadedAt: now,
      usageCount: 0,
    };

    const mongoConnected = isMongoConnected();
    const localDb = dbManager.getDb();
    let mongoSaved = false;
    let localSaved = false;
    try {
      if (mongoConnected) {
        await MediaAssetModel.create({
          id: mediaRecord.id,
          url: cloudResult.secureUrl,
          secureUrl: cloudResult.secureUrl,
          publicId: cloudResult.publicId,
          format: cloudResult.format,
          fileName: mediaRecord.fileName,
          originalName: mediaRecord.originalName,
          mimeType,
          sizeBytes: cloudResult.sizeBytes,
          category: mediaRecord.category,
          title: mediaRecord.title,
          altText: mediaRecord.altText,
          caption: mediaRecord.caption,
          uploadedAt: now,
          usageCount: 0,
          storageProvider: "cloudinary",
        });
        mongoSaved = true;
      }

      localDb.media.unshift(mediaRecord);
      dbManager.saveDb(localDb);
      localSaved = true;
    } catch (saveErr) {
      if (localSaved || localDb.media[0]?.id === mediaRecord.id) {
        localDb.media = localDb.media.filter((item) => item.id !== mediaRecord.id);
      }

      let mongoRollbackSucceeded = true;
      if (mongoSaved) {
        try {
          await MediaAssetModel.deleteOne({ id: mediaRecord.id });
        } catch (rollbackErr) {
          mongoRollbackSucceeded = false;
          console.error("[Media] MongoDB rollback failed after upload persistence error:", rollbackErr);
        }
      }

      if (mongoRollbackSucceeded) {
        try {
          await deleteFromCloudinary(cloudResult.publicId);
        } catch (cleanupErr) {
          console.error("[Media] Cloudinary cleanup failed after persistence error:", cleanupErr);
        }
      }

      console.error("[Media] Failed to persist uploaded image:", saveErr);
      res.status(500).json({ error: "Failed to save media record after upload." });
      return;
    }

    try {
      dbManager.addAuditLog(
        "UPLOAD_IMAGE",
        "MediaLibrary",
        `Uploaded image "${mediaRecord.fileName}" via Cloudinary`,
        mediaRecord.id
      );
    } catch (auditErr) {
      console.error("[Media] Image was saved but its audit log could not be recorded:", auditErr);
    }

    res.status(201).json({
      success: true,
      data: mediaRecord,
      storageProvider: "cloudinary",
      message: "Image uploaded successfully via Cloudinary CDN",
    });
  } catch (err: any) {
    console.error("Upload error", err);
    res.status(500).json({ error: "Failed to upload image: " + (err.message || String(err)) });
  }
});

// PUT /api/media/:id - Edit image metadata
router.put("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, altText, caption, category } = req.body || {};
    const updates = { title, altText, caption, category };

    if (Object.values(updates).some((value) => value !== undefined && typeof value !== "string")) {
      res.status(400).json({ error: "Media metadata fields must be strings." });
      return;
    }

    const db = dbManager.getDb();
    const existingLocalItem = db.media.find((media) => media.id === id);
    const mongoDoc = isMongoConnected() ? await MediaAssetModel.findOne({ id }) : null;
    if (!existingLocalItem && !mongoDoc) {
      res.status(404).json({ error: "Media item not found" });
      return;
    }

    if (mongoDoc) {
      const result = await MediaAssetModel.updateOne({ id }, { $set: updates });
      if (result.matchedCount === 0) {
        res.status(404).json({ error: "Media item not found" });
        return;
      }
    }

    const item: MediaItem = existingLocalItem
      ? { ...existingLocalItem }
      : {
          id: mongoDoc!.id,
          fileName: mongoDoc!.fileName,
          originalName: mongoDoc!.originalName,
          url: mongoDoc!.secureUrl || mongoDoc!.url,
          cloudinaryPublicId: mongoDoc!.publicId,
          mimeType: mongoDoc!.mimeType,
          sizeBytes: mongoDoc!.sizeBytes,
          category: mongoDoc!.category,
          title: mongoDoc!.title,
          altText: mongoDoc!.altText,
          caption: mongoDoc!.caption,
          uploadedAt: mongoDoc!.uploadedAt,
          usageCount: mongoDoc!.usageCount,
        };
    if (title !== undefined) item.title = title;
    if (altText !== undefined) item.altText = altText;
    if (caption !== undefined) item.caption = caption;
    if (category !== undefined) item.category = category;

    const localIndex = db.media.findIndex((media) => media.id === id);
    if (localIndex === -1) db.media.unshift(item);
    else db.media[localIndex] = item;

    try {
      dbManager.saveDb(db);
    } catch (saveErr) {
      if (!mongoDoc) throw saveErr;
      console.error("[Media] MongoDB metadata was saved but the local mirror failed:", saveErr);
    }

    try {
      dbManager.addAuditLog("UPDATE_MEDIA_METADATA", "MediaLibrary", `Updated metadata for "${item.fileName}"`, id);
    } catch (auditErr) {
      console.error("[Media] Metadata was saved but its audit log could not be recorded:", auditErr);
    }

    res.json({
      success: true,
      data: item,
      message: "Image metadata updated successfully",
    });
  } catch (err) {
    console.error("[Media] Failed to update media metadata:", err);
    res.status(500).json({ error: "Failed to update media metadata." });
  }
});

// DELETE /api/media/:id - Delete image with Cloudinary cleanup and in-use check
router.delete("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const db = dbManager.getDb();
    const index = db.media.findIndex((m) => m.id === id);

    let item = index !== -1 ? db.media[index] : null;
    let cloudinaryPublicId: string | undefined;

    if (isMongoConnected()) {
      const doc = await MediaAssetModel.findOne({ id });
      if (doc) {
        if (!item) {
          item = {
            id: doc.id,
            fileName: doc.fileName,
            originalName: doc.originalName,
            url: doc.secureUrl || doc.url,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes,
            category: doc.category,
            title: doc.title,
            altText: doc.altText,
            caption: doc.caption,
            uploadedAt: doc.uploadedAt,
          };
        }
        cloudinaryPublicId = doc.publicId;
      }
    }

    if (!item) {
      res.status(404).json({ error: "Media item not found" });
      return;
    }

    const usage = checkImageUsage(item.url);

    // If in use and not forced, prevent accidental removal
    if (usage.inUse && force !== "true") {
      res.status(409).json({
        error: `Cannot delete image because it is actively used in ${usage.count} location(s).`,
        inUse: true,
        places: usage.places,
        message: "Pass ?force=true to override and delete anyway.",
      });
      return;
    }

    // 1. Delete from Cloudinary if public ID exists
    const publicIdToDelete = cloudinaryPublicId || item.cloudinaryPublicId;
    if (publicIdToDelete) {
      await deleteFromCloudinary(publicIdToDelete);
    }

    if (isMongoConnected()) {
      await MediaAssetModel.deleteOne({ id });
    }

    // 2. Remove physical file if in local uploads directory
    if (item.url.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), item.url);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (err) {
          console.warn("Could not delete physical file:", localPath, err);
        }
      }
    }

    if (index !== -1) {
      db.media.splice(index, 1);
      dbManager.saveDb(db);
    }

    dbManager.addAuditLog("DELETE_MEDIA", "MediaLibrary", `Deleted image "${item.fileName}"`, id);

    res.json({
      success: true,
      message: `Image "${item.fileName}" removed from media library and storage service`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete media: " + err.message });
  }
});

export default router;
