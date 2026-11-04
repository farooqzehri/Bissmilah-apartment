
import express from "express";
import path from "path";
import fs from "fs";

import authRouter from "./routes/auth";
import settingsRouter from "./routes/settings";
import homepageRouter from "./routes/homepage";
import propertiesRouter from "./routes/properties";
import mediaRouter from "./routes/media";
import pagesRouter from "./routes/pages";
import enquiriesRouter from "./routes/enquiries";
import auditRouter from "./routes/audit";

import {
  connectToMongoAtlas,
  getMongoStatus,
} from "./db/mongodb";

import { getCloudinaryStatus } from "./utils/cloudinary";

const app = express();

// Start MongoDB connection
connectToMongoAtlas().catch((err) => {
  console.warn(
    "[MongoDB Atlas] Background connection notice:",
    err?.message || err
  );
});

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Uploads
const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      res.setHeader("X-Content-Type-Options", "nosniff");

      if (path.extname(filePath).toLowerCase() === ".svg") {
        res.setHeader("Content-Disposition", "attachment");
        res.setHeader(
          "Content-Security-Policy",
          "default-src 'none'; sandbox"
        );
      }
    },
  })
);

// API routes
app.use("/api/auth", authRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/homepage", homepageRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/audit-logs", auditRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Bismillah Real Estate CMS Backend",
    database: getMongoStatus(),
    cloudinary: getCloudinaryStatus(),
  });
});

// robots.txt
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(
    "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n"
  );
});

// API fallback
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// API error handler
app.use(
  "/api",
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[API Error]", err);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error occurred",
    });
  }
);

export default app;
