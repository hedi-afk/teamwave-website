import express from 'express';
import { getShopSettings, updateShopSettings } from '../controllers/shopSettingsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public route to get shop settings
router.get('/', getShopSettings);

// Protected route to update shop settings (admin only)
router.put('/', protect, admin, updateShopSettings);

export default router;
