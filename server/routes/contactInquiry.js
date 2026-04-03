import express from 'express';
import * as contactInquiryController from '../controllers/contactInquiryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/inquiries', contactInquiryController.createInquiry);

// Admin routes
router.get('/inquiries', protect, adminOnly, contactInquiryController.getAllInquiries);
router.get('/inquiries/stats', protect, adminOnly, contactInquiryController.getInquiryStats);
router.get('/inquiries/:id', protect, adminOnly, contactInquiryController.getInquiry);
router.put('/inquiries/:id/status', protect, adminOnly, contactInquiryController.updateInquiryStatus);
router.delete('/inquiries/:id', protect, adminOnly, contactInquiryController.deleteInquiry);

export default router;
