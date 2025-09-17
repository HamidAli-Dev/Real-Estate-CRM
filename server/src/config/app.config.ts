import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  JWT_SECRET: getEnv("JWT_SECRET", "your_jwt_secret"),
  JWT_EXPIRATION: getEnv("JWT_EXPIRATION", "1h"),
  DATABASE_URL: getEnv("DATABASE_URL", ""),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
  SMTP_HOST: getEnv("SMTP_HOST", "smtp.gmail.com"),
  SMTP_PORT: getEnv("SMTP_PORT", "587"),
  SMTP_SECURE: getEnv("SMTP_SECURE", "false"), // true for 465, false for other ports
  SMTP_USER: getEnv("SMTP_USER", ""),
  SMTP_PASS: getEnv("SMTP_PASS", ""),
  CLIENT_BASE_URL: getEnv("CLIENT_BASE_URL", "http://localhost:3000"),
  SMTP_FROM: getEnv("EMAIL_FROM", "noreply@example.com"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),
});

export const APP_CONFIG = appConfig();
