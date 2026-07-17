import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { ProductCategory, Product, News, User, MigrationLog } from '../models/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function generateSlug(str: string) {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseJsonEntry(entry: AdmZip.IZipEntry) {
    let content = entry.getData().toString('utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return JSON.parse(content);
}

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();
        const logs: string[] = [];
        let sqlCategories: any[] = [];
        let sqlProducts: any[] = [];
        let sqlBlogs: any[] = [];
        let catMap: Record<number, any> = {};
        let userCount = 0;

        // 1. Process Categories first to build catMap
        const categoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('categories.json'));
        if (categoriesEntry) {
            logs.push('Processing Categories...');
            sqlCategories = parseJsonEntry(categoriesEntry) || [];
            await ProductCategory.deleteMany({});
            
            for (const cat of sqlCategories) {
                try {
                    const catName = cat.name || cat.Name;
                    const newCat = new ProductCategory({
                        name: catName,
                        slug: cat.slug || (cat.SearchText ? generateSlug(cat.SearchText) : generateSlug(catName)),
                        description: cat.description || cat.SEODescriptions || '',
                        image: cat.image || cat.Image || '',
                        order: cat.order || cat.Rank || 0,
                        isActive: cat.isActive !== undefined ? cat.isActive : cat.IsActive
                    });
                    await newCat.save();
                    catMap[cat._id || cat.ID] = newCat._id;
                } catch (err: any) {
                    logs.push(`Category Error [${cat.name || cat.Name}]: ${err.message}`);
                }
            }
            logs.push(`Successfully imported ${sqlCategories.length} categories.`);
        }

        // 2. Process Products
        const productsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('products.json'));
        if (productsEntry) {
            logs.push('Processing Products...');
            sqlProducts = parseJsonEntry(productsEntry) || [];
            await Product.deleteMany({});
            
            for (const prod of sqlProducts) {
                try {
                    const catId = prod.categoryId || catMap[prod.CateID]; 
                    let imageList = prod.images || [];
                    if (imageList.length === 0) {
                        if (prod.Image) imageList.push(prod.Image);
                        if (prod.Image2) imageList.push(prod.Image2);
                        if (prod.Image3) imageList.push(prod.Image3);
                        if (prod.Image4) imageList.push(prod.Image4);
                        if (prod.Image5) imageList.push(prod.Image5);
                    }

                    const newProd = new Product({
                        name: prod.name || prod.Name,
                        category: prod.category || 'Default',
                        categoryId: catId, 
                        code: prod.code || prod.Code,
                        description: prod.description || prod.Content || prod.Description || 'No description',
                        shortDescription: prod.shortDescription || prod.ShortDescription,
                        price: prod.price?.toString() || prod.Price?.toString(),
                        contactPrice: prod.contactPrice !== undefined ? prod.contactPrice : (prod.Price === 0 || !prod.Price),
                        image: prod.image || prod.Image || '',
                        images: imageList,
                        stock: prod.stock || prod.Quantity || 0,
                        stockStatus: prod.stockStatus || (prod.Quantity > 0 ? 'in_stock' : 'contact'),
                        isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : (prod.IsHot || false),
                        isActive: prod.isActive !== undefined ? prod.isActive : prod.IsActive,
                        views: prod.views || prod.ViewCount || 0
                    });
                    await newProd.save();
                } catch (err: any) {
                    logs.push(`Product Error [${prod.name || prod.Name}]: ${err.message}`);
                }
            }
            logs.push(`Successfully imported ${sqlProducts.length} products.`);
        }

        // 3. Process Blogs/News
        const blogsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('blog.json'));
        if (blogsEntry) {
            logs.push('Processing Blogs...');
            sqlBlogs = parseJsonEntry(blogsEntry) || [];
            await News.deleteMany({});
            
            for (const blog of sqlBlogs) {
                try {
                    let d = new Date();
                    if (blog.date) {
                        d = new Date(blog.date);
                    } else if (blog.CreateTime) {
                        d = new Date(parseInt(blog.CreateTime.replace('/Date(', '').replace(')/', '')));
                    }
                    if (isNaN(d.getTime())) d = new Date();
                    
                    const blogTitle = blog.title || blog.Name || 'Untitled';
                    const newBlog = new News({
                        title: blogTitle,
                        slug: blog.slug || (blog.SearchText ? generateSlug(blog.SearchText) : generateSlug(blogTitle) || Date.now().toString()),
                        excerpt: blog.excerpt || blog.ShortDescription || blog.Name || 'No excerpt',
                        content: blog.content || blog.Content || 'No content',
                        image: blog.image || blog.Image || '/placeholder.jpg',
                        author: blog.author || blog.CreateBy || 'Admin',
                        date: d.toISOString(),
                        publishedAt: d,
                        isActive: blog.isActive !== undefined ? blog.isActive : (blog.IsActive !== false)
                    });
                    await newBlog.save();
                } catch (err: any) {
                    logs.push(`Blog Error [${blog.title || blog.Name}]: ${err.message}`);
                }
            }
            logs.push(`Successfully imported ${sqlBlogs.length} blogs.`);
        }

        // 4. Process Users
        const usersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('users.json'));
        if (usersEntry) {
            logs.push('Processing Users...');
            const sqlUsers = parseJsonEntry(usersEntry);
            // We shouldn't delete all users as it might delete the current admin
            let userCount = 0;
            for (const u of sqlUsers) {
                try {
                    const email = u.email || u.Username || u.Email;
                    const name = u.name || u.FullName || u.Username || u.Email;
                    const existing = await User.findOne({ email });
                    if (!existing && email) {
                        const newUser = new User({
                            email,
                            name,
                            role: u.role || 'staff',
                            password: u.password || 'defaultPassword123'
                        });
                        await newUser.save();
                        userCount++;
                    }
                } catch (err: any) {
                    logs.push(`User Error [${u.email || u.Username}]: ${err.message}`);
                }
            }
            logs.push(`Successfully imported ${userCount} new users.`);
        }

        const logEntry = new MigrationLog({
            action: 'import',
            status: 'success',
            details: `Imported Categories: ${sqlCategories?.length || 0}, Products: ${sqlProducts?.length || 0}, Blogs: ${sqlBlogs?.length || 0}, Users: ${userCount || 0}`,
            user: 'Admin'
        });
        await logEntry.save();

        res.json({ success: true, logs });
    } catch (error: any) {
        console.error('Migration API Error:', error);
        const logEntry = new MigrationLog({
            action: 'import',
            status: 'error',
            details: error.message || 'Migration failed',
            user: 'Admin'
        });
        await logEntry.save();
        res.status(500).json({ success: false, error: error.message || 'Migration failed' });
    }
});

