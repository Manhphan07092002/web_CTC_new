import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductCategory, Product, User, News, Category } from '../models/index.js';

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
        // MIGRATING CATEGORIES
        // ==============================
        console.log('Migrating Categories...');
        const catPath = path.join(dataDir, 'Categories.json');
        if (fs.existsSync(catPath)) {
            const sqlCategories = readJsonFile(catPath);
            
            await ProductCategory.deleteMany({});
            let catMap = {}; 
            
            for (const cat of sqlCategories) {
                try {
                    const newCat = new ProductCategory({
                        name: cat.Name,
                        slug: cat.SearchText ? generateSlug(cat.SearchText) : generateSlug(cat.Name),
                        description: cat.SEODescriptions || '',
                        image: cat.Image || '',
                        order: cat.Rank || 0,
                        isActive: cat.IsActive
                    });
                    await newCat.save();
                    catMap[cat.ID] = newCat._id;
                    console.log(`Saved category: ${newCat.name}`);
                } catch (err) {
                    console.error(`Error saving category ${cat.Name}:`, err.message);
                }
            }
            fs.writeFileSync(path.join(__dirname, 'catMap.json'), JSON.stringify(catMap));
        }

        // ==============================
        // MIGRATING PRODUCTS
        // ==============================
        console.log('Migrating Products...');
        const prodPath = path.join(dataDir, 'Products.json');
        if (fs.existsSync(prodPath)) {
            const sqlProducts = readJsonFile(prodPath);
            const catMap = readJsonFile(path.join(__dirname, 'catMap.json'));

            await Product.deleteMany({});
            
            for (const prod of sqlProducts) {
                try {
                    const catId = catMap[prod.CateID]; 
                    let imageList = [];
                    if (prod.Image) imageList.push(prod.Image);
                    if (prod.Image2) imageList.push(prod.Image2);
                    if (prod.Image3) imageList.push(prod.Image3);
                    if (prod.Image4) imageList.push(prod.Image4);
                    if (prod.Image5) imageList.push(prod.Image5);

                    const newProd = new Product({
                        name: prod.Name,
                        category: 'Default',
                        categoryId: catId, 
                        code: prod.Code,
                        description: prod.Content || prod.Description || 'No description',
                        shortDescription: prod.ShortDescription,
                        price: prod.Price?.toString(),
                        contactPrice: prod.Price === 0 || !prod.Price,
                        image: prod.Image || '',
                        images: imageList,
                        stock: prod.Quantity || 0,
                        stockStatus: prod.Quantity > 0 ? 'in_stock' : 'contact',
                        isFeatured: prod.IsHot || false,
                        isActive: prod.IsActive,
                        views: prod.ViewCount || 0
                    });
                    await newProd.save();
                } catch (err) {
                    console.error(`Error saving product ${prod.Name}:`, err.message);
                }
            }
            console.log(`Saved ${sqlProducts.length} products.`);
        }
        
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
                    const newBlog = new News({
                        title: blog.Name,
                        slug: blog.SearchText ? generateSlug(blog.SearchText) : generateSlug(blog.Name),
                        excerpt: blog.ShortDescription || '',
                        content: blog.Content || 'No content',
                        image: blog.Image || '',
                        author: blog.CreateBy || 'Admin',
                        publishedAt: blog.CreateTime ? new Date(blog.CreateTime) : new Date(),
                        isActive: blog.IsActive
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
