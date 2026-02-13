import { v2 as cloudinary } from "cloudinary";
import configs from "../config/configs.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: configs.CLOUDINARY_CLOUD_NAME,
    api_key: configs.CLOUDINARY_API_KEY,
    api_secret: configs.CLOUDINARY_API_SECRET,
} as any);

export class FileService {
    /**
     * Uploads a file buffer to Cloudinary and returns the secure URL.
     */
    static async uploadFile(fileBuffer: Buffer, folder: string = "onboarding_docs"): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Cloudinary upload failed"));
                    resolve(result.secure_url);
                }
            );

            uploadStream.end(fileBuffer);
        });
    }

    /**
     * Uploads a file from a local path/URL to Cloudinary.
     */
    static async uploadFromPath(path: string, folder: string = "onboarding_docs"): Promise<string> {
        const result = await cloudinary.uploader.upload(path, { folder });
        return result.secure_url;
    }
}
