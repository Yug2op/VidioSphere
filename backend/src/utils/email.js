import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { User } from "../models/user.model.js";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ Server is ready to take messages", success);
  }
});

// Function to render email template
const renderTemplate = async (templateName, data) => {
  try {
    const templatePath = join(__dirname, '..', 'templates', `${templateName}.html`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, { ...data, currentYear: new Date().getFullYear() });
  } catch (error) {
    console.error(`Error rendering ${templateName} template:`, error);
    throw new Error(`Failed to render ${templateName} template`);
  }
};

// General email sending function with user existence check
export const sendEmail = async ({ to, subject, text, html, checkUserExists = false }) => {
  // Check if user exists before sending email
  if (checkUserExists) {
    const userExists = await User.findOne({ email: to });
    if (!userExists) {
      console.log(`User with email ${to} not found. Email not sent.`);
      return { message: 'If an account with this email exists, you will receive a password reset link' };
    }
  }

  const mailOptions = {
    from: `"VidioSphere" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async (user, token) => {
  try {
    // Get the base URL from CORS_ORIGIN, default to localhost if not set
    const baseUrl = process.env.CORS_ORIGIN?.split(',')[1]?.trim() || 'http://localhost:5173';
    console.log(baseUrl);
    
    // Remove any trailing slashes from the base URL
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    // Construct the verification link with token only
    const verificationLink = `${cleanBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const html = await renderTemplate('emailVerification', {
      username: user.username,
      verificationLink,
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - VidioSphere',
      text: `Please verify your email by clicking the following link: ${verificationLink}`,
      html,
      checkUserExists: true
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, token) => {
  try {
    const baseUrl = process.env.CORS_ORIGIN?.split(',')[1]?.trim() || 'http://localhost:5173';
    console.log(baseUrl);
    // Only include token in the URL, not email
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    console.log('Sending reset link to:', user.email); // Don't log the full link

    const html = await renderTemplate('passwordReset', {
      resetLink: resetLink,
      currentYear: new Date().getFullYear()
    });

    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - VidioSphere',
      text: `To reset your password, please click the following link: ${resetLink}`,
      html,
      checkUserExists: true
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};