import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  eventId: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  gameName: string;
  gameId?: string;
  team?: string;
  message?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    gameName: {
      type: String,
      required: true,
      trim: true
    },
    gameId: {
      type: String,
      trim: true
    },
    team: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration; 