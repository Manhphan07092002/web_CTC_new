import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Setting = mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
  
  await Setting.updateMany({}, {
    $set: {
      address: '50B Nguyễn Du, Hải Châu, Đà Nẵng',
      email: 'info@ctcdn.vn',
      phone: '0915 059 666',
      siteName: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
      siteDescription: 'Giải pháp EPC và Năng lượng tái tạo hàng đầu Việt Nam'
    }
  });
  
  console.log('Database settings updated successfully.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
