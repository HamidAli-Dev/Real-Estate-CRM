import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { CustomError } from "@/types/custom-error.type";
import { refreshTokenFn } from "./api";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Token storage utilities for localStorage
const TOKEN_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },
  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    }
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    }
  },
  removeTokens: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    }
  },
  hasTokens: (): boolean => {
    return !!(tokenStorage.getAccessToken() && tokenStorage.getRefreshToken());
  },
};

interface ErrorData {
  errorCode?: string;
  [key: string]: unknown;
}

const API = axios.create({
  baseURL,
  timeout: 10000,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

// Flag to prevent infinite refresh loops
let hasRefreshFailed = false;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add Authorization header with access token
API.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (res: AxiosResponse) => {
    return res.data;
  },
  async (err: AxiosError) => {
    const response = err.response;
    const data = response?.data as ErrorData | undefined;
    const status = response?.status;
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      url?: string;
    };

    // Check for 401 status - handle both token expiry and unauthorized access
    if (status === 401) {
      const now = Date.now();

      console.log("🚨 401 Unauthorized detected:", {
        status,
        data,
        originalRequest: originalRequest.url,
        hasRefreshFailed,
        timeSinceLastRefresh: now - lastRefreshAttempt,
        inCooldown:
          hasRefreshFailed && now - lastRefreshAttempt < REFRESH_COOLDOWN,
      });

      // Check if we're in a refresh cooldown period
      if (hasRefreshFailed && now - lastRefreshAttempt < REFRESH_COOLDOWN) {
        console.log("🚫 In refresh cooldown, redirecting to login...");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(err);
      }

      // Check if this is a refresh token request that failed - don't retry refresh on refresh failure
      if (originalRequest.url?.includes("/refresh-token")) {
        console.log(
          "🚫 Refresh token request itself failed, redirecting to login..."
        );
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(err);
      }

      console.log("🔐 Token expired, attempting refresh...", {
        status,
        data,
        originalRequest: originalRequest.url,
        timeSinceLastRefresh: now - lastRefreshAttempt,
      });

      // If we're already refreshing, add to queue
      if (isRefreshing) {
        console.log("⏳ Already refreshing, adding to queue...");
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log("✅ Got token from queue, retrying request...");
            return API(originalRequest);
          })
          .catch((error) => {
            console.log("❌ Queue promise rejected:", error);
            return Promise.reject(error);
          });
      }

      // Start refresh process
      console.log("🔄 Starting token refresh...");
      isRefreshing = true;
      originalRequest._retry = true;
      lastRefreshAttempt = now;

      try {
        const newTokens = await refreshTokenFn();
        console.log("✅ Token refresh successful, retrying request...");
        hasRefreshFailed = false; // Reset failure flag on success

        // Update the original request with new token
        if (originalRequest.headers && newTokens.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        // Process the queue
        processQueue(null, "success");

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError: unknown) {
        const refreshAxiosError = refreshError as AxiosError | undefined;
        console.log("❌ Token refresh failed:", refreshError);
        console.log("❌ Refresh error details:", {
          message: (refreshError as { message?: string } | undefined)?.message,
          status: refreshAxiosError?.response?.status,
          data: refreshAxiosError?.response?.data,
        });
        hasRefreshFailed = true; // Set flag to prevent immediate retry

        // Clear tokens from localStorage on refresh failure
        tokenStorage.removeTokens();
        
        // Process the queue
        processQueue(refreshError, null);

        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const customError: CustomError = {
      ...(err as unknown as Error),
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
      // Keeping extra fields on the thrown object while typing as CustomError
      ...(status !== undefined ? { status } : {}),
      ...(data !== undefined ? { data } : {}),
    } as CustomError;

    return Promise.reject(customError);
  }
);

// Function to reset the refresh failure flag
export const resetRefreshFailureFlag = () => {
  hasRefreshFailed = false;
  lastRefreshAttempt = 0;
  // console.log("🔄 Refresh failure flag reset");
};

// Expose globally for auth context to use
if (typeof window !== "undefined") {
  (window as unknown as { __resetRefreshFlag: () => void }).__resetRefreshFlag =
    resetRefreshFailureFlag;
}

// No request interceptor needed for cookies, but we have one above for Authorization header
export default API;
