import express, { Request, Response } from 'express';
import Team, { ITeam } from '../models/Team';

const router = express.Router();

// GET all teams
router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find({});
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET team by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET teams by game
router.get('/game/:game', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find({ game: req.params.game });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET teams by status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find({ status: req.params.status });
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new team
router.post('/', async (req: Request, res: Response) => {
  try {
    const newTeam = new Team(req.body);
    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update team
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(updatedTeam);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    
    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json({ message: 'Team removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 