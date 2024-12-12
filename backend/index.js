import http from 'http';
import url from 'url';
import express from 'express';
import cors from 'cors';
import { database } from './config/firebase.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleSalesPredictions, handleStockRecommendations } from './routes/predictions.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (req.originalUrl.includes('treatment-image')) {
      uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'treatment_images');
    } else if (req.originalUrl.includes('product-image')) {
      uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads', 'product_images');
    } else {
      uploadPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'frontend', 'public', 'uploads')));

// Service image upload route
app.post('/api/upload-service-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const relativePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      success: true,
      path: relativePath,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading file',
      details: error.message 
    });
  }
});

// Treatment image upload route
app.post('/api/upload-treatment-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const relativePath = `/uploads/treatment_images/${req.file.filename}`;
    res.status(200).json({ 
      success: true,
      path: relativePath,
      message: 'Treatment image uploaded successfully'
    });
  } catch (error) {
    console.error('Treatment image upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading treatment image',
      details: error.message 
    });
  }
});

// Product image upload route
app.post('/api/upload-product-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const relativePath = `/uploads/product_images/${req.file.filename}`;
    res.status(200).json({ 
      success: true,
      path: relativePath,
      message: 'Product image uploaded successfully'
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading product image',
      details: error.message 
    });
  }
});

// Check upload directories route
app.get('/api/check-upload-dirs', (req, res) => {
  try {
    const baseUploadDir = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
    const treatmentImagesDir = path.join(baseUploadDir, 'treatment_images');
    const productImagesDir = path.join(baseUploadDir, 'product_images');

    [baseUploadDir, treatmentImagesDir, productImagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'All upload directories are ready',
      paths: {
        base: baseUploadDir,
        treatments: treatmentImagesDir,
        products: productImagesDir
      }
    });
  } catch (error) {
    console.error('Error checking/creating directories:', error);
    res.status(500).json({ 
      error: 'Failed to ensure upload directories exist',
      details: error.message 
    });
  }
});

// Mount routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

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

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (pathname === '/api/predictions/sales' && req.method === 'GET') {
      await handleSalesPredictions(req, res);
    } else if (pathname === '/api/predictions/stock' && req.method === 'GET') {
      await handleStockRecommendations(req, res);
    } else if (pathname === '/api/appointments' && req.method === 'GET') {
      const appointmentsSnapshot = await database.collection('appointments').get();
      const appointments = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(appointments));
    } else if (pathname === '/api/appointments' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { service, date, time, price } = JSON.parse(body);
          if (!service || !date || !time || !price) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'All fields are required.' }));
            return;
          }
          const appointmentRef = await database.collection('appointments').add({
            service,
            date,
            time,
            price,
            createdAt: new Date(),
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Appointment scheduled successfully',
            id: appointmentRef.id,
          }));
        } catch (error) {
          console.error('Error scheduling appointment:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Failed to schedule appointment',
            details: error.message,
          }));
        }
      });
    } else {
      // Forward the request to Express app
      app(req, res);
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default server;

