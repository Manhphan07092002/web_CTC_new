import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Permission, Role, UserPermission } from '../models/permissions';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Helper to generate unique slug from Vietnamese text
function generateSlug(str: string, existingSlugs: Set<string>): string {
  if (!str) str = 'danh-muc';
  let baseSlug = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (!baseSlug) baseSlug = 'item';

  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

// Generate deterministic 24-char Mongo ObjectId hex string from an integer prefix & ID
function makeObjectId(prefix: number, id: number | string): string {
  const prefixHex = prefix.toString(16).padStart(4, '0');
  const cleanId = String(id).replace(/[^a-fA-F0-9]/g, '');
  const idHex = cleanId.padStart(20, '0').slice(-20);
  return `${prefixHex}${idHex}`;
}

// Parse T-SQL VALUES clause preserving string quotes for nested regex
function parseSqlValues(valsStr: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < valsStr.length; i++) {
    const char = valsStr[i];
    if (char === "'") {
      if (inString && valsStr[i + 1] === "'") {
        current += "'";
        i++;
      } else {
        if (!inString && (current.endsWith('N') || current.endsWith('n'))) {
          current = current.slice(0, -1);
        }
        inString = !inString;
        current += "'";
      }
    } else if (char === ',' && !inString) {
      values.push(cleanValue(current.trim()));
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    values.push(cleanValue(current.trim()));
  }
  return values;
}

function cleanValue(valStr: string): any {
  valStr = valStr.trim();
  if (valStr.toUpperCase() === 'NULL') return null;

  // Handle CAST(...) for dates or numbers
  if (valStr.toUpperCase().startsWith('CAST(')) {
    const dateMatch = valStr.match(/'([^']+)'/);
    if (dateMatch) {
      const rawDate = dateMatch[1];
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      return rawDate.split(' ')[0];
    }
    const numMatch = valStr.match(/CAST\(([0-9.]+)\s+AS/i);
    if (numMatch) return parseFloat(numMatch[1]);
  }

  if (valStr.startsWith("'") && valStr.endsWith("'")) {
    let inner = valStr.substring(1, valStr.length - 1);
    return inner.replace(/''/g, "'");
  }

  if (!isNaN(Number(valStr)) && valStr !== '') {
    return Number(valStr);
  }

  return valStr;
}

function parseSqlInserts(content: string, tableName: string): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  const insertPrefix = `INSERT [dbo].[${tableName}] (`;
  let idx = 0;

  while ((idx = content.indexOf(insertPrefix, idx)) !== -1) {
    const colsEnd = content.indexOf(') VALUES (', idx);
    if (colsEnd === -1) break;
    const colsStr = content.substring(idx + insertPrefix.length, colsEnd);
    const cols = colsStr.split(',').map(c => c.trim().replace(/^\[|\]$/g, ''));

    const valsStart = colsEnd + ') VALUES ('.length;
    let inString = false;
    let i = valsStart;
    for (; i < content.length; i++) {
      const char = content[i];
      if (char === "'") {
        if (inString && content[i + 1] === "'") {
          i++;
        } else {
          inString = !inString;
        }
      } else if (char === ')' && !inString) {
        break;
      }
    }
    const valsStr = content.substring(valsStart, i);
    const rawValues = parseSqlValues(valsStr);

    const record: Record<string, any> = {};
    cols.forEach((col, index) => {
      record[col] = rawValues[index] !== undefined ? rawValues[index] : null;
    });
    records.push(record);

    idx = i;
  }
  return records;
}

// Clean HTML / decode basic entities
function cleanHtmlText(html: string): string {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&generic;/g, '')
    .replace(/&oacute;/g, 'ó')
    .replace(/&aacute;/g, 'á')
    .replace(/&agrave;/g, 'à')
    .replace(/&atilde;/g, 'ã')
    .replace(/&acirc;/g, 'â')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&iacute;/g, 'í')
    .replace(/&igrave;/g, 'ì')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&otilde;/g, 'õ');
}

