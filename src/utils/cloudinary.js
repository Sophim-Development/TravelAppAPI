import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload_stream({
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      transformation: [
        { width: 800, height: 600, crop: 'fill' }, // For places
        { quality: 'auto', fetch_format: 'auto' },
      ],
    }, (error, result) => {
      if (error) throw error;
      return result;
    }).end(file.buffer);

    return result.secure_url;
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};