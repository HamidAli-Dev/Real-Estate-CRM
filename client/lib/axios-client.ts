import axios from "axios";
import Cookies from "js-cookie";

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

API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (err) => {
    const response = err.response;
    const data = response?.data;
    const status = response?.status;
    const originalRequest = err.config;

    if (data === "Unauthorized" && status === 401) {
      // If we're already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }

      // Start refresh process
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshTokenFn();

        // Update the access token in cookies
        Cookies.set("accessToken", accessToken, {
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
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

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
  const token = Cookies.get("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
