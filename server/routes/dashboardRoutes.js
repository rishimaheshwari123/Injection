import express from 'express';
import { 
  getDashboardStats, 
  getUserDashboardStats, 
  incrementVisitorCount, 
  getVisitorCount,
  getVisitorLogs
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes for visitors count
router.post('/visitors/increment', incrementVisitorCount);
router.get('/visitors', getVisitorCount);

// User dashboard (requires authentication only)
router.get('/user/stats', protect, getUserDashboardStats);

// Detailed visitor logs for admin
router.get('/visitors/logs', protect, adminOnly, getVisitorLogs);

// Admin dashboard (requires authentication and admin access)
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

export default router;
