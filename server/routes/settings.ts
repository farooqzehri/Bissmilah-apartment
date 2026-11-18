import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { GlobalSettings } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { IWebsiteSettings, WebsiteSettingsModel } from "../models/WebsiteSettings";

const router = Router();
const SETTINGS_SECTIONS = ["branding", "contact", "behavior"] as const;
type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
type SettingsUpdate = Record<string, unknown>;

class SettingsValidationError extends Error {}

const isSettingsObject = (value: unknown): value is SettingsUpdate =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function flattenSettingsUpdates(value: unknown): Record<string, unknown> {
  if (!isSettingsObject(value)) {
    throw new SettingsValidationError("Settings update must be a JSON object");
  }

  const flattened: Record<string, unknown> = {};
  const visit = (section: SettingsSection, value: unknown, path: string[]) => {
    if (value === null || value === undefined) {
      throw new SettingsValidationError(`Settings field "${path.join(".")}" cannot be null`);
    }

    if (isSettingsObject(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || ["constructor", "prototype"].includes(key)) {
          throw new SettingsValidationError(`Invalid settings field "${key}"`);
        }
        visit(section, nestedValue, [...path, key]);
      }
      return;
    }

    const mongoPath = [section, ...path].join(".");
    if (!WebsiteSettingsModel.schema.path(mongoPath)) {
      throw new SettingsValidationError(`Unknown settings field "${mongoPath}"`);
    }
    flattened[mongoPath] = value;
  };

  for (const [section, sectionValue] of Object.entries(value)) {
    if (section === "updatedAt") continue;
    if (!SETTINGS_SECTIONS.includes(section as SettingsSection)) {
      throw new SettingsValidationError(`Unknown settings section "${section}"`);
    }
    if (!isSettingsObject(sectionValue)) {
      throw new SettingsValidationError(`Settings section "${section}" must be an object`);
    }
    for (const [key, fieldValue] of Object.entries(sectionValue)) {
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || ["constructor", "prototype"].includes(key)) {
        throw new SettingsValidationError(`Invalid settings field "${key}"`);
      }
      visit(section as SettingsSection, fieldValue, [key]);
    }
  }

  if (Object.keys(flattened).length === 0) {
    throw new SettingsValidationError("At least one settings field must be provided");
  }

  return flattened;
}

function mergeSettings(
  current: GlobalSettings,
  updates: Partial<GlobalSettings>,
  updatedAt: string
): GlobalSettings {
  return {
    ...current,
    ...updates,
    branding: { ...current.branding, ...updates.branding },
    contact: {
      ...current.contact,
      ...updates.contact,
      socialLinks: {
        ...current.contact.socialLinks,
        ...updates.contact?.socialLinks,
      },
    },
    behavior: {
      ...current.behavior,
      ...updates.behavior,
      announcementBanner: {
        ...current.behavior.announcementBanner,
        ...updates.behavior?.announcementBanner,
      },
      sectionToggles: {
        ...current.behavior.sectionToggles,
        ...updates.behavior?.sectionToggles,
      },
    },
    updatedAt,
  };
}

function toGlobalSettings(
  settings: Pick<IWebsiteSettings, "branding" | "contact" | "behavior" | "updatedAt">
): GlobalSettings {
  return {
    branding: settings.branding,
    contact: settings.contact,
    behavior: settings.behavior,
    updatedAt: typeof settings.updatedAt === "string" ? settings.updatedAt : new Date().toISOString(),
  };
}

// GET /api/settings - Public retrieval of website settings
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected()) {
      const doc = await WebsiteSettingsModel.findOne().lean();
      if (doc) {
        res.json({
          success: true,
          source: "MongoDB Atlas",
          data: toGlobalSettings(doc),
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
    const flattenedUpdates = flattenSettingsUpdates(req.body);
    const updates = req.body as Partial<GlobalSettings>;
    const db = dbManager.getDb();
    const updatedAt = new Date().toISOString();
    let newSettings: GlobalSettings;

    if (isMongoConnected()) {
      const existing = await WebsiteSettingsModel.findOne().select("_id").lean();
      if (existing) {
        const saved = await WebsiteSettingsModel.findByIdAndUpdate(
          existing._id,
          { $set: { ...flattenedUpdates, updatedAt } },
          { new: true, runValidators: true }
        );
        if (!saved) {
          throw new Error("Global settings disappeared while the update was being saved");
        }
        newSettings = toGlobalSettings(saved);
      } else {
        newSettings = mergeSettings(db.settings, updates, updatedAt);
        const saved = await WebsiteSettingsModel.create({
          ...newSettings,
          homepage: db.homepage,
          pages: db.pages,
        });
        newSettings = toGlobalSettings(saved);
      }
    } else {
      newSettings = mergeSettings(db.settings, updates, updatedAt);
    }

    db.settings = newSettings;
    try {
      dbManager.saveDb(db);
    } catch (err) {
      if (!isMongoConnected()) throw err;
      console.error("[Settings] MongoDB save succeeded but local mirror failed:", err);
    }
    try {
      dbManager.addAuditLog("UPDATE_SETTINGS", "GlobalSettings", "Updated global branding, contact, and website behavior settings");
    } catch (err) {
      console.error("[Settings] Settings were saved but the audit log could not be recorded:", err);
    }

    res.json({
      success: true,
      data: newSettings,
      message: "Settings saved successfully and published to website",
    });
  } catch (err: any) {
    const status = err instanceof SettingsValidationError ? 400 : 500;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Settings] Failed to update settings:", err);
    res.status(status).json({ success: false, error: "Failed to update settings: " + message });
  }
});

export default router;
