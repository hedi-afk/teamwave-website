import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description: string;
  image: string;
  game: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: string;
  teams: string[];
  prizePool: number;
  format: string;
  registrationDeadline: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    game: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    teams: [{
      type: String
    }],
    prizePool: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model<IEvent>('Event', EventSchema);

export default Event; 