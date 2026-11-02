import mongoose from "mongoose";
import { PropertyModel } from "../models/Property";
import { WebsiteSettingsModel } from "../models/WebsiteSettings";
import { CustomerInquiryModel } from "../models/CustomerInquiry";
import { MediaAssetModel } from "../models/MediaAsset";
import { AdminUserModel } from "../models/AdminUser";
import { dbManager } from "../db";

let isConnected = false;
let isConnecting = false;
let lastError: string | null = null;

// Prevent unhandled error events from crashing or emitting alerts
mongoose.connection.on("error", (err) => {
  lastError = err?.message || String(err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
});

export const isMongoConnected = (): boolean => isConnected && mongoose.connection.readyState === 1;

export interface MongoStatusInfo {
  connected: boolean;
  provider: string;
  hasUri: boolean;
  error?: string;
  advice?: string;
}

export const getMongoStatus = (): MongoStatusInfo => {
  const mongoUri = process.env.MONGODB_URI;
  const hasUri = Boolean(mongoUri && mongoUri.trim() !== "" && !mongoUri.includes("<username>"));
  const connected = isMongoConnected();

  let advice: string | undefined;
  if (!connected && hasUri && lastError) {
    const errLow = lastError.toLowerCase();
    if (errLow.includes("whitelist") || errLow.includes("could not connect") || errLow.includes("timed out") || errLow.includes("serverselectionerror")) {
      advice = "MongoDB Atlas requires IP whitelisting for Cloud deployments. In your MongoDB Atlas Console under Security > Network Access, add IP 0.0.0.0/0 (Allow from Anywhere).";
    } else if (errLow.includes("auth") || errLow.includes("password")) {
      advice = "Database credentials incorrect. Please verify your Atlas database username & password in MONGODB_URI (ensure special characters are URL encoded).";
    }
  }

  return {
    connected,
    provider: connected ? "MongoDB Atlas (Connected)" : (hasUri ? "MongoDB Atlas (IP Whitelist Required)" : "Local Storage (Persistent)"),
    hasUri,
    error: lastError || undefined,
    advice,
  };
};

export const connectToMongoAtlas = async (forceRetry = false): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === "" || mongoUri.includes("<username>") || mongoUri.includes("<password>")) {
    console.log("[MongoDB Atlas] MONGODB_URI not configured in .env. Operating in resilient local storage mode.");
    lastError = null;
    return false;
  }

  if (isConnected && !forceRetry && mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;

  try {
    // If previously in a connecting or half-open state, disconnect cleanly first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }

    console.log("[MongoDB Atlas] Attempting connection to MongoDB Atlas cluster...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 4000,
      autoIndex: true,
    });

    isConnected = true;
    lastError = null;
    isConnecting = false;
    console.log("[MongoDB Atlas] Successfully connected to MongoDB Atlas database!");

    // Safely remove any legacy unique indexes that could block document creation
    try {
      const coll = mongoose.connection.db?.collection("properties");
      if (coll) {
        const indexes = await coll.indexes();
        if (indexes.some((idx: any) => idx.name === "propertyId_1")) {
          await coll.dropIndex("propertyId_1").catch(() => {});
          console.log("[MongoDB Atlas] Removed legacy propertyId_1 index constraint.");
        }
      }
    } catch {
      // Safe ignore
    }

    // Seed default data if collections are empty or missing records
    await seedDefaultDataIfEmpty();

    return true;
  } catch (err: any) {
    isConnected = false;
    isConnecting = false;
    lastError = err?.message || String(err);

    // Disconnect cleanly so no lingering sockets or reconnect loops remain
    await mongoose.disconnect().catch(() => {});

    console.log("[MongoDB Atlas Notice] Atlas connection unreachable (" + (err?.name || "Notice") + "). Safely operating in persistent local storage mode.");
    return false;
  }
};

/**
 * Seed initial data from local DB seeds into MongoDB Atlas if collections are empty or missing records.
 */
