import express from 'express';
import {
  vendorRegister,
  vendorLogin,
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  activateVendor,
  deactivateVendor,
  deleteVendor
} from '../controllers/vendorController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/vendors/register:
 *   post:
 *     summary: Register new vendor
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vendor'
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Vendor already exists
 */
router.post('/register', vendorRegister);

/**
 * @swagger
 * /api/vendors/login:
 *   post:
 *     summary: Login vendor
 *     tags: [Vendors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', vendorLogin);

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all vendors
 */
router.get('/', protect, adminOnly, getAllVendors);

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', getVendorById);

/**
 * @swagger
 * /api/vendors/profile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               servicesOffered:
 *                 type: array
 *                 items:
 *                   type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', protect, vendorOnly, updateVendorProfile);

/**
 * @swagger
 * /api/vendors/{id}/activate:
 *   put:
 *     summary: Activate and verify vendor account
 *     tags: [Vendors]
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
 *         description: Vendor activated and verified successfully
 */
router.put('/:id/activate', protect, adminOnly, activateVendor);

/**
 * @swagger
 * /api/vendors/{id}/deactivate:
 *   put:
 *     summary: Deactivate vendor account
 *     tags: [Vendors]
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
 *         description: Vendor deactivated successfully
 */
router.put('/:id/deactivate', protect, adminOnly, deactivateVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete vendor
 *     tags: [Vendors]
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
 *         description: Vendor deleted successfully
 */
router.delete('/:id', protect, adminOnly, deleteVendor);

export default router;
