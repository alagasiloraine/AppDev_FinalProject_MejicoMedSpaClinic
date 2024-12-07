const database = require('./config/firebase'); // Firestore setup
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs module
const app = express();

// Middleware
// Enable CORS with specific origin
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vue.js dev server
  credentials: true
}));

app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the upload path based on the route
    let uploadPath;
    if (req.path === '/api/upload-treatment-image') {
      uploadPath = path.join(__dirname, '../frontend/public/uploads/treatment_images/');
    } else {
      uploadPath = path.join(__dirname, '../frontend/public/uploads/');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Service image upload route (unchanged)
app.post('/api/upload-service-image', upload.single('image'), (req, res) => {
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
});

// Updated treatment image upload route with correct path
app.post('/api/upload-treatment-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path relative to the public directory, now including treatment_images
    const relativePath = `/uploads/treatment_images/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      path: relativePath
    });
  } catch (error) {
    console.error('Treatment image upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading treatment image',
      details: error.message 
    });
  }
});

// Add this route before your other routes
app.get('/api/check-upload-dir', (req, res) => {
  const productImagesPath = path.join(__dirname, '../frontend/public/uploads/product_images');
  
  try {
    if (!fs.existsSync(productImagesPath)) {
      fs.mkdirSync(productImagesPath, { recursive: true });
    }
    res.status(200).json({ success: true, message: 'Upload directory is ready' });
  } catch (error) {
    console.error('Error checking/creating upload directory:', error);
    res.status(500).json({ 
      error: 'Failed to ensure upload directory exists',
      details: error.message 
    });
  }
});

// Update your product image upload route
app.post('/api/upload-product-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure the product_images directory exists
    const productImagesPath = path.join(__dirname, '../frontend/public/uploads/product_images');
    if (!fs.existsSync(productImagesPath)) {
      fs.mkdirSync(productImagesPath, { recursive: true });
    }

    // Return the path relative to the public directory
    const relativePath = `/uploads/product_images/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      path: relativePath
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading product image',
      details: error.message 
    });
  }
});

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

// Serve static files from the frontend public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Create a new appointment
app.post('/api/appointments', async (req, res) => {
    const { service, date, time, price } = req.body;

    console.log('Received appointment data:', req.body);

    if (!service || !date || !time || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const appointmentRef = await database.collection('appointments').add({
            service,
            date,
            time,
            price,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Appointment scheduled with ID: ${appointmentRef.id}`);
        res.status(200).json({
            message: 'Appointment scheduled successfully',
            id: appointmentRef.id,
        });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({
            error: 'Failed to schedule appointment',
            details: error.message,
        });
    }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const appointmentsSnapshot = await database.collection('appointments').get();

        if (appointmentsSnapshot.empty) {
            console.log('No appointments found.');
            return res.status(404).json({ message: 'No appointments available.' });
        }

        const appointments = appointmentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to retrieve appointments' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  console.error(err);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

