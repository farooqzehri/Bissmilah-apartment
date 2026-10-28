import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";

const router = Router();

// GET /api/audit-logs - Admin inspection of activity logs
router.get("/", requireAdminAuth, (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({
    success: true,
    data: db.auditLogs,
    total: db.auditLogs.length,
  });
});

export default router;
