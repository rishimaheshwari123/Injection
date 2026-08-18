import express from 'express';
import {
  ambassadorRegister,
  ambassadorLogin,
  getMe,
  getAmbassadorVendors,
  registerVendor,
  getWalletHistory,
  uploadAmbassadorFile,
  adminGetAllAmbassadors,
  adminToggleAmbassadorStatus,
  adminGetAmbassadorVendors,
  adminGetAmbassadorById,
  requestWithdrawal,
  getWithdrawals,
  adminGetAllWithdrawals,
  adminUpdateWithdrawalStatus
} from '../controllers/ambassadorController.js';
import { protect, adminOnly, ambassadorOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', ambassadorRegister);
router.post('/login', ambassadorLogin);
router.post('/upload', uploadAmbassadorFile);

// Protected routes (Ambassador Only)
router.get('/me', protect, ambassadorOnly, getMe);
router.get('/vendors', protect, ambassadorOnly, getAmbassadorVendors);
router.post('/register-vendor', protect, ambassadorOnly, registerVendor);
router.get('/wallet-history', protect, ambassadorOnly, getWalletHistory);
router.post('/withdraw', protect, ambassadorOnly, requestWithdrawal);
router.get('/withdrawals', protect, ambassadorOnly, getWithdrawals);

// Admin routes (Admin Only)
router.get('/admin/all', protect, adminOnly, adminGetAllAmbassadors);
router.get('/admin/withdrawals/all', protect, adminOnly, adminGetAllWithdrawals);
router.put('/admin/withdrawals/:ambassadorId/:requestId', protect, adminOnly, adminUpdateWithdrawalStatus);
router.get('/admin/:id', protect, adminOnly, adminGetAmbassadorById);
router.put('/admin/:id/toggle-status', protect, adminOnly, adminToggleAmbassadorStatus);
router.get('/admin/:id/vendors', protect, adminOnly, adminGetAmbassadorVendors);

export default router;
