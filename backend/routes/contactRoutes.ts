import express from 'express';
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
  markMessageAsRead,
  deleteContactMessage,
  getMessageStats
} from '../controllers/contactController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/', createContactMessage);

// Protected routes (admin only)
router.get('/', protect, getAllContactMessages);
router.get('/stats', protect, getMessageStats);
router.get('/:id', protect, getContactMessageById);
router.patch('/:id/read', protect, markMessageAsRead);
router.delete('/:id', protect, deleteContactMessage);

export default router; 