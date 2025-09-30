import axios, { AxiosError } from "axios";

import {
  createPropertyType,
  createWorkspaceResponseType,
  editWorkspaceResponseType,
  editPropertyType,
  getCurrentUserResponseType,
  propertyType,
  propertyCategoryType,
  userWorkspaceType,
} from "@/types/api.types";
import API, { tokenStorage } from "./axios-client";

// Separate axios instance for refresh token to avoid interceptor loops
const refreshAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

interface ApiEnvelope<T = unknown> {
  message?: string;
  data?: T;
}

interface AuthResponse {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

const hasStringMessage = (value: unknown): value is { message: string } => {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
};

export const registerMutationFn = async (data: {
  name: string;
  email: string;
  password: string;
  workspaceDomain?: string;
  role?: string;
}) => {
  const response = await API.post("/auth/register-owner", data);

  // Store tokens in localStorage if present
  if (response.data?.accessToken) {
    tokenStorage.setAccessToken(response.data.accessToken);
  }
  if (response.data?.refreshToken) {
    tokenStorage.setRefreshToken(response.data.refreshToken);
  }

  return response;
};

export const loginMutationFn = async (data: {
  email: string;
  password: string;
}) => {
  const response = await API.post("/auth/login", data);

  // Store tokens in localStorage
  const responseData = (response as ApiEnvelope<AuthResponse>).data;
  if (responseData?.accessToken) {
    tokenStorage.setAccessToken(responseData.accessToken);
  }
  if (responseData?.refreshToken) {
    tokenStorage.setRefreshToken(responseData.refreshToken);
  }

  return responseData;
};

export const refreshTokenFn = async (): Promise<{
  message: string;
  accessToken: string;
}> => {
  console.log("🔄 Attempting to refresh token...");

  try {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Use separate axios instance to avoid interceptor loops
    const response = await refreshAPI.post("/auth/refresh-token", {
      refreshToken,
    });

    // Store new access token
    if (response.data?.data?.accessToken) {
      tokenStorage.setAccessToken(response.data.data.accessToken);
    }

    return {
      message: response.data.message,
      accessToken: response.data.data.accessToken,
    };
  } catch (error) {
    console.log("❌ Refresh token request failed:", error);
    // Clear tokens on refresh failure
    tokenStorage.removeTokens();
    throw error;
  }
};

export const getCurrentUserQueryFn =
  async (): Promise<getCurrentUserResponseType> => {
    const response = await API.get(`/user/current`);

    return response as unknown as getCurrentUserResponseType;
  };

// Workspace API functions
export const createWorkspaceMutationFn = async (data: {
  name: string;
}): Promise<createWorkspaceResponseType> => {
  const response = await API.post("/workspace/create", data);

  return response as unknown as createWorkspaceResponseType;
};

export const editWorkspaceMutationFn = async (data: {
  workspaceId: string;
  name: string;
}): Promise<editWorkspaceResponseType["data"]> => {
  const { workspaceId, ...updateData } = data;
  const response = await API.put(`/workspace/${workspaceId}`, updateData);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data as editWorkspaceResponseType["data"]; // Return the actual workspace data
  } else {
    throw new Error(responseData?.message || "Failed to update workspace");
  }
};

export const deleteWorkspaceMutationFn = async (workspaceId: string) => {
  const response = await API.delete(`/workspace/${workspaceId}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual response data
  } else {
    throw new Error(responseData?.message || "Failed to delete workspace");
  }
};

export const getUserWorkspacesQueryFn = async (): Promise<
  userWorkspaceType[]
> => {
  const response = await API.get("/workspace/user");

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data as userWorkspaceType[]; // Return the actual workspaces data
  } else {
    throw new Error(responseData?.message || "Failed to fetch user workspaces");
  }
};

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<userWorkspaceType> => {
  const response = await API.get(`/workspace/${workspaceId}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data as userWorkspaceType; // Return the actual workspace data
  } else {
    throw new Error(responseData?.message || "Failed to fetch workspace");
  }
};

