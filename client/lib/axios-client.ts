import axios from "axios";

import { CustomError } from "@/types/custom-error.type";
import { refreshTokenFn } from "./api";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

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

// Safe cookie functions that check if we're in the browser
const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  } catch (error) {
    console.error("Error reading cookie:", error);
  }
  return undefined;
};

const setCookie = (name: string, value: string, options: any = {}) => {
  if (typeof window === "undefined") return;

  try {
    document.cookie = `${name}=${value}; path=/; ${
      options.secure ? "secure;" : ""
    } ${options.sameSite ? `samesite=${options.sameSite};` : ""}`;
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
};

const removeCookie = (name: string) => {
  if (typeof window === "undefined") return;

  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  } catch (error) {
    console.error("Error removing cookie:", error);
  }
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

    // Check for 401 status and either "Unauthorized" message or "ACCESS_UNAUTHORIZED" error code
    if (
      status === 401 &&
      (data === "Unauthorized" || data?.errorCode === "ACCESS_UNAUTHORIZED")
    ) {
      console.log("🔐 Token expired, attempting refresh...", {
        status,
        data,
        originalRequest: originalRequest.url,
      });

      // If we're already refreshing, add to queue
      if (isRefreshing) {
        console.log("⏳ Already refreshing, adding to queue...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("✅ Got token from queue, retrying request...");
            originalRequest.headers.Authorization = `Bearer ${token}`;
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

      try {
        const { accessToken } = await refreshTokenFn();
        console.log(
          "✅ Token refresh successful, updating cookies and retrying..."
        );

        // Update the access token in cookies
        setCookie("accessToken", accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        // Update the failed request's authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process the queue
        processQueue(null, accessToken);

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        console.log("❌ Token refresh failed:", refreshError);
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        removeCookie("accessToken");
        removeCookie("refreshToken");

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

API.interceptors.request.use((config) => {
  const token = getCookie("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
