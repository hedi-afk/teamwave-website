import axios from 'axios';
import config from '../config';

export interface ShopSettings {
  _id: string;
  isActive: boolean;
  maintenanceMessage?: string;
  updatedAt: string;
}

export interface UpdateShopSettingsData {
  isActive: boolean;
  maintenanceMessage?: string;
}

const API_URL = `${config.apiUrl}/shop-settings`;

// Get shop settings
export const getShopSettings = async (): Promise<ShopSettings> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Update shop settings (admin only)
export const updateShopSettings = async (settings: UpdateShopSettingsData): Promise<{ message: string; settings: ShopSettings }> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.put(API_URL, settings, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
