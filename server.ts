import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import authRouter from "./server/routes/auth";
import settingsRouter from "./server/routes/settings";
import homepageRouter from "./server/routes/homepage";
import propertiesRouter from "./server/routes/properties";
import mediaRouter from "./server/routes/media";
import pagesRouter from "./server/routes/pages";
import enquiriesRouter from "./server/routes/enquiries";
import auditRouter from "./server/routes/audit";
import { connectToMongoAtlas, getMongoStatus } from "./server/db/mongodb";
import { getCloudinaryStatus } from "./server/utils/cloudinary";

dotenv.config();

function getCliArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return undefined;
}

const cliPort = getCliArg("--port");
const cliHost = getCliArg("--host");
const PORT = parseInt(cliPort || process.env.PORT || "3000", 10);
const HOST = cliHost || process.env.HOST || "0.0.0.0";
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();

  // Connect to MongoDB Atlas in the background so port binding happens instantly
  connectToMongoAtlas().catch((err) => {
    console.warn("[MongoDB Atlas] Background connection notice:", err?.message || err);
  });

  // Middleware for large base64 image uploads & JSON payloads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Ensure uploads directory exists and is statically served
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // Mount API routers
  app.use("/api/auth", authRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/homepage", homepageRouter);
  app.use("/api/properties", propertiesRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/pages", pagesRouter);
  app.use("/api/enquiries", enquiriesRouter);
  app.use("/api/audit-logs", auditRouter);

  // Health & System Status check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Bismillah Real Estate CMS Backend",
      database: getMongoStatus(),
      cloudinary: getCloudinaryStatus(),
    });
  });

  // Dynamic robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n`);
  });

  // Fallback 404 handler for any unmatched /api routes (Always return JSON, never HTML)
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global API error handler (Always return JSON, never HTML)
  app.use("/api", (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[API Error]", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error occurred",
    });
  });

  // Mount Vite development middlewares or production static serving
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`  ➜  [Bismillah CMS] Server successfully running on port ${PORT}\n`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
