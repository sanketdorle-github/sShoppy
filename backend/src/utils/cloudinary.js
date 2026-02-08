import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dczkpxuav",
  api_key: process.env.CLOUDINARY_API_KEY || "773615537821756",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "FVoiXzCFez0jGrswPLK7-567SEc",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dczkpxuav",
  api_key: process.env.CLOUDINARY_API_KEY || "773615537821756",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "FVoiXzCFez0jGrswPLK7-567SEc",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath); // 🔥 IMPORTANT

    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export default uploadOnCloudinary;
