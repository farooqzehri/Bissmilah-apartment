import mongoose, { Schema, Document } from "mongoose";

export interface IMediaAsset extends Document {
  id: string;
  url: string;
  secureUrl: string;
  publicId?: string; // Cloudinary public_id
  format?: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  category: string;
  title: string;
  altText: string;
  caption: string;
  uploadedAt: string;
  usageCount: number;
  storageProvider: "cloudinary" | "local" | "remote";
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    id: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
    publicId: { type: String, index: true },
    format: { type: String },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, default: "image/jpeg" },
    sizeBytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    category: { type: String, default: "General", index: true },
    title: { type: String, default: "Bismillah Real Estate" },
    altText: { type: String, default: "" },
    caption: { type: String, default: "" },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
    usageCount: { type: Number, default: 0 },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "local", "remote"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

MediaAssetSchema.index({ title: "text", fileName: "text", category: "text" });

export const MediaAssetModel: mongoose.Model<IMediaAsset> =
  (mongoose.models.MediaAsset as mongoose.Model<IMediaAsset>) ||
  mongoose.model<IMediaAsset>("MediaAsset", MediaAssetSchema);
