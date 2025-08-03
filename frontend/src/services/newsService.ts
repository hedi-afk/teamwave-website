import axios from 'axios';
import config from '../config';

// Define interfaces matching the server models
export interface INewsArticle {
  _id?: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: Date | string;
  category: 'announcement' | 'event' | 'team' | 'partnership' | 'community';
  author: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// News API service
const newsService = {
  // Get all news articles
  getAllArticles: async () => {
    try {
      console.log('Requesting all news articles from:', `${config.apiUrl}/news`);
      const response = await axios.get(`${config.apiUrl}/news`);
      console.log('Received news articles:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching news articles:', error);
      throw error;
    }
  },

  // Get published news articles (for public site)
  getPublishedArticles: async () => {
    try {
      console.log('Requesting published news articles from:', `${config.apiUrl}/news/published`);
      const response = await axios.get(`${config.apiUrl}/news/published`);
      console.log('Received published news articles:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching published news articles:', error);
      throw error;
    }
  },

  // Get news article by ID
  getArticleById: async (id: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news article with ID ${id}:`, error);
      throw error;
    }
  },

  // Get news articles by category
  getArticlesByCategory: async (category: string) => {
    try {
      const response = await axios.get(`${config.apiUrl}/news/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news articles for category ${category}:`, error);
      throw error;
    }
  },

  // Create new article
  createArticle: async (articleData: INewsArticle) => {
    try {
      const response = await axios.post(`${config.apiUrl}/news`, articleData);
      return response.data;
    } catch (error) {
      console.error('Error creating news article:', error);
      throw error;
    }
  },

  // Update article
  updateArticle: async (id: string, articleData: Partial<INewsArticle>) => {
    try {
      const response = await axios.put(`${config.apiUrl}/news/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating news article with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id: string) => {
    try {
      const response = await axios.delete(`${config.apiUrl}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting news article with ID ${id}:`, error);
      throw error;
    }
  },

  // Toggle article published status
  togglePublishStatus: async (id: string, publishStatus: boolean) => {
    try {
      const response = await axios.patch(`${config.apiUrl}/news/${id}/publish`, { published: publishStatus });
      return response.data;
    } catch (error) {
      console.error(`Error toggling publish status for article with ID ${id}:`, error);
      throw error;
    }
  },
};

export default newsService; 