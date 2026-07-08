import express from 'express';
import {
  createService,
  uploadServiceImage,
  adminCreateService,
  adminGetAllServices,
  adminUpdateService,
  getAllServices,
  getServiceById,
  getVendorServices,
  getServicesByVendorId,
  updateService,
  deleteService,
  toggleServiceStatus,
  getServicesByCategory,
  adminGetAllServicesByPagination
} from '../controllers/serviceController.js';
import { protect, vendorOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();


router.post('/admin/create', protect, adminOnly, adminCreateService);
router.post('/upload-image', protect, adminOnly, uploadServiceImage);

router.get('/admin/all', protect, adminOnly, adminGetAllServices);
router.get('/admin/paginated', protect, adminOnly, adminGetAllServicesByPagination);

router.put('/admin/:id', protect, adminOnly, adminUpdateService);

router.post('/create', protect, vendorOnly, createService);

router.get('/', getAllServices);

router.get('/vendor/me', protect, vendorOnly, getVendorServices);

router.get('/vendor/:vendorId', getServicesByVendorId);

router.get('/category/:category', getServicesByCategory);

router.get('/:id', getServiceById);

router.put('/:id', protect, vendorOnly, updateService);

router.put('/:id/toggle-status', protect, vendorOnly, toggleServiceStatus);

router.delete('/:id', protect, vendorOnly, deleteService);

export default router;
