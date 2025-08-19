import Cookie from "js-cookie";

import { loginType, registerType, loginResponseType } from "@/types/api.types";
import API from "./axios-client";

export const registerMutationFn = async (data: registerType) => {
  await API.post("/auth/register-owner", data);
};

export const loginMutationFn = async (
  data: loginType
): Promise<loginResponseType> => {
  const res = await API.post("/auth/login", data);

  if (res.data.accessToken) {
    Cookie.set("accessToken", res.data.accessToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  if (res.data.refreshToken) {
    Cookie.set("refreshToken", res.data.refreshToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: 30, // 30 days
    });
  }

  return res.data;
};

export const refreshTokenFn = async (): Promise<{ accessToken: string }> => {
  const refreshToken = Cookie.get("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await API.post("/auth/refresh-token", { refreshToken });
  return response as unknown as { accessToken: string }; // axios interceptor transforms the response
};

export const getCurrentUserQueryFn = async (): Promise<{
  message: string;
  user: any;
}> => {
  const response = await API.get(`/user/current`);
  return response as unknown as { message: string; user: any }; // axios interceptor transforms the response
};