export interface WorkspaceUserResponseType {
  id: string;
  userId: string;
  workspaceId: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
    rolePermissions: {
      id: string;
      roleId: string;
      permissionId: string;
      permission: {
        id: string;
        name: string;
        group: string;
        createdAt: string;
        updatedAt: string;
      }[];
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  invitation: {
    id: string;
    status: string;
    expiresAt: Date;
  } | null;
  status: string;
}

// New workspace user management API functions
export const getWorkspaceUsersQueryFn = async (
  workspaceId: string
): Promise<WorkspaceUserResponseType[]> => {
  try {
    const response = await API.get(`/workspace/${workspaceId}/users`);

    // Since axios interceptor returns res.data, response is already the data object
    const responseData = response as ApiEnvelope<WorkspaceUserResponseType[]>;

    // Check for the actual response structure: { message: string, data: any }
    if (responseData && responseData.data) {
      return responseData.data; // Return the actual users data
    } else {
      throw new Error(
        responseData?.message || "Failed to fetch workspace users"
      );
    }
  } catch (error) {
    const errorResponse = error as {
      response?: { data?: { errorCode: string; message: string } };
    };

    // Handle permission errors gracefully
    if (
      errorResponse?.response?.data?.errorCode === "VALIDATION_ERROR" &&
      errorResponse?.response?.data?.message.includes("Required permission")
    ) {
      console.log(
        "Permission denied for VIEW_USERS in getWorkspaceUsersQueryFn"
      );
      // Return empty array instead of throwing error when permission is denied
      return [];
    }
    console.error("❌ Error fetching workspace users:", error);
    throw error; // Re-throw other errors
  }
};

interface inviteUserType {
  name: string;
  email: string;
  roleId: string;
  workspaceId: string;
}

interface inviteUserResponseType {
  message: string;
  invitation: {
    id: string;
    name: string;
    email: string;
    role: string;
    expiresAt: Date;
  };
}

export const inviteUserMutationFn = async (
  data: inviteUserType
): Promise<inviteUserResponseType> => {
  const { workspaceId, ...inviteData } = data;
  const response = await API.post(
    `/workspace/${workspaceId}/users/invite`,
    inviteData
  );

  return response.data as inviteUserResponseType;
};

export const updateUserRoleMutationFn = async (data: {
  workspaceId: string;
  userId: string;
  roleId: string;
  name: string;
  email: string;
}) => {
  const { workspaceId, userId, ...updateData } = data;
  const response = await API.put(
    `/workspace/${workspaceId}/users/${userId}/role`,
    updateData
  );

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

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
    if (key !== "images" && key !== "features") {
      const value = data[key as keyof createPropertyType];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    }
  });

  // Handle features array specially
  if (data.features && data.features.length > 0) {
    formData.append("features", JSON.stringify(data.features));
  }

  // Add images
  if (data.images) {
    data.images.forEach((image: File, index: number) => {
      formData.append(`images`, image);
    });
  }

  try {
    const response = await API.post("/properties", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds timeout for image uploads
    });

    // Since axios interceptor returns res.data, response is already the data object
    const responseData = response as ApiEnvelope;
    // Check if the response indicates success
    if (responseData && responseData.data) {
      return responseData.data; // Return the actual property data
    } else {
      throw new Error(responseData?.message || "Failed to create property");
    }
  } catch (error: unknown) {
    console.error("❌ createPropertyMutationFn error:", error);

    const axiosErr = error as AxiosError | undefined;
    // Handle different types of errors
    if (axiosErr?.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout - Please try again with fewer or smaller images"
      );
    }

    if (hasStringMessage(axiosErr?.response?.data)) {
      throw new Error(axiosErr.response!.data.message);
    }

    if ((error as { message?: string }).message) {
      throw new Error((error as { message?: string }).message as string);
    }

    throw new Error("Failed to create property - Please try again");
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
    if (
      key !== "images" &&
      key !== "features" &&
      data[key as keyof editPropertyType] !== undefined
    ) {
      const value = data[key as keyof editPropertyType];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    }
  });

  // Handle features array specially
  if (data.features && data.features.length > 0) {
    formData.append("features", JSON.stringify(data.features));
  }

  // Add images
  if (data.images) {
    data.images.forEach((image: File, index: number) => {
      formData.append(`images`, image);
    });
  }

  try {
    const response = await API.put(`/properties/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds timeout for image uploads
    });

    // Since axios interceptor returns res.data, response is already the data object
    const responseData = response as ApiEnvelope;
    // Check if the response indicates success
    if (responseData && responseData.data) {
      return responseData.data; // Return the actual property data
    } else {
      throw new Error(responseData?.message || "Failed to update property");
    }
  } catch (error: unknown) {
    console.error("❌ editPropertyMutationFn error:", error);

    const axiosErr = error as AxiosError | undefined;
    // Handle different types of errors
    if (axiosErr?.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout - Please try again with fewer or smaller images"
      );
    }

    if (hasStringMessage(axiosErr?.response?.data)) {
      throw new Error(axiosErr.response!.data.message);
    }

    if ((error as { message?: string }).message) {
      throw new Error((error as { message?: string }).message as string);
    }

    throw new Error("Failed to update property - Please try again");
  }
};

export const deletePropertyMutationFn = async (id: string) => {
  try {
    const response = await API.delete(`/properties/${id}`);

    // Since axios interceptor returns res.data, response is already the data object
    const responseData = response as ApiEnvelope;
    // Check if the response indicates success
    if (responseData) {
      return responseData.message || "Property deleted successfully"; // Return success message
    } else {
      throw new Error(
        (responseData as ApiEnvelope | undefined)?.message ||
          "Failed to delete property"
      );
    }
  } catch (error: unknown) {
    console.error("❌ deletePropertyMutationFn error:", error);

    const axiosErr = error as AxiosError | undefined;
    if (hasStringMessage(axiosErr?.response?.data)) {
      throw new Error(axiosErr.response!.data.message);
    }
  }
};

export const getPropertiesQueryFn = async (
  workspaceId: string
): Promise<propertyType[]> => {
  const response = await API.get(`/properties?workspaceId=${workspaceId}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data as propertyType[]; // Return the actual properties array
  } else {
    throw new Error(responseData?.message || "Failed to fetch properties");
  }
};

