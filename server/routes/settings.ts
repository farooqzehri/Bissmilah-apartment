import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { GlobalSettings } from "../types";

const router = Router();

// GET /api/settings - Public retrieval of website settings
router.get("/", (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({
    success: true,
    data: db.settings,
  });
});

// PUT /api/settings - Admin update of settings
router.put("/", requireAdminAuth, (req: Request, res: Response) => {
  const updates: Partial<GlobalSettings> = req.body;
  const db = dbManager.getDb();

  const currentSettings = db.settings;
  const newSettings: GlobalSettings = {
    ...currentSettings,
    ...updates,
    branding: {
      ...currentSettings.branding,
      ...(updates.branding || {}),
    },
    contact: {
      ...currentSettings.contact,
      ...(updates.contact || {}),
      socialLinks: {
        ...currentSettings.contact.socialLinks,
        ...((updates.contact && updates.contact.socialLinks) || {}),
      },
    },
    behavior: {
      ...currentSettings.behavior,
      ...(updates.behavior || {}),
      announcementBanner: {
        ...currentSettings.behavior.announcementBanner,
        ...((updates.behavior && updates.behavior.announcementBanner) || {}),
      },
      sectionToggles: {
        ...currentSettings.behavior.sectionToggles,
        ...((updates.behavior && updates.behavior.sectionToggles) || {}),
      },
    },
    updatedAt: new Date().toISOString(),
  };

  db.settings = newSettings;
  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_SETTINGS", "GlobalSettings", "Updated global branding, contact, and website behavior settings");

  res.json({
    success: true,
    data: newSettings,
    message: "Settings saved successfully and published to website",
  });
});

export default router;
