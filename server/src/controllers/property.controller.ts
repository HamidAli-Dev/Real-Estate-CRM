import { Request, Response, NextFunction } from "express";
import {
  createPropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
  deletePropertyService,
  getPropertyCategoriesService,
} from "../services/property.service";

export const createPropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await createPropertyService(req, res, next);
};

export const getPropertiesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await getPropertiesService(req, res, next);
};

export const getPropertyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await getPropertyByIdService(req, res, next);
};

export const updatePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await updatePropertyService(req, res, next);
};

export const deletePropertyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await deletePropertyService(req, res, next);
};

export const getPropertyCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await getPropertyCategoriesService(req, res, next);
};
