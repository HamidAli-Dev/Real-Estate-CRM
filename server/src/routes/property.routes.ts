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
import { checkPermission } from "../middlewares/permission.middleware";
import {
  uploadPropertyImages,
  handleUploadError,
} from "../middlewares/upload.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get properties (all authenticated users can view)
router.get("/", checkPermission("VIEW_PROPERTIES"), getPropertiesController);

// Get property categories (all authenticated users can view) - MUST come before :id route
router.get(
  "/categories",
  checkPermission("VIEW_PROPERTIES"),
  getPropertyCategoriesController
);

// Get property by ID (all authenticated users can view)
router.get(
  "/:id",
  checkPermission("VIEW_PROPERTIES"),
  getPropertyByIdController
);

// Create property
router.post(
  "/",
  uploadPropertyImages,
  handleUploadError,
  checkPermission("CREATE_PROPERTIES"),
  createPropertyController
);

// Update property
router.put(
  "/:id",
  uploadPropertyImages,
  handleUploadError,
  checkPermission("EDIT_PROPERTIES"),
  updatePropertyController
);

// Delete property
router.delete(
  "/:id",
  checkPermission("DELETE_PROPERTIES"),
  deletePropertyController
);

export default router;
