import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  verifyCoupon,
  getUserCoupons,
  applyCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/verify/:code', verifyCoupon);

// User routes
router.get('/user/my-coupons', protect, getUserCoupons);
router.post('/apply', protect, applyCoupon);

// Admin routes
router.get('/', protect, adminOnly, getAllCoupons);
router.get('/:id', protect, adminOnly, getCouponById);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
