import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerInquiry extends Document {
  id: string;
  token: string;
  clientName: string;
  phone: string;
  email?: string;
  propertyInterest?: string;
  preferredDate?: string;
  meetingType: string;
  clientNote?: string;
  status: "New" | "Contacted" | "In Review" | "Booked" | "Closed" | "Archived";
  internalNotes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerInquirySchema = new Schema<ICustomerInquiry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    propertyInterest: { type: String, default: "General Portfolio" },
    preferredDate: { type: String },
    meetingType: {
      type: String,
      default: "office",
    },
    clientNote: { type: String, default: "" },
    status: {
      type: String,
      enum: ["New", "Contacted", "In Review", "Booked", "Closed", "Archived"],
      default: "New",
      index: true,
    },
    internalNotes: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

CustomerInquirySchema.index({ clientName: "text", phone: "text", propertyInterest: "text" });

export const CustomerInquiryModel: mongoose.Model<ICustomerInquiry> =
  (mongoose.models.CustomerInquiry as mongoose.Model<ICustomerInquiry>) ||
  mongoose.model<ICustomerInquiry>("CustomerInquiry", CustomerInquirySchema);