router.get('/export', async (req, res) => {
    try {
        const zip = new AdmZip();
        
        // Export Categories
        const categories = await ProductCategory.find({}).lean();
        zip.addFile('Categories.json', Buffer.from(JSON.stringify(categories, null, 2), 'utf8'));
        
        // Export Products
        const products = await Product.find({}).lean();
        zip.addFile('Products.json', Buffer.from(JSON.stringify(products, null, 2), 'utf8'));
        
        // Export Blogs
        const blogs = await News.find({}).lean();
        zip.addFile('Blog.json', Buffer.from(JSON.stringify(blogs, null, 2), 'utf8'));
        
        // Export Users
        const users = await User.find({}).lean();
        zip.addFile('Users.json', Buffer.from(JSON.stringify(users, null, 2), 'utf8'));
        
        const zipBuffer = zip.toBuffer();
        
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=website_backup_${new Date().toISOString().split('T')[0]}.zip`);
        res.set('Content-Length', zipBuffer.length.toString());
        res.send(zipBuffer);
        
        const logEntry = new MigrationLog({
            action: 'export',
            status: 'success',
            details: `Exported backup zip`,
            user: 'Admin'
        });
        await logEntry.save();
        
    } catch (error: any) {
        console.error('Export API Error:', error);
        const logEntry = new MigrationLog({
            action: 'export',
            status: 'error',
            details: error.message || 'Export failed',
            user: 'Admin'
        });
        await logEntry.save();
        res.status(500).json({ success: false, error: error.message || 'Export failed' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const history = await MigrationLog.find({}).sort({ date: -1 }).limit(50);
        res.json({ success: true, data: history });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
