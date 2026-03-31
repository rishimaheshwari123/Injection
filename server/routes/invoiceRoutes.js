import express from 'express';
import {
  generateInvoice,
  getInvoiceUrl
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate and download invoice PDF
router.get('/:bookingId', protect, generateInvoice);

// Get invoice URL
router.get('/url/:bookingId', protect, getInvoiceUrl);

export default router;
