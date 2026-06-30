const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Create local uploads directory if it doesn't exist (for local fallback)
const localUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let uploadImage;
let uploadPdf;

if (isCloudinaryConfigured) {
  console.log('Cloudinary is configured. Using cloud storage for uploads.');
  
  // Storage for Profile Images
  const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'ai_resume_profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 300, height: 300, crop: 'limit' }],
    },
  });

  // Storage for PDFs
  const pdfStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'ai_resume_pdfs',
      resource_type: 'raw',
      allowed_formats: ['pdf'],
    },
  });

  uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });

  uploadPdf = multer({
    storage: pdfStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
} else {
  console.log('Cloudinary is NOT configured. Using local disk storage.');

  // Local storage setup
  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, localUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      const filetypes = /jpeg|jpg|png|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    } else if (file.fieldname === 'resumePdf') {
      if (file.mimetype === 'application/pdf') {
        return cb(null, true);
      }
      cb(new Error('Only PDF files are allowed'));
    } else {
      cb(new Error('Unknown field upload'));
    }
  };

  uploadImage = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });

  uploadPdf = multer({
    storage: localStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
  });
}

module.exports = {
  uploadImage: uploadImage.single('profileImage'),
  uploadPdf: uploadPdf.single('resumePdf'),
  isCloudinaryConfigured,
};
