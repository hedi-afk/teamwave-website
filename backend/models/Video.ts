import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  thumbnail: string; // Path to thumbnail (image or video)
  thumbnailType: 'image' | 'video'; // Type of thumbnail
  videoFile: string; // Path to video file
  videoUrl: string; // External video URL (YouTube, Vimeo, etc.)
  category: 'gameplay' | 'tournament' | 'interview' | 'highlights' | 'tutorial' | 'stream';
  duration?: number; // Video duration in seconds
  views: number;
  isPublic: boolean;
  featured: boolean;
  tags: string[];
  uploadedBy: string; // Reference to member who uploaded
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required'],
    trim: true
  },
  thumbnailType: {
    type: String,
    required: [true, 'Thumbnail type is required'],
    enum: ['image', 'video'],
    default: 'image'
  },
  videoFile: {
    type: String,
    trim: true
    // Optional - can be either videoFile or videoUrl
  },
  videoUrl: {
    type: String,
    trim: true
    // Optional - can be either videoFile or videoUrl
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['gameplay', 'tournament', 'interview', 'highlights', 'tutorial', 'stream'],
    default: 'gameplay'
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: String,
    required: [true, 'Uploader is required']
  }
}, { timestamps: true });

// Validation to ensure either videoFile or videoUrl is provided
VideoSchema.pre('validate', function(next) {
  if (!this.videoFile && !this.videoUrl) {
    next(new Error('Either video file or video URL must be provided'));
  }
  next();
});

const Video = mongoose.model<IVideo>('Video', VideoSchema);

export default Video; 