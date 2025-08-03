import axios from 'axios';
import config from '../config';

export interface ITeam {
  _id: string;
  name: string;
  game: string;
  description: string;
  logo: string;
  status: 'active' | 'inactive';
  members: string[];
  achievements: Array<{
    title: string;
    date: Date;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamFormData {
  name: string;
  game: string;
  description: string;
  logo: string;
  status: 'active' | 'inactive';
  members: string[];
  achievements: Array<{
    title: string;
    date: string;
    description: string;
  }>;
}

class TeamService {
  private apiUrl = `${config.apiUrl}/teams`;

  // Get all teams
  async getAllTeams(): Promise<ITeam[]> {
    const response = await axios.get(this.apiUrl);
    return response.data;
  }

  // Get active teams only
  async getActiveTeams(): Promise<ITeam[]> {
    const response = await axios.get(`${this.apiUrl}/active`);
    return response.data;
  }

  // Get single team by ID
  async getTeamById(id: string): Promise<ITeam> {
    const response = await axios.get(`${this.apiUrl}/${id}`);
    return response.data;
  }

  // Create new team
  async createTeam(teamData: TeamFormData): Promise<ITeam> {
    const response = await axios.post(this.apiUrl, teamData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Update team
  async updateTeam(id: string, teamData: TeamFormData): Promise<ITeam> {
    const response = await axios.put(`${this.apiUrl}/${id}`, teamData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Delete team
  async deleteTeam(id: string): Promise<void> {
    await axios.delete(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  // Get teams by game
  async getTeamsByGame(game: string): Promise<ITeam[]> {
    const response = await axios.get(`${this.apiUrl}/game/${game}`);
    return response.data;
  }
}

export default new TeamService(); 