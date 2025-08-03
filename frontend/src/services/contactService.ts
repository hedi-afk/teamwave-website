import config from '../config';

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'partnership' | 'events' | 'other';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'partnership' | 'events' | 'other';
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: IContactMessage;
  errors?: string[];
}

export interface ContactMessagesResponse {
  success: boolean;
  data: IContactMessage[];
  count: number;
}

export interface MessageStats {
  total: number;
  unread: number;
  categories: Array<{
    _id: string;
    count: number;
  }>;
}

const contactService = {
  // Send a contact message (public)
  sendMessage: async (formData: ContactFormData): Promise<ContactResponse> => {
    try {
      const response = await fetch(`${config.apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      return {
        success: false,
        message: 'Failed to send message. Please try again.',
        errors: [error.message]
      };
    }
  },

  // Get all contact messages (admin only)
  getAllMessages: async (filters?: { category?: string; read?: boolean }): Promise<ContactMessagesResponse> => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      let url = `${config.apiUrl}/contact`;
      const params = new URLSearchParams();
      
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters?.read !== undefined) {
        params.append('read', filters.read.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching contact messages:', error);
      throw new Error('Failed to fetch messages');
    }
  },

  // Get message statistics (admin only)
  getMessageStats: async (): Promise<MessageStats> => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(`${config.apiUrl}/contact/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error fetching message stats:', error);
      throw new Error('Failed to fetch message statistics');
    }
  },

  // Get a single message by ID (admin only)
  getMessageById: async (id: string): Promise<IContactMessage> => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(`${config.apiUrl}/contact/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error fetching message:', error);
      throw new Error('Failed to fetch message');
    }
  },

  // Mark message as read (admin only)
  markAsRead: async (id: string): Promise<IContactMessage> => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(`${config.apiUrl}/contact/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  },

  // Delete a message (admin only)
  deleteMessage: async (id: string): Promise<void> => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin token not found');
      }

      const response = await fetch(`${config.apiUrl}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (error: any) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get category display name
  getCategoryDisplayName: (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      general: 'General Inquiry',
      support: 'Technical Support',
      partnership: 'Partnership Opportunity',
      events: 'Events & Tournaments',
      other: 'Other'
    };
    return categoryMap[category] || category;
  }
};

export default contactService; 