import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { PageContent } from "../types";

const router = Router();

// GET /api/pages - Get all published pages (or all for admin)
router.get("/", (req: Request, res: Response) => {
  const db = dbManager.getDb();
  res.json({
    success: true,
    data: db.pages,
  });
});

// GET /api/pages/:slug - Get single page by slug
router.get("/:slug", (req: Request, res: Response) => {
  const { slug } = req.params;
  const db = dbManager.getDb();

  const page = db.pages.find((p) => p.slug === slug || p.id === slug);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  res.json({
    success: true,
    data: page,
  });
});

// POST /api/pages - Create new CMS page
router.post("/", requireAdminAuth, (req: Request, res: Response) => {
  const { title, slug, metaTitle, metaDescription, bodyContent, published, showInNav } = req.body;

  if (!title || !slug) {
    res.status(400).json({ error: "Title and slug are required" });
    return;
  }

  const db = dbManager.getDb();
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  if (db.pages.some((p) => p.slug === cleanSlug)) {
    res.status(409).json({ error: "A page with this slug already exists" });
    return;
  }

  const newPage: PageContent = {
    id: `page-${Date.now()}`,
    slug: cleanSlug,
    title: title.trim(),
    metaTitle: metaTitle || `${title} | Bismillah Real Estate`,
    metaDescription: metaDescription || "",
    bodyContent: bodyContent || "",
    published: published !== false,
    showInNav: !!showInNav,
    navOrder: db.pages.length + 1,
    updatedAt: new Date().toISOString(),
  };

  db.pages.push(newPage);
  dbManager.saveDb(db);
  dbManager.addAuditLog("CREATE_PAGE", "PagesCMS", `Created page "${newPage.title}"`, newPage.id);

  res.status(201).json({
    success: true,
    data: newPage,
    message: "Page created successfully",
  });
});

// PUT /api/pages/:id - Update page
router.put("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = dbManager.getDb();

  const page = db.pages.find((p) => p.id === id);
  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  if (updates.title) page.title = updates.title;
  if (updates.metaTitle) page.metaTitle = updates.metaTitle;
  if (updates.metaDescription) page.metaDescription = updates.metaDescription;
  if (updates.bodyContent !== undefined) page.bodyContent = updates.bodyContent;
  if (updates.published !== undefined) page.published = updates.published;
  if (updates.showInNav !== undefined) page.showInNav = updates.showInNav;
  if (updates.navOrder !== undefined) page.navOrder = updates.navOrder;
  page.updatedAt = new Date().toISOString();

  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_PAGE", "PagesCMS", `Updated page "${page.title}"`, id);

  res.json({
    success: true,
    data: page,
    message: "Page updated successfully",
  });
});

// DELETE /api/pages/:id - Delete page
router.delete("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();

  const index = db.pages.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  const removed = db.pages.splice(index, 1)[0];
  dbManager.saveDb(db);
  dbManager.addAuditLog("DELETE_PAGE", "PagesCMS", `Deleted page "${removed.title}"`, id);

  res.json({
    success: true,
    message: `Page "${removed.title}" deleted`,
  });
});

export default router;
