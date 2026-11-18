import mongoose from "mongoose";
import { PropertyModel } from "../models/Property";
import { WebsiteSettingsModel } from "../models/WebsiteSettings";
import { CustomerInquiryModel } from "../models/CustomerInquiry";
import { MediaAssetModel } from "../models/MediaAsset";
import { dbManager } from "../db";

let isConnected = false;
let lastError: string | null = null;
let connectionPromise: Promise<boolean> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;

const RETRY_BASE_DELAY_MS = 5_000;
const RETRY_MAX_DELAY_MS = 60_000;
const PROPERTY_SEED_MARKER_ID = "initial-properties-v1";
const PROPERTY_SEED_LEASE_MS = 5 * 60_000;

interface PropertySeedMarker {
  _id: string;
  status: string;
  leaseUntil?: Date;
  [key: string]: unknown;
}

mongoose.connection.on("error", (err) => {
  lastError = err?.message || String(err);
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
});

mongoose.connection.on("connected", () => {
  isConnected = true;
  lastError = null;
  retryAttempt = 0;

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
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
  const hasUri = Boolean(
    mongoUri &&
      mongoUri.trim() !== "" &&
      !mongoUri.includes("<username>") &&
      !mongoUri.includes("<password>")
  );
  const connected = isMongoConnected();

  let advice: string | undefined;
  if (!connected && hasUri && lastError) {
    const errLow = lastError.toLowerCase();
    if (errLow.includes("auth") || errLow.includes("password")) {
      advice = "Database credentials incorrect. Please verify your Atlas database username & password in MONGODB_URI (ensure special characters are URL encoded).";
    } else if (errLow.includes("mongoparseerror") || errLow.includes("invalid scheme") || errLow.includes("invalid uri")) {
      advice = "MONGODB_URI is malformed. Copy the Atlas Node.js driver URI, include a database name, and URL-encode special characters in the username or password.";
    } else if (errLow.includes("whitelist") || errLow.includes("could not connect") || errLow.includes("timed out") || errLow.includes("serverselectionerror")) {
      advice = "MongoDB Atlas could not be reached. Check the cluster status, network access list, DNS/network connectivity, and the deployment's outbound IP address.";
    }
  }

  return {
    connected,
    provider: connected ? "MongoDB Atlas (Connected)" : (hasUri ? "MongoDB Atlas (Disconnected)" : "Local Storage (Persistent)"),
    hasUri,
    error: lastError || undefined,
    advice,
  };
};

function scheduleMongoRetry(): void {
  if (retryTimer || !process.env.MONGODB_URI?.trim()) {
    return;
  }

  const delay = Math.min(RETRY_BASE_DELAY_MS * 2 ** retryAttempt, RETRY_MAX_DELAY_MS);
  retryAttempt = Math.min(retryAttempt + 1, 4);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void connectToMongoAtlas();
  }, delay);
  retryTimer.unref();
}

function isPermanentConnectionError(err: unknown): boolean {
  const error = err as { name?: string; message?: string };
  const name = error?.name?.toLowerCase() || "";
  const message = error?.message?.toLowerCase() || "";

  return (
    name.includes("mongoparseerror") ||
    name.includes("mongoinvalidargumenterror") ||
    message.includes("authentication failed") ||
    message.includes("bad auth")
  );
}

export const connectToMongoAtlas = (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri || mongoUri.includes("<username>") || mongoUri.includes("<password>")) {
    console.log("[MongoDB Atlas] MONGODB_URI not configured in .env. Operating in resilient local storage mode.");
    lastError = null;
    return Promise.resolve(false);
  }

  if (isMongoConnected()) {
    return Promise.resolve(true);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  connectionPromise = (async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      console.log("[MongoDB Atlas] Attempting connection to MongoDB Atlas cluster...");
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
        autoIndex: true,
      });

      isConnected = true;
      lastError = null;
      retryAttempt = 0;
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

      // Import local seed data only during first-time initialization.
      await seedDefaultDataIfEmpty();

      return true;
    } catch (err: any) {
      isConnected = false;
      lastError = `${err?.name || "Error"}: ${err?.message || String(err)}`;

      await mongoose.disconnect().catch(() => {});

      if (!isPermanentConnectionError(err)) {
        scheduleMongoRetry();
      }

      console.warn(
        "[MongoDB Atlas Notice] Connection failed (" +
          (err?.name || "Error") +
          "). " +
          (isPermanentConnectionError(err)
            ? "Check MONGODB_URI credentials and format."
            : "Operating in local storage mode; a background retry has been scheduled.")
      );
      return false;
    }
  })().finally(() => {
    connectionPromise = null;
  });

  return connectionPromise;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function claimPropertySeed(): Promise<boolean> {
  const database = mongoose.connection.db;
  if (!database) {
    throw new Error("MongoDB database handle is unavailable during property initialization");
  }

  const migrations = database.collection<PropertySeedMarker>("_cms_migrations");
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + PROPERTY_SEED_LEASE_MS);
  const marker = await migrations.findOne({ _id: PROPERTY_SEED_MARKER_ID });

  if (marker?.status === "complete") {
    console.log("[MongoDB Atlas] Property seed migration already completed; leaving Atlas properties unchanged.");
    return false;
  }

  if (marker) {
    if (marker.status === "running" && marker.leaseUntil instanceof Date && marker.leaseUntil > now) {
      console.log("[MongoDB Atlas] Property seed migration is already running in another process.");
      return false;
    }

    const takeover = await migrations.updateOne(
      {
        _id: PROPERTY_SEED_MARKER_ID,
        status: marker.status,
        ...(marker.leaseUntil ? { leaseUntil: marker.leaseUntil } : {}),
      },
      {
        $set: { status: "running", startedAt: now, leaseUntil },
      }
    );
    return takeover.modifiedCount === 1;
  }

  const [propertyCount, settingsCount, mediaCount, inquiryCount] = await Promise.all([
    PropertyModel.countDocuments(),
    WebsiteSettingsModel.countDocuments(),
    MediaAssetModel.countDocuments(),
    CustomerInquiryModel.countDocuments(),
  ]);
  const hasExistingCmsData = propertyCount + settingsCount + mediaCount + inquiryCount > 0;

  try {
    await migrations.insertOne({
      _id: PROPERTY_SEED_MARKER_ID,
      status: hasExistingCmsData ? "complete" : "running",
      source: "local-json",
      startedAt: now,
      ...(hasExistingCmsData ? { completedAt: now, result: "skipped-existing-atlas-data" } : { leaseUntil }),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return false;
    }
    throw error;
  }

  if (hasExistingCmsData) {
    console.log(
      "[MongoDB Atlas] Existing CMS data detected; skipping legacy property import to preserve Atlas deletions."
    );
    return false;
  }

  return true;
}

