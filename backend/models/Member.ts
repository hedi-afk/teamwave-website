import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  username: string;
  fullName: string;
  avatar: string;
  role: 'Player' | 'Coach' | 'Content Creator' | 'Social Media Manager';
  primaryGame?: string; // For Players and Coaches - which game they're assigned to
  secondaryGames: string[]; // Other games they can play/coach
  rank: string;
  bio: string;
  achievements: string[];
  socialLinks: {
    twitter?: string;
    instagram?: string;
    twitch?: string;
    youtube?: string;
    discord?: string;
  };
  joinDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Player', 'Coach', 'Content Creator', 'Social Media Manager'],
    trim: true
  },
  primaryGame: {
    type: String,
    trim: true,
    default: null // null for Content Creators and Social Media Managers
  },
  secondaryGames: {
    type: [String],
    default: []
  },
  rank: {
    type: String,
    default: 'Rookie'
  },
  bio: {
    type: String,
    default: ''
  },
  achievements: {
    type: [String],
    default: []
  },
  socialLinks: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitch: { type: String, default: '' },
    youtube: { type: String, default: '' },
    discord: { type: String, default: '' }
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Member = mongoose.model<IMember>('Member', MemberSchema);

export default Member; 