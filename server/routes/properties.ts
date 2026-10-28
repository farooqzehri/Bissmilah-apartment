import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { Property, PropertyCategory, AvailabilityStatus } from "../types";

const router = Router();

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET /api/properties - Public list with search, filter, sort, pagination
router.get("/", (req: Request, res: Response) => {
  const {
    category,
    search,
    availability,
    featured,
    sort,
    page = "1",
    limit = "50",
    includeUnpublished = "false",
  } = req.query;

  const db = dbManager.getDb();
  let list = [...db.properties];

  // In public mode, hide unpublished unless requested with admin token
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && authHeader.startsWith("Bearer");

  if (!isAdmin && includeUnpublished !== "true") {
    list = list.filter((p) => p.published !== false);
  }

  // Filter by category
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  // Filter by availability
  if (availability && availability !== "all") {
    list = list.filter((p) => p.availability === availability);
  }

  // Filter by featured
  if (featured === "true") {
    list = list.filter((p) => p.featured === true);
  }

  // Search filter
  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.price.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === "price-asc") {
    list.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
  } else if (sort === "price-desc") {
    list.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
  } else if (sort === "title") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Default newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Pagination
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const total = list.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// GET /api/properties/:slugOrId - Single property lookup
router.get("/:slugOrId", (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const db = dbManager.getDb();

  const property = db.properties.find((p) => p.id === slugOrId || p.slug === slugOrId);
  if (!property) {
    res.status(404).json({ success: false, error: "Property not found" });
    return;
  }

  res.json({ success: true, data: property });
});

// POST /api/properties - Create property (Admin)
router.post("/", requireAdminAuth, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title || !data.price || !data.location || !data.image) {
    res.status(400).json({ error: "Title, price, location, and main image are required" });
    return;
  }

  const db = dbManager.getDb();
  const now = new Date().toISOString();
  let baseSlug = generateSlug(data.title);
  if (!baseSlug) baseSlug = "property";

  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (db.properties.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newProperty: Property = {
    id,
    slug,
    title: String(data.title).trim(),
    category: (data.category as PropertyCategory) || "apartments",
    price: String(data.price).trim(),
    numericPrice: data.numericPrice || undefined,
    currency: data.currency || "PKR",
    location: String(data.location).trim(),
    city: data.city || "Quetta",
    area: data.area || "A-1 City",
    googleMapsUrl: data.googleMapsUrl || "",
    size: String(data.size || "2,500 Sq. Ft.").trim(),
    coveredAreaUnit: data.coveredAreaUnit || "Sq. Ft.",
    tag: String(data.tag || "Premium").trim(),
    status: String(data.status || "100% Registry Ready").trim(),
    availability: (data.availability as AvailabilityStatus) || "Available",
    published: data.published !== false,
    featured: !!data.featured,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    floorNumber: data.floorNumber,
    totalFloors: data.totalFloors,
    furnishingStatus: data.furnishingStatus || "N/A",
    description: String(data.description || "").trim(),
    fullOverview: data.fullOverview || "",
    image: String(data.image).trim(),
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    imageCaptions: data.imageCaptions || {},
    imageAltTexts: data.imageAltTexts || {},
    highlights: Array.isArray(data.highlights) && data.highlights.length > 0
      ? data.highlights
      : ["Verified legal papers under Haji Saud Zehri personal supervision."],
    specs: Array.isArray(data.specs) && data.specs.length > 0
      ? data.specs
      : [{ label: "Registry", value: "Verified Deed" }],
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    createdAt: now,
    updatedAt: now,
  };

  db.properties.unshift(newProperty);
  dbManager.saveDb(db);
  dbManager.addAuditLog("CREATE_PROPERTY", "Property", `Created listing "${newProperty.title}"`, newProperty.id);

  res.status(201).json({
    success: true,
    data: newProperty,
    message: "Property created and published successfully",
  });
});

// PUT /api/properties/:id - Update property (Admin)
router.put("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = dbManager.getDb();

  const index = db.properties.findIndex((p) => p.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const existing = db.properties[index];
  const now = new Date().toISOString();

  // If title changed, update slug safely
  let slug = existing.slug;
  if (updates.title && updates.title !== existing.title) {
    let baseSlug = generateSlug(updates.title);
    slug = baseSlug;
    let counter = 1;
    while (db.properties.some((p) => p.slug === slug && p.id !== id)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const updated: Property = {
    ...existing,
    ...updates,
    id: existing.id,
    slug: updates.slug || slug,
    createdAt: existing.createdAt,
    updatedAt: now,
  };

  db.properties[index] = updated;
  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_PROPERTY", "Property", `Updated property "${updated.title}"`, updated.id);

  res.json({
    success: true,
    data: updated,
    message: `Property "${updated.title}" updated successfully`,
  });
});

// DELETE /api/properties/:id - Delete property (Admin)
router.delete("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();

  const existing = db.properties.find((p) => p.id === id);
  if (!existing) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  db.properties = db.properties.filter((p) => p.id !== id);
  dbManager.saveDb(db);
  dbManager.addAuditLog("DELETE_PROPERTY", "Property", `Deleted property "${existing.title}"`, id);

  res.json({
    success: true,
    message: `Listing "${existing.title}" deleted successfully`,
  });
});

// POST /api/properties/reset-defaults - Reset to factory initial records
router.post("/reset-defaults", requireAdminAuth, (req: Request, res: Response) => {
  dbManager.resetPropertiesToDefault();
  const db = dbManager.getDb();
  res.json({
    success: true,
    data: db.properties,
    message: "Property catalog reset to initial records",
  });
});

export default router;
