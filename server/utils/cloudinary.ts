import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Initialize Cloudinary with environment variables
export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(cloudName && apiKey && apiSecret);
};

export const configureCloudinary = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

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

// Auto-run configuration on import
configureCloudinary();

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
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg"],
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
  if (!isCloudinaryConfigured() || !publicId) {
    return false;
  }

  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return result.result === "ok";
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, err);
    return false;
  }
};

/**
 * Get Cloudinary status summary for Admin panel (without revealing API secret)
 */
export const getCloudinaryStatus = () => {
  const configured = isCloudinaryConfigured();
  return {
    configured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? `${process.env.CLOUDINARY_CLOUD_NAME.slice(0, 3)}***` : "Not configured",
    folder: "bismillah_apartments",
  };
};
