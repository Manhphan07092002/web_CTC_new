import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { 
  ProductCategory, Product, 
  ProjectCategory, Project,
  NewsCategory, News, NewsComment, CommentLike,
  DocumentCategory, Resource,
  Order, OrderItem,
  Contact, Review,
  Settings, TeamMember, Testimonial, Partner,
  Notification, User, MigrationLog,
  AnalyticsGoal, FunnelMetrics, AnalyticsEvent,
  Translation
} from '../../models';
import { Permission, Role, UserPermission, PermissionLog } from '../../models/permissions';
import { SecurityEvent, AuditLog, IPBlacklist, SecurityStats } from '../../models/security';

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
 * Sanitizes object for insert:
 * - If keepId is true and doc._id is a valid ObjectId, preserves _id as mongoose.Types.ObjectId.
 * - Strips __v to avoid version conflicts.
 * - Cleans up relation keys if empty string to avoid CastError.
 */
function cleanDocForInsert(doc: any, keepId: boolean = true) {
  if (!doc || typeof doc !== 'object') return doc;
  const clone = { ...doc };
  delete clone.__v;

  if (!keepId) {
    delete clone._id;
    delete clone.id;
  } else if (clone._id) {
    if (mongoose.Types.ObjectId.isValid(clone._id)) {
      clone._id = new mongoose.Types.ObjectId(clone._id);
    }
    delete clone.id;
  } else {
    delete clone.id;
  }

  // Clean empty or invalid relation keys to avoid Mongoose CastError
  const relationKeys = ['categoryId', 'orderId', 'productId', 'newsId', 'userId', 'roleId', 'parentId', 'rootId', 'replyToId', 'assignedBy'];
  for (const k of relationKeys) {
    if (clone[k] === '' || clone[k] === null) {
      delete clone[k];
    } else if (clone[k] && typeof clone[k] === 'string' && mongoose.Types.ObjectId.isValid(clone[k])) {
      clone[k] = new mongoose.Types.ObjectId(clone[k]);
    }
  }

  // Handle arrays of ObjectIds
  if (Array.isArray(clone.permissions)) {
    clone.permissions = clone.permissions
      .filter((p: any) => p && (typeof p !== 'string' || mongoose.Types.ObjectId.isValid(p)))
      .map((p: any) => (typeof p === 'string' ? new mongoose.Types.ObjectId(p) : p));
  }
  if (Array.isArray(clone.additionalPermissions)) {
    clone.additionalPermissions = clone.additionalPermissions
      .filter((p: any) => p && (typeof p !== 'string' || mongoose.Types.ObjectId.isValid(p)))
      .map((p: any) => (typeof p === 'string' ? new mongoose.Types.ObjectId(p) : p));
  }
  if (Array.isArray(clone.deniedPermissions)) {
    clone.deniedPermissions = clone.deniedPermissions
      .filter((p: any) => p && (typeof p !== 'string' || mongoose.Types.ObjectId.isValid(p)))
      .map((p: any) => (typeof p === 'string' ? new mongoose.Types.ObjectId(p) : p));
  }

  return clone;
}

/**
 * IMPORT BACKUP (Upload ZIP containing 100% site JSON collections and media)
 */
