import express from 'express';
import {
  generateReport,
  getReport,
  uploadReport,
  getAllReports
} from '../controllers/reportController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

// Generate report (Vendor/Admin)
router.post('/generate/:bookingId', protect, generateReport);

// Upload report (Vendor/Admin)
router.post('/upload/:bookingId', protect, uploadReport);

// Get report (User/Vendor/Admin)
router.get('/:bookingId', protect, getReport);

// Get all reports (Admin)
router.get('/admin/all', protect, adminOnly, getAllReports);

export default router;
