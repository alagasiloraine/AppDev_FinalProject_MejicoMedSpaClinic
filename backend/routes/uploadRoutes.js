import express from 'express';
import { upload, uploadImage, uploadTreatmentImage } from '../controllers/uploadController.js';

const router = express.Router();

// Route for handling service image uploads
router.post('/api/upload-service-image', upload, uploadImage);

// New route for handling treatment image uploads
router.post('/api/upload-treatment-image', upload, uploadTreatmentImage);

export default router;

