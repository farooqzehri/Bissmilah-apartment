import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { dbManager } from "../db";
import { isMongoConnected } from "../db/mongodb";
import { AdminUserModel } from "../models/AdminUser";

const router = Router();

const activeTokens = new Set<string>();
const DEFAULT_AUTH_TOKEN = "bismillah-staff-token-786";
activeTokens.add(DEFAULT_AUTH_TOKEN);

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "bismillah_default_secret_786_key";
};

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

  // 1. Direct match with active session or default token
  if (activeTokens.has(token) || token === DEFAULT_AUTH_TOKEN) {
    next();
    return;
  }

  // 2. Validate JWT token if signed
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded) {
      (req as any).user = decoded;
      next();
      return;
    }
  } catch {
    // JWT verification failed
  }

  res.status(403).json({ error: "Forbidden: Session expired or invalid admin token" });
};

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { pin, password, username } = req.body;
  const inputPin = String(pin || password || "").trim().toLowerCase();

  const standardPins = ["786", "bismillah786", "admin", "1234"];
  let isValid = standardPins.includes(inputPin);
  let adminRecord: any = null;

  // Check against MongoDB Atlas if connected
  if (isMongoConnected()) {
    try {
      adminRecord = await AdminUserModel.findOne({
        $or: [{ pin: inputPin }, { username: username || "admin" }],
      });
      if (adminRecord && adminRecord.pin === inputPin) {
        isValid = true;
      }
    } catch (err) {
      console.warn("MongoDB auth check warning:", err);
    }
  }

  if (isValid) {
    // Sign JWT token
    const tokenPayload = {
      username: username || adminRecord?.username || "Haji Saud Zehri Staff",
      role: adminRecord?.role || "admin",
      permissions: adminRecord?.permissions || ["read", "write", "delete", "publish", "settings"],
    };

    const sessionToken = jwt.sign(tokenPayload, getJwtSecret(), { expiresIn: "7d" });
    activeTokens.add(sessionToken);

    // Update lastLogin in MongoDB if connected
    if (adminRecord) {
      adminRecord.lastLogin = new Date();
      adminRecord.save().catch(() => {});
    }

    dbManager.addAuditLog(
      "STAFF_LOGIN",
      "Authentication",
      `Staff authenticated successfully (${tokenPayload.username})`,
      undefined,
      tokenPayload.username
    );

    res.json({
      success: true,
      token: sessionToken,
      user: tokenPayload,
      database: isMongoConnected() ? "MongoDB Atlas" : "Local Storage",
      message: "Authentication successful",
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid staff PIN. Use '786' or 'admin'.",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    activeTokens.delete(token);
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET /api/auth/me - Verify current session
router.get("/me", requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: (req as any).user || {
      username: "Haji Saud Zehri Staff",
      role: "admin",
      permissions: ["read", "write", "delete", "publish", "settings"],
    },
    database: isMongoConnected() ? "MongoDB Atlas" : "Local Storage",
  });
});

export default router;
