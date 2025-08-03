import express from 'express';
import {
  getProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = express.Router();

// GET all products
router.get('/', getProducts);

// GET products by category
router.get('/category/:category', getProductsByCategory);

// GET product by ID
router.get('/:id', getProductById);

// POST create new product
router.post('/', createProduct);

// PUT update product
router.put('/:id', updateProduct);

// DELETE product
router.delete('/:id', deleteProduct);

export default router; 