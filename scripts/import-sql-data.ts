import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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

// Parse T-SQL VALUES clause
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
        if (!inString && (current.trim() === 'N' || current.trim() === 'n')) {
          current = '';
        }
        inString = !inString;
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
    if (dateMatch) return dateMatch[1];
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
  const productCategoryMap = new Map<number, string>(); // SQL ID -> Mongo ObjectId string
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
    const dateStr = p.CompletionDate ? String(p.CompletionDate).split(' ')[0] : '2024';

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
    const dateStr = b.CreateTime ? String(b.CreateTime).split(' ')[0] : '15/10/2024';

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
    const dateStr = n.PublishedDate || n.CreatedDate ? String(n.PublishedDate || n.CreatedDate).split(' ')[0] : '15/10/2024';

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

      // Drop existing indexes if duplicate error might occur, then clear & insert
      await collection.deleteMany({});
      if (item.data.length > 0) {
        await collection.insertMany(item.data as any);
        console.log(`   🎉 [MongoDB] Collection '${collectionName.padEnd(20)}': Đã import ${item.data.length} bản ghi.`);
      }
    }

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
