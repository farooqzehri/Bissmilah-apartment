import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { HomepageSections } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { WebsiteSettingsModel } from "../models/WebsiteSettings";

const router = Router();

const readHomepage = async (localDb: ReturnType<typeof dbManager.getDb>): Promise<HomepageSections> => {
  if (isMongoConnected()) {
    const settings = await WebsiteSettingsModel.findOne().lean();
    if (settings?.homepage) return settings.homepage;
  }
  return localDb.homepage;
};

const persistHomepage = async (
  localDb: ReturnType<typeof dbManager.getDb>,
  homepage: HomepageSections
): Promise<void> => {
  const mongoConnected = isMongoConnected();
  if (mongoConnected) {
    const settings = await WebsiteSettingsModel.findOne();
    if (settings) {
      settings.homepage = homepage;
      await settings.save();
    } else {
      await WebsiteSettingsModel.create({
        ...localDb.settings,
        homepage,
        pages: localDb.pages,
      });
    }
  }

  localDb.homepage = homepage;
  try {
    dbManager.saveDb(localDb);
  } catch (err) {
    if (!mongoConnected) throw err;
    console.error("[Homepage] MongoDB save succeeded but local mirror failed:", err);
  }
};

// GET /api/homepage - Public retrieval
router.get("/", async (_req: Request, res: Response) => {
  try {
    const db = dbManager.getDb();
    res.json({
      success: true,
      data: await readHomepage(db),
    });
  } catch (err) {
    console.error("[Homepage] Failed to fetch content:", err);
    res.status(500).json({ success: false, error: "Failed to fetch homepage content" });
  }
});

// PUT /api/homepage - Admin full update
router.put("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const updates: Partial<HomepageSections> = req.body;
    const db = dbManager.getDb();
    const currentHomepage = await readHomepage(db);
    const newHomepage: HomepageSections = {
      ...currentHomepage,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await persistHomepage(db, newHomepage);
    try {
      dbManager.addAuditLog("UPDATE_HOMEPAGE", "HomepageCMS", "Updated full homepage sections");
    } catch (auditErr) {
      console.error("[Homepage] Content was saved but its audit log could not be recorded:", auditErr);
    }

    res.json({
      success: true,
      data: newHomepage,
      message: "Homepage content updated successfully",
    });
  } catch (err) {
    console.error("[Homepage] Failed to update content:", err);
    res.status(500).json({ success: false, error: "Failed to update homepage content" });
  }
});

// PUT /api/homepage/:section - Update individual section
router.put("/:section", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const sectionData = req.body;
    const db = dbManager.getDb();
    const currentHomepage = await readHomepage(db);

    if (!(section in currentHomepage)) {
      res.status(400).json({ error: `Invalid homepage section: ${section}` });
      return;
    }

    const newHomepage = {
      ...currentHomepage,
      [section]: sectionData,
      updatedAt: new Date().toISOString(),
    };
    await persistHomepage(db, newHomepage);
    try {
      dbManager.addAuditLog(
        "UPDATE_HOMEPAGE_SECTION",
        "HomepageCMS",
        `Updated homepage section: ${section}`,
        section
      );
    } catch (auditErr) {
      console.error("[Homepage] Section was saved but its audit log could not be recorded:", auditErr);
    }

    res.json({
      success: true,
      data: newHomepage[section as keyof HomepageSections],
      message: `Homepage ${section} section updated successfully`,
    });
  } catch (err) {
    console.error("[Homepage] Failed to update section:", err);
    res.status(500).json({ success: false, error: "Failed to update homepage section" });
  }
});

export default router;
