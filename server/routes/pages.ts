import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { PageContent } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { WebsiteSettingsModel } from "../models/WebsiteSettings";

const router = Router();

const readPages = async (localDb: ReturnType<typeof dbManager.getDb>): Promise<PageContent[]> => {
  if (isMongoConnected()) {
    const settings = await WebsiteSettingsModel.findOne().lean();
    if (Array.isArray(settings?.pages)) return settings.pages;
  }
  return localDb.pages;
};

const persistPages = async (
  localDb: ReturnType<typeof dbManager.getDb>,
  pages: PageContent[]
): Promise<void> => {
  const mongoConnected = isMongoConnected();
  if (mongoConnected) {
    const settings = await WebsiteSettingsModel.findOne();
    if (settings) {
      settings.pages = pages;
      await settings.save();
    } else {
      await WebsiteSettingsModel.create({
        ...localDb.settings,
        homepage: localDb.homepage,
        pages,
      });
    }
  }

  localDb.pages = pages;
  try {
    dbManager.saveDb(localDb);
  } catch (err) {
    if (!mongoConnected) throw err;
    console.error("[Pages] MongoDB save succeeded but local mirror failed:", err);
  }
};

// GET /api/pages - Get all pages
router.get("/", async (_req: Request, res: Response) => {
  try {
    const db = dbManager.getDb();
    res.json({
      success: true,
      data: await readPages(db),
    });
  } catch (err) {
    console.error("[Pages] Failed to list pages:", err);
    res.status(500).json({ success: false, error: "Failed to fetch pages" });
  }
});

// GET /api/pages/:slug - Get single page by slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const db = dbManager.getDb();
    const pages = await readPages(db);
    const page = pages.find((candidate) => candidate.slug === slug || candidate.id === slug);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json({ success: true, data: page });
  } catch (err) {
    console.error("[Pages] Failed to fetch page:", err);
    res.status(500).json({ success: false, error: "Failed to fetch page" });
  }
});

// POST /api/pages - Create new CMS page
router.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { title, slug, metaTitle, metaDescription, bodyContent, published, showInNav } = req.body || {};
    if (typeof title !== "string" || !title.trim() || typeof slug !== "string" || !slug.trim()) {
      res.status(400).json({ error: "Title and slug are required" });
      return;
    }

    const db = dbManager.getDb();
    const pages = await readPages(db);
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (pages.some((page) => page.slug === cleanSlug)) {
      res.status(409).json({ error: "A page with this slug already exists" });
      return;
    }

    const newPage: PageContent = {
      id: `page-${Date.now()}`,
      slug: cleanSlug,
      title: title.trim(),
      metaTitle:
        typeof metaTitle === "string" && metaTitle.trim()
          ? metaTitle
          : `${title.trim()} | Bismillah Real Estate`,
      metaDescription: typeof metaDescription === "string" ? metaDescription : "",
      bodyContent: typeof bodyContent === "string" ? bodyContent : "",
      published: published !== false,
      showInNav: Boolean(showInNav),
      navOrder: pages.length + 1,
      updatedAt: new Date().toISOString(),
    };

    const updatedPages = [newPage, ...pages];
    await persistPages(db, updatedPages);
    try {
      dbManager.addAuditLog("CREATE_PAGE", "PagesCMS", `Created page "${newPage.title}"`, newPage.id);
    } catch (auditErr) {
      console.error("[Pages] Page was saved but its audit log could not be recorded:", auditErr);
    }

    res.status(201).json({
      success: true,
      data: newPage,
      message: "Page created successfully",
    });
  } catch (err) {
    console.error("[Pages] Failed to create page:", err);
    res.status(500).json({ success: false, error: "Failed to create page" });
  }
});

// PUT /api/pages/:id - Update page
router.put("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const db = dbManager.getDb();
    const pages = await readPages(db);
    const page = pages.find((candidate) => candidate.id === id);
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (typeof updates.title === "string" && updates.title.trim()) page.title = updates.title.trim();
    if (typeof updates.metaTitle === "string") page.metaTitle = updates.metaTitle;
    if (typeof updates.metaDescription === "string") page.metaDescription = updates.metaDescription;
    if (typeof updates.bodyContent === "string") page.bodyContent = updates.bodyContent;
    if (typeof updates.published === "boolean") page.published = updates.published;
    if (typeof updates.showInNav === "boolean") page.showInNav = updates.showInNav;
    if (Number.isInteger(updates.navOrder) && updates.navOrder >= 0) page.navOrder = updates.navOrder;
    page.updatedAt = new Date().toISOString();

    await persistPages(db, pages);
    try {
      dbManager.addAuditLog("UPDATE_PAGE", "PagesCMS", `Updated page "${page.title}"`, id);
    } catch (auditErr) {
      console.error("[Pages] Page was saved but its audit log could not be recorded:", auditErr);
    }

    res.json({ success: true, data: page, message: "Page updated successfully" });
  } catch (err) {
    console.error("[Pages] Failed to update page:", err);
    res.status(500).json({ success: false, error: "Failed to update page" });
  }
});

// DELETE /api/pages/:id - Delete page
router.delete("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDb();
    const pages = await readPages(db);
    const index = pages.findIndex((page) => page.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    const [removed] = pages.splice(index, 1);
    await persistPages(db, pages);
    try {
      dbManager.addAuditLog("DELETE_PAGE", "PagesCMS", `Deleted page "${removed.title}"`, id);
    } catch (auditErr) {
      console.error("[Pages] Page was deleted but its audit log could not be recorded:", auditErr);
    }

    res.json({ success: true, message: `Page "${removed.title}" deleted` });
  } catch (err) {
    console.error("[Pages] Failed to delete page:", err);
    res.status(500).json({ success: false, error: "Failed to delete page" });
  }
});

export default router;
