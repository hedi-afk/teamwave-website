import { Request, Response } from 'express';
import Game from '../models/Game';

// Get all games
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find().sort({ order: 1 });
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
};

// Debug endpoint to check game names
export const debugGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find({}, 'name').sort({ name: 1 });
    const names = games.map(g => g.name);
    res.json({ 
      count: games.length, 
      names: names,
      message: 'Current game names in database'
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: 'Failed to get debug info' });
  }
};

// Get active games only
export const getActiveGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find().sort({ order: 1 });
    res.json(games);
  } catch (error) {
    console.error('Error fetching active games:', error);
    res.status(500).json({ message: 'Failed to fetch active games' });
  }
};

// Get featured games
export const getFeaturedGames = async (req: Request, res: Response) => {
  try {
    const games = await Game.find({ featured: true }).sort({ order: 1 });
    res.json(games);
  } catch (error) {
    console.error('Error fetching featured games:', error);
    res.status(500).json({ message: 'Failed to fetch featured games' });
  }
};

// Get single game by ID
export const getGameById = async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Failed to fetch game' });
  }
};

// Create new game
export const createGame = async (req: Request, res: Response) => {
  try {
    const { name, featured, order } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Game name is required' });
    }
    
    const trimmedName = name.trim();
    
    // Check if a game with this name already exists (case-insensitive)
    const existingGame = await Game.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });
    
    if (existingGame) {
      return res.status(400).json({ 
        message: `Game with the name "${trimmedName}" already exists` 
      });
    }
    
    // Also check for exact match
    const exactMatch = await Game.findOne({ name: trimmedName });
    if (exactMatch) {
      return res.status(400).json({ 
        message: `Game with the name "${trimmedName}" already exists` 
      });
    }
    
    const game = new Game({
      name: trimmedName,
      featured: featured || false,
      order: order || 0
    });
    
    await game.save();
    res.status(201).json(game);
  } catch (error: any) {
    console.error('Error creating game:', error);
    if (error.code === 11000) {
      // Get more details about the duplicate key error
      console.error('Duplicate key error details:', error.keyValue);
      

      
      res.status(400).json({ 
        message: `Game with the name "${req.body.name?.trim()}" already exists. Please try a different name.` 
      });
    } else {
      res.status(500).json({ message: 'Failed to create game' });
    }
  }
};

// Update game
export const updateGame = async (req: Request, res: Response) => {
  try {
    const { name, featured, order } = req.body;
    
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      {
        name,
        featured,
        order
      },
      { new: true, runValidators: true }
    );
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (error: any) {
    console.error('Error updating game:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Game with this name already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update game' });
    }
  }
};

// Delete game
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Delete the game and wait for the operation to complete
    await Game.findByIdAndDelete(req.params.id);
    
    // Force a small delay to ensure the database operation completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ message: 'Failed to delete game' });
  }
};

// Update game order (for reordering)
export const updateGameOrder = async (req: Request, res: Response) => {
  try {
    const { games } = req.body; // Array of { id, order }
    
    for (const gameUpdate of games) {
      await Game.findByIdAndUpdate(gameUpdate.id, { order: gameUpdate.order });
    }
    
    res.json({ message: 'Game order updated successfully' });
  } catch (error) {
    console.error('Error updating game order:', error);
    res.status(500).json({ message: 'Failed to update game order' });
  }
}; 