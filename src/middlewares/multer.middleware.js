import multer from "multer";
import path from "path";
import { ApiError } from "../utils/api-error.js";
import fs from "fs";

// Define allowed file types
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Ensure the upload directory exists
const uploadDir = "./public/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save directly to public/images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

// File filter function
const fileFilter = function (req, file, cb) {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
      ),
      false,
    );
  }
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

// Specific upload middlewares
export const uploadAvatar = upload.single("avatar");

// Error handler
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(
          400,
          `File too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        ),
      );
    }
    return next(new ApiError(400, err.message));
  } else if (err) {
    return next(err);
  }
  next();
};
