import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { News } from '../models/index.js';

dotenv.config({ path: '../.env' }); // Mặc định ở server/scripts thì .env nằm ở gốc

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..'); // Trỏ ra root 'e:\tran-le-electricity---solar-energy (1)'

function generateSlug(str) {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function readJsonFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return JSON.parse(content);
}

async function migrate() {
    try {
        console.log('Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');
        
        // ==============================
        // MIGRATING BLOGS
        // ==============================
        console.log('Migrating Blogs...');
        const blogPath = path.join(dataDir, 'Blog.json');
        if (fs.existsSync(blogPath)) {
            const sqlBlogs = readJsonFile(blogPath);

            await News.deleteMany({});
            
            for (const blog of sqlBlogs) {
                try {
                    let d = blog.CreateTime ? new Date(parseInt(blog.CreateTime.replace('/Date(', '').replace(')/', ''))) : new Date();
                    if (isNaN(d.getTime())) d = new Date();
                    
                    const newBlog = new News({
                        title: blog.Name || 'Untitled',
                        slug: blog.SearchText ? generateSlug(blog.SearchText) : generateSlug(blog.Name) || Date.now().toString(),
                        excerpt: blog.ShortDescription || blog.Name || 'No excerpt',
                        content: blog.Content || 'No content',
                        image: blog.Image || '/placeholder.jpg',
                        author: blog.CreateBy || 'Admin',
                        date: d.toISOString(),
                        publishedAt: d,
                        isActive: blog.IsActive !== false
                    });
                    await newBlog.save();
                } catch (err) {
                    console.error(`Error saving blog ${blog.Name}:`, err.message);
                }
            }
            console.log(`Saved ${sqlBlogs.length} blogs.`);
        }

        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

migrate();
