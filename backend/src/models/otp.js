import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
  },

  code: {
    type: String,
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },

  verified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("OTP", otpSchema);