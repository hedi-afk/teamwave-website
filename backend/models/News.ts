import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: Date;
  author: string;
  category: 'announcement' | 'event' | 'team' | 'community' | 'partnership';
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [150, 'Excerpt cannot be more than 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: String,
      required: [true, 'Featured image is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    author: {
      type: String,
      default: 'Admin',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['announcement', 'event', 'team', 'community', 'partnership'],
      default: 'announcement',
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
NewsSchema.index({ date: -1 });
NewsSchema.index({ category: 1 });
NewsSchema.index({ published: 1 });

export default mongoose.model<INews>('News', NewsSchema); 