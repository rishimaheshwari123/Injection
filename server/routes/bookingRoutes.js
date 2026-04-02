import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  getAvailableBookings,
  acceptBooking,
  getVendorBookings,
  startService,
  completeService,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  addNoteToBooking,
  updatePrescription,
  addPrescription
} from '../controllers/bookingController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - patientName
 *         - age
 *         - sex
 *         - address
 *         - pincode
 *         - currentLocation
 *         - email
 *         - selectedServices
 *         - subtotal
 *         - gstAmount
 *         - grandTotal
 *         - preferredTimeSlot
 *       properties:
 *         patientName:
 *           type: string
 *         age:
 *           type: number
 *         sex:
 *           type: string
 *           enum: [Male, Female, Other]
 *         address:
 *           type: string
 *         pincode:
 *           type: string
 *         currentLocation:
 *           type: string
 *         alternateMobile:
 *           type: string
 *         email:
 *           type: string
 *         selectedServices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *         additionalRequirements:
 *           type: string
 *         prescriptionDocument:
 *           type: string
 *         hasInsurance:
 *           type: boolean
 *         insurancePolicyNumber:
 *           type: string
 *         subtotal:
 *           type: number
 *         gstAmount:
 *           type: number
 *         grandTotal:
 *           type: number
 *         freeComplimentaryService:
 *           type: string
 *         preferredTimeSlot:
 *           type: string
 *         staffPreference:
 *           type: string
 */

/**
 * @swagger
 * /api/bookings/create:
 *   post:
 *     summary: Create new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/create', protect, createBooking);

/**
 * @swagger
 * /api/bookings/user/me:
 *   get:
 *     summary: Get user's all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 */
router.get('/user/me', protect, getUserBookings);

/**
 * @swagger
 * /api/bookings/available:
 *   get:
 *     summary: Get all available bookings (pending)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available bookings
 */
router.get('/available', protect, vendorOnly, getAvailableBookings);

/**
 * @swagger
 * /api/bookings/vendor/me:
 *   get:
 *     summary: Get vendor's accepted bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor bookings
 */
router.get('/vendor/me', protect, vendorOnly, getVendorBookings);

/**
 * @swagger
 * /api/bookings/admin/all:
 *   get:
 *     summary: Get all bookings (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get('/admin/all', protect, adminOnly, getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get('/:id', protect, getBookingById);

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   put:
 *     summary: Vendor accepts booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 */
router.put('/:id/accept', protect, vendorOnly, acceptBooking);

/**
 * @swagger
 * /api/bookings/{id}/start:
 *   put:
 *     summary: Start service
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service started successfully
 */
router.put('/:id/start', protect, vendorOnly, startService);

/**
 * @swagger
 * /api/bookings/{id}/complete:
 *   put:
 *     summary: Complete service
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service completed successfully
 */
router.put('/:id/complete', protect, vendorOnly, completeService);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.put('/:id/cancel', protect, cancelBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/:id/status', protect, adminOnly, updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/notes:
 *   post:
 *     summary: Add note to booking (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added successfully
 */
router.post('/:id/notes', protect, adminOnly, addNoteToBooking);

/**
 * @swagger
 * /api/bookings/{id}/prescription:
 *   put:
 *     summary: Update prescription for booking (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prescriptionUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 */
router.put('/:id/prescription', protect, adminOnly, updatePrescription);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete booking (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 */
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
