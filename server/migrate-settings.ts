import { connectDB, disconnectDB } from '../services/mongodb';
import { Settings } from '../models';

async function migrateSettings() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Get current settings
    const settings = await Settings.findOne();
    
    if (settings) {
      console.log('Current settings:', settings);
      
      // Add logoHeader and logoFooter if they don't exist
      if (!settings.logoHeader) {
        settings.logoHeader = settings.logo || '';
        console.log('Set logoHeader to:', settings.logoHeader);
      }
      
      if (!settings.logoFooter) {
        settings.logoFooter = settings.logo || '';
        console.log('Set logoFooter to:', settings.logoFooter);
      }
      
      await settings.save();
      console.log('Settings updated successfully!');
      console.log('New settings:', settings.toObject());
    } else {
      console.log('No settings found in database');
    }
    
    await disconnectDB();
    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSettings();
