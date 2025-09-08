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
  FRONTEND_BASE_URL: getEnv("FRONTEND_BASE_URL", "http://localhost:3000"),
  SMTP_FROM: getEnv("EMAIL_FROM", "noreply@example.com"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),

  // stripe
  STRIPE_BASIC_PLAN_STRIPE_PRICE_ID: getEnv(
    "STRIPE_BASIC_PLAN_STRIPE_PRICE_ID",
    "price_basic_123"
  ),
  STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID: getEnv(
    "STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID",
    "price_standard_123"
  ),
  STRIPE_PRO_PLAN_STRIPE_PRICE_ID: getEnv(
    "STRIPE_PRO_PLAN_STRIPE_PRICE_ID",
    "price_pro_123"
  ),
});

export const APP_CONFIG = appConfig();
