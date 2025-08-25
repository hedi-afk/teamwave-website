import mongoose, { Schema, Document } from 'mongoose';

export interface IShopSettings extends Document {
  isActive: boolean;
  maintenanceMessage?: string;
  updatedAt: Date;
}

const ShopSettingsSchema: Schema = new Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    maintenanceMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
ShopSettingsSchema.index({}, { unique: true });

const ShopSettings = mongoose.model<IShopSettings>('ShopSettings', ShopSettingsSchema);

export default ShopSettings;
