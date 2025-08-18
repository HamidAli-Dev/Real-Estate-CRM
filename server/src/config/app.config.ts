import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  JWT_SECRET: getEnv("JWT_SECRET", "your_jwt_secret"),
  JWT_EXPIRATION: getEnv("JWT_EXPIRATION", "1h"),
  DATABASE_URL: getEnv("DATABASE_URL", ""),
  CORS_ORIGIN: getEnv("CORS_ORIGIN", "localhost:3000"),

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
