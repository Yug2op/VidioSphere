import express from "express";
import { otpRateLimiter, forgotPasswordRateLimiter } from "../middlewares/rateLimiter.js";
import { register, verifyEmail, resendOtp, forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", otpRateLimiter, verifyEmail);
router.post("/resend-otp", otpRateLimiter, resendOtp);
router.post("/forgot-password", forgotPasswordRateLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

// ...existing login route should be updated to check isEmailVerified
export default router;