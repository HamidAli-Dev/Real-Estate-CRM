import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  JWT_SECRET: getEnv("JWT_SECRET", "your_jwt_secret"),
  JWT_EXPIRATION: getEnv("JWT_EXPIRATION", "1h"),
  DATABASE_URL: getEnv("DATABASE_URL", ""),
});

export const APP_CONFIG = appConfig();
