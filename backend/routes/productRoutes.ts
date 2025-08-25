import express from 'express';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';
import uploadMiddleware from '../middleware/uploadMiddleware';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes (admin only)
router.post('/', protect, admin, createProduct);
router.post('/upload', protect, admin, uploadMiddleware.single('image'), uploadProductImage);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router; 