import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function for uploading files to Cloudinary
export const uploadToCloudinary = async (
  localFilePath,
  folder = "misc",
  transformation = [],
) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
      transformation,
    });

    // File uploaded successfully
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Error uploading file to Cloudinary");
  } finally {
    // Remove local file regardless of success or failure
    try {
      if (localFilePath) {
        fs.unlinkSync(localFilePath);
      }
    } catch (err) {
      console.error("Error removing local file:", err);
    }
  }
};
