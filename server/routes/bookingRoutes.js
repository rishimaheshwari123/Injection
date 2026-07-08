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
  updateBooking,
  deleteBooking,
  addNoteToBooking,
  updatePrescription,
  updatePrescriptionSummary,
  getVendorAllBookings,
  updateRequestedItems,
  updateRequestedItemStatus
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
router.put('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

router.put('/:id/requested-items', protect, updateRequestedItems);
router.put('/:id/requested-items/:itemId/status', protect, updateRequestedItemStatus);

export default router;
