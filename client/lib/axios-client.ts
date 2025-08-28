import axios from "axios";

import { CustomError } from "@/types/custom-error.type";
import { refreshTokenFn } from "./api";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API = axios.create({
  baseURL,
  withCredentials: true, // Need this for cookies
  timeout: 10000,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

// Flag to prevent infinite refresh loops
let hasRefreshFailed = false;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (err) => {
    const response = err.response;
    const data = response?.data;
    const status = response?.status;
    const originalRequest = err.config;

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
        return new Promise((resolve, reject) => {
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
        await refreshTokenFn();
        console.log("✅ Token refresh successful, retrying request...");
        hasRefreshFailed = false; // Reset failure flag on success

        // Process the queue
        processQueue(null, "success");

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError: any) {
        console.log("❌ Token refresh failed:", refreshError);
        console.log("❌ Refresh error details:", {
          message: refreshError?.message,
          status: refreshError?.response?.status,
          data: refreshError?.response?.data,
        });
        hasRefreshFailed = true; // Set flag to prevent immediate retry

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
      ...err,
      errorCode: data?.errorCode || "UNKNOWN_ERROR",
      status,
      data,
    };

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
  (window as any).__resetRefreshFlag = resetRefreshFailureFlag;
}

// No need for request interceptor since cookies are automatically sent
export default API;
