import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  id: string;
  propertyId?: string;
  slug: string;
  title: string;
  category: "apartments" | "estates" | "schemes" | "commercial";
  purpose: "sale" | "rent";
  price: string;
  numericPrice?: number;
  currency: string;
  location: string;
  city: string;
  area: string;
  googleMapsUrl?: string;
  size: string;
  coveredAreaUnit: string;
  tag: string;
  status: string;
  availability: "Available" | "Reserved" | "Sold" | "Rented" | "Unavailable";
  published: boolean;
  featured: boolean;
  bedrooms?: number | string;
  bathrooms?: number | string;
  floorNumber?: string;
  totalFloors?: string;
  furnishingStatus?: "Furnished" | "Semi-Furnished" | "Unfurnished" | "N/A";
  description: string;
  fullOverview?: string;
  image: string; // Cloudinary secure URL or fallback URL
  imagePublicId?: string; // Cloudinary public ID for deletion
  gallery: string[]; // Cloudinary secure URLs
  galleryPublicIds?: string[]; // Cloudinary public IDs
  highlights: string[];
  specs: { label: string; value: string }[];
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["apartments", "estates", "schemes", "commercial"],
      default: "apartments",
      index: true,
    },
    purpose: {
      type: String,
      enum: ["sale", "rent"],
      default: "sale",
      index: true,
    },
    price: { type: String, required: true },
    numericPrice: { type: Number, index: true },
    currency: { type: String, default: "PKR" },
    location: { type: String, required: true },
    city: { type: String, default: "Quetta" },
    area: { type: String, default: "A-1 City" },
    googleMapsUrl: { type: String },
    size: { type: String, required: true },
    coveredAreaUnit: { type: String, default: "Sq. Ft." },
    tag: { type: String, default: "Exclusive" },
    status: { type: String, default: "100% Registry Ready" },
    availability: {
      type: String,
      enum: ["Available", "Reserved", "Sold", "Rented", "Unavailable"],
      default: "Available",
      index: true,
    },
    published: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    bedrooms: { type: Schema.Types.Mixed },
    bathrooms: { type: Schema.Types.Mixed },
    floorNumber: { type: String },
    totalFloors: { type: String },
    furnishingStatus: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished", "N/A"],
      default: "Unfurnished",
    },
    description: { type: String, required: true },
    fullOverview: { type: String },
    image: { type: String, required: true },
    imagePublicId: { type: String },
    gallery: { type: [String], default: [] },
    galleryPublicIds: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    specs: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    amenities: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Search indexes for title, description, location
PropertySchema.index({ title: "text", description: "text", location: "text" });

export const PropertyModel: mongoose.Model<IProperty> =
  (mongoose.models.Property as mongoose.Model<IProperty>) ||
  mongoose.model<IProperty>("Property", PropertySchema);
