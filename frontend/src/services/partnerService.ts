import axios from 'axios';
import config from '../config';

export interface IPartner {
  _id?: string;
  name: string;
  type: 'partner' | 'sponsor';
  tier: string;
  logo: string;
  website: string;
  description: string;
  longDescription?: string;
  foundedYear?: number;
  headquarters?: string;
  industry?: string;
  partnerSince?: Date | string;
  keyProjects?: string[];
  teamCollaborations?: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const partnerService = {
  /**
   * Check API connectivity
   */
  checkApiStatus: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${config.apiUrl}/partners`);
      console.log('API status check - Server is running');
      return true;
    } catch (error) {
      console.error('API connection error:', error);
      return false;
    }
  },

  /**
   * Fetch all partners/sponsors
   */
  getAllPartners: async (type?: 'partner' | 'sponsor', activeOnly: boolean = true): Promise<IPartner[]> => {
    try {
      let url = `${config.apiUrl}/partners`;
      
      // Apply filters
      const params = new URLSearchParams();
      if (type) {
        params.append('type', type);
      }
      if (activeOnly) {
        params.append('active', 'true');
      }
      
      // Add params to URL if we have any
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      console.log(`getAllPartners response (type: ${type || 'all'}, activeOnly: ${activeOnly}):`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  /**
   * Fetch a partner by ID
   */
  getPartnerById: async (id: string): Promise<IPartner> => {
    try {
      const response = await axios.get(`${config.apiUrl}/partners/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching partner with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new partner
   */
  createPartner: async (partnerData: IPartner): Promise<IPartner> => {
    try {
      const response = await axios.post(`${config.apiUrl}/partners`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  /**
   * Update an existing partner
   */
  updatePartner: async (id: string, partnerData: Partial<IPartner>): Promise<IPartner> => {
    try {
      const response = await axios.put(`${config.apiUrl}/partners/${id}`, partnerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating partner with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a partner
   */
  deletePartner: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${config.apiUrl}/partners/${id}`);
    } catch (error) {
      console.error(`Error deleting partner with ID ${id}:`, error);
      throw error;
    }
  }
};

export default partnerService; 