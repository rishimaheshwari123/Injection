import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  startService,
  completeService,
  cancelBooking,
  rescheduleBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  addNoteToBooking,
  updatePrescription,
  updatePrescriptionSummary,
  getVendorAllBookings
} from '../controllers/bookingController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();


router.post('/create', protect, createBooking);

router.get('/user/me', protect, getUserBookings);


router.get('/vendor/me', protect, vendorOnly, getVendorAllBookings);

router.get('/admin/all', protect, adminOnly, getAllBookings);

router.get('/:id', protect, getBookingById);


router.put('/:id/start', protect, vendorOnly, startService);

router.put('/:id/complete', protect, vendorOnly, completeService);

router.put('/:id/cancel', protect, cancelBooking);

router.put('/:id/reschedule', protect, rescheduleBooking);

router.put('/:id/status', protect, adminOnly, updateBookingStatus);

router.post('/:id/notes', protect, adminOnly, addNoteToBooking);

router.put('/:id/prescription', protect, adminOnly, updatePrescription);
router.put('/:id/prescription-summary', protect, adminOnly, updatePrescriptionSummary);

router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
