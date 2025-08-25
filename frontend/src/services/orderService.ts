import axios from 'axios';
import config from '../config';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerLocation: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerLocation: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const API_URL = `${config.apiUrl}/orders`;

// Create a new order
export const createOrder = async (orderData: CreateOrderData): Promise<{ message: string; order: Order }> => {
  const response = await axios.post(API_URL, orderData);
  return response.data;
};

// Get all orders (admin only)
export const getAllOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get order by ID (admin only)
export const getOrderById = async (id: string): Promise<Order> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update order status (admin only)
export const updateOrderStatus = async (id: string, status: string, notes?: string): Promise<{ message: string; order: Order }> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.put(`${API_URL}/${id}`, { status, notes }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Delete order (admin only)
export const deleteOrder = async (id: string): Promise<{ message: string }> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Get order statistics (admin only)
export const getOrderStats = async (): Promise<OrderStats> => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
