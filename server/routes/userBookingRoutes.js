import express from 'express';
import {
  createUserBooking,
  getVendorNotifications,
  acceptUserBooking,
  markNotificationRead
} from '../controllers/userBookingController.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/bookingController.js';
import { protect, vendorOnly, userOnly } from '../middleware/auth.js';

const router = express.Router();

// User auth route to create booking
router.post('/create', protect, userOnly, createUserBooking);

// User auth routes to pay for booking
router.post('/:id/pay/razorpay-order', protect, userOnly, createRazorpayOrder);
router.post('/:id/pay/razorpay-verify', protect, userOnly, verifyRazorpayPayment);

// Vendor auth routes
router.get('/notifications', protect, vendorOnly, getVendorNotifications);
router.put('/accept/:bookingId', protect, vendorOnly, acceptUserBooking);
router.put('/notifications/:id/read', protect, vendorOnly, markNotificationRead);

export default router;
