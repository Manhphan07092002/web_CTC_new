import { connectDB, disconnectDB } from '../services/mongodb';
import { Settings } from '../models';
import { logger } from "../utils/logger";

async function migrateSettings() {
  try {
    logger.log('Connecting to MongoDB...');
    await connectDB();
    logger.log('Connected to MongoDB');

    // Get current settings
    const settings = await Settings.findOne();
    
    if (settings) {
      logger.log('Current settings:', settings);
      
      // Add logoHeader and logoFooter if they don't exist
      if (!settings.logoHeader) {
        settings.logoHeader = settings.logo || '';
        logger.log('Set logoHeader to:', settings.logoHeader);
      }
      
      if (!settings.logoFooter) {
        settings.logoFooter = settings.logo || '';
        logger.log('Set logoFooter to:', settings.logoFooter);
      }
      
      await settings.save();
      logger.log('Settings updated successfully!');
      logger.log('New settings:', settings.toObject());
    } else {
      logger.log('No settings found in database');
    }
    
    await disconnectDB();
    logger.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSettings();
