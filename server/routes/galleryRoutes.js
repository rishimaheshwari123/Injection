import express from 'express';
import {
  getGallery,
  uploadGalleryImage,
  deleteGalleryImage
} from '../controllers/galleryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getGallery);

// Admin only routes
router.post('/upload', protect, adminOnly, uploadGalleryImage);
router.delete('/:publicId', protect, adminOnly, deleteGalleryImage);

export default router;
