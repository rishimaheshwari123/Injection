import express from 'express';
import {
  getAllLabPartners,
  getLabPartnerById,
  createLabPartner,
  updateLabPartner,
  deleteLabPartner,
  uploadResult,
  updateStatus
} from '../controllers/labPartnerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

// CRUD routes
router.route('/')
  .get(getAllLabPartners)
  .post(createLabPartner);

router.route('/:id')
  .get(getLabPartnerById)
  .put(updateLabPartner)
  .delete(deleteLabPartner);

// Special routes
router.post('/:id/upload-result', uploadResult);
router.put('/:id/status', updateStatus);

export default router;
