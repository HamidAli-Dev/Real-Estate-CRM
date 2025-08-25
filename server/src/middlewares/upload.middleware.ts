import multer from "multer";
import { storage } from "../config/cloudinary.config";

// Configure multer for file uploads
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6, // Maximum 6 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware for property image uploads
export const uploadPropertyImages = upload.array("images", 6);

// Error handling middleware for multer
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 6 images",
      });
    }
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed",
    });
  }

  next(err);
};
