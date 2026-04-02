import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

export default router;
