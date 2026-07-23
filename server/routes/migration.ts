import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { 
  ProductCategory, Product, 
  ProjectCategory, Project,
  NewsCategory, News, 
  DocumentCategory, Resource,
  Order, OrderItem,
  Contact, Review,
  Settings, TeamMember, Testimonial, Partner,
  Notification, User, MigrationLog 
} from '../../models';

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

/**
 * IMPORT BACKUP (Upload ZIP containing all site JSON collections)
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Chưa chọn file sao lưu ZIP' });
    }

    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();
    const logs: string[] = [];
    const importCounts: Record<string, number> = {};

    let catMap: Record<string, any> = {};

    // 1. Process Product Categories & Products
    const categoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('categories.json') && !e.entryName.toLowerCase().includes('project') && !e.entryName.toLowerCase().includes('news') && !e.entryName.toLowerCase().includes('document'));
    if (categoriesEntry) {
      logs.push('Đang xử lý Danh mục Sản phẩm...');
      const sqlCategories = parseJsonEntry(categoriesEntry) || [];
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
            isActive: cat.isActive !== undefined ? cat.isActive : (cat.IsActive !== false)
          });
          await newCat.save();
          if (cat._id || cat.ID) {
            catMap[cat._id || cat.ID] = newCat._id;
          }
        } catch (err: any) {
          logs.push(`Lỗi Danh mục Sản phẩm [${cat.name || cat.Name}]: ${err.message}`);
        }
      }
      importCounts['Categories'] = sqlCategories.length;
      logs.push(`Đã nhập ${sqlCategories.length} danh mục sản phẩm.`);
    }

    const productsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('products.json'));
    if (productsEntry) {
      logs.push('Đang xử lý Sản phẩm...');
      const sqlProducts = parseJsonEntry(productsEntry) || [];
      await Product.deleteMany({});
      
      for (const prod of sqlProducts) {
        try {
          const catId = prod.categoryId || catMap[prod.CateID];
          let imageList = prod.images || [];
          if (imageList.length === 0) {
            if (prod.Image) imageList.push(prod.Image);
            if (prod.Image2) imageList.push(prod.Image2);
            if (prod.Image3) imageList.push(prod.Image3);
          }

          const newProd = new Product({
            name: prod.name || prod.Name,
            category: prod.category || 'Default',
            categoryId: catId,
            code: prod.code || prod.Code,
            description: prod.description || prod.Content || prod.Description || '',
            shortDescription: prod.shortDescription || prod.ShortDescription,
            price: prod.price?.toString() || prod.Price?.toString(),
            contactPrice: prod.contactPrice !== undefined ? prod.contactPrice : (prod.Price === 0 || !prod.Price),
            image: prod.image || prod.Image || '',
            images: imageList,
            power: prod.power,
            efficiency: prod.efficiency,
            brand: prod.brand,
            stock: prod.stock || prod.Quantity || 0,
            stockStatus: prod.stockStatus || 'in_stock',
            isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : (prod.IsHot || false),
            isActive: prod.isActive !== undefined ? prod.isActive : true,
            views: prod.views || 0
          });
          await newProd.save();
        } catch (err: any) {
          logs.push(`Lỗi Sản phẩm [${prod.name || prod.Name}]: ${err.message}`);
        }
      }
      importCounts['Products'] = sqlProducts.length;
      logs.push(`Đã nhập ${sqlProducts.length} sản phẩm.`);
    }

    // 2. Process Project Categories & Projects
    const projectCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('projectcategories.json'));
    if (projectCategoriesEntry) {
      logs.push('Đang xử lý Danh mục Dự án...');
      const items = parseJsonEntry(projectCategoriesEntry) || [];
      await ProjectCategory.deleteMany({});
      for (const item of items) {
        await new ProjectCategory(item).save();
      }
      importCounts['ProjectCategories'] = items.length;
    }

    const projectsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('projects.json'));
    if (projectsEntry) {
      logs.push('Đang xử lý Dự án...');
      const items = parseJsonEntry(projectsEntry) || [];
      await Project.deleteMany({});
      for (const item of items) {
        await new Project(item).save();
      }
      importCounts['Projects'] = items.length;
      logs.push(`Đã nhập ${items.length} dự án.`);
    }

    // 3. Process News Categories & News (Blogs)
    const newsCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('newscategories.json'));
    if (newsCategoriesEntry) {
      logs.push('Đang xử lý Danh mục Tin tức...');
      const items = parseJsonEntry(newsCategoriesEntry) || [];
      await NewsCategory.deleteMany({});
      for (const item of items) {
        await new NewsCategory(item).save();
      }
      importCounts['NewsCategories'] = items.length;
    }

    const blogsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('blog.json') || e.entryName.toLowerCase().includes('news.json'));
    if (blogsEntry) {
      logs.push('Đang xử lý Bài viết/Tin tức...');
      const sqlBlogs = parseJsonEntry(blogsEntry) || [];
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
            slug: blog.slug || generateSlug(blogTitle) || Date.now().toString(),
            excerpt: blog.excerpt || blog.ShortDescription || 'No excerpt',
            content: blog.content || blog.Content || 'No content',
            image: blog.image || blog.Image || '/placeholder.jpg',
            author: blog.author || 'Admin',
            date: d.toISOString(),
            publishedAt: d,
            isActive: blog.isActive !== undefined ? blog.isActive : true
          });
          await newBlog.save();
        } catch (err: any) {
          logs.push(`Lỗi Tin tức [${blog.title || blog.Name}]: ${err.message}`);
        }
      }
      importCounts['Blogs'] = sqlBlogs.length;
      logs.push(`Đã nhập ${sqlBlogs.length} bài viết.`);
    }

    // 4. Process Document Categories & Resources
    const docCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('documentcategories.json'));
    if (docCategoriesEntry) {
      const items = parseJsonEntry(docCategoriesEntry) || [];
      await DocumentCategory.deleteMany({});
      for (const item of items) {
        await new DocumentCategory(item).save();
      }
      importCounts['DocCategories'] = items.length;
    }

    const resourcesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('resources.json'));
    if (resourcesEntry) {
      logs.push('Đang xử lý Tài liệu Kỹ thuật...');
      const items = parseJsonEntry(resourcesEntry) || [];
      await Resource.deleteMany({});
      for (const item of items) {
        await new Resource(item).save();
      }
      importCounts['Resources'] = items.length;
      logs.push(`Đã nhập ${items.length} tài liệu kỹ thuật.`);
    }

    // 5. Process Orders & OrderItems
    const ordersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('orders.json'));
    if (ordersEntry) {
      logs.push('Đang xử lý Đơn hàng...');
      const items = parseJsonEntry(ordersEntry) || [];
      await Order.deleteMany({});
      for (const item of items) {
        await new Order(item).save();
      }
      importCounts['Orders'] = items.length;
    }

    const orderItemsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('orderitems.json'));
    if (orderItemsEntry) {
      const items = parseJsonEntry(orderItemsEntry) || [];
      await OrderItem.deleteMany({});
      for (const item of items) {
        await new OrderItem(item).save();
      }
    }

    // 6. Process Contacts & Reviews
    const contactsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('contacts.json'));
    if (contactsEntry) {
      const items = parseJsonEntry(contactsEntry) || [];
      await Contact.deleteMany({});
      for (const item of items) {
        await new Contact(item).save();
      }
      importCounts['Contacts'] = items.length;
    }

    const reviewsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('reviews.json'));
    if (reviewsEntry) {
      const items = parseJsonEntry(reviewsEntry) || [];
      await Review.deleteMany({});
      for (const item of items) {
        await new Review(item).save();
      }
      importCounts['Reviews'] = items.length;
    }

    // 7. Process System Settings, Team, Testimonials, Partners
    const settingsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('settings.json'));
    if (settingsEntry) {
      const items = parseJsonEntry(settingsEntry) || [];
      if (Array.isArray(items) && items.length > 0) {
        await Settings.deleteMany({});
        await new Settings(items[0]).save();
        importCounts['Settings'] = 1;
      }
    }

    const teamEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('team.json'));
    if (teamEntry) {
      const items = parseJsonEntry(teamEntry) || [];
      await TeamMember.deleteMany({});
      for (const item of items) {
        await new TeamMember(item).save();
      }
      importCounts['Team'] = items.length;
    }

    const testimonialsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('testimonials.json'));
    if (testimonialsEntry) {
      const items = parseJsonEntry(testimonialsEntry) || [];
      await Testimonial.deleteMany({});
      for (const item of items) {
        await new Testimonial(item).save();
      }
      importCounts['Testimonials'] = items.length;
    }

    const partnersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('partners.json'));
    if (partnersEntry) {
      const items = parseJsonEntry(partnersEntry) || [];
      await Partner.deleteMany({});
      for (const item of items) {
        await new Partner(item).save();
      }
      importCounts['Partners'] = items.length;
    }

    // 8. Process Users (Safely restore without deleting active admin)
    const usersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('users.json'));
    if (usersEntry) {
      const sqlUsers = parseJsonEntry(usersEntry) || [];
      let importedUserCount = 0;
      for (const u of sqlUsers) {
        const existing = await User.findOne({ username: u.username || u.Username || u.email });
        if (!existing) {
          await new User(u).save();
          importedUserCount++;
        }
      }
      importCounts['Users'] = importedUserCount;
    }

    const detailsStr = Object.entries(importCounts).map(([key, val]) => `${key}: ${val}`).join(', ') || 'Nhiều bảng dữ liệu';

    const logEntry = new MigrationLog({
      action: 'import',
      status: 'success',
      details: `Đã nhập dữ liệu toàn bộ website (${detailsStr})`,
      user: 'Admin'
    });
    await logEntry.save();

    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Migration Upload API Error:', error);
    const logEntry = new MigrationLog({
      action: 'import',
      status: 'error',
      details: error.message || 'Migration import failed',
      user: 'Admin'
    });
    await logEntry.save();
    res.status(500).json({ success: false, error: error.message || 'Import failed' });
  }
});

/**
 * EXPORT FULL BACKUP ZIP (Packages 100% of all site database collections)
 */