function toMongoProperty(property: ReturnType<typeof dbManager.getDb>["properties"][number]) {
  return {
    id: property.id,
    propertyId: property.id,
    slug: property.slug,
    title: property.title,
    category: property.category,
    purpose: "sale" as const,
    price: property.price,
    numericPrice: property.numericPrice,
    currency: property.currency,
    location: property.location,
    city: property.city,
    area: property.area,
    googleMapsUrl: property.googleMapsUrl,
    size: property.size,
    coveredAreaUnit: property.coveredAreaUnit,
    tag: property.tag,
    status: property.status,
    availability: property.availability,
    published: property.published !== false,
    featured: Boolean(property.featured),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    floorNumber: property.floorNumber,
    totalFloors: property.totalFloors,
    furnishingStatus: property.furnishingStatus,
    description: property.description,
    fullOverview: property.fullOverview,
    image: property.image,
    gallery: property.gallery || [],
    highlights: property.highlights || [],
    specs: property.specs || [],
    amenities: property.amenities || [],
  };
}

async function seedPropertiesOnce(localDb: ReturnType<typeof dbManager.getDb>): Promise<void> {
  const shouldSeed = await claimPropertySeed();
  if (!shouldSeed) {
    return;
  }

  const properties = localDb.properties || [];
  const migrations = mongoose.connection.db!.collection<PropertySeedMarker>("_cms_migrations");
  try {
    for (const property of properties) {
      await PropertyModel.updateOne(
        { id: property.id },
        { $setOnInsert: toMongoProperty(property) },
        { upsert: true }
      );
    }

    const completedAt = new Date();
    const completion = await migrations.updateOne(
      { _id: PROPERTY_SEED_MARKER_ID, status: "running" },
      {
        $set: { status: "complete", completedAt, seededCount: properties.length },
        $unset: { leaseUntil: "" },
      }
    );
    if (completion.matchedCount !== 1) {
      throw new Error("Property seed migration marker was not owned by this process");
    }

    console.log(`[MongoDB Atlas] Initial property import completed (${properties.length} properties).`);
  } catch (error) {
    await migrations.updateOne(
      { _id: PROPERTY_SEED_MARKER_ID, status: "running" },
      { $set: { status: "failed", failedAt: new Date(), error: String(error) }, $unset: { leaseUntil: "" } }
    );
    throw error;
  }
}

/**
 * Import local JSON data into a new Atlas database once; existing Atlas data remains authoritative.
 */
async function seedDefaultDataIfEmpty(): Promise<void> {
  try {
    const localDb = dbManager.getDb();

    await seedPropertiesOnce(localDb);

    // 2. Seed Settings
    const settingsDoc = await WebsiteSettingsModel.findOne();
    if (!settingsDoc && localDb.settings) {
      console.log("[MongoDB Atlas] Seeding initial website settings and CMS content...");
      await WebsiteSettingsModel.create({
        ...localDb.settings,
        homepage: localDb.homepage,
        pages: localDb.pages,
      });
    } else if (settingsDoc) {
      let needsSave = false;
      if (settingsDoc.homepage == null && localDb.homepage) {
        settingsDoc.homepage = localDb.homepage;
        needsSave = true;
      }
      if (settingsDoc.pages == null && localDb.pages) {
        settingsDoc.pages = localDb.pages;
        needsSave = true;
      }
      if (needsSave) {
        await settingsDoc.save();
      }
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

    // 4. Seed Inquiries
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
    console.error("[MongoDB Atlas] Initial data migration failed:", err);
    throw err;
  }
}
