import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createOTP, verifyOTP } from "../Services/otpService.js";
import { sendOTPEmail } from "../Services/emailService.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });


router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const result = verifyOTP(normalizedEmail, code);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    user.isVerified = true;
    await user.save();

    const token = signToken(user);
    res.json({ message: "Email verified", user: user.toPublicJSON(), token });
  } catch (err) {
    console.error("OTP verify error:", err.message);
    res.status(500).json({ message: "Verification failed" });
  }
});

// POST /api/otp/resend
// Covers: user closed the verify screen, or tried to log in before verifying and needs a new code.
router.post("/resend", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "No account found with that email" });
    if (user.isVerified) return res.status(400).json({ message: "This account is already verified" });

    const code = createOTP(normalizedEmail);
    await sendOTPEmail(normalizedEmail, code);
    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("OTP resend error:", err.message);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});
import bcrypt from "bcryptjs";

// POST /api/otp/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    // Don't reveal whether the account exists
    if (user) {
      const code = createOTP(`reset:${normalizedEmail}`);
      await sendOTPEmail(normalizedEmail, code);
    }
    res.json({ message: "If that email exists, a reset code has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send reset code" });
  }
});

// POST /api/otp/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const normalizedEmail = email.toLowerCase();
    const result = verifyOTP(`reset:${normalizedEmail}`, code);
    if (!result.success) return res.status(400).json({ message: result.message });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "Account not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    clearOTP(`reset:${normalizedEmail}`);

    res.json({ message: "Password reset. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;