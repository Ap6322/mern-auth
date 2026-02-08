import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    verifyOtp: {
      type: String,
      default: null,
    },
    verifyOtpExpireAt: {
      type: Date,
      default: null,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);
