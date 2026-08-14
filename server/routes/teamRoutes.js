import express from 'express';
import {
  getAllTeam,
  getAllTeamAdmin,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/teamController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getAllTeam);

// Admin routes
router.get('/admin', protect, adminOnly, getAllTeamAdmin);
router.get('/:id', protect, adminOnly, getTeamMemberById);
router.post('/', protect, adminOnly, createTeamMember);
router.put('/:id', protect, adminOnly, updateTeamMember);
router.delete('/:id', protect, adminOnly, deleteTeamMember);

export default router;