router.post(['/upload', '/import'], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Chưa chọn file sao lưu ZIP' });
    }

    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries();
    const logs: string[] = [];
    const importCounts: Record<string, number> = {};

    let catMap: Record<string, any> = {};

    // 0. Extract images and media files into uploads/ directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let extractedMediaCount = 0;
    const mediaExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.mp4'];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      const entryName = entry.entryName;
      const ext = path.extname(entryName).toLowerCase();

      if (mediaExtensions.includes(ext) || entryName.toLowerCase().startsWith('uploads/') || entryName.toLowerCase().startsWith('images/')) {
        let relativePath = entryName;
        if (relativePath.toLowerCase().startsWith('uploads/')) {
          relativePath = relativePath.substring(8);
        }
        const targetPath = path.join(uploadsDir, relativePath);
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(targetPath, entry.getData());
        extractedMediaCount++;
      }
    }
    if (extractedMediaCount > 0) {
      logs.push(`Đã giải nén ${extractedMediaCount} hình ảnh & tệp tin phương tiện vào thư mục uploads/`);
      importCounts['MediaFiles'] = extractedMediaCount;
    }

    // 1. Process Permissions (Quyền hệ thống)
    const permissionsEntry = zipEntries.find(e => {
      const name = e.entryName.toLowerCase();
      return name.includes('permissions.json') && !name.includes('userpermission') && !name.includes('log');
    });
    if (permissionsEntry) {
      logs.push('Đang xử lý Quyền hạn (Permissions)...');
      const items = parseJsonEntry(permissionsEntry) || [];
      await Permission.deleteMany({});
      for (const item of items) {
        try {
          await new Permission(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Quyền hạn [${item.name}]: ${e.message}`);
        }
      }
      importCounts['Permissions'] = items.length;
      logs.push(`Đã nhập ${items.length} quyền hạn hệ thống.`);
    }

    // 2. Process Roles (Vai trò người dùng)
    const rolesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('roles.json'));
    if (rolesEntry) {
      logs.push('Đang xử lý Vai trò (Roles)...');
      const items = parseJsonEntry(rolesEntry) || [];
      await Role.deleteMany({});
      for (const item of items) {
        try {
          await new Role(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Vai trò [${item.name}]: ${e.message}`);
        }
      }
      importCounts['Roles'] = items.length;
      logs.push(`Đã nhập ${items.length} vai trò.`);
    }

    // 3. Process Users (Tài khoản người dùng)
    const usersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('users.json'));
    if (usersEntry) {
      logs.push('Đang xử lý Tài khoản người dùng (Users)...');
      const sqlUsers = parseJsonEntry(usersEntry) || [];
      let importedUserCount = 0;
      for (const u of sqlUsers) {
        try {
          const targetEmail = (u.email || u.username || u.Username || '').toLowerCase();
          if (!targetEmail) continue;

          const uClean = cleanDocForInsert(u, true);

          const existing = await User.findOne({
            $or: [
              { email: targetEmail },
              { username: targetEmail }
            ]
          });

          if (!existing) {
            await new User(uClean).save();
            importedUserCount++;
          } else {
            const updateData = { ...uClean };
            delete updateData._id;
            await User.updateOne({ _id: existing._id }, { $set: updateData });
            importedUserCount++;
          }
        } catch (err: any) {
          logs.push(`Lỗi Người dùng [${u.email || u.username}]: ${err.message}`);
        }
      }
      importCounts['Users'] = importedUserCount;
      logs.push(`Đã nhập ${importedUserCount} tài khoản người dùng.`);
    }

    // 4. Process UserPermissions & PermissionLogs
    const userPermissionsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('userpermissions.json'));
    if (userPermissionsEntry) {
      logs.push('Đang xử lý Phân quyền người dùng chi tiết (UserPermissions)...');
      const items = parseJsonEntry(userPermissionsEntry) || [];
      await UserPermission.deleteMany({});
      for (const item of items) {
        try {
          await new UserPermission(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Phân quyền cá nhân: ${e.message}`);
        }
      }
      importCounts['UserPermissions'] = items.length;
      logs.push(`Đã nhập ${items.length} cấu hình phân quyền người dùng.`);
    }

    const permissionLogsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('permissionlogs.json'));
    if (permissionLogsEntry) {
      const items = parseJsonEntry(permissionLogsEntry) || [];
      await (PermissionLog as any).deleteMany({});
      for (const item of items) {
        try {
          await new (PermissionLog as any)(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['PermissionLogs'] = items.length;
    }

    // 5. Process Product Categories & Products
    const categoriesEntry = zipEntries.find(e => {
      const name = e.entryName.toLowerCase();
      return name.includes('categories.json') && !name.includes('project') && !name.includes('news') && !name.includes('document');
    });
    if (categoriesEntry) {
      logs.push('Đang xử lý Danh mục Sản phẩm...');
      const sqlCategories = parseJsonEntry(categoriesEntry) || [];
      await ProductCategory.deleteMany({});
      
      for (const cat of sqlCategories) {
        try {
          const isNative = cat.name && (cat.slug || cat._id);
          const catDoc = isNative ? cleanDocForInsert(cat, true) : {
            name: cat.name || cat.Name,
            slug: cat.slug || (cat.SearchText ? generateSlug(cat.SearchText) : generateSlug(cat.name || cat.Name)),
            description: cat.description || cat.SEODescriptions || '',
            image: cat.image || cat.Image || '',
            order: cat.order || cat.Rank || 0,
            isActive: cat.isActive !== undefined ? cat.isActive : (cat.IsActive !== false)
          };
          const newCat = new ProductCategory(catDoc);
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
          const isNative = prod.name && (prod.price !== undefined || prod.category !== undefined);
          if (isNative) {
            const cleanData = cleanDocForInsert(prod, true);
            if (cleanData.categoryId && catMap[cleanData.categoryId]) {
              cleanData.categoryId = catMap[cleanData.categoryId];
            }
            await new Product(cleanData).save();
          } else {
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
          }
        } catch (err: any) {
          logs.push(`Lỗi Sản phẩm [${prod.name || prod.Name}]: ${err.message}`);
        }
      }
      importCounts['Products'] = sqlProducts.length;
      logs.push(`Đã nhập ${sqlProducts.length} sản phẩm.`);
    }

    // 6. Process Project Categories & Projects (Bảo toàn liên kết ID)
    const projectCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('projectcategories.json'));
    if (projectCategoriesEntry) {
      logs.push('Đang xử lý Danh mục Dự án...');
      const items = parseJsonEntry(projectCategoriesEntry) || [];
      await ProjectCategory.deleteMany({});
      for (const item of items) {
        try {
          await new ProjectCategory(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Danh mục Dự án [${item.name}]: ${e.message}`);
        }
      }
      importCounts['ProjectCategories'] = items.length;
      logs.push(`Đã nhập ${items.length} danh mục dự án.`);
    }

    const projectsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('projects.json'));
    if (projectsEntry) {
      logs.push('Đang xử lý Dự án...');
      const items = parseJsonEntry(projectsEntry) || [];
      await Project.deleteMany({});
      for (const item of items) {
        try {
          await new Project(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Dự án [${item.title}]: ${e.message}`);
        }
      }
      importCounts['Projects'] = items.length;
      logs.push(`Đã nhập ${items.length} dự án.`);
    }

    // 7. Process News Categories, News (Blogs), Comments & Likes
    const newsCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('newscategories.json'));
    if (newsCategoriesEntry) {
      logs.push('Đang xử lý Danh mục Tin tức...');
      const items = parseJsonEntry(newsCategoriesEntry) || [];
      await NewsCategory.deleteMany({});
      for (const item of items) {
        try {
          await new NewsCategory(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Danh mục Tin tức [${item.name}]: ${e.message}`);
        }
      }
      importCounts['NewsCategories'] = items.length;
      logs.push(`Đã nhập ${items.length} danh mục tin tức.`);
    }

    const blogsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('blog.json') || e.entryName.toLowerCase().includes('news.json'));
    if (blogsEntry) {
      logs.push('Đang xử lý Bài viết/Tin tức...');
      const sqlBlogs = parseJsonEntry(blogsEntry) || [];
      await News.deleteMany({});
      try {
        await News.collection.dropIndexes();
      } catch (e) {}
      
      const existingSlugs = new Set<string>();
      for (const blog of sqlBlogs) {
        try {
          const isNative = blog.title && blog.excerpt && blog.date;
          if (isNative) {
            const cleanData = cleanDocForInsert(blog, true);
            let baseSlug = (cleanData.slug && typeof cleanData.slug === 'string' && cleanData.slug.trim())
              ? cleanData.slug.trim()
              : (generateSlug(cleanData.title) || 'tin-tuc');
            let finalSlug = baseSlug;
            let counter = 1;
            while (existingSlugs.has(finalSlug)) {
              finalSlug = `${baseSlug}-${counter}`;
              counter++;
            }
            existingSlugs.add(finalSlug);
            cleanData.slug = finalSlug;
            await new News(cleanData).save();
          } else {
            let d = new Date();
            if (blog.date) {
              d = new Date(blog.date);
            } else if (blog.CreateTime) {
              d = new Date(parseInt(blog.CreateTime.replace('/Date(', '').replace(')/', '')));
            }
            if (isNaN(d.getTime())) d = new Date();
            
            const blogTitle = blog.title || blog.Name || 'Untitled';
            let baseSlug = (blog.slug && typeof blog.slug === 'string' && blog.slug.trim()) 
              ? blog.slug.trim() 
              : (generateSlug(blogTitle) || 'tin-tuc');
            let finalSlug = baseSlug;
            let counter = 1;
            while (existingSlugs.has(finalSlug)) {
              finalSlug = `${baseSlug}-${counter}`;
              counter++;
            }
            existingSlugs.add(finalSlug);

            const newBlog = new News({
              title: blogTitle,
              slug: finalSlug,
              excerpt: blog.excerpt || blog.ShortDescription || blogTitle,
              content: blog.content || blog.Content || 'No content',
              image: blog.image || blog.Image || '/uploads/images/default-news.webp',
              author: blog.author || 'Phan Xuân Mạnh',
              date: d.toISOString().split('T')[0],
              publishedAt: d,
              category: blog.category || 'Tin tức',
              tags: blog.tags || [],
              focusKeyword: blog.focusKeyword || '',
              status: blog.status || 'published',
              isActive: blog.isActive !== undefined ? blog.isActive : true
            });
            await newBlog.save();
          }
        } catch (err: any) {
          logs.push(`Lỗi Tin tức [${blog.title || blog.Name}]: ${err.message}`);
        }
      }
      importCounts['Blogs'] = sqlBlogs.length;
      logs.push(`Đã nhập ${sqlBlogs.length} bài viết.`);
    }

    const commentsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('newscomments.json') || e.entryName.toLowerCase().includes('comments.json'));
    if (commentsEntry) {
      logs.push('Đang xử lý Bình luận Tin tức...');
      const items = parseJsonEntry(commentsEntry) || [];
      await NewsComment.deleteMany({});
      for (const item of items) {
        try {
          await new NewsComment(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Bình luận: ${e.message}`);
        }
      }
      importCounts['NewsComments'] = items.length;
      logs.push(`Đã nhập ${items.length} bình luận.`);
    }

    const commentLikesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('commentlikes.json'));
    if (commentLikesEntry) {
      const items = parseJsonEntry(commentLikesEntry) || [];
      await CommentLike.deleteMany({});
      for (const item of items) {
        try {
          await new CommentLike(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['CommentLikes'] = items.length;
    }

    // 8. Process Document Categories & Resources (Bảo toàn liên kết ID)
    const docCategoriesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('documentcategories.json'));
    if (docCategoriesEntry) {
      logs.push('Đang xử lý Danh mục Tài liệu...');
      const items = parseJsonEntry(docCategoriesEntry) || [];
      await DocumentCategory.deleteMany({});
      for (const item of items) {
        try {
          await new DocumentCategory(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Danh mục Tài liệu [${item.name}]: ${e.message}`);
        }
      }
      importCounts['DocCategories'] = items.length;
      logs.push(`Đã nhập ${items.length} danh mục tài liệu.`);
    }

    const resourcesEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('resources.json'));
    if (resourcesEntry) {
      logs.push('Đang xử lý Tài liệu Kỹ thuật...');
      const items = parseJsonEntry(resourcesEntry) || [];
      await Resource.deleteMany({});
      for (const item of items) {
        try {
          await new Resource(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Tài liệu [${item.title}]: ${e.message}`);
        }
      }
      importCounts['Resources'] = items.length;
      logs.push(`Đã nhập ${items.length} tài liệu kỹ thuật.`);
    }

    // 9. Process Orders & OrderItems (Bảo toàn liên kết ID)
    const ordersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('orders.json'));
    if (ordersEntry) {
      logs.push('Đang xử lý Đơn hàng...');
      const items = parseJsonEntry(ordersEntry) || [];
      await Order.deleteMany({});
      for (const item of items) {
        try {
          await new Order(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Đơn hàng [${item.orderCode}]: ${e.message}`);
        }
      }
      importCounts['Orders'] = items.length;
      logs.push(`Đã nhập ${items.length} đơn hàng.`);
    }

    const orderItemsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('orderitems.json'));
    if (orderItemsEntry) {
      logs.push('Đang xử lý Chi tiết Đơn hàng...');
      const items = parseJsonEntry(orderItemsEntry) || [];
      await OrderItem.deleteMany({});
      for (const item of items) {
        try {
          await new OrderItem(cleanDocForInsert(item, true)).save();
        } catch (e: any) {
          logs.push(`Lỗi Chi tiết Đơn hàng: ${e.message}`);
        }
      }
      importCounts['OrderItems'] = items.length;
      logs.push(`Đã nhập ${items.length} chi tiết đơn hàng.`);
    }

    // 10. Process Contacts & Reviews
    const contactsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('contacts.json'));
    if (contactsEntry) {
      logs.push('Đang xử lý Yêu cầu Liên hệ...');
      const items = parseJsonEntry(contactsEntry) || [];
      await Contact.deleteMany({});
      for (const item of items) {
        try {
          await new Contact(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Contacts'] = items.length;
      logs.push(`Đã nhập ${items.length} yêu cầu liên hệ.`);
    }

    const reviewsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('reviews.json'));
    if (reviewsEntry) {
      logs.push('Đang xử lý Đánh giá khách hàng...');
      const items = parseJsonEntry(reviewsEntry) || [];
      await Review.deleteMany({});
      for (const item of items) {
        try {
          await new Review(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Reviews'] = items.length;
      logs.push(`Đã nhập ${items.length} đánh giá.`);
    }

    // 11. Process System Settings, Team, Testimonials, Partners, Notifications
    const settingsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('settings.json'));
    if (settingsEntry) {
      const items = parseJsonEntry(settingsEntry) || [];
      if (Array.isArray(items) && items.length > 0) {
        await Settings.deleteMany({});
        await new Settings(cleanDocForInsert(items[0], true)).save();
        importCounts['Settings'] = 1;
        logs.push('Đã cập nhật Cài đặt hệ thống (Settings).');
      }
    }

    const teamEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('team.json'));
    if (teamEntry) {
      logs.push('Đang xử lý Đội ngũ nhân sự...');
      const items = parseJsonEntry(teamEntry) || [];
      await TeamMember.deleteMany({});
      for (const item of items) {
        try {
          await new TeamMember(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Team'] = items.length;
      logs.push(`Đã nhập ${items.length} thành viên đội ngũ.`);
    }

    const testimonialsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('testimonials.json'));
    if (testimonialsEntry) {
      logs.push('Đang xử lý Ý kiến khách hàng (Testimonials)...');
      const items = parseJsonEntry(testimonialsEntry) || [];
      await Testimonial.deleteMany({});
      for (const item of items) {
        try {
          await new Testimonial(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Testimonials'] = items.length;
      logs.push(`Đã nhập ${items.length} ý kiến khách hàng.`);
    }

    const partnersEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('partners.json'));
    if (partnersEntry) {
      logs.push('Đang xử lý Đối tác (Partners)...');
      const items = parseJsonEntry(partnersEntry) || [];
      await Partner.deleteMany({});
      for (const item of items) {
        try {
          await new Partner(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Partners'] = items.length;
      logs.push(`Đã nhập ${items.length} đối tác.`);
    }

    const notificationsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('notifications.json'));
    if (notificationsEntry) {
      const items = parseJsonEntry(notificationsEntry) || [];
      await Notification.deleteMany({});
      for (const item of items) {
        try {
          await new Notification(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Notifications'] = items.length;
    }

    // 12. Process Translations (Từ điển đa ngôn ngữ i18n)
    const translationsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('translations.json'));
    if (translationsEntry) {
      logs.push('Đang xử lý Từ điển Đa ngôn ngữ (Translations)...');
      const items = parseJsonEntry(translationsEntry) || [];
      await Translation.deleteMany({});
      for (const item of items) {
        try {
          await new Translation(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['Translations'] = items.length;
      logs.push(`Đã nhập ${items.length} từ điển đa ngôn ngữ.`);
    }

    // 13. Process Analytics Goals, Funnel Metrics & Analytics Events
    const goalsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('goals.json') || e.entryName.toLowerCase().includes('analyticsgoals.json'));
    if (goalsEntry) {
      logs.push('Đang xử lý Mục tiêu (Analytics Goals)...');
      const items = parseJsonEntry(goalsEntry) || [];
      await AnalyticsGoal.deleteMany({});
      for (const item of items) {
        try {
          await new AnalyticsGoal(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['AnalyticsGoals'] = items.length;
      logs.push(`Đã nhập ${items.length} mục tiêu kinh doanh.`);
    }

    const funnelEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('funnelmetrics.json'));
    if (funnelEntry) {
      const items = parseJsonEntry(funnelEntry) || [];
      await FunnelMetrics.deleteMany({});
      for (const item of items) {
        try {
          await new FunnelMetrics(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['FunnelMetrics'] = items.length;
    }

    const analyticsEventsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('analyticsevents.json'));
    if (analyticsEventsEntry) {
      logs.push('Đang xử lý Sự kiện Phân tích (Analytics Events)...');
      const items = parseJsonEntry(analyticsEventsEntry) || [];
      await AnalyticsEvent.deleteMany({});
      for (const item of items) {
        try {
          await new AnalyticsEvent(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['AnalyticsEvents'] = items.length;
      logs.push(`Đã nhập ${items.length} sự kiện phân tích.`);
    }

    // 14. Process Security & Audit Logs
    const auditLogsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('auditlogs.json'));
    if (auditLogsEntry) {
      const items = parseJsonEntry(auditLogsEntry) || [];
      await (AuditLog as any).deleteMany({});
      for (const item of items) {
        try {
          await new (AuditLog as any)(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['AuditLogs'] = items.length;
    }

    const securityEventsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('securityevents.json'));
    if (securityEventsEntry) {
      const items = parseJsonEntry(securityEventsEntry) || [];
      await (SecurityEvent as any).deleteMany({});
      for (const item of items) {
        try {
          await new (SecurityEvent as any)(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['SecurityEvents'] = items.length;
    }

    const ipBlacklistsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('ipblacklists.json'));
    if (ipBlacklistsEntry) {
      const items = parseJsonEntry(ipBlacklistsEntry) || [];
      await (IPBlacklist as any).deleteMany({});
      for (const item of items) {
        try {
          await new (IPBlacklist as any)(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['IPBlacklists'] = items.length;
    }

    const securityStatsEntry = zipEntries.find(e => e.entryName.toLowerCase().includes('securitystats.json'));
    if (securityStatsEntry) {
      const items = parseJsonEntry(securityStatsEntry) || [];
      await (SecurityStats as any).deleteMany({});
      for (const item of items) {
        try {
          await new (SecurityStats as any)(cleanDocForInsert(item, true)).save();
        } catch (e: any) {}
      }
      importCounts['SecurityStats'] = items.length;
    }

    const detailsStr = Object.entries(importCounts).map(([key, val]) => `${key}: ${val}`).join(', ') || 'Nhiều bảng dữ liệu';

    const logEntry = new MigrationLog({
      action: 'import',
      status: 'success',
      details: `Đã nhập đầy đủ 100% dữ liệu website (${detailsStr})`,
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
 * EXPORT FULL BACKUP ZIP (Packages 100% of all site database collections & uploads)
 */
router.all('/export', async (req, res) => {
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

    // 3. Export News/Blogs, News Categories & Comments & Likes
    const newsCategories = await NewsCategory.find({}).lean();
    zip.addFile('NewsCategories.json', Buffer.from(JSON.stringify(newsCategories, null, 2), 'utf8'));

    const blogs = await News.find({}).lean();
    zip.addFile('Blog.json', Buffer.from(JSON.stringify(blogs, null, 2), 'utf8'));

    const newsComments = await NewsComment.find({}).lean();
    zip.addFile('NewsComments.json', Buffer.from(JSON.stringify(newsComments, null, 2), 'utf8'));

    const commentLikes = await CommentLike.find({}).lean();
    zip.addFile('CommentLikes.json', Buffer.from(JSON.stringify(commentLikes, null, 2), 'utf8'));

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

    // 8. Export Users, Roles & Permissions (RBAC)
    const users = await User.find({}).lean();
    zip.addFile('Users.json', Buffer.from(JSON.stringify(users, null, 2), 'utf8'));

    const permissions = await Permission.find({}).lean();
    zip.addFile('Permissions.json', Buffer.from(JSON.stringify(permissions, null, 2), 'utf8'));

    const roles = await Role.find({}).lean();
    zip.addFile('Roles.json', Buffer.from(JSON.stringify(roles, null, 2), 'utf8'));

    const userPermissions = await UserPermission.find({}).lean();
    zip.addFile('UserPermissions.json', Buffer.from(JSON.stringify(userPermissions, null, 2), 'utf8'));

    const permissionLogs = await (PermissionLog as any).find({}).lean();
    zip.addFile('PermissionLogs.json', Buffer.from(JSON.stringify(permissionLogs, null, 2), 'utf8'));

    // 9. Export Translations (Từ điển đa ngôn ngữ i18n)
    const translations = await Translation.find({}).lean();
    zip.addFile('Translations.json', Buffer.from(JSON.stringify(translations, null, 2), 'utf8'));

    // 10. Export Analytics Goals, Funnel Metrics & Analytics Events
    const goals = await AnalyticsGoal.find({}).lean();
    zip.addFile('AnalyticsGoals.json', Buffer.from(JSON.stringify(goals, null, 2), 'utf8'));

    const funnelMetrics = await FunnelMetrics.find({}).lean();
    zip.addFile('FunnelMetrics.json', Buffer.from(JSON.stringify(funnelMetrics, null, 2), 'utf8'));

    const analyticsEvents = await AnalyticsEvent.find({}).lean();
    zip.addFile('AnalyticsEvents.json', Buffer.from(JSON.stringify(analyticsEvents, null, 2), 'utf8'));

    // 11. Export Security & Audit Logs
    const auditLogs = await (AuditLog as any).find({}).lean();
    zip.addFile('AuditLogs.json', Buffer.from(JSON.stringify(auditLogs, null, 2), 'utf8'));

    const securityEvents = await (SecurityEvent as any).find({}).lean();
    zip.addFile('SecurityEvents.json', Buffer.from(JSON.stringify(securityEvents, null, 2), 'utf8'));

    const ipBlacklists = await (IPBlacklist as any).find({}).lean();
    zip.addFile('IPBlacklists.json', Buffer.from(JSON.stringify(ipBlacklists, null, 2), 'utf8'));

    const securityStats = await (SecurityStats as any).find({}).lean();
    zip.addFile('SecurityStats.json', Buffer.from(JSON.stringify(securityStats, null, 2), 'utf8'));

    // 12. Export uploaded media files
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const addFilesRecursively = (dir: string, zipPath: string) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          const zipSubPath = path.join(zipPath, file.name);
          if (file.isDirectory()) {
            addFilesRecursively(fullPath, zipSubPath);
          } else if (file.isFile()) {
            zip.addFile(zipSubPath, fs.readFileSync(fullPath));
          }
        }
      };
      addFilesRecursively(uploadsDir, 'uploads');
    }

    const zipBuffer = zip.toBuffer();

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=ctc_full_backup_${new Date().toISOString().split('T')[0]}.zip`);
    res.set('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);

    const logEntry = new MigrationLog({
      action: 'export',
      status: 'success',
      details: `Đã xuất file sao lưu đầy đủ 100% dữ liệu website (${products.length} SP, ${projects.length} Dự án, ${blogs.length} Bài viết, ${orders.length} Đơn hàng, ${roles.length} Vai trò, ${permissions.length} Quyền, ${users.length} Tài khoản...)`,
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
