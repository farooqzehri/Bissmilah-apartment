import "dotenv/config";
import express from "express";
import path from "node:path";
import app from "./server/app";

const isVercel = Boolean(process.env.VERCEL);

if (process.env.NODE_ENV === "production") {
  if (!isVercel) {
    const distDirectory = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDirectory));
    app.get("*", (_req, res, next) => {
      res.sendFile(path.join(distDirectory, "index.html"), (error) => {
        if (error) next(error);
      });
    });
  }
} else if (!isVercel) {
  void startDevelopmentServer();
}

async function startDevelopmentServer(): Promise<void> {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    await vite.close();
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }

  const server = app.listen(port, () => {
    console.log(`Bismillah app running at http://localhost:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    void vite.close();
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other process or set PORT to a free port.`);
      return;
    }

    console.error("Failed to start the local server:", error);
    process.exitCode = 1;
  });
}

export default app;
