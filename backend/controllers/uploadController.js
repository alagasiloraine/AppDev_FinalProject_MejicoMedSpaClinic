const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (req.originalUrl.includes('treatment-image')) {
      uploadPath = path.join(__dirname, '../../frontend/public/upload/treatment_images/');
    } else {
      uploadPath = path.join(__dirname, '../../frontend/public/uploads/');
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path relative to the public directory
    const relativePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      path: relativePath
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading file',
      details: error.message 
    });
  }
};

// New function for uploading treatment images
const uploadTreatmentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return both the path and filename
    const relativePath = `/uploads/treatment_images/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      path: relativePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading treatment image',
      details: error.message 
    });
  }
};

module.exports = {
  upload: upload.single('image'),
  uploadImage,
  uploadTreatmentImage
};

