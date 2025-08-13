import express from 'express';
import {
  getAllGames,
  getActiveGames,
  getFeaturedGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameOrder,
  debugGames
} from '../controllers/gameController';

const router = express.Router();

// Public routes
router.get('/', getAllGames);
router.get('/debug', debugGames); // Debug endpoint
router.get('/active', getActiveGames);
router.get('/featured', getFeaturedGames);
router.get('/:id', getGameById);

// Protected routes (admin only) - temporarily removing auth for development
router.post('/', createGame);
router.put('/:id', updateGame);
router.delete('/:id', deleteGame);
router.put('/order/update', updateGameOrder);

export default router; 