// Strip HTML tags for excerpts
function stripHtml(html: string): string {
  if (!html) return '';
  return cleanHtmlText(html).replace(/<[^>]*>?/gm, '').trim();
}

// Format date to YYYY-MM-DD
function formatDate(val: any): string {
  if (!val) return '2024-10-15';
  const str = String(val).trim();
  if (str.startsWith('CAST(')) {
    const match = str.match(/'([^']+)'/);
    if (match) return match[1].split(' ')[0];
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return str.split(' ')[0] || '2024-10-15';
}

async function seedRBAC() {
  console.log('\n👑 Đang tạo và gán hệ thống phân quyền (RBAC - Super Admin)...');

  const PermissionModel = Permission as mongoose.Model<any>;
  const RoleModel = Role as mongoose.Model<any>;
  const UserPermissionModel = UserPermission as mongoose.Model<any>;

  await PermissionModel.deleteMany({});
  await RoleModel.deleteMany({});
  await UserPermissionModel.deleteMany({});

  const permissions = [
    // Content Management
    { name: 'view_content', resource: 'content', action: 'view', description: 'Xem nội dung', category: 'content', isActive: true },
    { name: 'create_content', resource: 'content', action: 'create', description: 'Tạo nội dung', category: 'content', isActive: true },
    { name: 'edit_content', resource: 'content', action: 'edit', description: 'Chỉnh sửa nội dung', category: 'content', isActive: true },
    { name: 'delete_content', resource: 'content', action: 'delete', description: 'Xóa nội dung', category: 'content', isActive: true },
    { name: 'publish_content', resource: 'content', action: 'publish', description: 'Xuất bản nội dung', category: 'content', isActive: true },
    // Product Management
    { name: 'view_products', resource: 'products', action: 'view', description: 'Xem sản phẩm', category: 'content', isActive: true },
    { name: 'create_products', resource: 'products', action: 'create', description: 'Tạo sản phẩm', category: 'content', isActive: true },
    { name: 'edit_products', resource: 'products', action: 'edit', description: 'Chỉnh sửa sản phẩm', category: 'content', isActive: true },
    { name: 'delete_products', resource: 'products', action: 'delete', description: 'Xóa sản phẩm', category: 'content', isActive: true },
    { name: 'manage_product_categories', resource: 'product_categories', action: 'manage', description: 'Quản lý danh mục sản phẩm', category: 'content', isActive: true },
    // News Management
    { name: 'view_news', resource: 'news', action: 'view', description: 'Xem tin tức', category: 'content', isActive: true },
    { name: 'create_news', resource: 'news', action: 'create', description: 'Tạo tin tức', category: 'content', isActive: true },
    { name: 'edit_news', resource: 'news', action: 'edit', description: 'Chỉnh sửa tin tức', category: 'content', isActive: true },
    { name: 'delete_news', resource: 'news', action: 'delete', description: 'Xóa tin tức', category: 'content', isActive: true },
    { name: 'manage_news_categories', resource: 'news_categories', action: 'manage', description: 'Quản lý danh mục tin tức', category: 'content', isActive: true },
    // Project Management
    { name: 'view_projects', resource: 'projects', action: 'view', description: 'Xem dự án', category: 'content', isActive: true },
    { name: 'create_projects', resource: 'projects', action: 'create', description: 'Tạo dự án', category: 'content', isActive: true },
    { name: 'edit_projects', resource: 'projects', action: 'edit', description: 'Chỉnh sửa dự án', category: 'content', isActive: true },
    { name: 'delete_projects', resource: 'projects', action: 'delete', description: 'Xóa dự án', category: 'content', isActive: true },
    { name: 'manage_project_categories', resource: 'project_categories', action: 'manage', description: 'Quản lý danh mục dự án', category: 'content', isActive: true },
    // User Management
    { name: 'view_users', resource: 'users', action: 'view', description: 'Xem người dùng', category: 'user', isActive: true },
    { name: 'create_users', resource: 'users', action: 'create', description: 'Tạo người dùng', category: 'user', isActive: true },
    { name: 'edit_users', resource: 'users', action: 'edit', description: 'Chỉnh sửa người dùng', category: 'user', isActive: true },
    { name: 'delete_users', resource: 'users', action: 'delete', description: 'Xóa người dùng', category: 'user', isActive: true },
    { name: 'manage_user_permissions', resource: 'user_permissions', action: 'manage', description: 'Quản lý phân quyền người dùng', category: 'user', isActive: true },
    // Role & Permission Management
    { name: 'view_roles', resource: 'roles', action: 'view', description: 'Xem vai trò', category: 'user', isActive: true },
    { name: 'manage_roles', resource: 'roles', action: 'manage', description: 'Quản lý vai trò', category: 'user', isActive: true },
    { name: 'view_permissions', resource: 'permissions', action: 'view', description: 'Xem quyền', category: 'user', isActive: true },
    { name: 'manage_permissions', resource: 'permissions', action: 'manage', description: 'Quản lý quyền', category: 'user', isActive: true },
    { name: 'view_user_permissions', resource: 'user_permissions', action: 'view', description: 'Xem phân quyền người dùng', category: 'user', isActive: true },
    { name: 'view_permission_logs', resource: 'permission_logs', action: 'view', description: 'Xem nhật ký phân quyền', category: 'user', isActive: true },
    // System Management
    { name: 'view_system_settings', resource: 'system_settings', action: 'view', description: 'Xem cài đặt hệ thống', category: 'system', isActive: true },
    { name: 'manage_system_settings', resource: 'system_settings', action: 'manage', description: 'Quản lý cài đặt hệ thống', category: 'system', isActive: true },
    { name: 'view_system_logs', resource: 'system_logs', action: 'view', description: 'Xem nhật ký hệ thống', category: 'system', isActive: true },
    { name: 'manage_file_uploads', resource: 'file_uploads', action: 'manage', description: 'Quản lý tải lên tệp', category: 'system', isActive: true },
    { name: 'view_database_backup', resource: 'database_backup', action: 'view', description: 'Xem sao lưu cơ sở dữ liệu', category: 'system', isActive: true },
    { name: 'manage_database_backup', resource: 'database_backup', action: 'manage', description: 'Quản lý sao lưu cơ sở dữ liệu', category: 'system', isActive: true },
    // Security Management
    { name: 'view_security_logs', resource: 'security_logs', action: 'view', description: 'Xem nhật ký bảo mật', category: 'security', isActive: true },
    { name: 'manage_security_settings', resource: 'security_settings', action: 'manage', description: 'Quản lý cài đặt bảo mật', category: 'security', isActive: true },
    { name: 'view_audit_logs', resource: 'audit_logs', action: 'view', description: 'Xem nhật ký kiểm toán', category: 'security', isActive: true },
    { name: 'manage_ip_blacklist', resource: 'ip_blacklist', action: 'manage', description: 'Quản lý danh sách IP chặn', category: 'security', isActive: true },
    // Analytics
    { name: 'view_analytics', resource: 'analytics', action: 'view', description: 'Xem thống kê', category: 'analytics', isActive: true },
    { name: 'view_reports', resource: 'reports', action: 'view', description: 'Xem báo cáo', category: 'analytics', isActive: true },
    { name: 'export_data', resource: 'data_export', action: 'export', description: 'Xuất dữ liệu', category: 'analytics', isActive: true },
  ];

  const createdPermissions = await PermissionModel.insertMany(permissions);
  const permIds = createdPermissions.map(p => p._id);

  const superAdminRole = new RoleModel({
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Quyền cao nhất, có thể làm tất cả',
    level: 100,
    isSystem: true,
    isActive: true,
    color: '#DC2626',
    icon: 'Crown',
    permissions: permIds
  });
  await superAdminRole.save();

  const db = mongoose.connection.db;
  if (db) {
    const users = await db.collection('users').find({}).toArray();
    for (const u of users) {
      const up = new UserPermissionModel({
        userId: u._id,
        roleId: superAdminRole._id,
        assignedBy: u._id,
        notes: 'Tự động phân quyền Super Admin Level 100'
      });
      await up.save();
      console.log(`   👑 [RBAC] Gán vai trò Super Admin (Level 100 - 48 quyền) cho: ${u.email}`);
    }
  }
}

