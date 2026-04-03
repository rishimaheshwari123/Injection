import express from 'express';
import * as advertisementController from '../controllers/advertisementController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/ads', advertisementController.getAllAds);

// Admin routes
router.get('/ads/admin', protect, adminOnly, advertisementController.getAllAdsAdmin);
router.post('/ads', protect, adminOnly, advertisementController.createAd);
router.put('/ads/:id', protect, adminOnly, advertisementController.updateAd);
router.put('/ads/:id/toggle', protect, adminOnly, advertisementController.toggleAdStatus);
router.delete('/ads/:id', protect, adminOnly, advertisementController.deleteAd);

export default router;
