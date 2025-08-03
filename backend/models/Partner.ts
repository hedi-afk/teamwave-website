import mongoose, { Schema, Document } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  type: 'partner' | 'sponsor';
  tier: string;
  logo: string;
  website: string;
  description: string;
  longDescription?: string;
  foundedYear?: number;
  headquarters?: string;
  industry?: string;
  partnerSince: Date;
  keyProjects?: string[];
  teamCollaborations?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Partner name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['partner', 'sponsor'],
    required: [true, 'Type is required (partner or sponsor)']
  },
  tier: {
    type: String,
    required: [true, 'Tier is required'],
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  longDescription: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number
  },
  headquarters: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  partnerSince: {
    type: Date,
    default: Date.now
  },
  keyProjects: {
    type: [String],
    default: []
  },
  teamCollaborations: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Partner = mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner; 