router.get('/export', async (req, res) => {
  try {
    const zip = new AdmZip();

    // 1. Export Products & Product Categories
    const categories = await ProductCategory.find({}).lean();
    zip.addFile('Categories.json', Buffer.from(JSON.stringify(categories, null, 2), 'utf8'));

    const products = await Product.find({}).lean();
    zip.addFile('Products.json', Buffer.from(JSON.stringify(products, null, 2), 'utf8'));

    // 2. Export Projects & Project Categories
    const projectCategories = await ProjectCategory.find({}).lean();
    zip.addFile('ProjectCategories.json', Buffer.from(JSON.stringify(projectCategories, null, 2), 'utf8'));

    const projects = await Project.find({}).lean();
    zip.addFile('Projects.json', Buffer.from(JSON.stringify(projects, null, 2), 'utf8'));

    // 3. Export News/Blogs & News Categories
    const newsCategories = await NewsCategory.find({}).lean();
    zip.addFile('NewsCategories.json', Buffer.from(JSON.stringify(newsCategories, null, 2), 'utf8'));

    const blogs = await News.find({}).lean();
    zip.addFile('Blog.json', Buffer.from(JSON.stringify(blogs, null, 2), 'utf8'));

    // 4. Export Document Categories & Resources (Documents)
    const docCategories = await DocumentCategory.find({}).lean();
    zip.addFile('DocumentCategories.json', Buffer.from(JSON.stringify(docCategories, null, 2), 'utf8'));

    const resources = await Resource.find({}).lean();
    zip.addFile('Resources.json', Buffer.from(JSON.stringify(resources, null, 2), 'utf8'));

    // 5. Export Orders & OrderItems
    const orders = await Order.find({}).lean();
    zip.addFile('Orders.json', Buffer.from(JSON.stringify(orders, null, 2), 'utf8'));

    const orderItems = await OrderItem.find({}).lean();
    zip.addFile('OrderItems.json', Buffer.from(JSON.stringify(orderItems, null, 2), 'utf8'));

    // 6. Export Contacts & Reviews
    const contacts = await Contact.find({}).lean();
    zip.addFile('Contacts.json', Buffer.from(JSON.stringify(contacts, null, 2), 'utf8'));

    const reviews = await Review.find({}).lean();
    zip.addFile('Reviews.json', Buffer.from(JSON.stringify(reviews, null, 2), 'utf8'));

    // 7. Export System Settings, Team, Testimonials, Partners, Notifications
    const settings = await Settings.find({}).lean();
    zip.addFile('Settings.json', Buffer.from(JSON.stringify(settings, null, 2), 'utf8'));

    const team = await TeamMember.find({}).lean();
    zip.addFile('Team.json', Buffer.from(JSON.stringify(team, null, 2), 'utf8'));

    const testimonials = await Testimonial.find({}).lean();
    zip.addFile('Testimonials.json', Buffer.from(JSON.stringify(testimonials, null, 2), 'utf8'));

    const partners = await Partner.find({}).lean();
    zip.addFile('Partners.json', Buffer.from(JSON.stringify(partners, null, 2), 'utf8'));

    const notifications = await Notification.find({}).lean();
    zip.addFile('Notifications.json', Buffer.from(JSON.stringify(notifications, null, 2), 'utf8'));

    // 8. Export Users
    const users = await User.find({}).lean();
    zip.addFile('Users.json', Buffer.from(JSON.stringify(users, null, 2), 'utf8'));

    const zipBuffer = zip.toBuffer();

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=ctc_full_backup_${new Date().toISOString().split('T')[0]}.zip`);
    res.set('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);

    const logEntry = new MigrationLog({
      action: 'export',
      status: 'success',
      details: `Đã xuất file sao lưu đầy đủ toàn bộ dữ liệu website (${products.length} SP, ${projects.length} Dự án, ${blogs.length} Bài viết, ${orders.length} Đơn hàng...)`,
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
