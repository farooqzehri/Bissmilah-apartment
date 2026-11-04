import "dotenv/config";

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server/app";

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

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: {
          ignored: [
            "**/data/**",
            "**/uploads/**",
            "**/dist/**",
            "**/.git/**",
            "**/server/data/**",
          ],
        },
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
    console.log(`Bismillah CMS running at http://${HOST}:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
 http://${HOST}:${PORT}/`);
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
