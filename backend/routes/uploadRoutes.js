const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadTreatmentImage } = require('../controllers/uploadController');

// Route for handling service image uploads
router.post('/api/upload-service-image', upload, uploadImage);

// New route for handling treatment image uploads
router.post('/api/upload-treatment-image', upload, uploadTreatmentImage);

module.exports = router;

