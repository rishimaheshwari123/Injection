import express from 'express';
import {
  getAdminSettings,
  getAdminSettingById,
  createAdminSetting,
  updateAdminSetting,
  deleteAdminSetting
} from '../controllers/adminSettingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/all', getAdminSettings);
router.post('/create', createAdminSetting);
router.get('/:id', getAdminSettingById);
router.put('/update/:id', updateAdminSetting);
router.delete('/delete/:id', deleteAdminSetting);

export default router;
