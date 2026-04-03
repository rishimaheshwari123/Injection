import express from 'express';
import {
  uploadBlogImage,
  createBlog,
  adminGetAllBlogs,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  toggleFeaturedStatus,
  likeBlog,
  getBlogsByCategory,
  searchBlogs
} from '../controllers/blogController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/search', searchBlogs);
router.get('/category/:category', getBlogsByCategory);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.put('/:id/like', likeBlog);

// Protected routes (Admin/Staff)
router.post('/upload-image', protect, uploadBlogImage);
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.put('/:id/toggle-status', protect, toggleBlogStatus);

// Admin only routes
router.get('/admin/all', protect, adminOnly, adminGetAllBlogs);
router.delete('/:id', protect, adminOnly, deleteBlog);
router.put('/:id/toggle-featured', protect, adminOnly, toggleFeaturedStatus);

export default router;
