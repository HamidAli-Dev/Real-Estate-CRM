import Cookie from "js-cookie";
import axios from "axios";

import {
  loginType,
  registerType,
  loginResponseType,
  createPropertyType,
  editPropertyType,
} from "@/types/api.types";
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
  const response = await API.post("/auth/register-owner", data);
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

  const result = response as unknown as { message: string; user: any }; // axios interceptor transforms the response
  return result;
};

// Workspace API functions
export const createWorkspaceMutationFn = async (data: { name: string }) => {
  const response = await API.post("/workspace/create", data);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  if (responseData && responseData.success) {
    return responseData.data; // Return the actual workspace data
  } else {
    throw new Error(responseData?.message || "Failed to create workspace");
  }
};

export const editWorkspaceMutationFn = async (data: {
  workspaceId: string;
  name: string;
}) => {
  const { workspaceId, ...updateData } = data;
  const response = await API.put(`/workspace/${workspaceId}`, updateData);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  if (responseData && responseData.success) {
    return responseData.data; // Return the actual workspace data
  } else {
    throw new Error(responseData?.message || "Failed to update workspace");
  }
};

export const getUserWorkspacesQueryFn = async () => {
  const response = await API.get("/workspace/user");

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual workspaces data
  } else {
    throw new Error(responseData?.message || "Failed to fetch user workspaces");
  }
};

export const getWorkspaceByIdQueryFn = async (workspaceId: string) => {
  const response = await API.get(`/workspace/${workspaceId}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual workspace data
  } else {
    throw new Error(responseData?.message || "Failed to fetch workspace");
  }
};

// New workspace user management API functions
export const getWorkspaceUsersQueryFn = async (workspaceId: string) => {
  const response = await API.get(`/workspace/${workspaceId}/users`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual users data
  } else {
    throw new Error(responseData?.message || "Failed to fetch workspace users");
  }
};

export const inviteUserMutationFn = async (data: {
  workspaceId: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Agent";
  permissions: string[];
}) => {
  const { workspaceId, ...inviteData } = data;
  const response = await API.post(
    `/workspace/${workspaceId}/users/invite`,
    inviteData
  );

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual response data
  } else {
    throw new Error(responseData?.message || "Failed to invite user");
  }
};

export const updateUserRoleMutationFn = async (data: {
  workspaceId: string;
  userId: string;
  role: "Admin" | "Manager" | "Agent";
  permissions: string[];
}) => {
  const { workspaceId, userId, ...updateData } = data;
  const response = await API.put(
    `/workspace/${workspaceId}/users/${userId}/role`,
    updateData
  );

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual response data
  } else {
    throw new Error(responseData?.message || "Failed to update user role");
  }
};

export const removeUserMutationFn = async (data: {
  workspaceId: string;
  userId: string;
}) => {
  const { workspaceId, userId } = data;
  const response = await API.delete(
    `/workspace/${workspaceId}/users/${userId}`
  );
  return response;
};

// Property API functions
export const createPropertyMutationFn = async (data: createPropertyType) => {
  const formData = new FormData();

  // Add text fields
  Object.keys(data).forEach((key) => {
    if (key !== "images") {
      formData.append(key, data[key as keyof createPropertyType] as string);
    }
  });

  // Add images
  if (data.images) {
    data.images.forEach((image: File, index: number) => {
      formData.append(`images`, image);
    });
  }

  const response = await API.post("/properties", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Check if the response indicates success
  if (response.data.success) {
    return response.data.data; // Return the actual property data
  } else {
    throw new Error(response.data.message || "Failed to create property");
  }
};

export const editPropertyMutationFn = async ({
  id,
  data,
}: {
  id: string;
  data: editPropertyType;
}) => {
  const formData = new FormData();

  // Add text fields
  Object.keys(data).forEach((key) => {
    if (key !== "images" && data[key as keyof editPropertyType] !== undefined) {
      formData.append(key, data[key as keyof editPropertyType] as string);
    }
  });

  // Add images
  if (data.images) {
    data.images.forEach((image: File, index: number) => {
      formData.append(`images`, image);
    });
  }

  const response = await API.put(`/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Check if the response indicates success
  if (response.data.success) {
    return response.data.data; // Return the actual property data
  } else {
    throw new Error(response.data.message || "Failed to update property");
  }
};

export const deletePropertyMutationFn = async (id: string) => {
  const response = await API.delete(`/properties/${id}`);

  // Check if the response indicates success
  if (response.data.success) {
    return response.data.data; // Return the actual data
  } else {
    throw new Error(response.data.message || "Failed to delete property");
  }
};

export const getPropertiesQueryFn = async (workspaceId: string) => {
  const response = await API.get(`/properties?workspaceId=${workspaceId}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check if the response indicates success
  if (responseData.success) {
    return responseData.data; // Return the actual properties array
  } else {
    throw new Error(responseData.message || "Failed to fetch properties");
  }
};

export const getPropertyByIdQueryFn = async (id: string) => {
  const response = await API.get(`/properties/${id}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check if the response indicates success
  if (responseData.success) {
    return responseData.data; // Return the actual property data
  } else {
    throw new Error(responseData.message || "Failed to fetch property");
  }
};

export const getPropertyCategoriesQueryFn = async (workspaceId: string) => {
  const response = await API.get(
    `/properties/categories?workspaceId=${workspaceId}`
  );

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as any;

  // Check if the response indicates success
  if (responseData.success) {
    return responseData.data; // Return the actual categories array
  } else {
    throw new Error(responseData.message || "Failed to fetch categories");
  }
};
