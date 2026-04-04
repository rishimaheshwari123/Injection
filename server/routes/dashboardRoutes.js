import express from 'express';
import { getDashboardStats, getUserDashboardStats } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// User dashboard (requires authentication only)
router.get('/user/stats', protect, getUserDashboardStats);

// Admin dashboard (requires authentication and admin access)
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

export default router;
