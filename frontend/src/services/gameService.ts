import axios from 'axios';
import config from '../config';

export interface IGame {
  _id: string;
  name: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameFormData {
  name: string;
  featured: boolean;
  order: number;
}

class GameService {
  private apiUrl = `${config.apiUrl}/games`;

  // Get all games
  async getAllGames(): Promise<IGame[]> {
    const response = await axios.get(this.apiUrl);
    return response.data;
  }

  // Get active games only
  async getActiveGames(): Promise<IGame[]> {
    const response = await axios.get(`${this.apiUrl}/active`);
    return response.data;
  }

  // Get featured games
  async getFeaturedGames(): Promise<IGame[]> {
    const response = await axios.get(`${this.apiUrl}/featured`);
    return response.data;
  }

  // Get single game by ID
  async getGameById(id: string): Promise<IGame> {
    const response = await axios.get(`${this.apiUrl}/${id}`);
    return response.data;
  }

  // Create new game
  async createGame(gameData: GameFormData): Promise<IGame> {
    const response = await axios.post(this.apiUrl, gameData);
    return response.data;
  }

  // Update game
  async updateGame(id: string, gameData: GameFormData): Promise<IGame> {
    const response = await axios.put(`${this.apiUrl}/${id}`, gameData);
    return response.data;
  }

  // Delete game
  async deleteGame(id: string): Promise<void> {
    await axios.delete(`${this.apiUrl}/${id}`);
  }

  // Update game order
  async updateGameOrder(games: Array<{ id: string; order: number }>): Promise<void> {
    await axios.put(`${this.apiUrl}/order/update`, { games });
  }
}

export default new GameService(); 