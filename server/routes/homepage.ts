import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { HomepageSections } from "../types";

const router = Router();

// GET /api/homepage - Public retrieval
router.get("/", (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({
    success: true,
    data: db.homepage,
  });
});

// PUT /api/homepage - Admin full update
router.put("/", requireAdminAuth, (req: Request, res: Response) => {
  const updates: Partial<HomepageSections> = req.body;
  const db = dbManager.getDb();

  const newHomepage: HomepageSections = {
    ...db.homepage,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  db.homepage = newHomepage;
  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_HOMEPAGE", "HomepageCMS", "Updated full homepage sections");

  res.json({
    success: true,
    data: newHomepage,
    message: "Homepage content updated successfully",
  });
});

// PUT /api/homepage/:section - Update individual section
router.put("/:section", requireAdminAuth, (req: Request, res: Response) => {
  const { section } = req.params;
  const sectionData = req.body;
  const db = dbManager.getDb();

  if (!(section in db.homepage)) {
    res.status(400).json({ error: `Invalid homepage section: ${section}` });
    return;
  }

  (db.homepage as any)[section] = sectionData;
  db.homepage.updatedAt = new Date().toISOString();

  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_HOMEPAGE_SECTION", "HomepageCMS", `Updated homepage section: ${section}`, section);

  res.json({
    success: true,
    data: (db.homepage as any)[section],
    message: `Homepage ${section} section updated successfully`,
  });
});

export default router;
