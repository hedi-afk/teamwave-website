import express from 'express';
import { adminLogin, verifyToken } from '../controllers/authController';

const router = express.Router();

// Admin login route
router.post('/admin/login', adminLogin);

// Token verification route
router.get('/verify', verifyToken);

export default router; 