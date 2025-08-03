import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string; // e.g., "TeamWave CS:GO"
  game: string; // e.g., "CS:GO"
  description: string;
  logo: string;
  status: string;
  members: string[]; // Array of member IDs (players only)
  achievements: Array<{
    title: string;
    date: Date;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    game: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure one team per game
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'Member'
    }],
    achievements: [
      {
        title: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.model<ITeam>('Team', TeamSchema);

export default Team; 