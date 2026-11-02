import crypto from "crypto";
import type { Request, Response } from "express";

const validPins = new Set(["786", "bismillah786", "admin", "1234"]);

export default function login(req: Request, res: Response): void {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as
    | { pin?: unknown; password?: unknown; username?: unknown }
    | null
    | undefined;
  const inputPin = String(body?.pin || body?.password || "").trim();

  if (!validPins.has(inputPin.toLowerCase())) {
    res.status(401).json({
      success: false,
      error: "Invalid staff PIN. Use '786' or 'admin'.",
    });
    return;
  }

  const username =
    typeof body?.username === "string" && body.username.trim()
      ? body.username.trim()
      : "Haji Saud Zehri Staff";

  res.status(200).json({
    success: true,
    token: `bme_${crypto.randomBytes(24).toString("hex")}`,
    user: {
      username,
      role: "admin",
      permissions: ["read", "write", "delete", "publish", "settings"],
    },
    message: "Authentication successful",
  });
}
