import { loginType, registerType } from "@/types/api.types";
import API from "./axios-client";

export const registerMutationFn = async (data: registerType) => {
  await API.post("/auth/register-owner", data);
};

export const loginMutationFn = async (data: loginType) => {
  const res = await API.post("/auth/login", data);

  return res.data;
};
