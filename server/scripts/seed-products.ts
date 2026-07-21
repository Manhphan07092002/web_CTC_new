import mongoose from 'mongoose';
import { Product, ProductCategory } from '../../models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const sampleProducts = [
  {
    name: 'Inverter Huawei Sun2000 5kWz',
    description: 'Biến tần hòa lưới 3 pha, tích hợp AI thông minh.',
    shortDescription: 'Inverter thông minh 5kW với AI tích hợp',
    price: 15000000,
    originalPrice: 18000000,
    category: 'Inverter',
    image: '/uploads/images/products/inverter-huawei-5kw.jpg',
    images: [
      '/uploads/images/products/inverter-huawei-5kw.jpg',
      '/uploads/images/products/inverter-huawei-5kw-2.jpg'
    ],
    power: 5000,
    efficiency: 98.4,
    warranty: 10,
    isFeatured: true,
    isActive: true,
    stock: 50,
    specifications: 'Công suất AC: 5000W | Hiệu suất: 98.4% | Điện áp đầu vào: 200-1000V | Điện áp đầu ra: 380V | Bảo hành: 10 năm',
    features: [
      'Tích hợp AI thông minh',
      'Hiệu suất cao 98.4%',
      'Kết nối WiFi/4G',
      'Chống sét tích hợp',
      'Thiết kế nhỏ gọn'
    ]
  },
  {
    name: 'Inverter SMA Sunny Tripower 10kW',
    description: 'Thương hiệu Đức, độ bền cao, phù hợp cho dự án doanh nghiệp.',
    shortDescription: 'Inverter SMA 10kW chất lượng Đức',
    price: 28000000,
    originalPrice: 32000000,
    category: 'Inverter',
    image: '/uploads/images/products/inverter-sma-10kw.jpg',
    images: [
      '/uploads/images/products/inverter-sma-10kw.jpg'
    ],
    power: 10000,
    efficiency: 98.2,
    warranty: 10,
    isFeatured: true,
    isActive: true,
    stock: 25,
    specifications: 'Công suất AC: 10000W | Hiệu suất: 98.2% | Điện áp đầu vào: 320-800V | Điện áp đầu ra: 400V | Bảo hành: 10 năm',
    features: [
      'Thương hiệu Đức',
      'Độ bền cao',
      'Phù hợp doanh nghiệp',
      'Công nghệ Optiflex',
      'Giám sát từ xa'
    ]
  },
  {
    name: 'Tấm Pin Năng Lượng Mặt Trời 450W',
    description: 'Tấm pin mono PERC hiệu suất cao, tuổi thọ 25 năm.',
    shortDescription: 'Tấm pin 450W hiệu suất cao',
    price: 2500000,
    originalPrice: 3000000,
    category: 'Tấm Pin Mặt Trời',
    image: '/uploads/images/products/solar-panel-450w.jpg',
    images: [
      '/uploads/images/products/solar-panel-450w.jpg'
    ],
    power: 450,
    efficiency: 21.2,
    warranty: 25,
    isFeatured: true,
    isActive: true,
    stock: 100,
    specifications: 'Công suất: 450W | Hiệu suất: 21.2% | Kích thước: 2108x1048x35mm | Trọng lượng: 22.5kg | Bảo hành: 25 năm',
    features: [
      'Công nghệ PERC',
      'Hiệu suất 21.2%',
      'Chống thấm IP67',
      'Chịu tải gió 2400Pa',
      'Tuổi thọ 25 năm'
    ]
  },
  {
    name: 'Pin Lưu Trữ LiFePO4 100Ah',
    description: 'Pin lithium an toàn, tuổi thọ cao, sạc nhanh.',
    shortDescription: 'Pin LiFePO4 100Ah an toàn',
    price: 12000000,
    originalPrice: 15000000,
    category: 'Pin Lưu Trữ',
    image: '/uploads/images/products/battery-lifepo4-100ah.jpg',
    images: [
      '/uploads/images/products/battery-lifepo4-100ah.jpg'
    ],
    power: 1280, // 12.8V * 100Ah
    efficiency: 95,
    warranty: 10,
    isFeatured: false,
    isActive: true,
    stock: 30,
    specifications: 'Dung lượng: 100Ah | Điện áp: 12.8V | Năng lượng: 1280Wh | Chu kỳ sạc: 6000+ cycles | Bảo hành: 10 năm',
    features: [
      'Công nghệ LiFePO4',
      'An toàn cao',
      'Sạc nhanh',
      '6000+ chu kỳ',
      'BMS tích hợp'
    ]
  },
  {
    name: 'Phụ Kiện Giá Đỡ Mái Ngói',
    description: 'Giá đỡ chuyên dụng cho mái ngói, chống ăn mòn.',
    shortDescription: 'Giá đỡ mái ngói chống ăn mòn',
    price: 500000,
    originalPrice: 600000,
    category: 'Phụ Kiện',
    image: '/uploads/images/products/roof-mount-tile.jpg',
    images: [
      '/uploads/images/products/roof-mount-tile.jpg'
    ],
    power: 0,
    efficiency: 0,
    warranty: 15,
    isFeatured: false,
    isActive: true,
    stock: 200,
    specifications: 'Chất liệu: Nhôm anodized | Tải trọng: Lên đến 60kg/m² | Góc nghiêng: 15-60° | Chống ăn mòn: Class C5 | Bảo hành: 15 năm',
    features: [
      'Nhôm anodized',
      'Chống ăn mòn C5',
      'Lắp đặt dễ dàng',
      'Tải trọng cao',
      'Phù hợp mái ngói'
    ]
  }
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});

    // Get categories to map categoryId
    const categories = await ProductCategory.find();
    console.log(`Found ${categories.length} categories`);

    // Create products with categoryId
    const productsWithCategoryId = sampleProducts.map(product => {
      const category = categories.find(c => c.name === product.category);
      return {
        ...product,
        categoryId: category?._id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    console.log('Creating products...');
    const createdProducts = await Product.insertMany(productsWithCategoryId);
    
    console.log(`✅ Successfully created ${createdProducts.length} products:`);
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price.toLocaleString('vi-VN')}đ`);
    });

    // Show summary
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const activeProducts = await Product.countDocuments({ isActive: true });

    console.log('\n📊 Summary:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Featured products: ${featuredProducts}`);
    console.log(`Active products: ${activeProducts}`);

    console.log('\n🎉 Products seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
seedProducts();

export default seedProducts;
