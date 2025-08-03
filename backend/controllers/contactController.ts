import { Request, Response } from 'express';
import ContactMessage, { IContactMessage } from '../models/ContactMessage';

// Create a new contact message
export const createContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, category } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      category
    });

    const savedMessage = await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: savedMessage
    });
  } catch (error: any) {
    console.error('Error creating contact message:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.',
      error: error.message
    });
  }
};

// Get all contact messages (admin only)
export const getAllContactMessages = async (req: Request, res: Response) => {
  try {
    const { category, read } = req.query;
    
    let filter: any = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get a single contact message by ID
export const getContactMessageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findById(id).select('-__v');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error: any) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Mark message as read
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).select('-__v');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Delete a contact message
export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const message = await ContactMessage.findByIdAndDelete(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

// Get message statistics
export const getMessageStats = async (req: Request, res: Response) => {
  try {
    const totalMessages = await ContactMessage.countDocuments();
    const unreadMessages = await ContactMessage.countDocuments({ read: false });
    
    const categoryStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalMessages,
        unread: unreadMessages,
        categories: categoryStats
      }
    });
  } catch (error: any) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
}; 