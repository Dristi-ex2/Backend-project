// // cloudinary.js
// import { v2 as cloudinary } from 'cloudinary';

// // Configure Cloudinary once
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Upload image function
// const uploadImage = async () => {
//   try {
//     const uploadResult = await cloudinary.uploader.upload(
//       'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
//       { public_id: 'shoes' }
//     );

//     console.log("Uploaded:", uploadResult);

//     // Optimization URL
//     const optimizeUrl = cloudinary.url('shoes', {
//       fetch_format: 'auto',
//       quality: 'auto'
//     });
//     console.log("Optimized URL:", optimizeUrl);

//     // Auto-crop URL
//     const autoCropUrl = cloudinary.url('shoes', {
//       crop: 'auto',
//       gravity: 'auto',
//       width: 500,
//       height: 500,
//     });
//     console.log("Auto Crop URL:", autoCropUrl);

//     return uploadResult;
//   } catch (error) {
//     console.error("Upload failed:", error);
//     throw error;
//   }
// };

// export { uploadImage };

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary once
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
     
     console.log("Cloudinary Upload Response:", response);

    // ✅ Check if the file exists before deleting it
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted:", localFilePath);
    }

    return response;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    // ✅ Clean up local file if it exists, even on error
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted after error:", localFilePath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp file after error:", unlinkErr.message);
      }
    }

    return null;
  }
};

export { uploadOnCloudinary };
