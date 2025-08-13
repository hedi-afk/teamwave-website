import { Request, Response } from 'express';
import Event from '../models/Event';
import mongoose from 'mongoose';
// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbEvents = await Event.find().sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error: any) {
    console.error(`Error fetching event with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Get events by game
export const getEventsByGame = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbEvents = await Event.find({ game: req.params.game }).sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error(`Error fetching events for game ${req.params.game}:`, error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get events by status
export const getEventsByStatus = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbEvents = await Event.find({ status: req.params.status }).sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error(`Error fetching events with status ${req.params.status}:`, error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const dbEvents = await Event.find({ 
      status: 'upcoming',
      startDate: { $gte: new Date() }
    }).sort({ startDate: 1 });
    
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events', error: error.message });
  }
};

// Create new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error: any) {
    console.error(`Error updating event with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting event with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
}; 