import { ErrorRequestHandler, Response } from "express";
import { z, ZodError } from "zod";

import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/AppError";
import { ErrorCode } from "../enums/error-code.enum";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
    errorCode: ErrorCode.VALIDATION_ERROR,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`Error occurred on path: ${req.path} with error:`, err);

  if (err instanceof ZodError) {
    return formatZodError(res, err);
  }

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
