import express from 'express';
import {
  getAllFAQs,
  getAllFAQsAdmin,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from '../controllers/faqController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllFAQs);

// Admin routes
router.get('/admin', protect, adminOnly, getAllFAQsAdmin);
router.get('/:id', protect, adminOnly, getFAQById);
router.post('/', protect, adminOnly, createFAQ);
router.put('/:id', protect, adminOnly, updateFAQ);
router.delete('/:id', protect, adminOnly, deleteFAQ);

export default router;
