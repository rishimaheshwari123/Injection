import express from 'express';
import {
  vendorRegister,
  vendorLogin,
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  activateVendor,
  deactivateVendor,
  deleteVendor,
  updateVendorByAdmin,
  createVendorByAdmin,
  getAllVendorsByPagination,
  uploadVendorFile,
  verifyVendorDocument
} from '../controllers/vendorController.js';
import { protect, adminOnly, vendorOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', vendorRegister);
router.post('/upload', uploadVendorFile);


router.post('/admin/create', protect, adminOnly, createVendorByAdmin);

router.post('/login', vendorLogin);

router.get('/', protect, adminOnly, getAllVendors);
router.get('/admin/paginated', protect, adminOnly, getAllVendorsByPagination);
router.get('/getAll',getAllVendors);

router.get('/:id', getVendorById);

router.put('/profile', protect, vendorOnly, updateVendorProfile);

router.put('/:id/activate', protect, adminOnly, activateVendor);

router.put('/:id/deactivate', protect, adminOnly, deactivateVendor);

router.put('/:id/verify-document', protect, adminOnly, verifyVendorDocument);

router.delete('/:id', protect, adminOnly, deleteVendor);

router.put('/:id', protect, adminOnly, updateVendorByAdmin);

export default router;
