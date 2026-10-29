import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { GlobalSettings } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { WebsiteSettingsModel } from "../models/WebsiteSettings";

const router = Router();

// GET /api/settings - Public retrieval of website settings
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected()) {
      const doc = await WebsiteSettingsModel.findOne().lean();
      if (doc) {
        res.json({
          success: true,
          source: "MongoDB Atlas",
          data: doc,
        });
        return;
      }
    }

    const db = dbManager.getDb();
    res.json({
      success: true,
      source: "Local Storage",
      data: db.settings,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch settings: " + err.message });
  }
});

// PUT /api/settings - Admin update of settings
router.put("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
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

    if (isMongoConnected()) {
      const existing = await WebsiteSettingsModel.findOne();
      if (existing) {
        Object.assign(existing, newSettings);
        await existing.save();
      } else {
        await WebsiteSettingsModel.create(newSettings);
      }
    }

    db.settings = newSettings;
    dbManager.saveDb(db);
    dbManager.addAuditLog("UPDATE_SETTINGS", "GlobalSettings", "Updated global branding, contact, and website behavior settings");

    res.json({
      success: true,
      data: newSettings,
      message: "Settings saved successfully and published to website",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update settings: " + err.message });
  }
});

export default router;
