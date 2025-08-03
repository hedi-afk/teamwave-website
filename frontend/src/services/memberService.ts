import axios from 'axios';
import config from '../config';

export interface IMember {
  _id?: string;
  username: string;
  fullName: string;
  avatar: string;
  role: 'Player' | 'Coach' | 'Content Creator' | 'Social Media Manager';
  primaryGame?: string; // For Players and Coaches - which game they're assigned to
  secondaryGames: string[]; // Other games they can play/coach
  rank: string;
  bio: string;
  achievements: string[];
  socialLinks: {
    twitter?: string;
    instagram?: string;
    twitch?: string;
    youtube?: string;
    discord?: string;
  };
  joinDate?: string | Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const memberService = {
  /**
   * Check API connectivity
   */
  checkApiStatus: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members`);
      console.log('API status check - Server is running');
      return true;
    } catch (error) {
      console.error('API connection error:', error);
      return false;
    }
  },

  /**
   * Fetch all members
   */
  getAllMembers: async (): Promise<IMember[]> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members`);
      console.log('getAllMembers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  /**
   * Fetch a member by ID
   */
  getMemberById: async (id: string): Promise<IMember> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch a member by username
   */
  getMemberByUsername: async (username: string): Promise<IMember> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members/username/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member with username ${username}:`, error);
      throw error;
    }
  },

  /**
   * Fetch members by team
   */
  getMembersByTeam: async (team: string): Promise<IMember[]> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members/team/${team}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for team ${team}:`, error);
      throw error;
    }
  },

  /**
   * Fetch members by game
   */
  getMembersByGame: async (game: string): Promise<IMember[]> => {
    try {
      const response = await axios.get(`${config.apiUrl}/members/game/${game}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching members for game ${game}:`, error);
      throw error;
    }
  },

  /**
   * Create a new member
   */
  createMember: async (memberData: IMember): Promise<IMember> => {
    try {
      const response = await axios.post(`${config.apiUrl}/members`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  /**
   * Update an existing member
   */
  updateMember: async (id: string, memberData: Partial<IMember>): Promise<IMember> => {
    try {
      const response = await axios.put(`${config.apiUrl}/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a member
   */
  deleteMember: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${config.apiUrl}/members/${id}`);
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      throw error;
    }
  }
};

export default memberService; 