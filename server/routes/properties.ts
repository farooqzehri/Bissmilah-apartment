import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { Property } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { PropertyModel } from "../models/Property";
import { MediaAssetModel } from "../models/MediaAsset";
import { deleteFromCloudinary, uploadToCloudinary, isCloudinaryConfigured } from "../utils/cloudinary";

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
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      availability,
      featured,
      purpose,
      sort,
      page = "1",
      limit = "50",
      includeUnpublished = "false",
    } = req.query;

    const authHeader = req.headers.authorization;
    const isAdmin = authHeader && authHeader.startsWith("Bearer");
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));

    // If MongoDB Atlas is connected, execute query via Mongoose
    if (isMongoConnected()) {
      const query: any = {};

      if (!isAdmin && includeUnpublished !== "true") {
        query.published = { $ne: false };
      }

      if (category && category !== "all") {
        query.category = category;
      }

      if (availability && availability !== "all") {
        query.availability = availability;
      }

      if (purpose && purpose !== "all") {
        query.purpose = purpose;
      }

      if (featured === "true") {
        query.featured = true;
      }

      if (search && typeof search === "string" && search.trim() !== "") {
        const q = search.trim();
        query.$or = [
          { title: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { area: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { price: { $regex: q, $options: "i" } },
          { tag: { $regex: q, $options: "i" } },
        ];
      }

      // Sort
      let sortOptions: any = { createdAt: -1 };
      if (sort === "price-asc") sortOptions = { numericPrice: 1 };
      else if (sort === "price-desc") sortOptions = { numericPrice: -1 };
      else if (sort === "title") sortOptions = { title: 1 };

      const total = await PropertyModel.countDocuments(query);
      const properties = await PropertyModel.find(query)
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      res.json({
        success: true,
        source: "MongoDB Atlas",
        data: properties,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
      return;
    }

    // Fallback: Local resilient storage
    const db = dbManager.getDb();
    let list = [...db.properties];

    if (!isAdmin && includeUnpublished !== "true") {
      list = list.filter((p) => p.published !== false);
    }

    if (category && category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (availability && availability !== "all") {
      list = list.filter((p) => p.availability === availability);
    }

    if (featured === "true") {
      list = list.filter((p) => p.featured === true);
    }

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

    if (sort === "price-asc") {
      list.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
    } else if (sort === "price-desc") {
      list.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
    } else if (sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      source: "Local Storage",
      data: paginated,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err: any) {
    console.error("Properties GET error", err);
    res.status(500).json({ error: "Failed to fetch properties: " + err.message });
  }
});

// GET /api/properties/:slugOrId - Single property lookup
router.get("/:slugOrId", async (req: Request, res: Response) => {
  const { slugOrId } = req.params;

  if (isMongoConnected()) {
    try {
      const property = await PropertyModel.findOne({
        $or: [{ id: slugOrId }, { slug: slugOrId }],
      }).lean();

      if (!property) {
        res.status(404).json({ success: false, error: "Property not found" });
        return;
      }

      res.json({ success: true, source: "MongoDB Atlas", data: property });
      return;
    } catch (err: any) {
      console.warn("MongoDB single property lookup failed, falling back", err);
    }
  }

  const db = dbManager.getDb();
  const property = db.properties.find((p) => p.id === slugOrId || p.slug === slugOrId);
  if (!property) {
    res.status(404).json({ success: false, error: "Property not found" });
    return;
  }

  res.json({ success: true, source: "Local Storage", data: property });
});

// POST /api/properties - Create property (Admin)
router.post("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title || !data.price || !data.location || !data.image) {
      res.status(400).json({ error: "Title, price, location, and main image are required" });
      return;
    }

    const now = new Date().toISOString();
    let baseSlug = generateSlug(data.title);
    if (!baseSlug) baseSlug = "property";

    const id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let slug = baseSlug;

    // Check unique slug in Mongo or local
    if (isMongoConnected()) {
      let counter = 1;
      while (await PropertyModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else {
      const db = dbManager.getDb();
      let counter = 1;
      while (db.properties.some((p) => p.slug === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    let coverUrl = data.image;
    let coverPublicId = data.imagePublicId || "";

    // If main image is base64, upload to Cloudinary or disk
    if (coverUrl && coverUrl.startsWith("data:image/")) {
      if (isCloudinaryConfigured()) {
        try {
          const cloudResult = await uploadToCloudinary(coverUrl, {
            folder: "bismillah_properties",
            category: data.category || "apartments",
          });
          coverUrl = cloudResult.secureUrl;
          coverPublicId = cloudResult.publicId;

          // Also mirror to MediaAssetModel so it appears in Media Library
          if (isMongoConnected()) {
            MediaAssetModel.create({
              id: `med-${Date.now()}-${cloudResult.publicId.slice(-6)}`,
              url: cloudResult.secureUrl,
              secureUrl: cloudResult.secureUrl,
              publicId: cloudResult.publicId,
              fileName: `${slug}-cover.jpg`,
              originalName: `${slug}-cover.jpg`,
              mimeType: "image/jpeg",
              sizeBytes: cloudResult.sizeBytes || 500000,
              category: data.category || "apartments",
              title: `${data.title} Cover`,
              altText: `${data.title} primary exterior view`,
              caption: `${data.title} luxury real estate`,
              uploadedAt: now,
              storageProvider: "cloudinary",
            }).catch(() => {});
          }
        } catch (uploadErr: any) {
          console.warn("[Cloudinary] Property cover upload failed, continuing with provided URL:", uploadErr.message);
        }
      }
    }

    const newProperty: Property = {
      id,
      slug,
      title: data.title.trim(),
      category: data.category || "apartments",
      price: data.price.trim(),
      numericPrice: data.numericPrice || parseFloat(data.price.replace(/[^0-9.]/g, "")) * (data.price.includes("Crore") ? 10000000 : 100000) || 0,
      currency: data.currency || "PKR",
      location: data.location.trim(),
      city: data.city || "Quetta",
      area: data.area || "A-1 City",
      googleMapsUrl: data.googleMapsUrl || "",
      size: data.size || "2,500 Sq. Ft.",
      coveredAreaUnit: data.coveredAreaUnit || "Sq. Ft.",
      tag: data.tag || "Verified Exclusive",
      status: data.status || "100% Registry Ready",
      availability: data.availability || "Available",
      published: data.published !== false,
      featured: !!data.featured,
      bedrooms: data.bedrooms || 3,
      bathrooms: data.bathrooms || 3,
      floorNumber: data.floorNumber || "1st Floor",
      totalFloors: data.totalFloors || "8 Floors",
      furnishingStatus: data.furnishingStatus || "Unfurnished",
      description: data.description || "",
      fullOverview: data.fullOverview || data.description || "",
      image: coverUrl,
      imagePublicId: coverPublicId,
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      galleryPublicIds: Array.isArray(data.galleryPublicIds) ? data.galleryPublicIds : [],
      highlights: Array.isArray(data.highlights) && data.highlights.length > 0
        ? data.highlights
        : [
            "100% verified mutation registry deed",
            "Continuous solar hybrid electrical backup",
            "Sweet-water deep tube well connection",
            "High-security gated access control",
          ],
      specs: Array.isArray(data.specs) && data.specs.length > 0
        ? data.specs
        : [
            { label: "Bedrooms", value: String(data.bedrooms || "3 Bed") },
            { label: "Bathrooms", value: String(data.bathrooms || "3 Bath") },
            { label: "Area", value: data.size || "2,500 Sq. Ft." },
            { label: "Registry", value: "Mutation Certified" },
          ],
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      createdAt: now,
      updatedAt: now,
    };

    // Save to MongoDB if connected
    if (isMongoConnected()) {
      await PropertyModel.create({
        ...newProperty,
        propertyId: id,
      });
    }

    // Always mirror to local DB for resilience
    const db = dbManager.getDb();
    db.properties.unshift(newProperty);
    dbManager.saveDb(db);
    dbManager.addAuditLog("CREATE_PROPERTY", "Properties", `Created property: "${newProperty.title}"`, newProperty.id);

    res.status(201).json({
      success: true,
      data: newProperty,
      message: `Property "${newProperty.title}" created successfully`,
    });
  } catch (err: any) {
    console.error("Property creation error", err);
    res.status(500).json({ error: "Failed to create property: " + err.message });
  }
});

// PUT /api/properties/:id - Update property (Admin)
router.put("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const now = new Date().toISOString();

    // If updating with a new base64 image, upload to Cloudinary first
    if (updates.image && updates.image.startsWith("data:image/")) {
      if (isCloudinaryConfigured()) {
        try {
          const cloudResult = await uploadToCloudinary(updates.image, {
            folder: "bismillah_properties",
            category: updates.category || "apartments",
          });
          updates.image = cloudResult.secureUrl;
          updates.imagePublicId = cloudResult.publicId;
        } catch (uploadErr: any) {
          console.warn("[Cloudinary] Property cover update upload failed:", uploadErr.message);
        }
      }
    }

    let updatedProperty: Property | null = null;
    let oldCloudinaryPublicIdToDelete = "";

    if (isMongoConnected()) {
      const doc = await PropertyModel.findOne({ id });
      if (doc) {
        const oldPublicId = doc.imagePublicId;

        Object.assign(doc, updates, { updatedAt: now });
        await doc.save();
        updatedProperty = doc.toObject() as unknown as Property;

        // Mark old Cloudinary asset for deletion ONLY after database update succeeds
        if (oldPublicId && updates.imagePublicId && oldPublicId !== updates.imagePublicId) {
          oldCloudinaryPublicIdToDelete = oldPublicId;
        }
      }
    }

    const db = dbManager.getDb();
    const index = db.properties.findIndex((p) => p.id === id);

    if (index !== -1) {
      const existingProp = db.properties[index];
      if (!oldCloudinaryPublicIdToDelete && existingProp.imagePublicId && updates.imagePublicId && existingProp.imagePublicId !== updates.imagePublicId) {
        oldCloudinaryPublicIdToDelete = existingProp.imagePublicId;
      }

      db.properties[index] = {
        ...db.properties[index],
        ...updates,
        updatedAt: now,
      };
      dbManager.saveDb(db);
      if (!updatedProperty) updatedProperty = db.properties[index];
    }

    if (!updatedProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    // Delete old asset ONLY after the database update succeeds
    if (oldCloudinaryPublicIdToDelete) {
      deleteFromCloudinary(oldCloudinaryPublicIdToDelete).catch((e) =>
        console.warn("[Cloudinary] Old property image deletion notice:", e.message)
      );
    }

    dbManager.addAuditLog("UPDATE_PROPERTY", "Properties", `Updated property "${updatedProperty.title}"`, id);

    res.json({
      success: true,
      data: updatedProperty,
      message: `Property "${updatedProperty.title}" updated successfully`,
    });
  } catch (err: any) {
    console.error("Property update error", err);
    res.status(500).json({ error: "Failed to update property: " + err.message });
  }
});

// DELETE /api/properties/:id - Delete property (Admin)
router.delete("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let deletedTitle = id;
    let imagePublicId: string | undefined;
    let galleryPublicIds: string[] | undefined;

    if (isMongoConnected()) {
      const doc = await PropertyModel.findOne({ id });
      if (doc) {
        deletedTitle = doc.title;
        imagePublicId = doc.imagePublicId;
        galleryPublicIds = doc.galleryPublicIds;
        await PropertyModel.deleteOne({ id });
      }
    }

    const db = dbManager.getDb();
    const index = db.properties.findIndex((p) => p.id === id);

    if (index !== -1) {
      const prop = db.properties[index];
      deletedTitle = prop.title;
      if (!imagePublicId) imagePublicId = prop.imagePublicId;
      if (!galleryPublicIds) galleryPublicIds = prop.galleryPublicIds;
      db.properties.splice(index, 1);
      dbManager.saveDb(db);
    }

    // Clean up Cloudinary assets if public IDs were stored
    if (imagePublicId) {
      deleteFromCloudinary(imagePublicId).catch((e) => console.warn("Cloudinary cover deletion notice", e));
    }
    if (galleryPublicIds && galleryPublicIds.length > 0) {
      galleryPublicIds.forEach((pid) => deleteFromCloudinary(pid).catch((e) => console.warn("Cloudinary gallery deletion notice", e)));
    }

    dbManager.addAuditLog("DELETE_PROPERTY", "Properties", `Deleted property: "${deletedTitle}"`, id);

    res.json({
      success: true,
      message: `Property "${deletedTitle}" deleted successfully and media assets removed`,
    });
  } catch (err: any) {
    console.error("Property deletion error", err);
    res.status(500).json({ error: "Failed to delete property: " + err.message });
  }
});

// POST /api/properties/reset-defaults - Reset to verified seeds (Admin)
router.post("/reset-defaults", requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const localDb = dbManager.getDb();

    if (isMongoConnected()) {
      await PropertyModel.deleteMany({});
      for (const p of localDb.properties) {
        await PropertyModel.create(p);
      }
    }

    res.json({
      success: true,
      data: localDb.properties,
      message: "Properties reset to verified seeds successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to reset properties: " + err.message });
  }
});

export default router;
