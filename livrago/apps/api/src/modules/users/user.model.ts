import { UserRole, UserStatus } from "@livrago/shared-types";
import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isPhoneVerified: boolean;
  isActive: boolean;
  status: UserStatus;
  refreshTokenHash?: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["CUSTOMER", "BUSINESS", "DRIVER", "DELIVERY_COMPANY", "ADMIN"],
      default: "CUSTOMER",
      index: true,
    },
    avatar: String,
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    refreshTokenHash: { type: String, select: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>("User", userSchema);
