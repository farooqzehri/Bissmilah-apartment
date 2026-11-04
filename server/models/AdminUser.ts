import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  username: string;
  email: string;
  pin: string;
  passwordHash?: string;
  role: "admin" | "superadmin" | "manager" | "staff";
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    pin: { type: String, required: true, select: false },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin", "superadmin", "manager", "staff"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["read", "write", "delete", "publish", "settings"],
    },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const AdminUserModel: mongoose.Model<IAdminUser> =
  (mongoose.models.AdminUser as mongoose.Model<IAdminUser>) ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
