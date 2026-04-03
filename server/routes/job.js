import express from 'express';
import * as jobController from '../controllers/jobController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJob);

// User routes (protected)
router.post('/jobs/:jobId/apply', protect, jobController.applyForJob);
router.get('/applications/my', protect, jobController.getMyApplications);

// Admin routes
router.get('/jobs/admin/all', protect, adminOnly, jobController.getAllJobsAdmin);
router.post('/jobs', protect, adminOnly, jobController.createJob);
router.put('/jobs/:id', protect, adminOnly, jobController.updateJob);
router.delete('/jobs/:id', protect, adminOnly, jobController.deleteJob);
router.get('/jobs/:jobId/applications', protect, adminOnly, jobController.getJobApplications);
router.get('/applications/admin/all', protect, adminOnly, jobController.getAllApplications);
router.put('/applications/:id/status', protect, adminOnly, jobController.updateApplicationStatus);

export default router;
