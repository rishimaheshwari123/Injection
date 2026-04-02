import express from 'express';
import multer from 'multer';
import insuranceClaimController from '../controllers/insuranceClaimController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/');
  },
  filename: (req, file, cb) => {
    cb(null, `claim-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public/User routes
router.post('/claims', protect, upload.array('documents', 5), insuranceClaimController.createClaim);
router.get('/claims/user/:userId', protect, insuranceClaimController.getUserClaims);
router.get('/claims/:id', protect, insuranceClaimController.getClaimById);

// Admin routes
router.get('/claims', protect, adminOnly, insuranceClaimController.getAllClaims);
router.put('/claims/:id/status', protect, adminOnly, insuranceClaimController.updateClaimStatus);
router.put('/claims/:id', protect, adminOnly, insuranceClaimController.updateClaim);
router.delete('/claims/:id', protect, adminOnly, insuranceClaimController.deleteClaim);
router.get('/claims-stats', protect, adminOnly, insuranceClaimController.getClaimStats);

export default router;
