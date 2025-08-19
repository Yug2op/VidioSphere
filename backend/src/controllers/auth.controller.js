import asyncHandler from "../middlewares/async.handler.js";
import User from "../models/user.model.js";
import Token from "../models/token.model.js";
import { generateOTP, hashToken, compareToken, generateRandomToken } from "../utils/token.util.js";
import { sendEmail } from "../utils/email.js";
import dayjs from "dayjs";

// POST /users/register
export const register = asyncHandler(async (req, res) => {
  // ...existing validation...
  const { email, username, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: "Email already registered" });

  const user = await User.create({ email, username, password, isEmailVerified: false });

  const otp = generateOTP();
  const tokenHash = await hashToken(otp);
  const expiresAt = dayjs().add(15, "minute").toDate();

  await Token.create({ user: user._id, tokenHash, type: "emailVerify", expiresAt });

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It expires in 15 minutes.`,
  });

  return res.json({ success: true, message: "Account created. Verify email with the OTP sent to your mailbox." });
});

// POST /users/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: "Invalid email" });

  const tokenDoc = await Token.findOne({ user: user._id, type: "emailVerify", used: false }).sort({ createdAt: -1 });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  const ok = await compareToken(otp, tokenDoc.tokenHash);
  if (!ok) return res.status(400).json({ success: false, message: "Invalid OTP" });

  tokenDoc.used = true;
  await tokenDoc.save();

  user.isEmailVerified = true;
  await user.save();

  return res.json({ success: true, message: "Email verified successfully." });
});

// POST /users/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ success: false, message: "Invalid email" });

  // basic cooldown: ensure not sent in last 60s
  const last = await Token.findOne({ user: user._id, type: "emailVerify" }).sort({ createdAt: -1 });
  if (last && (new Date() - last.createdAt) < 60 * 1000) {
    return res.status(429).json({ success: false, message: "Wait before requesting another code" });
  }

  const otp = generateOTP();
  const tokenHash = await hashToken(otp);
  const expiresAt = dayjs().add(15, "minute").toDate();

  await Token.create({ user: user._id, tokenHash, type: "emailVerify", expiresAt });

  await sendEmail({
    to: user.email,
    subject: "Your verification OTP",
    text: `Your verification code is ${otp}. It expires in 15 minutes.`,
  });

  return res.json({ success: true, message: "OTP resent" });
});

// POST /users/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true, message: "If the email exists, a reset link will be sent." });

  const token = generateRandomToken(24);
  const tokenHash = await hashToken(token);
  const expiresAt = dayjs().add(60, "minute").toDate();

  await Token.create({ user: user._id, tokenHash, type: "resetPassword", expiresAt });

  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}&id=${user._id}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 60 minutes.`,
  });

  return res.json({ success: true, message: "If the email exists, a reset link will be sent." });
});

// POST /users/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { userId, token, password } = req.body;
  const tokenDoc = await Token.findOne({ user: userId, type: "resetPassword", used: false }).sort({ createdAt: -1 });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }

  const ok = await compareToken(token, tokenDoc.tokenHash);
  if (!ok) return res.status(400).json({ success: false, message: "Invalid token" });

  const user = await User.findById(userId);
  if (!user) return res.status(400).json({ success: false, message: "Invalid user" });

  user.password = password; // will be hashed by model pre-save
  await user.save();

  tokenDoc.used = true;
  await tokenDoc.save();

  return res.json({ success: true, message: "Password reset successful." });
});

// POST /users/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  // check verified
  if (!user.isEmailVerified) {
    return res.status(403).json({ success: false, message: "Email not verified. Please verify via OTP." });
  }

  // then verify password and continue
  // Check if the password matches
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

  // Generate a token (assuming you have a method for this)
  const token = user.generateAuthToken();

  return res.json({ success: true, token });
});