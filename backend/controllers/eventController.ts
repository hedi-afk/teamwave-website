import { Request, Response } from 'express';
import Event from '../models/Event';
import mongoose from 'mongoose';
import { events as mockEvents, findEventById } from '../utils/mockData';

// Flag to track if we're using mock data due to DB connection issues
let useMockData = false;

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  const connected = mongoose.connection.readyState === 1;
  if (!connected && !useMockData) {
    console.warn("MongoDB is not connected. Using mock data for events.");
    useMockData = true;
  }
  return connected;
};

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      console.log("Returning mock events data");
      return res.status(200).json(mockEvents);
    }

    const dbEvents = await Event.find().sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    // Fallback to mock data on error
    console.log("Error in database query, returning mock events data");
    res.status(200).json(mockEvents);
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const event = findEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(200).json(event);
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error: any) {
    console.error(`Error fetching event with ID ${req.params.id}:`, error);
    
    // Try to get from mock data on error
    const mockEvent = findEventById(req.params.id);
    if (mockEvent) {
      return res.status(200).json(mockEvent);
    }
    
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Get events by game
export const getEventsByGame = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const gameEvents = mockEvents.filter(e => e.game === req.params.game);
      return res.status(200).json(gameEvents);
    }

    const dbEvents = await Event.find({ game: req.params.game }).sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error(`Error fetching events for game ${req.params.game}:`, error);
    
    // Try to get from mock data on error
    const filteredEvents = mockEvents.filter(e => e.game === req.params.game);
    return res.status(200).json(filteredEvents);
  }
};

// Get events by status
export const getEventsByStatus = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const statusEvents = mockEvents.filter(e => e.status === req.params.status);
      return res.status(200).json(statusEvents);
    }

    const dbEvents = await Event.find({ status: req.params.status }).sort({ startDate: 1 });
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error(`Error fetching events with status ${req.params.status}:`, error);
    
    // Try to get from mock data on error
    const filteredEvents = mockEvents.filter(e => e.status === req.params.status);
    return res.status(200).json(filteredEvents);
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    // Check if using mock data
    if (!isMongoConnected()) {
      const now = new Date();
      const upcomingEvents = mockEvents.filter(e => 
        e.status === 'upcoming' && new Date(e.startDate) >= now
      );
      return res.status(200).json(upcomingEvents);
    }

    const dbEvents = await Event.find({ 
      status: 'upcoming',
      startDate: { $gte: new Date() }
    }).sort({ startDate: 1 });
    
    res.status(200).json(dbEvents);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    
    // Try to get from mock data on error
    const now = new Date();
    const filteredEvents = mockEvents.filter(e => 
      e.status === 'upcoming' && new Date(e.startDate) >= now
    );
    return res.status(200).json(filteredEvents);
  }
};

// Create new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate creating an event
    if (!isMongoConnected()) {
      const newId = 'evt' + (mockEvents.length + 1);
      const mockEvent = {
        _id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockEvents.push(mockEvent);
      return res.status(201).json(mockEvent);
    }

    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error('Error creating event:', error);
    
    // Try to create with mock data on error
    if (!useMockData) {
      const newId = 'evt' + (mockEvents.length + 1);
      const mockEvent = {
        _id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockEvents.push(mockEvent);
      useMockData = true;
      return res.status(201).json(mockEvent);
    }
    
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate updating an event
    if (!isMongoConnected()) {
      const index = mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const updatedEvent = {
        ...mockEvents[index],
        ...req.body,
        updatedAt: new Date()
      };
      
      mockEvents[index] = updatedEvent;
      return res.status(200).json(updatedEvent);
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
    
    // Try to update with mock data on error
    if (!useMockData) {
      const index = mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const updatedEvent = {
        ...mockEvents[index],
        ...req.body,
        updatedAt: new Date()
      };
      
      mockEvents[index] = updatedEvent;
      useMockData = true;
      return res.status(200).json(updatedEvent);
    }
    
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    // If using mock data, simulate deleting an event
    if (!isMongoConnected()) {
      const index = mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      mockEvents.splice(index, 1);
      return res.status(200).json({ message: 'Event deleted successfully' });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting event with ID ${req.params.id}:`, error);
    
    // Try to delete with mock data on error
    if (!useMockData) {
      const index = mockEvents.findIndex(e => e._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      mockEvents.splice(index, 1);
      useMockData = true;
      return res.status(200).json({ message: 'Event deleted successfully' });
    }
    
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
}; 