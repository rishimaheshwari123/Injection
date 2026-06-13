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

router.post('/create', protect, createServiceRequest);

router.get('/my-requests', protect, vendorOnly, getMyServiceRequests);

router.get('/getAll', protect, adminOnly, getAllServiceRequests);

router.get('/:id', protect, getRequestById);

router.put('/:id/process', protect, adminOnly, processServiceRequest);

export default router;
