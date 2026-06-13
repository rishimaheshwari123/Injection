import express from 'express';
import {
  userRegister,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserProfile,
  activateUser,
  deactivateUser,
  toggleUserStatus,
  deleteUser,
  getMe,
  createUserByAdmin,
  updateUserByAdmin,
  getAllUsersByPagination
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', userRegister);

router.post('/login', userLogin);

router.get('/me', protect, getMe);

router.get('/', protect, adminOnly, getAllUsers);
router.get('/admin/paginated', protect, adminOnly, getAllUsersByPagination);

router.get('/:id', protect, adminOnly, getUserById);

router.put('/profile', protect, updateUserProfile);

router.post('/admin/create', protect, adminOnly, createUserByAdmin);

router.put('/:id', protect, adminOnly, updateUserByAdmin);

router.put('/:id/activate', protect, adminOnly, activateUser);

router.put('/:id/deactivate', protect, adminOnly, deactivateUser);

router.put('/:id/toggle-status', protect, adminOnly, toggleUserStatus);

router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
