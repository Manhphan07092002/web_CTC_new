import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  Settings,
  ProductCategory,
  Product,
  NewsCategory,
  News,
  ProjectCategory,
  Project,
  Testimonial,
  Partner,
  User,
  TeamMember,
  Contact,
  Notification
} from '../models/index.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({ path: '../../.env.local' });
dotenv.config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    console.log('Clearing old data...');
    await Promise.all([
      ProductCategory.deleteMany({}),
      Product.deleteMany({}),
      NewsCategory.deleteMany({}),
      News.deleteMany({}),
      ProjectCategory.deleteMany({}),
      Project.deleteMany({}),
      Testimonial.deleteMany({}),
      Partner.deleteMany({}),
      User.deleteMany({}),
      TeamMember.deleteMany({}),
      Settings.deleteMany({}),
      Contact.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Inserting Settings...');
    await Settings.create({
      siteName: 'Trần Lê Solar',
      siteDescription: 'Giải pháp điện mặt trời hàng đầu Việt Nam',
      logo: '/uploads/images/logo/logodo.png',
      email: 'contact@tranlesolar.vn',
      phone: '0901234567',
      address: '123 Đường Tôn Đức Thắng, Quận 1, TP.HCM',
      maintenance: false,
      notifyEmail: true,
      twoFactorAuth: false,
      currency: 'VND',
      taxRate: 10
    });

    console.log('Inserting Users...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'Admin Trần Lê',
      email: 'admin@ctcdn.vn',
      password: hashedPassword,
      role: 'admin',
      permissions: ['settings_manage', 'view_users'],
      status: 'active'
    });

    await User.create({
      name: 'Nhân viên Sale',
      email: 'sale@ctcdn.vn',
      password: hashedPassword,
      role: 'editor',
      permissions: [],
      status: 'active'
    });

    console.log('Inserting Product Categories & Products...');
    const catSolar = await ProductCategory.create({ name: 'Tấm Pin Năng Lượng Mặt Trời', slug: 'tam-pin-mat-troi', description: 'Các loại pin mặt trời chất lượng cao', status: 'active', order: 1 });
    const catInverter = await ProductCategory.create({ name: 'Biến Tần (Inverter)', slug: 'bien-tan', description: 'Inverter hòa lưới và lưu trữ', status: 'active', order: 2 });
    
    await Product.insertMany([
      {
        name: 'Tấm Pin Jinko Solar 550W',
        categoryId: catSolar._id,
        category: 'Tấm Pin Năng Lượng Mặt Trời',
        code: 'JK-550W',
        description: 'Tấm pin Jinko Solar hiệu suất cao...',
        shortDescription: 'Hiệu suất 21.3%',
        price: '2.500.000',
        contactPrice: false,
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        stockStatus: 'in_stock'
      },
      {
        name: 'Biến tần Huawei 10kW',
        categoryId: catInverter._id,
        category: 'Biến Tần (Inverter)',
        code: 'HW-10K',
        description: 'Biến tần Huawei hòa lưới...',
        shortDescription: 'Hòa lưới 3 pha',
        price: '25.000.000',
        contactPrice: false,
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80',
        stockStatus: 'in_stock'
      }
    ]);

    console.log('Inserting Projects...');
    const pCatResidential = await ProjectCategory.create({ name: 'Điện Mặt Trời Áp Mái (Hộ Gia Đình)', slug: 'ap-mai-ho-gia-dinh', status: 'active', order: 1 });
    const pCatIndustrial = await ProjectCategory.create({ name: 'Điện Mặt Trời Công Nghiệp', slug: 'cong-nghiep', status: 'active', order: 2 });

    await Project.insertMany([
      {
        title: 'Dự án 5kWp tại Thủ Đức',
        categoryId: pCatResidential._id,
        category: 'Điện Mặt Trời Áp Mái (Hộ Gia Đình)',
        location: 'TP. Thủ Đức, HCM',
        capacity: '5kWp',
        completionDate: '2023-12-01',
        description: 'Lắp đặt 10 tấm pin 500W...',
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        featured: true
      },
      {
        title: 'Nhà máy dệt may 1MWp',
        categoryId: pCatIndustrial._id,
        category: 'Điện Mặt Trời Công Nghiệp',
        location: 'KCN Sóng Thần, Bình Dương',
        capacity: '1MWp',
        completionDate: '2023-10-15',
        description: 'Dự án áp mái nhà xưởng dệt may...',
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80',
        featured: true
      }
    ]);

    console.log('Inserting News...');
    const nCatTech = await NewsCategory.create({ name: 'Công Nghệ Điện Mặt Trời', slug: 'cong-nghe', status: 'active' });

    await News.insertMany([
      {
        title: 'Xu hướng điện mặt trời năm 2024',
        categoryId: nCatTech._id,
        category: 'Công Nghệ Điện Mặt Trời',
        slug: 'xu-huong-dien-mat-troi-2024',
        excerpt: 'Điện mặt trời lưu trữ đang trở thành xu hướng mới...',
        content: '<p>Chi tiết về xu hướng điện mặt trời năm 2024...</p>',
        image: 'https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80',
        author: admin._id,
        date: new Date().toISOString(),
        featured: true,
        status: 'published'
      }
    ]);

    console.log('Inserting Team, Testimonials, Partners...');
    await TeamMember.insertMany([
      { name: 'Nguyễn Văn A', role: 'Giám đốc Điều hành', bio: 'Hơn 15 năm kinh nghiệm', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80', email: 'a@ctcdn.vn', phone: '0901234567', order: 1 },
      { name: 'Trần Thị B', role: 'Kỹ sư trưởng', bio: 'Chuyên gia thiết kế hệ thống', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', email: 'b@ctcdn.vn', phone: '0909876543', order: 2 }
    ]);

    await Testimonial.insertMany([
      { name: 'Anh Hùng', role: 'Chủ hộ gia đình', content: 'Hệ thống điện mặt trời giúp gia đình tôi tiết kiệm 2 triệu tiền điện mỗi tháng. Rất cảm ơn đội ngũ!', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80', rating: 5 },
      { name: 'Chị Mai', role: 'Giám đốc Công ty TNHH', content: 'Thi công chuyên nghiệp, đúng tiến độ. Hệ thống chạy rất ổn định.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80', rating: 5 }
    ]);

    await Partner.insertMany([
      { name: 'Jinko Solar', logo: 'https://via.placeholder.com/150x80?text=Jinko', website: 'https://jinkosolar.com', tier: 'gold', type: 'supplier', status: 'active' },
      { name: 'Huawei', logo: 'https://via.placeholder.com/150x80?text=Huawei', website: 'https://huawei.com', tier: 'platinum', type: 'supplier', status: 'active' }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
