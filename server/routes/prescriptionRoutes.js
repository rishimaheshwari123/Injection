import express from 'express';
import {
  uploadPrescription,
  getPrescription,
  deletePrescription,
  uploadImageToCloudinary
} from '../controllers/prescriptionController.js';
import { protect, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload image to Cloudinary
router.post('/upload-image', protect, uploadImageToCloudinary);

// Upload prescription for booking
router.post('/upload/:bookingId', protect, uploadPrescription);

// Get prescription
router.get('/:bookingId', protect, getPrescription);

// Delete prescription
router.delete('/:bookingId', protect, deletePrescription);

export default router;
