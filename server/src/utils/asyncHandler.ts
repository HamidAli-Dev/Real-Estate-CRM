import { NextFunction, Request, Response } from "express";

type AsyncHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler =
  (controller: AsyncHandlerType): AsyncHandlerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
