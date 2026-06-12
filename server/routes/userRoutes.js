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

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', protect, adminOnly, getAllUsers);
router.get('/admin/paginated', protect, adminOnly, getAllUsersByPagination);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, adminOnly, getUserById);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               age:
 *                 type: number
 *               address:
 *                 type: string
 *               pincode:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @swagger
 * /api/users/admin/create:
 *   post:
 *     summary: Create user/patient by admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *               - gender
 *               - age
 *               - address
 *               - pincode
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/admin/create', protect, adminOnly, createUserByAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user/patient by admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', protect, adminOnly, updateUserByAdmin);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   put:
 *     summary: Activate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated successfully
 */
router.put('/:id/activate', protect, adminOnly, activateUser);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated successfully
 */
router.put('/:id/deactivate', protect, adminOnly, deactivateUser);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   put:
 *     summary: Toggle user status (activate/deactivate)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status toggled successfully
 */
router.put('/:id/toggle-status', protect, adminOnly, toggleUserStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
