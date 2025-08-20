import Cookie from "js-cookie";
import axios from "axios";

import { loginType, registerType, loginResponseType } from "@/types/api.types";
import API from "./axios-client";

// Separate axios instance for refresh token to avoid interceptor loops
const refreshAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

export const registerMutationFn = async (data: {
  name: string;
  email: string;
  password: string;
  workspaceDomain?: string;
  role?: string;
}) => {
  const response = await API.post("/auth/register", data);
  return response;
};

export const loginMutationFn = async (data: {
  email: string;
  password: string;
}) => {
  const response = await API.post("/auth/login", data);

  // If login successful, update access token in cookies
  if (response.data.accessToken) {
    Cookie.set("accessToken", response.data.accessToken);

    if (response.data.refreshToken) {
      Cookie.set("refreshToken", response.data.refreshToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }
  }
  return response.data;
};

export const refreshTokenFn = async (): Promise<{ accessToken: string }> => {
  const refreshToken = Cookie.get("refreshToken");

  if (!refreshToken) {
    console.log("❌ No refresh token found in cookies");
    throw new Error("No refresh token available");
  }

  console.log("🔄 Attempting to refresh token...");

  try {
    // Use separate axios instance to avoid interceptor loops
    const response = await refreshAPI.post("/auth/refresh-token", {
      refreshToken,
    });
    console.log("✅ Refresh token response:", response.data);
    return response.data; // Direct access to response.data since no interceptor
  } catch (error) {
    console.log("❌ Refresh token request failed:", error);
    throw error;
  }
};

export const getCurrentUserQueryFn = async (): Promise<{
  message: string;
  user: any;
}> => {
  const response = await API.get(`/user/current`);
  return response as unknown as { message: string; user: any }; // axios interceptor transforms the response
};

// Workspace API functions
export const createWorkspaceMutationFn = async (data: {
  name: string;
  domain: string;
}) => {
  const response = await API.post("/workspace/create", data);
  return response;
};

export const editWorkspaceMutationFn = async (data: {
  workspaceId: string;
  name: string;
  domain?: string;
}) => {
  const { workspaceId, ...updateData } = data;
  const response = await API.put(`/workspace/${workspaceId}`, updateData);
  return response;
};

export const getUserWorkspacesQueryFn = async () => {
  const response = await API.get("/workspace/user");
  return response;
};

export const getWorkspaceByIdQueryFn = async (workspaceId: string) => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response;
};
