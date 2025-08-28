import { Router } from "express";
import {
  createPropertyController,
  getPropertiesController,
  getPropertyByIdController,
  updatePropertyController,
  deletePropertyController,
  getPropertyCategoriesController,
} from "../controllers/property.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";
import {
  uploadPropertyImages,
  handleUploadError,
} from "../middlewares/upload.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get properties (all authenticated users can view)
router.get("/", getPropertiesController);

// Get property categories (all authenticated users can view) - MUST come before :id route
router.get("/categories", getPropertyCategoriesController);

// Get property by ID (all authenticated users can view)
router.get("/:id", getPropertyByIdController);

// Create property (Owner, Admin, Manager can create)
router.post(
  "/",
  uploadPropertyImages,
  handleUploadError,
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager),
  createPropertyController
);

// Update property (Owner, Admin, Manager can update)
router.put(
  "/:id",
  uploadPropertyImages,
  handleUploadError,
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager),
  updatePropertyController
);

// Delete property (Owner, Admin can delete)
router.delete(
  "/:id",
  authorizeRoles(Role.Owner, Role.Admin),
  deletePropertyController
);

export default router;
