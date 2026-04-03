import express from 'express';
import * as supportTicketController from '../controllers/supportTicketController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.post('/tickets', supportTicketController.createTicket);

// Admin routes
router.get('/tickets', protect, adminOnly, supportTicketController.getAllTickets);
router.get('/tickets/stats', protect, adminOnly, supportTicketController.getTicketStats);
router.get('/tickets/:id', protect, adminOnly, supportTicketController.getTicket);
router.put('/tickets/:id/status', protect, adminOnly, supportTicketController.updateTicketStatus);
router.delete('/tickets/:id', protect, adminOnly, supportTicketController.deleteTicket);

export default router;

