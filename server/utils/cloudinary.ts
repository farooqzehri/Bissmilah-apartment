import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

let cloudinaryVerified: boolean | null = null;
let cloudinaryError: string | null = null;
let cloudinaryAdvice: string | null = null;

// Initialize Cloudinary with environment variables
export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  return Boolean(cloudName && apiKey && apiSecret);
};

export const configureCloudinary = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
};

export const verifyCloudinaryConnection = async (force = false): Promise<boolean> => {
  if (!isCloudinaryConfigured()) {
    cloudinaryVerified = false;
    cloudinaryError = "Missing credentials";
    cloudinaryAdvice = "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment secrets.";
    return false;
  }

  const rawCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
  if (/\s/.test(rawCloudName)) {
    cloudinaryVerified = false;
    cloudinaryError = `Invalid Cloud Name format: contains spaces ("${rawCloudName}")`;
    cloudinaryAdvice = `Cloudinary Cloud Names never contain spaces. In your Cloudinary console, your Cloud Name is shown under 'Product Environment Credentials' (or the part after '@' in your CLOUDINARY_URL), e.g. 'dabcdefgh' or 'bismillah-real-estate' without spaces.`;
    return false;
  }

  if (cloudinaryVerified !== null && !force) {
    return cloudinaryVerified;
  }

  try {
    configureCloudinary();
    await cloudinary.api.ping();
    cloudinaryVerified = true;
    cloudinaryError = null;
    cloudinaryAdvice = null;
    return true;
  } catch (err: any) {
    cloudinaryVerified = false;
    const msg = err?.error?.message || err?.message || String(err);
    cloudinaryError = msg;
    if (msg.includes("cloud_name mismatch") || err?.error?.http_code === 401) {
      cloudinaryAdvice = `Cloud Name "${rawCloudName}" does not match your API Key/Secret. Please check your Cloudinary Console Dashboard -> Product Environment Credentials for your exact 'Cloud name'.`;
    } else {
      cloudinaryAdvice = "Please check your Cloudinary API Key, Secret, and Cloud Name.";
    }
    return false;
  }
};

// Auto-run configuration on import
configureCloudinary();
verifyCloudinaryConnection().catch(() => {});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  originalFileName?: string;
}

/**
 * Upload an image (base64 data URI or buffer) securely to Cloudinary.
 * Sets folder to 'bismillah_apartments/' and auto-generates unique public IDs.
 */
export const uploadToCloudinary = async (
  fileData: string,
  options: {
    folder?: string;
    publicIdPrefix?: string;
    category?: string;
  } = {}
): Promise<CloudinaryUploadResult> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
    );
  }

  // Ensure latest config is loaded
  configureCloudinary();

  const folder = options.folder || "bismillah_apartments";
  const uploadOptions: any = {
    folder,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "gif"],
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" }
    ],
  };

  const result: UploadApiResponse = await cloudinary.uploader.upload(fileData, uploadOptions);

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    sizeBytes: result.bytes,
    width: result.width,
    height: result.height,
    originalFileName: result.original_filename,
  };
};

/**
 * Safely delete an asset from Cloudinary using its public_id.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!publicId) {
    return false;
  }

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured; the asset was not deleted.");
  }

  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
  if (result.result === "ok" || result.result === "not found") {
    return true;
  }
  throw new Error("Cloudinary did not confirm asset deletion.");
};

/**
 * Get Cloudinary status summary for Admin panel (without revealing API secret)
 */
export const getCloudinaryStatus = () => {
  const configured = isCloudinaryConfigured();
  const rawCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
  const hasSpaces = /\s/.test(rawCloudName);

  return {
    configured,
    verified: cloudinaryVerified === true,
    cloudName: rawCloudName ? `${rawCloudName.slice(0, 3)}***` : "Not configured",
    hasSpaces,
    error: cloudinaryError || (hasSpaces ? `Cloud name contains spaces ("${rawCloudName}")` : undefined),
    advice: cloudinaryAdvice || (hasSpaces ? "Cloudinary Cloud Names cannot contain spaces. Find your exact Cloud Name on your Cloudinary Dashboard under Product Environment Credentials." : undefined),
    folder: "bismillah_apartments",
  };
};
