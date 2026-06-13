import express from 'express';
import {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  getRequestById,
  processServiceRequest
} from '../controllers/vendorServiceRequestController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/vendor-service-requests/create:
 *   post:
 *     summary: Submit a new service request (Vendor only)
 *     tags: [Vendor Service Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - services
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of service IDs to request
 *     responses:
 *       201:
 *         description: Request submitted successfully
 *       400:
 *         description: Validation error or existing pending request
 */
router.post('/create', protect, createServiceRequest);

/**
 * @swagger
 * /api/vendor-service-requests/my-requests:
 *   get:
 *     summary: Get logged-in vendor's requests (Vendor only)
 *     tags: [Vendor Service Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor's requests
 */
router.get('/my-requests', protect, vendorOnly, getMyServiceRequests);

/**
 * @swagger
 * /api/vendor-service-requests/getAll:
 *   get:
 *     summary: Get all service requests (Admin only)
 *     tags: [Vendor Service Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter requests by status
 *     responses:
 *       200:
 *         description: List of all service requests
 */
router.get('/getAll', protect, adminOnly, getAllServiceRequests);

/**
 * @swagger
 * /api/vendor-service-requests/{id}:
 *   get:
 *     summary: Get service request details by ID
 *     tags: [Vendor Service Requests]
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
 *         description: Service request details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 */
router.get('/:id', protect, getRequestById);

/**
 * @swagger
 * /api/vendor-service-requests/{id}/process:
 *   put:
 *     summary: Process service request - Approve or Reject (Admin only)
 *     tags: [Vendor Service Requests]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               adminRemarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request processed successfully
 *       400:
 *         description: Invalid input or request already processed
 */
router.put('/:id/process', protect, adminOnly, processServiceRequest);

export default router;
