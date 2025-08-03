import axios from 'axios';
import config from '../config';

// Define interfaces matching the server models
export interface IEvent {
  _id?: string;
  name: string;
  description: string;
  image: string;
  game: string;
  startDate: Date | string;
  endDate: Date | string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  teams: string[];
  prizePool: number;
  format: string;
  registrationDeadline: Date | string;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Event API service
const eventService = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/events`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  },

  // Get events by game
  getEventsByGame: async (game: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/events/game/${game}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for game ${game}:`, error);
      throw error;
    }
  },

  // Get events by status
  getEventsByStatus: async (status: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/events/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching events with status ${status}:`, error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData: IEvent) => {
    try {
      const response = await axios.post(`${config.apiUrl}/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (id: string, eventData: Partial<IEvent>) => {
    try {
      const response = await axios.put(`${config.apiUrl}/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error updating event with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id: string) => {
    try {
      const response = await axios.delete(`${config.apiUrl}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error);
      throw error;
    }
  },
};

export default eventService; 