import { Request, Response } from 'express';
import Member from '../models/Member';
import mongoose from 'mongoose';
// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbMembers = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Failed to fetch members', error: error.message });
  }
};

// Get member by ID
export const getMemberById = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error: any) {
    console.error(`Error fetching member with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch member', error: error.message });
  }
};

// Get member by username
export const getMemberByUsername = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const member = await Member.findOne({ username: req.params.username });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error: any) {
    console.error(`Error fetching member with username ${req.params.username}:`, error);
    res.status(500).json({ message: 'Failed to fetch member', error: error.message });
  }
};

// Get members by team
export const getMembersByTeam = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbMembers = await Member.find({ team: req.params.team }).sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error(`Error fetching members for team ${req.params.team}:`, error);
    res.status(500).json({ message: 'Failed to fetch members', error: error.message });
  }
};

// Get members by game
export const getMembersByGame = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbMembers = await Member.find({ games: req.params.game }).sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error(`Error fetching members for game ${req.params.game}:`, error);
    res.status(500).json({ message: 'Failed to fetch members', error: error.message });
  }
};

// Create new member
export const createMember = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (error: any) {
    console.error('Error creating member:', error);
    res.status(400).json({ message: 'Failed to create member', error: error.message });
  }
};

// Update member
export const updateMember = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error: any) {
    console.error(`Error updating member with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Failed to update member', error: error.message });
  }
};

// Delete member
export const deleteMember = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const member = await Member.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting member with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete member', error: error.message });
  }
}; 