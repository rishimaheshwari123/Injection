import express from 'express';
import {
  getHero,
  uploadHeroImage,
  deleteHeroImage
} from '../controllers/heroController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHero);

// Admin only routes
router.post('/upload', protect, adminOnly, uploadHeroImage);
router.delete('/:publicId', protect, adminOnly, deleteHeroImage);

export default router;
