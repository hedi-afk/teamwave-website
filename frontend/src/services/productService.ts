import axios from 'axios';
import config from '../config';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: 'jerseys' | 'accessories' | 'peripherals';
  price: number;
  image: string;
  stock: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  category: 'jerseys' | 'accessories' | 'peripherals';
  price: number;
  image: string;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  category?: 'jerseys' | 'accessories' | 'peripherals';
  price?: number;
  image?: string;
  stock?: number;
}

const API_URL = `${config.apiUrl}/products`;

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/category/${category}`);
  return response.data;
};

// Create a new product (admin only)
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(API_URL, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update a product (admin only)
export const updateProduct = async (id: string, productData: UpdateProductData): Promise<Product> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.put(`${API_URL}/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete a product (admin only)
export const deleteProduct = async (id: string): Promise<{ message: string }> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
