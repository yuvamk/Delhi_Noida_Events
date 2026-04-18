import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  password?: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  cityPreference?: "Delhi" | "Noida" | "Both";
  categoryPreferences: string[];
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  otpCode?: string;
  otpExpires?: Date;
  lastLogin?: Date;
  loginCount: number;
  fcmToken?: string;
  bookmarkedEvents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    password: { type: String, minlength: 8, select: false },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    cityPreference: { type: String, enum: ["Delhi", "Noida", "Both"], default: "Both" },
    categoryPreferences: [{ type: String }],
    notificationsEnabled: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    fcmToken: { type: String, select: false },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
    bookmarkedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  },
  { timestamps: true }
);

// Redundant index removed: email is already unique via field definition

// Pre-save: hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
