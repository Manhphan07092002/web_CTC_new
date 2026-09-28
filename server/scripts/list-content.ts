/**
 * List Content Script
 * Hiển thị tất cả projects và news hiện có với ID
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project, News } from '../../models';
import { logger } from "../../utils/logger";

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function listContent() {
  try {
    logger.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    logger.log('Connected to MongoDB');

    // List Projects
    logger.log('\n📋 PROJECTS:');
    const projects = await Project.find().select('_id title location capacity');
    if (projects.length === 0) {
      logger.log('  No projects found');
    } else {
      projects.forEach((project, index) => {
        logger.log(`  ${index + 1}. ID: ${project._id}`);
        logger.log(`     Title: ${project.title}`);
        logger.log(`     Location: ${project.location}`);
        logger.log(`     Capacity: ${project.capacity}`);
        logger.log(`     Edit URL: /admin/projects/edit/${project._id}`);
        logger.log('');
      });
    }

    // List News
    logger.log('\n📰 NEWS:');
    const news = await News.find().select('_id title author date');
    if (news.length === 0) {
      logger.log('  No news found');
    } else {
      news.forEach((item, index) => {
        logger.log(`  ${index + 1}. ID: ${item._id}`);
        logger.log(`     Title: ${item.title}`);
        logger.log(`     Author: ${item.author}`);
        logger.log(`     Date: ${item.date}`);
        logger.log(`     Edit URL: /admin/news/edit/${item._id}`);
        logger.log('');
      });
    }

    logger.log('✅ Content listing completed!');

  } catch (error) {
    logger.error('Error listing content:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.log('\nDisconnected from MongoDB');
  }
}

// Run the list function
listContent();

export default listContent;
