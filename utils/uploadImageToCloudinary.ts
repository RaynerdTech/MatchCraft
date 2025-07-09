// utils/uploadImageToCloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImageToCloudinary(base64Image: string, publicId: string) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "soccer",
      public_id: publicId,
      overwrite: true,
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
}
