import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { dbManager } from "../db";

const router = Router();

// In-memory active tokens store (persists while server runs)
const activeTokens = new Set<string>();

// Pre-authorize a standard default token so dev/demo logins work smoothly
const DEFAULT_AUTH_TOKEN = "bismillah-staff-token-786";
activeTokens.add(DEFAULT_AUTH_TOKEN);

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized: Missing authentication credentials" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ error: "Unauthorized: Invalid authorization format" });
    return;
  }

  const token = parts[1];
  if (!activeTokens.has(token) && token !== DEFAULT_AUTH_TOKEN) {
    res.status(403).json({ error: "Forbidden: Session expired or invalid token" });
    return;
  }

  next();
};

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const { pin, password, username } = req.body;
  const inputPin = String(pin || password || "").trim();

  // Accepted staff credentials
  const validPins = ["786", "bismillah786", "admin", "1234"];

  if (validPins.includes(inputPin.toLowerCase())) {
    const sessionToken = "bme_" + crypto.randomBytes(24).toString("hex");
    activeTokens.add(sessionToken);

    dbManager.addAuditLog(
      "STAFF_LOGIN",
      "Authentication",
      `Staff authenticated successfully (${username || "Haji Saud Staff"})`,
      undefined,
      username || "Haji Saud Staff"
    );

    res.json({
      success: true,
      token: sessionToken,
      user: {
        username: username || "Haji Saud Zehri Staff",
        role: "admin",
        permissions: ["read", "write", "delete", "publish", "settings"],
      },
      message: "Authentication successful",
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid staff PIN. Use '786' or 'admin'.",
    });
  }
});

// GET /api/auth/me
router.get("/me", requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: {
      username: "Haji Saud Zehri Staff",
      role: "admin",
    },
  });
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      activeTokens.delete(token);
    }
  }
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
