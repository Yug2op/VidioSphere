import rateLimit from "express-rate-limit";

export const createRateLimiter = (options) => rateLimit(options);

export const otpRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  max: 3, // limit each IP to 3 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
});

export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: "Too many password reset requests, try again later." },
});