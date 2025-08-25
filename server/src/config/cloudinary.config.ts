import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { APP_CONFIG } from "./app.config";

// Configure Cloudinary with fallback values for testing
cloudinary.config({
  cloud_name: APP_CONFIG.CLOUDINARY_CLOUD_NAME || "test-cloud",
  api_key: APP_CONFIG.CLOUDINARY_API_KEY || "test-key",
  api_secret: APP_CONFIG.CLOUDINARY_API_SECRET || "test-secret",
});

// Configure multer storage for Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "real-estate-crm",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Main image
      { width: 400, height: 300, crop: "limit" }, // Thumbnail
    ],
  } as any,
});

export default cloudinary;
