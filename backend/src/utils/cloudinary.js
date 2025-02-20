// Cloudinary library ko import karte hain (v2 version ko 'cloudinary' ke naam se use karte hain)
import { v2 as cloudinary } from 'cloudinary';

// Node.js ka built-in 'fs' (file system) module import karte hain
// Iska use local files ko manage karne ke liye hota hai (e.g., delete karna)
import fs from 'fs';

// Cloudinary ke configuration settings ko set karte hain
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary account ka naam (Environment variable se fetch karte hain)
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary ke liye API key (Environment variable)
    api_secret: process.env.CLOUDINARY_API_SECRET // Cloudinary API secret key (Environment variable)
});
// Note: Ye settings sensitive information ko protect karte hain kyunki values .env file se read hoti hain

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Step 1: Check karte hain ki local file ka path exist karta hai ya nahi
        // Agar file path nahi mila toh null return karte hain (invalid input)
        if (!localFilePath) {
            console.log("Invalid file path");
            
            return null;
        }
        // Step 2: File ko Cloudinary par upload karte hain
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // File type (image, video, etc.) ko automatically detect karta hai
        });

        // Step 3: Agar upload successful ho gaya, toh Cloudinary se milne wala URL console mein print karte hain
        // console.log("File has been uploaded successfully", response.url);

        // Step 4: Response object return karte hain jo Cloudinary deta hai (e.g., URL, public_id, etc.)
        return response;
    } catch (error) {
        // Agar upload process fail ho jaye toh error handle karte hain
        console.error("Error in uploading file to Cloudinary", error);
        // Step 5: Null return karte hain kyunki upload operation fail ho gaya
        return null;
    }
    finally {
        // Step 6: Local temporary file ko delete karte hain in both situation of success and failure kyunki ab uska use nahi hai
        fs.unlinkSync(localFilePath); 
    }
};

// Function ko export karte hain taaki isse baaki files mein import karke use kiya ja sake
export { uploadOnCloudinary };

