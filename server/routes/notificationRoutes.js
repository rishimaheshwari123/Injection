import express from 'express';
import {
  registerDeviceToken,
  getNotificationStats,
  getDevices,
  getCustomTopics,
  createCustomTopic,
  deleteCustomTopic,
  subscribeDevices,
  unsubscribeDevices,
  sendBroadcastNotification,
  uploadNotificationImage
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Device token registration (open or with optional auth header)
router.post('/devices/register', registerDeviceToken);

// Admin only management routes
router.get('/stats', protect, adminOnly, getNotificationStats);
router.get('/devices', protect, adminOnly, getDevices);
router.get('/topics', protect, adminOnly, getCustomTopics);
router.post('/topics', protect, adminOnly, createCustomTopic);
router.delete('/topics/:id', protect, adminOnly, deleteCustomTopic);
router.post('/topics/subscribe', protect, adminOnly, subscribeDevices);
router.post('/topics/unsubscribe', protect, adminOnly, unsubscribeDevices);
router.post('/send', protect, adminOnly, sendBroadcastNotification);
router.post('/upload-image', protect, adminOnly, uploadNotificationImage);

export default router;
