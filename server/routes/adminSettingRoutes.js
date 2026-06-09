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

// All routes require protection and admin permission
router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getAdminSettings)
  .post(createAdminSetting);

router.route('/:id')
  .get(getAdminSettingById)
  .put(updateAdminSetting)
  .delete(deleteAdminSetting);

export default router;
