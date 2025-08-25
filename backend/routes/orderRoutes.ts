import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} from '../controllers/orderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/', createOrder);

// Protected routes (admin only)
router.get('/', protect, admin, getAllOrders);
router.get('/stats', protect, admin, getOrderStats);
router.get('/:id', protect, admin, getOrderById);
router.put('/:id', protect, admin, updateOrderStatus);
router.delete('/:id', protect, admin, deleteOrder);

export default router;
