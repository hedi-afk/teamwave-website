import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  name: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Add unique index manually to avoid issues
GameSchema.index({ name: 1 }, { unique: true });

export default mongoose.model<IGame>('Game', GameSchema); 