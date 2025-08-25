import { Request, Response } from 'express';
import ShopSettings from '../models/ShopSettings';

// Get shop settings
export const getShopSettings = async (req: Request, res: Response) => {
  try {
    let settings = await ShopSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new ShopSettings({
        isActive: true,
        maintenanceMessage: 'Shop is currently under maintenance. Please check back later.',
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error: any) {
    console.error('Error fetching shop settings:', error);
    res.status(500).json({ message: 'Error fetching shop settings' });
  }
};

// Update shop settings (admin only)
export const updateShopSettings = async (req: Request, res: Response) => {
  try {
    const { isActive, maintenanceMessage } = req.body;
    
    let settings = await ShopSettings.findOne();
    
    if (!settings) {
      settings = new ShopSettings({
        isActive: isActive ?? true,
        maintenanceMessage: maintenanceMessage || 'Shop is currently under maintenance. Please check back later.',
      });
    } else {
      settings.isActive = isActive ?? settings.isActive;
      if (maintenanceMessage !== undefined) {
        settings.maintenanceMessage = maintenanceMessage;
      }
    }
    
    await settings.save();
    
    res.json({
      message: 'Shop settings updated successfully',
      settings,
    });
  } catch (error: any) {
    console.error('Error updating shop settings:', error);
    res.status(500).json({ message: 'Error updating shop settings' });
  }
};
