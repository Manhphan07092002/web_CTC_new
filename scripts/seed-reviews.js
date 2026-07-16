import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/web-tranle1';

// Product Schema (simplified)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reviews: [{
    userName: { type: String, required: true },
    userRole: String,
    userPhone: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  rating: { type: Number, min: 0, max: 5, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const sampleReviews = [
  {
    userName: "Nguyễn Văn An",
    userRole: "Chủ nhà",
    userPhone: "0901234567",
    rating: 5,
    comment: "Sản phẩm rất tốt, chất lượng cao. Hiệu suất điện mặt trời vượt mong đợi. Đội ngũ lắp đặt chuyên nghiệp.",
    date: "2024-11-10"
  },
  {
    userName: "Trần Thị Bình",
    userRole: "Kỹ sư",
    userPhone: "0912345678",
    rating: 4,
    comment: "Panel năng lượng mặt trời hoạt động ổn định. Giá cả hợp lý so với chất lượng. Sẽ giới thiệu cho bạn bè.",
    date: "2024-11-08"
  },
  {
    userName: "Lê Minh Cường",
    userRole: "Doanh nhân",
    userPhone: "0923456789",
    rating: 5,
    comment: "Đầu tư rất đáng giá! Tiết kiệm được nhiều tiền điện hàng tháng. Dịch vụ hậu mãi tốt.",
    date: "2024-11-05"
  },
  {
    userName: "Phạm Thị Dung",
    userRole: "Giáo viên",
    userPhone: "0934567890",
    rating: 4,
    comment: "Sản phẩm chất lượng, lắp đặt nhanh chóng. Hướng dẫn sử dụng chi tiết, dễ hiểu.",
    date: "2024-11-03"
  },
  {
    userName: "Hoàng Văn Em",
    userRole: "Nông dân",
    userPhone: "0945678901",
    rating: 5,
    comment: "Rất hài lòng với hệ thống điện mặt trời. Phù hợp với nhu cầu gia đình nông thôn. Giá tốt!",
    date: "2024-11-01"
  },
  {
    userName: "Vũ Thị Giang",
    userRole: "Bác sĩ",
    userPhone: "0956789012",
    rating: 4,
    comment: "Công nghệ hiện đại, tiết kiệm năng lượng. Đóng góp tích cực cho môi trường xanh.",
    date: "2024-10-28"
  }
];

async function seedReviews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find().limit(3);
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }

    console.log(`Found ${products.length} products. Adding reviews...`);

    // Add reviews to each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const reviewsForProduct = sampleReviews.slice(i * 2, (i + 1) * 2); // 2 reviews per product
      
      product.reviews = reviewsForProduct.map(review => ({
        ...review,
        createdAt: new Date(review.date),
        updatedAt: new Date(review.date)
      }));
      
      // Calculate average rating
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / product.reviews.length;
      
      await product.save();
      
      console.log(`✅ Added ${reviewsForProduct.length} reviews to product: ${product.name}`);
      console.log(`   Average rating: ${product.rating}/5`);
    }

    console.log('✅ Reviews seeding completed!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
