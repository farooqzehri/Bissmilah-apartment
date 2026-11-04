import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { dbManager } from "../db";
import { isMongoConnected } from "../db/mongodb";

const router = Router();
const INSECURE_JWT_SECRETS = new Set([
  "bismillah_default_secret_786_key",
  "bismillah_super_secret_jwt_key_786",
  "super_secret_jwt_key_bismillah_786_california_luxury",
]);
const INSECURE_ADMIN_PINS = new Set(["786", "bismillah786", "admin", "1234"]);
const revokedTokens = new Map<string, number>();

const pruneRevokedTokens = (): void => {
  const now = Date.now();
  for (const [tokenId, expiresAt] of revokedTokens) {
    if (expiresAt <= now) revokedTokens.delete(tokenId);
  }
};

const getJwtSecret = (): string | undefined => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32 || INSECURE_JWT_SECRETS.has(secret)) {
    return undefined;
  }
  return secret;
};

const getAdminPin = (): string | undefined => {
  const pin = process.env.ADMIN_PIN?.trim();
  if (!pin || pin.length < 8 || INSECURE_ADMIN_PINS.has(pin.toLowerCase())) {
    return undefined;
  }
  return pin;
};

const isValidAdminPin = (candidate: string, expected: string): boolean => {
  const candidateHash = crypto.createHash("sha256").update(candidate).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(candidateHash, expectedHash);
};

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const secret = getJwtSecret();
  if (!secret || !getAdminPin()) {
    res.status(503).json({ error: "Admin authentication is not configured securely" });
    return;
  }

  const authHeader = req.headers.authorization;
  const tokenMatch = authHeader?.match(/^Bearer\s+(\S+)$/);
  if (!tokenMatch) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid authentication credentials" });
    return;
  }

  try {
    const decoded = jwt.verify(tokenMatch[1], secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.role !== "admin" || !decoded.jti) {
      res.status(401).json({ error: "Unauthorized: Invalid admin session" });
      return;
    }

    const revokedUntil = revokedTokens.get(decoded.jti);
    if (revokedUntil && revokedUntil > Date.now()) {
      res.status(401).json({ error: "Unauthorized: Admin session has been logged out" });
      return;
    }
    if (revokedUntil) {
      revokedTokens.delete(decoded.jti);
    }

    (req as Request & { user?: jwt.JwtPayload }).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: Session expired or invalid" });
  }
};

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  const expectedPin = getAdminPin();
  const secret = getJwtSecret();

  if (!expectedPin || !secret) {
    res.status(503).json({
      success: false,
      error: "Admin authentication is not configured securely. Set ADMIN_PIN and JWT_SECRET.",
    });
    return;
  }

  const suppliedPin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
  if (!suppliedPin || !isValidAdminPin(suppliedPin, expectedPin)) {
    res.status(401).json({ success: false, error: "Invalid staff passcode" });
    return;
  }

  try {
    pruneRevokedTokens();
    const username = process.env.ADMIN_USERNAME?.trim() || "admin";
    const user = {
      username,
      role: "admin",
      permissions: ["read", "write", "delete", "publish", "settings"],
    };
    const sessionToken = jwt.sign(user, secret, {
      algorithm: "HS256",
      jwtid: crypto.randomUUID(),
      expiresIn: "7d",
    });

    dbManager.addAuditLog(
      "STAFF_LOGIN",
      "Authentication",
      `Staff authenticated successfully (${username})`,
      undefined,
      username
    );

    res.json({
      success: true,
      token: sessionToken,
      user,
      database: isMongoConnected() ? "MongoDB Atlas" : "Local Storage",
      message: "Authentication successful",
    });
  } catch (err) {
    console.error("[Auth] Failed to create admin session:", err);
    res.status(500).json({ success: false, error: "Unable to create admin session" });
  }
});

// POST /api/auth/logout
router.post("/logout", requireAdminAuth, (req: Request, res: Response) => {
  const user = (req as Request & { user?: jwt.JwtPayload }).user;
  if (user?.jti && user.exp) {
    pruneRevokedTokens();
    revokedTokens.set(user.jti, user.exp * 1000);
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
    user: (req as Request & { user?: jwt.JwtPayload }).user,
    database: isMongoConnected() ? "MongoDB Atlas" : "Local Storage",
  });
});

export default router;
