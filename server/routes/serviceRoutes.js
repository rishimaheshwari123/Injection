import express from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  getVendorServices,
  getServicesByVendorId,
  updateService,
  deleteService,
  toggleServiceStatus,
  getServicesByCategory
} from '../controllers/serviceController.js';
import { protect, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - serviceName
 *         - description
 *         - category
 *         - basePrice
 *       properties:
 *         serviceName:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         basePrice:
 *           type: number
 *         duration:
 *           type: number
 *         serviceType:
 *           type: string
 *           enum: [At Home, At Clinic, Both]
 *         icon:
 *           type: string
 *         image:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         requirements:
 *           type: string
 */

/**
 * @swagger
 * /api/services/create:
 *   post:
 *     summary: Create new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 */
router.post('/create', protect, vendorOnly, createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of all services
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /api/services/vendor/me:
 *   get:
 *     summary: Get vendor's all services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor services
 */
router.get('/vendor/me', protect, vendorOnly, getVendorServices);

/**
 * @swagger
 * /api/services/vendor/{vendorId}:
 *   get:
 *     summary: Get services by vendor ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of vendor services
 */
router.get('/vendor/:vendorId', getServicesByVendorId);

/**
 * @swagger
 * /api/services/category/{category}:
 *   get:
 *     summary: Get services by category
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of services in category
 */
router.get('/category/:category', getServicesByCategory);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Services]
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
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 */
router.put('/:id', protect, vendorOnly, updateService);

/**
 * @swagger
 * /api/services/{id}/toggle-status:
 *   put:
 *     summary: Toggle service active status
 *     tags: [Services]
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
 *         description: Service status toggled successfully
 */
router.put('/:id/toggle-status', protect, vendorOnly, toggleServiceStatus);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 */
router.delete('/:id', protect, vendorOnly, deleteService);

export default router;
