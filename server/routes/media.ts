import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { MediaItem } from "../types";

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
  if (db.homepage.hero.backgroundImage === imageUrl) {
    places.push("Homepage Hero background");
  }
  if (db.homepage.about.ownerImage === imageUrl) {
    places.push("Homepage About Haji Saud portrait");
  }
  if (db.homepage.gallery.some((g) => g.url === imageUrl)) {
    places.push("Homepage Curated Gallery");
  }

  // Check branding
  if (db.settings.branding.mainLogo === imageUrl) {
    places.push("Global Website Logo");
  }

  return {
    inUse: places.length > 0,
    count: places.length,
    places,
  };
};

// GET /api/media - Get media library items
router.get("/", (req: Request, res: Response) => {
  const { search, category } = req.query;
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

  // Enrich with active usage counts
  const enriched = list.map((item) => {
    const usage = checkImageUsage(item.url);
    return {
      ...item,
      usageCount: usage.count,
    };
  });

  res.json({
    success: true,
    data: enriched,
    total: enriched.length,
  });
});

// POST /api/media/upload - Upload new image (base64 or URL import)
router.post("/upload", requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { base64Data, fileName, title, altText, caption, category } = req.body;

    if (!base64Data || typeof base64Data !== "string") {
      res.status(400).json({ error: "Missing image data (base64Data is required)" });
      return;
    }

    // Match MIME type from data URL
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let buffer: Buffer;
    let ext = "jpg";

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");

      // Validate allowed mime types
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
      if (!allowed.includes(mimeType)) {
        res.status(400).json({ error: `Unsupported image format (${mimeType}). Supported: JPEG, PNG, WebP, AVIF, SVG.` });
        return;
      }

      if (mimeType === "image/png") ext = "png";
      else if (mimeType === "image/webp") ext = "webp";
      else if (mimeType === "image/avif") ext = "avif";
      else if (mimeType === "image/gif") ext = "gif";
      else if (mimeType === "image/svg+xml") ext = "svg";
    } else {
      // Raw buffer or direct base64
      buffer = Buffer.from(base64Data, "base64");
    }

    // File size validation (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: "Image size exceeds 10MB limit." });
      return;
    }

    // Generate unique storage filename
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const sanitizedName = (fileName || "image").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const storageFileName = `${sanitizedName}_${Date.now()}_${uniqueId}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, storageFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${storageFileName}`;
    const now = new Date().toISOString();

    const mediaRecord: MediaItem = {
      id: `med-${Date.now()}-${uniqueId}`,
      fileName: storageFileName,
      originalName: fileName || storageFileName,
      url: publicUrl,
      mimeType,
      sizeBytes: buffer.length,
      category: category || "General",
      title: title || sanitizedName,
      altText: altText || title || "Bismillah Real Estate photo",
      caption: caption || "",
      uploadedAt: now,
      usageCount: 0,
    };

    const db = dbManager.getDb();
    db.media.unshift(mediaRecord);
    dbManager.saveDb(db);
    dbManager.addAuditLog("UPLOAD_IMAGE", "MediaLibrary", `Uploaded image "${mediaRecord.fileName}"`, mediaRecord.id);

    res.status(201).json({
      success: true,
      data: mediaRecord,
      message: "Image uploaded and stored successfully",
    });
  } catch (err: any) {
    console.error("Upload error", err);
    res.status(500).json({ error: "Failed to upload image: " + (err.message || String(err)) });
  }
});

// PUT /api/media/:id - Edit image metadata
router.put("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, altText, caption, category } = req.body;
  const db = dbManager.getDb();

  const item = db.media.find((m) => m.id === id);
  if (!item) {
    res.status(404).json({ error: "Media item not found" });
    return;
  }

  if (title !== undefined) item.title = title;
  if (altText !== undefined) item.altText = altText;
  if (caption !== undefined) item.caption = caption;
  if (category !== undefined) item.category = category;

  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_MEDIA_METADATA", "MediaLibrary", `Updated metadata for "${item.fileName}"`, id);

  res.json({
    success: true,
    data: item,
    message: "Image metadata updated successfully",
  });
});

// DELETE /api/media/:id - Delete image with in-use safety verification
router.delete("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { force } = req.query;
  const db = dbManager.getDb();

  const index = db.media.findIndex((m) => m.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Media item not found" });
    return;
  }

  const item = db.media[index];
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

  // Remove physical file if in uploads directory
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

  db.media.splice(index, 1);
  dbManager.saveDb(db);
  dbManager.addAuditLog("DELETE_MEDIA", "MediaLibrary", `Deleted image "${item.fileName}"`, id);

  res.json({
    success: true,
    message: `Image "${item.fileName}" removed from media library`,
  });
});

export default router;
