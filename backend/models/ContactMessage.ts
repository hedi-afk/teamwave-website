import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'partnership' | 'events' | 'other';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'support', 'partnership', 'events', 'other'],
    default: 'general'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage; 