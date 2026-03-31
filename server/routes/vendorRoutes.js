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
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - businessName
 *               - businessType
 *               - address
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               name:
 *                 type: string
 *                 description: Vendor's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Vendor's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (minimum 6 characters)
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: 10-digit phone number
 *               alternatePhone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 description: Alternate 10-digit phone number
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *               businessType:
 *                 type: string
 *                 enum: [Individual, Clinic, Hospital, Laboratory, Pharmacy, Other]
 *                 description: Type of business
 *               registrationNumber:
 *                 type: string
 *                 description: Business registration number
 *               gstNumber:
 *                 type: string
 *                 pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
 *                 description: GST number
 *               servicesOffered:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Home Injections, IV Drip Services, Wound Dressing, Day Care at Home, Patient Monitoring, Old Age Patient Care, 24 HR Patient Care, Field Survey Service, Data Collection Service, Field Sample Collection, Community Survey, Awareness Activities, Lab-based Training, BSC/MSC Training, DMLT Training, Nursing Training, Dissertation Program, Placement Services]
 *                 description: Services offered by the vendor
 *               qualifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     degree:
 *                       type: string
 *                     institution:
 *                       type: string
 *                     year:
 *                       type: number
 *                 description: Professional qualifications
 *               experience:
 *                 type: number
 *                 minimum: 0
 *                 description: Years of experience
 *               specialization:
 *                 type: string
 *                 description: Area of specialization
 *               address:
 *                 type: string
 *                 description: Business address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State
 *               pincode:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit pincode
 *               serviceAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas where services are provided
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: Brief bio (max 500 characters)
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Vendor already exists or validation error
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
