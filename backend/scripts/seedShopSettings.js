const mongoose = require('mongoose');
const ShopSettings = require('../dist/models/ShopSettings').default;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/teamwave', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedShopSettings = async () => {
  try {
    // Check if settings already exist
    const existingSettings = await ShopSettings.findOne();
    
    if (existingSettings) {
      console.log('Shop settings already exist:', {
        isActive: existingSettings.isActive,
        maintenanceMessage: existingSettings.maintenanceMessage,
        updatedAt: existingSettings.updatedAt
      });
    } else {
      // Create default shop settings
      const defaultSettings = new ShopSettings({
        isActive: true,
        maintenanceMessage: 'Shop is currently under maintenance. Please check back later.',
      });
      
      await defaultSettings.save();
      console.log('Successfully created default shop settings');
      console.log('Settings:', {
        isActive: defaultSettings.isActive,
        maintenanceMessage: defaultSettings.maintenanceMessage,
        updatedAt: defaultSettings.updatedAt
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding shop settings:', error);
    mongoose.connection.close();
  }
};

seedShopSettings();
