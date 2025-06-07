// cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary once
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image function
const uploadImage = async () => {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
      { public_id: 'shoes' }
    );

    console.log("Uploaded:", uploadResult);

    // Optimization URL
    const optimizeUrl = cloudinary.url('shoes', {
      fetch_format: 'auto',
      quality: 'auto'
    });
    console.log("Optimized URL:", optimizeUrl);

    // Auto-crop URL
    const autoCropUrl = cloudinary.url('shoes', {
      crop: 'auto',
      gravity: 'auto',
      width: 500,
      height: 500,
    });
    console.log("Auto Crop URL:", autoCropUrl);

    return uploadResult;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export { uploadImage };
