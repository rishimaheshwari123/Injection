import express from 'express';
import {
  createUserBooking,
  getVendorNotifications,
  acceptUserBooking,
  markNotificationRead
} from '../controllers/userBookingController.js';
import { protect, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

// User auth route to create booking
router.post('/create', protect, createUserBooking);

// Vendor auth routes
router.get('/notifications', protect, vendorOnly, getVendorNotifications);
router.put('/accept/:bookingId', protect, vendorOnly, acceptUserBooking);
router.put('/notifications/:id/read', protect, vendorOnly, markNotificationRead);

export default router;
