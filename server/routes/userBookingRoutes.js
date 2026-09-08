import express from 'express';
import {
  createUserBooking,
  getVendorNotifications,
  acceptUserBooking,
  markNotificationRead
} from '../controllers/userBookingController.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  addPrescription,
  updatePrescription
} from '../controllers/bookingController.js';
import {
  uploadReport
} from '../controllers/reportController.js';
import {
  uploadPrescription,
  uploadImageToCloudinary
} from '../controllers/prescriptionController.js';
import { protect, vendorOnly, userOnly } from '../middleware/auth.js';

const router = express.Router();

// User auth route to create booking
router.post('/create', protect, userOnly, createUserBooking);

// User auth routes to pay for booking
router.post('/:id/pay/razorpay-order', protect, userOnly, createRazorpayOrder);
router.post('/:id/pay/razorpay-verify', protect, userOnly, verifyRazorpayPayment);

// User prescription & lab report routes
router.post('/upload-image', protect, userOnly, uploadImageToCloudinary);
router.post('/:id/prescription', protect, userOnly, addPrescription);
router.put('/:id/prescription', protect, userOnly, updatePrescription);
router.post('/upload-prescription/:bookingId', protect, userOnly, uploadPrescription);
router.post('/:bookingId/report', protect, userOnly, uploadReport);
router.post('/upload-report/:bookingId', protect, userOnly, uploadReport);

// Vendor auth routes
router.get('/notifications', protect, vendorOnly, getVendorNotifications);
router.put('/accept/:bookingId', protect, vendorOnly, acceptUserBooking);
router.put('/notifications/:id/read', protect, vendorOnly, markNotificationRead);

export default router;
