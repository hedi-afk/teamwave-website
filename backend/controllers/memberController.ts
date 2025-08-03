import { Request, Response } from 'express';
import Member from '../models/Member';
import mongoose from 'mongoose';
import { members as mockMembers, findMemberById } from '../utils/mockData';

// Flag to track if we're using mock data due to DB connection issues
let useMockData = false;

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  const connected = mongoose.connection.readyState === 1;
  if (!connected && !useMockData) {
    console.warn("MongoDB is not connected. Using mock data for members.");
    useMockData = true;
  }
  return connected;
};

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      console.log("Returning mock members data");
      return res.status(200).json(mockMembers);
    }

    const dbMembers = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error('Error fetching members:', error);
    // Fallback to mock data on error
    console.log("Error in database query, returning mock members data");
    res.status(200).json(mockMembers);
  }
};

// Get member by ID
export const getMemberById = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const member = findMemberById(req.params.id);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.status(200).json(member);
    }

    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error: any) {
    console.error(`Error fetching member with ID ${req.params.id}:`, error);
    
    // Try to get from mock data on error
    const mockMember = findMemberById(req.params.id);
    if (mockMember) {
      return res.status(200).json(mockMember);
    }
    
    res.status(500).json({ message: 'Failed to fetch member', error: error.message });
  }
};

// Get member by username
export const getMemberByUsername = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const member = mockMembers.find(m => m.username === req.params.username);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      return res.status(200).json(member);
    }

    const member = await Member.findOne({ username: req.params.username });
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json(member);
  } catch (error: any) {
    console.error(`Error fetching member with username ${req.params.username}:`, error);
    
    // Try to get from mock data on error
    const mockMember = mockMembers.find(m => m.username === req.params.username);
    if (mockMember) {
      return res.status(200).json(mockMember);
    }
    
    res.status(500).json({ message: 'Failed to fetch member', error: error.message });
  }
};

// Get members by team
export const getMembersByTeam = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const teamMembers = mockMembers.filter(m => m.team === req.params.team);
      return res.status(200).json(teamMembers);
    }

    const dbMembers = await Member.find({ team: req.params.team }).sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error(`Error fetching members for team ${req.params.team}:`, error);
    
    // Try to get from mock data on error
    const filteredMembers = mockMembers.filter(m => m.team === req.params.team);
    return res.status(200).json(filteredMembers);
  }
};

// Get members by game
export const getMembersByGame = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const gameMembers = mockMembers.filter(m => m.games.includes(req.params.game));
      return res.status(200).json(gameMembers);
    }

    const dbMembers = await Member.find({ games: req.params.game }).sort({ createdAt: -1 });
    res.status(200).json(dbMembers);
  } catch (error: any) {
    console.error(`Error fetching members for game ${req.params.game}:`, error);
    
    // Try to get from mock data on error
    const filteredMembers = mockMembers.filter(m => m.games.includes(req.params.game));
    return res.status(200).json(filteredMembers);
  }
};

// Create new member
export const createMember = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate creating a member
    if (!isMongoConnected()) {
      const newId = 'mem' + (mockMembers.length + 1);
      const mockMember = {
        _id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockMembers.push(mockMember);
      return res.status(201).json(mockMember);
    }

    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json(newMember);
  } catch (error: any) {
    console.error('Error creating member:', error);
    
    // Try to create with mock data on error
    if (!useMockData) {
      const newId = 'mem' + (mockMembers.length + 1);
      const mockMember = {
        _id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockMembers.push(mockMember);
      useMockData = true;
      return res.status(201).json(mockMember);
    }
    
    res.status(400).json({ message: 'Failed to create member', error: error.message });
  }
};

// Update member
export const updateMember = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate updating a member
    if (!isMongoConnected()) {
      const index = mockMembers.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Member not found' });
      }
      
      const updatedMember = {
        ...mockMembers[index],
        ...req.body,
        updatedAt: new Date()
      };
      
      mockMembers[index] = updatedMember;
      return res.status(200).json(updatedMember);
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
    
    // Try to update with mock data on error
    if (!useMockData) {
      const index = mockMembers.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Member not found' });
      }
      
      const updatedMember = {
        ...mockMembers[index],
        ...req.body,
        updatedAt: new Date()
      };
      
      mockMembers[index] = updatedMember;
      useMockData = true;
      return res.status(200).json(updatedMember);
    }
    
    res.status(400).json({ message: 'Failed to update member', error: error.message });
  }
};

// Delete member
export const deleteMember = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate deleting a member
    if (!isMongoConnected()) {
      const index = mockMembers.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Member not found' });
      }
      
      mockMembers.splice(index, 1);
      return res.status(200).json({ message: 'Member deleted successfully' });
    }

    const member = await Member.findByIdAndDelete(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting member with ID ${req.params.id}:`, error);
    
    // Try to delete with mock data on error
    if (!useMockData) {
      const index = mockMembers.findIndex(m => m._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Member not found' });
      }
      
      mockMembers.splice(index, 1);
      useMockData = true;
      return res.status(200).json({ message: 'Member deleted successfully' });
    }
    
    res.status(500).json({ message: 'Failed to delete member', error: error.message });
  }
}; 