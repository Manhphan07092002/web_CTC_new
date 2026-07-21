/**
 * List Content Script
 * Hiển thị tất cả projects và news hiện có với ID
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project, News } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

async function listContent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // List Projects
    console.log('\n📋 PROJECTS:');
    const projects = await Project.find().select('_id title location capacity');
    if (projects.length === 0) {
      console.log('  No projects found');
    } else {
      projects.forEach((project, index) => {
        console.log(`  ${index + 1}. ID: ${project._id}`);
        console.log(`     Title: ${project.title}`);
        console.log(`     Location: ${project.location}`);
        console.log(`     Capacity: ${project.capacity}`);
        console.log(`     Edit URL: /admin/projects/edit/${project._id}`);
        console.log('');
      });
    }

    // List News
    console.log('\n📰 NEWS:');
    const news = await News.find().select('_id title author date');
    if (news.length === 0) {
      console.log('  No news found');
    } else {
      news.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item._id}`);
        console.log(`     Title: ${item.title}`);
        console.log(`     Author: ${item.author}`);
        console.log(`     Date: ${item.date}`);
        console.log(`     Edit URL: /admin/news/edit/${item._id}`);
        console.log('');
      });
    }

    console.log('✅ Content listing completed!');

  } catch (error) {
    console.error('Error listing content:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the list function
listContent();

export default listContent;