async function migrateData() {
  console.log('🚀 === BẮT ĐẦU IMPORT DỮ LIỆU TỪ SQL SERVER (script.sql) SANG MONGODB ===\n');

  const sqlFilePath = path.join(process.cwd(), 'sql', 'script.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ Không tìm thấy file SQL tại: ${sqlFilePath}`);
    process.exit(1);
  }

  console.log('📄 Đang đọc file sql/script.sql (UTF-16LE)...');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf16le');

  // Parse raw tables from SQL
  const rawCategories = parseSqlInserts(sqlContent, 'Categories');
  const rawProducts = parseSqlInserts(sqlContent, 'Products');
  const rawProductSpecs = parseSqlInserts(sqlContent, 'ProductStandardDetail');
  const rawProjectCategories = parseSqlInserts(sqlContent, 'ProjectCategories');
  const rawProjects = parseSqlInserts(sqlContent, 'Projects');
  const rawProjectImages = parseSqlInserts(sqlContent, 'ProjectImages');
  const rawBlogCategories = parseSqlInserts(sqlContent, 'BlogCategory');
  const rawBlogs = parseSqlInserts(sqlContent, 'Blog');
  const rawNews = parseSqlInserts(sqlContent, 'News');
  const rawServices = parseSqlInserts(sqlContent, 'Services');
  const rawCustomers = parseSqlInserts(sqlContent, 'OurCustomer');
  const rawContacts = parseSqlInserts(sqlContent, 'Contacts');
  const rawUsers = parseSqlInserts(sqlContent, 'Users');

  console.log(`📊 Đã đọc từ SQL:
  - Categories: ${rawCategories.length}
  - Products: ${rawProducts.length}
  - ProjectCategories: ${rawProjectCategories.length}
  - Projects: ${rawProjects.length}
  - ProjectImages: ${rawProjectImages.length}
  - BlogCategories: ${rawBlogCategories.length}
  - Blogs (Bài viết tin tức): ${rawBlogs.length}
  - News (Tin sự kiện): ${rawNews.length}
  - Services: ${rawServices.length}
  - OurCustomer: ${rawCustomers.length}
  - Contacts: ${rawContacts.length}
  - Users: ${rawUsers.length}
  `);

  // ==================== 1. PRODUCT CATEGORIES ====================
  const prodCatSlugs = new Set<string>();
  const productCategoryMap = new Map<number, string>();
  const productCategoriesData = rawCategories.map((c, index) => {
    const mongoId = makeObjectId(1001, c.ID || (index + 1));
    productCategoryMap.set(c.ID, mongoId);

    const name = c.Name || `Danh mục ${c.ID}`;
    const slug = generateSlug(c.Url || name, prodCatSlugs);

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: name,
      slug: slug,
      description: c.Description || '',
      image: c.Image || '',
      order: Number(c.Rank) || 0,
      isActive: c.IsActive !== 0,
      productCount: 0
    };
  });

  // ==================== 2. PRODUCTS ====================
  const specMap = new Map<string, Record<string, string>>();
  rawProductSpecs.forEach(s => {
    if (!s.ProductID) return;
    if (!specMap.has(String(s.ProductID))) {
      specMap.set(String(s.ProductID), {});
    }
    const specs = specMap.get(String(s.ProductID))!;
    specs[`Thông số ${s.StandardID || ''}`] = String(s.Val || '');
  });

  const productsData = rawProducts.map((p, index) => {
    const mongoId = makeObjectId(1002, index + 1);
    const catMongoId = p.CategoryID ? productCategoryMap.get(p.CategoryID) : undefined;
    const catObj = productCategoriesData.find(c => String(c._id) === String(catMongoId));

    const rawImgs = [p.Image, p.Image1, p.Image2, p.Image3, p.Image4, p.Image5, p.Image6]
      .filter(img => img && typeof img === 'string' && img.trim() !== '');
    const mainImg = rawImgs[0] || '/uploads/images/default-product.png';

    let priceStr = 'Liên hệ';
    if (p.PriceSale && Number(p.PriceSale) > 0) {
      priceStr = `${Number(p.PriceSale).toLocaleString('vi-VN')} đ`;
    } else if (p.Price && Number(p.Price) > 0) {
      priceStr = `${Number(p.Price).toLocaleString('vi-VN')} đ`;
    }

    const desc = cleanHtmlText(p.DetailInfo || p.BasicInfo || p.Name || '');
    const shortDesc = cleanHtmlText(p.BasicInfo || stripHtml(p.DetailInfo || '').slice(0, 150));

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: p.Name || `Sản phẩm ${p.ID}`,
      code: p.ID || p.IDAndSize || `SP-${index + 1}`,
      category: catObj ? catObj.name : 'Sản phẩm',
      categoryId: catMongoId ? new mongoose.Types.ObjectId(catMongoId) : undefined,
      description: desc,
      shortDescription: shortDesc,
      price: priceStr,
      contactPrice: priceStr === 'Liên hệ',
      image: mainImg,
      images: rawImgs.length > 0 ? rawImgs : [mainImg],
      stockStatus: (p.IsActive === 0 || p.IsDelete === 1) ? 'out_of_stock' : 'in_stock',
      isActive: p.IsActive !== 0 && p.IsDelete !== 1,
      isDeleted: p.IsDelete === 1,
      views: 0,
      likes: 0,
      shares: 0,
      technicalSpecs: specMap.get(String(p.ID)) || {}
    };
  });

  productCategoriesData.forEach(cat => {
    cat.productCount = productsData.filter(p => String(p.categoryId) === String(cat._id)).length;
  });

  // ==================== 3. PROJECT CATEGORIES ====================
  const projCatSlugs = new Set<string>();
  const projectCategoryMap = new Map<number, string>();
  const projectCategoriesData = rawProjectCategories.map((c, index) => {
    const mongoId = makeObjectId(2001, c.CategoryID || (index + 1));
    projectCategoryMap.set(c.CategoryID, mongoId);

    const name = c.CategoryName || `Danh mục dự án ${c.CategoryID}`;
    const slug = generateSlug(c.CategoryCode || name, projCatSlugs);

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: name,
      slug: slug,
      description: c.Description || '',
      order: Number(c.DisplayOrder) || 0,
      isActive: c.IsActive !== 0,
      projectCount: 0
    };
  });

  // ==================== 4. PROJECTS ====================
  const projectsData = rawProjects.map((p, index) => {
    const mongoId = makeObjectId(2002, p.ProjectID || (index + 1));
    const catMongoId = p.CategoryID ? projectCategoryMap.get(p.CategoryID) : undefined;
    const catObj = projectCategoriesData.find(c => String(c._id) === String(catMongoId));

    const capacityStr = p.Contractor || (p.ProjectValue ? `${(Number(p.ProjectValue) / 1e9).toFixed(1)} Tỷ VNĐ` : 'Tiêu chuẩn');
    const dateStr = formatDate(p.CompletionDate || p.StartDate || '2024-10-15');

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      title: p.Title || `Dự án ${p.ProjectID}`,
      location: p.Location || 'Việt Nam',
      capacity: capacityStr,
      completionDate: dateStr,
      image: p.ImageUrl || '/uploads/images/default-project.png',
      description: cleanHtmlText(p.Description || p.Title || ''),
      category: catObj ? catObj.name : (p.Category || 'Dự án EPC'),
      categoryId: catMongoId ? new mongoose.Types.ObjectId(catMongoId) : undefined
    };
  });

  projectCategoriesData.forEach(cat => {
    cat.projectCount = projectsData.filter(p => String(p.categoryId) === String(cat._id)).length;
  });

  // ==================== 5. NEWS CATEGORIES & NEWS ====================
  const newsCatSlugs = new Set<string>();
  const newsCategoryMap = new Map<number, string>();
  const newsCategoriesData = rawBlogCategories.map((c, index) => {
    const mongoId = makeObjectId(3001, c.ID || (index + 1));
    newsCategoryMap.set(c.ID, mongoId);

    const name = c.BlogCategoryName || `Tin tức ${c.ID}`;
    const slug = generateSlug(c.BlogURL || name, newsCatSlugs);

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: name,
      slug: slug,
      description: c.SEODescriptions || '',
      order: Number(c.Rank) || 0,
      isActive: c.IsActive !== 0,
      newsCount: 0
    };
  });

  const newsData: any[] = [];

  rawBlogs.forEach((b, index) => {
    const mongoId = makeObjectId(3002, b.ID || (index + 1));
    const catMongoId = b.BlogCategoryID ? newsCategoryMap.get(b.BlogCategoryID) : undefined;
    const catObj = newsCategoriesData.find(c => String(c._id) === String(catMongoId));

    const content = cleanHtmlText(b.Content || b.Name || '');
    const excerpt = stripHtml(content).slice(0, 180) + '...';
    const dateStr = formatDate(b.CreateTime);

    newsData.push({
      _id: new mongoose.Types.ObjectId(mongoId),
      title: b.Name || `Bài viết ${b.ID}`,
      excerpt: excerpt,
      content: content,
      date: dateStr,
      image: b.Image || '/uploads/images/default-news.png',
      category: catObj ? catObj.name : 'Tin công nghệ',
      categoryId: catMongoId ? new mongoose.Types.ObjectId(catMongoId) : undefined,
      author: 'Ban Truyền Thông CTC',
      viewCount: Number(b.Views) || 120,
      isFeatured: index < 5,
      featuredOrder: index < 5 ? index + 1 : 0,
      tags: ['CTC', 'Năng lượng', 'Công nghệ']
    });
  });

  rawNews.forEach((n, index) => {
    const mongoId = makeObjectId(3003, n.NewsID || (index + 1));
    const content = cleanHtmlText(n.Content || n.Title || '');
    const dateStr = formatDate(n.PublishedDate || n.CreatedDate);

    newsData.push({
      _id: new mongoose.Types.ObjectId(mongoId),
      title: n.Title || `Tin sự kiện ${n.NewsID}`,
      excerpt: n.Summary || stripHtml(content).slice(0, 180),
      content: content,
      date: dateStr,
      image: n.ImageUrl || '/uploads/images/default-news.png',
      category: 'Sự kiện công ty',
      author: n.Author || 'Ban Truyền Thông',
      viewCount: Number(n.ViewCount) || 500,
      isFeatured: n.IsFeatured !== 0,
      featuredOrder: index + 1,
      tags: ['Sự kiện', 'CTC', 'Hợp tác']
    });
  });

  newsCategoriesData.forEach(cat => {
    cat.newsCount = newsData.filter(n => String(n.categoryId) === String(cat._id)).length;
  });

  // ==================== 6. PARTNERS & TESTIMONIALS ====================
  const partnersData = rawCustomers.map((c, index) => {
    const mongoId = makeObjectId(4001, c.ID || (index + 1));
    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: c.Name || `Đối tác ${c.ID}`,
      type: index % 2 === 0 ? 'supplier' : 'financial',
      logo: c.Image || `/uploads/images/partner-${(index % 6) + 1}.png`,
      website: c.Website && c.Website !== 'test' ? c.Website : 'https://ctcdn.vn'
    };
  });

  const testimonialsData = rawCustomers
    .filter(c => c.Info && c.Info.trim() !== '' && c.Info !== 'test')
    .map((c, index) => {
      const mongoId = makeObjectId(4002, index + 1);
      return {
        _id: new mongoose.Types.ObjectId(mongoId),
        name: c.Name || 'Khách hàng CTC',
        role: 'Đối tác Doanh Nghiệp',
        content: cleanHtmlText(c.Info),
        image: c.Image || '/uploads/images/default-avatar.png'
      };
    });

  // ==================== 7. CONTACTS ====================
  const contactsData = rawContacts.map((c, index) => {
    const mongoId = makeObjectId(5001, c.ContactID || c.ID || (index + 1));
    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: c.Name || 'Khách hàng liên hệ',
      phone: c.PhoneNumber || c.Phone || '0915059666',
      email: c.Email || 'khachhang@ctcdn.vn',
      service: c.Subject || 'Tư vấn giải pháp điện mặt trời',
      message: c.Message || 'Cần hỗ trợ tư vấn thiết kế và thi công hệ thống.',
      status: 'new'
    };
  });

  // ==================== 8. USERS ====================
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const usersData = rawUsers.map((u, index) => {
    const mongoId = makeObjectId(6001, index + 1);
    const email = u.UserName && u.UserName.includes('@') ? u.UserName : `${u.UserName || `user${index + 1}`}@ctcdn.vn`;

    return {
      _id: new mongoose.Types.ObjectId(mongoId),
      name: u.Name || u.UserName || `Quản trị viên ${index + 1}`,
      email: email.toLowerCase(),
      password: defaultPasswordHash,
      phone: u.PhoneNumber || '0915059666',
      role: 'admin'
    };
  });

  // Save parsed JSON to seed-data directory
  const seedDataDir = path.join(process.cwd(), 'seed-data');
  if (!fs.existsSync(seedDataDir)) {
    fs.mkdirSync(seedDataDir, { recursive: true });
  }

  const collectionsToSave = [
    { name: 'productcategories.json', data: productCategoriesData },
    { name: 'products.json', data: productsData },
    { name: 'projectcategories.json', data: projectCategoriesData },
    { name: 'projects.json', data: projectsData },
    { name: 'newscategories.json', data: newsCategoriesData },
    { name: 'news.json', data: newsData },
    { name: 'partners.json', data: partnersData },
    { name: 'testimonials.json', data: testimonialsData },
    { name: 'contacts.json', data: contactsData },
    { name: 'users.json', data: usersData }
  ];

  console.log('\n💾 Đang lưu dữ liệu đã chuyển đổi vào thư mục seed-data/...');
  collectionsToSave.forEach(item => {
    const filePath = path.join(seedDataDir, item.name);
    fs.writeFileSync(filePath, JSON.stringify(item.data, null, 2), 'utf8');
    console.log(`   ✅ Saved ${item.name} (${item.data.length} docs)`);
  });

  // Write _summary.json
  const summary = {
    migratedAt: new Date().toISOString(),
    totalCollections: collectionsToSave.length,
    totalDocuments: collectionsToSave.reduce((acc, item) => acc + item.data.length, 0),
    details: collectionsToSave.map(item => ({ collection: item.name.replace('.json', ''), count: item.data.length }))
  };
  fs.writeFileSync(path.join(seedDataDir, '_summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  // ==================== CONNECT TO MONGODB & IMPORT DATA ====================
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';
  console.log(`\n🔌 Đang kết nối tới MongoDB: ${MONGO_URI}...`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối thành công tới MongoDB!\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection instance is null');
    }

    for (const item of collectionsToSave) {
      const collectionName = item.name.replace('.json', '');
      const collection = db.collection(collectionName);

      await collection.deleteMany({});
      if (item.data.length > 0) {
        await collection.insertMany(item.data as any);
        console.log(`   🎉 [MongoDB] Collection '${collectionName.padEnd(20)}': Đã import ${item.data.length} bản ghi.`);
      }
    }

    // Seed RBAC Permissions & Roles for all Admin users
    await seedRBAC();

    console.log('\n' + '='.repeat(65));
    console.log('✨ HOÀN THÀNH IMPORT DỮ LIỆU TỪ SQL SERVER SANG MONGODB THÀNH CÔNG!');
    console.log('='.repeat(65));
    console.log(`📊 Tổng số tài liệu đã import: ${summary.totalDocuments} bản ghi từ 10 collections.\n`);

  } catch (error: any) {
    console.error('❌ Lỗi trong quá trình chèn dữ liệu vào MongoDB:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối MongoDB.');
  }
}

migrateData().catch(err => {
  console.error('❌ Lỗi không xác định:', err);
  process.exit(1);
});
