import { ErrorRequestHandler } from "express";

import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`Error occurred on path: ${req.path} with error:`, err);

  if (err instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid JSON payload, please check your request body.",
    });
  }

  if (err instanceof AppError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "An unexpected error occurred.",
    error: err.message || "something went wrong",
  });
};