export const getPropertyByIdQueryFn = async (id: string) => {
  const response = await API.get(`/properties/${id}`);

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual property data
  } else {
    throw new Error(responseData?.message || "Failed to fetch property");
  }
};

export const getPropertyCategoriesQueryFn = async (
  workspaceId: string
): Promise<propertyCategoryType[]> => {
  const response = await API.get(
    `/properties/categories?workspaceId=${workspaceId}`
  );

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data as propertyCategoryType[]; // Return the actual categories array
  } else {
    throw new Error(responseData?.message || "Failed to fetch categories");
  }
};

// Role And Permission API functions

export interface getWorkspaceRolesQueryResponseType {
  id: string;
  workspaceId: string;
  name: string;
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  rolePermissions: {
    id: string;
    roleId: string;
    permissionId: string;
    permission: {
      id: string;
      name: string;
      group: string;
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
}

// Get workspace roles
export const getWorkspaceRolesQueryFn = async (
  workspaceId: string
): Promise<getWorkspaceRolesQueryResponseType[]> => {
  const response = await API.get(`/roles/workspace/${workspaceId}`);

  return response.data;
};

// Get all permissions
export const getPermissionsQueryFn = async () => {
  const response = await API.get("/roles/permissions");

  // Since axios interceptor returns res.data, response is already the data object
  const responseData = response as ApiEnvelope;

  // Check for the actual response structure: { message: string, data: any }
  if (responseData && responseData.data) {
    return responseData.data; // Return the actual permissions data
  } else {
    throw new Error(responseData?.message || "Failed to fetch permissions");
  }
};

// Create role
export const createRoleMutationFn = async (data: {
  name: string;
  permissions: string[];
  workspaceId: string;
}) => {
  const { workspaceId, ...roleData } = data;
  const response = await API.post(`/roles/workspace/${workspaceId}`, roleData);
  return response.data;
};

// Update role
export const updateRoleMutationFn = async (data: {
  roleId: string;
  name: string;
  permissions: string[];
  workspaceId: string;
}) => {
  const { roleId, workspaceId, name, permissions } = data;
  const response = await API.put(
    `/roles/${roleId}/workspace/${workspaceId}/permissions`,
    {
      roleName: name, // Backend expects roleName, not name
      permissions,
    }
  );
  return response.data;
};

// Delete role
export const deleteRoleMutationFn = async (data: {
  roleId: string;
  workspaceId: string;
}) => {
  const { roleId, workspaceId } = data;
  const response = await API.delete(
    `/roles/workspace/${workspaceId}/roles/${roleId}`
  );
  return response.data;
};

// Change password
export const changePasswordMutationFn = async (data: {
  email: string;
  newPassword: string;
}) => {
  const response = await API.post("/auth/change-password", data);
  return response.data;
};
