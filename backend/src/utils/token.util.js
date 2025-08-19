import crypto from "crypto";
import bcrypt from "bcrypt";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
};

export const generateRandomToken = (len = 48) => crypto.randomBytes(len).toString("hex");

export const hashToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareToken = (token, hash) => bcrypt.compare(token, hash);