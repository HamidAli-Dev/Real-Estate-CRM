import axios from "axios";

import { CustomError } from "@/types/custom-error.type";

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (err) => {
    const response = err.response;
    const data = response?.data;
    const status = response?.status;

    if (data === "Unauthorized" && status === 401) {
      window.location.href = "/";
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

export default API;
