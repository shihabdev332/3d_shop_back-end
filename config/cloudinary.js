const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const cloudinaryEnvironment = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const ensureCloudinaryConfigured = (req, res, next) => {
  const missing = cloudinaryEnvironment.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return res.status(503).json({ message: 'Image uploads are not configured on the server.' });
  }
  return next();
};

// Cloudinary initialization using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure media storage settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cafe_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const uploadCloud = multer({ storage });

module.exports = { uploadCloud, cloudinary, ensureCloudinaryConfigured };