async function seedDefaultDataIfEmpty() {
  try {
    const localDb = dbManager.getDb();

    // 1. Seed Properties (ensure all initial catalog items exist in Atlas)
    if (localDb.properties && localDb.properties.length > 0) {
      for (const p of localDb.properties) {
        const existing = await PropertyModel.findOne({
          $or: [{ id: p.id }, { slug: p.slug }, { title: p.title }],
        });

        if (!existing) {
          console.log(`[MongoDB Atlas] Syncing catalog property "${p.title}"...`);
          await PropertyModel.create({
            id: p.id,
            propertyId: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category,
            purpose: "sale",
            price: p.price,
            numericPrice: p.numericPrice,
            currency: p.currency,
            location: p.location,
            city: p.city,
            area: p.area,
            googleMapsUrl: p.googleMapsUrl,
            size: p.size,
            coveredAreaUnit: p.coveredAreaUnit,
            tag: p.tag,
            status: p.status,
            availability: p.availability,
            published: p.published !== false,
            featured: Boolean(p.featured),
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            floorNumber: p.floorNumber,
            totalFloors: p.totalFloors,
            furnishingStatus: p.furnishingStatus,
            description: p.description,
            fullOverview: p.fullOverview,
            image: p.image,
            gallery: p.gallery || [],
            highlights: p.highlights || [],
            specs: p.specs || [],
            amenities: p.amenities || [],
          });
        }
      }
    }

    // 2. Seed Settings
    const settingsCount = await WebsiteSettingsModel.countDocuments();
    if (settingsCount === 0 && localDb.settings) {
      console.log("[MongoDB Atlas] Seeding initial website settings...");
      await WebsiteSettingsModel.create(localDb.settings);
    }

    // 3. Seed Media Assets
    const mediaCount = await MediaAssetModel.countDocuments();
    if (mediaCount === 0 && localDb.media.length > 0) {
      console.log(`[MongoDB Atlas] Seeding ${localDb.media.length} media records...`);
      for (const m of localDb.media) {
        await MediaAssetModel.create({
          id: m.id,
          url: m.url,
          secureUrl: m.url,
          fileName: m.fileName,
          originalName: m.originalName,
          mimeType: m.mimeType,
          sizeBytes: m.sizeBytes,
          category: m.category,
          title: m.title,
          altText: m.altText,
          caption: m.caption,
          uploadedAt: m.uploadedAt,
          usageCount: m.usageCount || 0,
          storageProvider: m.url.includes("cloudinary.com") ? "cloudinary" : "remote",
        });
      }
    }

    // 4. Seed Admin User
    const adminCount = await AdminUserModel.countDocuments();
    if (adminCount === 0) {
      console.log("[MongoDB Atlas] Seeding default administrator profile (PIN: 786)...");
      await AdminUserModel.create({
        username: "Haji Saud Zehri Admin",
        email: "hajisaud@bismillahrealestate.pk",
        pin: "786",
        role: "admin",
        permissions: ["read", "write", "delete", "publish", "settings"],
      });
    }

    // 5. Seed Inquiries
    const inqCount = await CustomerInquiryModel.countDocuments();
    if (inqCount === 0 && localDb.enquiries.length > 0) {
      console.log(`[MongoDB Atlas] Seeding ${localDb.enquiries.length} customer inquiries...`);
      for (const e of localDb.enquiries) {
        await CustomerInquiryModel.create({
          id: e.id,
          token: e.token,
          clientName: e.clientName,
          phone: e.phone,
          email: e.email,
          propertyInterest: e.propertyInterest,
          preferredDate: e.preferredDate,
          meetingType: e.meetingType,
          clientNote: e.clientNote,
          status: e.status,
          internalNotes: e.internalNotes,
        });
      }
    }
  } catch (err) {
    console.warn("[MongoDB Atlas] Seed check notice:", err);
  }
}
