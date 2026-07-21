#!/usr/bin/env node
/**
 * Seeding Script: 80 Test Products (Seeds BOTH databases)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  { id: '6a5b3bc65cf9276e6b83d5ff', name: 'Tấm Pin Năng Lượng Mặt Trời', label: 'TẤM PIN SOLAR' },
  { id: '6a5b3bc65cf9276e6b83d601', name: 'Biến Tần (Inverter)', label: 'INVERTER SOLAR' },
  { id: '6a5bc085bf437f88101d497a', name: 'Thiết Bị Viễn Thông', label: 'VIỄN THÔNG' },
  { id: '6a5bc085bf437f88101d497e', name: 'Thiết Bị CNTT & Data Center', label: 'CNTT & SECURITY' },
  { id: '6a5bc085bf437f88101d4981', name: 'Thiết Bị Điện Mặt Trời', label: 'ĐIỆN MẶT TRỜI' },
  { id: '6a5bc085bf437f88101d4985', name: 'Thiết Bị Điện Gió', label: 'ĐIỆN GIÓ' },
  { id: '6a5bc085bf437f88101d4988', name: 'Hạ Tầng & Trạm Điện', label: 'TRẠM ĐIỆN' }
];

const UNSPLASH_IMAGES = {
  solar: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548613053-220fc3188549?auto=format&fit=crop&w=600&q=80'
  ],
  telecom: [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
  ],
  it: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'
  ],
  power: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  ]
};

function generate80Products() {
  const generated = [];
  
  for (let i = 1; i <= 80; i++) {
    const catIndex = (i - 1) % CATEGORIES.length;
    const category = CATEGORIES[catIndex];
    
    let image = '';
    if (category.id === '6a5b3bc65cf9276e6b83d5ff' || category.id === '6a5bc085bf437f88101d4981') {
      image = UNSPLASH_IMAGES.solar[i % UNSPLASH_IMAGES.solar.length];
    } else if (category.id === '6a5bc085bf437f88101d497a' || category.id === '6a5bc085bf437f88101d4985') {
      image = UNSPLASH_IMAGES.telecom[i % UNSPLASH_IMAGES.telecom.length];
    } else if (category.id === '6a5bc085bf437f88101d497e') {
      image = UNSPLASH_IMAGES.it[i % UNSPLASH_IMAGES.it.length];
    } else {
      image = UNSPLASH_IMAGES.power[i % UNSPLASH_IMAGES.power.length];
    }

    let name = '';
    let code = `CTC-TEST-${String(i).padStart(3, '0')}`;
    let price = 'Liên hệ';
    let contactPrice = true;
    let power = undefined;
    let efficiency = undefined;
    let shortDescription = '';
    
    const brands = ['Huawei', 'Canadian Solar', 'Longi', 'SMA', 'Growatt', 'Jinko Solar', 'Trina Solar', 'ABB', 'Schneider'];
    const brand = brands[i % brands.length];

    if (category.id === '6a5b3bc65cf9276e6b83d5ff' || category.id === '6a5bc085bf437f88101d4981') {
      const w = 400 + (i % 6) * 30;
      const eff = (20.5 + (i % 5) * 0.4).toFixed(2);
      name = `Tấm pin ${brand} Mono Half-cell ${w}W`;
      shortDescription = `Tấm pin hiệu suất cao ${eff}%, công nghệ Half-cell, bảo hành 12 năm sản phẩm.`;
      price = `${(1800000 + (i % 10) * 150000).toLocaleString('vi-VN')}`;
      contactPrice = false;
      power = w;
      efficiency = parseFloat(eff);
    } else if (category.id === '6a5b3bc65cf9276e6b83d601') {
      const kw = 5 + (i % 7) * 15;
      const eff = (97.8 + (i % 4) * 0.3).toFixed(2);
      name = `Biến tần hòa lưới ${brand} ${kw}kW`;
      shortDescription = `Inverter hòa lưới 3 pha, tích hợp giám sát từ xa qua đám mây, hiệu suất tối đa ${eff}%.`;
      price = `${(12500000 + (i % 8) * 4500000).toLocaleString('vi-VN')}`;
      contactPrice = false;
      power = kw;
      efficiency = parseFloat(eff);
    } else if (category.id === '6a5bc085bf437f88101d497a') {
      name = `Cáp quang Single-mode ${brand} ${24 + (i % 4) * 24} Core`;
      shortDescription = `Cáp quang thuê bao bọc giáp kim loại chôn ngầm trực tiếp, chống gặm nhấm.`;
    } else if (category.id === '6a5bc085bf437f88101d497e') {
      name = `Tủ rack server ${brand} ${12 + (i % 5) * 6}U`;
      shortDescription = `Tủ rack tiêu chuẩn 19 inch, cửa lưới thoáng khí 75%, chịu tải lớn.`;
      price = `${(3500000 + (i % 6) * 900000).toLocaleString('vi-VN')}`;
      contactPrice = false;
    } else if (category.id === '6a5bc085bf437f88101d4985') {
      name = `Cảm biến đo gió ${brand} chuyên dụng`;
      shortDescription = `Cảm biến hướng gió và tốc độ gió tiêu chuẩn IEC cho trụ đo gió Met Mast.`;
    } else {
      const kva = 100 + (i % 5) * 150;
      name = `Trạm biến áp phân phối dầu ${brand} ${kva}kVA`;
      shortDescription = `Máy biến áp phân phối 3 pha 22/0.4kV tiêu chuẩn TCVN, tổn hao không tải cực thấp.`;
    }

    generated.push({
      _id: `6a5bc085bf437f88101d9${String(i).padStart(3, '0')}`,
      name,
      category: category.name,
      categoryId: category.id,
      categoryLabel: category.label,
      code,
      description: `${name} được nhập khẩu chính hãng và phân phối bởi CTC. Sản phẩm đầy đủ giấy tờ chứng nhận CO/CQ và được bảo hành chính hãng từ nhà sản xuất. Hỗ trợ kỹ thuật lắp đặt, tư vấn thiết kế hệ thống miễn phí.`,
      shortDescription,
      price,
      contactPrice,
      image,
      images: [image],
      stock: 50,
      stockStatus: contactPrice ? 'contact' : 'in_stock',
      rating: 5,
      power,
      efficiency,
      warranty: '5 năm',
      features: [
        'Nhập khẩu chính hãng, đầy đủ CO/CQ',
        'Hiệu suất vận hành vượt trội và ổn định',
        'Bảo hành dài hạn từ nhà sản xuất',
        'Hỗ trợ kỹ thuật 24/7 từ đội ngũ kỹ sư CTC'
      ],
      technicalSpecs: {
        'Thương hiệu': brand,
        'Nguồn gốc': 'Chính hãng',
        'Chứng chỉ': 'CO, CQ đầy đủ',
        'Bảo hành': '5 năm'
      },
      isFeatured: i % 15 === 0,
      featuredOrder: i % 15 === 0 ? Math.floor(i / 15) : 0,
      isActive: true,
      isDeleted: false,
      views: Math.floor(Math.random() * 200) + 10,
      likes: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 10),
      translations: {},
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    });
  }
  
  return generated;
}

function convertIds(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertIds);
  }
  if (typeof obj === 'object') {
    const res = {};
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
        res[key] = new mongoose.Types.ObjectId(val);
      } else if (val && typeof val === 'object') {
        res[key] = convertIds(val);
      } else {
        res[key] = val;
      }
    }
    return res;
  }
  return obj;
}

async function seedIntoDb(uri, products) {
  try {
    console.log(`🔌 Đang kết nối tới: ${uri}...`);
    const conn = await mongoose.connect(uri);
    const db = conn.connection.db;
    
    const productsCollection = db.collection('products');
    const categoriesCollection = db.collection('productcategories');

    // Make sure category structures exist in ctc_web_new if they don't
    const catCount = await categoriesCollection.countDocuments({});
    if (catCount === 0 || catCount < CATEGORIES.length) {
      console.log('   📂 Chưa có danh mục sản phẩm, đang tạo danh mục...');
      const seedCategoriesPath = path.join(__dirname, '..', 'seed-data', 'productcategories.json');
      if (fs.existsSync(seedCategoriesPath)) {
        const cats = JSON.parse(fs.readFileSync(seedCategoriesPath, 'utf8'));
        await categoriesCollection.deleteMany({});
        await categoriesCollection.insertMany(cats);
        console.log(`   ✅ Đã nạp ${cats.length} danh mục vào ${uri}`);
      }
    }

    // Delete existing products
    console.log('   🗑️  Đang dọn dẹp collection "products"...');
    await productsCollection.deleteMany({});

    // Insert all products
    console.log('   📥 Đang nạp sản phẩm...');
    await productsCollection.insertMany(convertIds(products));
    console.log(`   ✅ Đã nạp ${products.length} sản phẩm thành công!`);

    // Recalculate category productCount
    console.log('   📊 Cập nhật số lượng sản phẩm (productCount) cho danh mục...');
    const allCategories = await categoriesCollection.find({}).toArray();
    for (const cat of allCategories) {
      const count = await productsCollection.countDocuments({ 
        $or: [
          { categoryId: cat._id.toString() },
          { categoryId: new mongoose.Types.ObjectId(cat._id) }
        ],
        isDeleted: { $ne: true },
        isActive: true
      });
      await categoriesCollection.updateOne(
        { _id: cat._id },
        { $set: { productCount: count } }
      );
    }
    console.log(`   🎉 Đã đồng bộ xong database: ${uri}\n`);
  } catch (error) {
    console.error(`   ❌ Lỗi kết nối hoặc ghi database ${uri}:`, error.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function seedData() {
  console.log('📦 Bắt đầu tiến trình tạo dữ liệu mẫu 80 sản phẩm...');
  
  const generatedProducts = generate80Products();
  const productsFilePath = path.join(__dirname, '..', 'seed-data', 'products.json');

  let existingProducts = [];
  if (fs.existsSync(productsFilePath)) {
    try {
      existingProducts = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
      console.log(`📖 Đã đọc được ${existingProducts.length} sản phẩm hiện có từ products.json`);
    } catch (e) {
      console.log('⚠️ Không thể đọc products.json cũ, sẽ tạo mới');
    }
  }

  // Filter out older test seed products
  existingProducts = existingProducts.filter(p => !p.code.startsWith('CTC-TEST-'));

  const finalProducts = [...existingProducts, ...generatedProducts];
  fs.writeFileSync(productsFilePath, JSON.stringify(finalProducts, null, 2), 'utf8');
  console.log(`💾 Đã ghi ${finalProducts.length} sản phẩm vào seed-data/products.json`);

  // Seed into both databases
  await seedIntoDb('mongodb://localhost:27017/ctc_web_new', finalProducts);
  await seedIntoDb('mongodb://localhost:27017/ctc_web_new', finalProducts);

  console.log('✨ Seed dữ liệu hoàn tất trên tất cả các databases!');
}

seedData().catch(err => {
  console.error('❌ Seed failed:', err);
});
