/**
 * Seed 300 SEO Products Script
 * Tạo 300 sản phẩm với mô tả Chuẩn SEO, chia đều cho các danh mục, toàn bộ giá để "Liên hệ".
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product, ProductCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// Danh sách hình ảnh mẫu chất lượng cao cho từng loại sản phẩm
const imageSets: { [key: string]: string[] } = {
  router: [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
  ],
  switch: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
  ],
  wifi: [
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80',
    'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80'
  ],
  server: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
  ],
  pc: [
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80'
  ],
  solar: [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80',
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&q=80'
  ],
  inverter: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80'
  ],
  battery: [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
  ],
  cable: [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
  ],
  voip: [
    'https://images.unsplash.com/photo-1580894732468-058f747280f2?w=800&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
  ]
};

function getImageForSlug(slug: string): string {
  if (slug.includes('router') || slug.includes('mikrotik') || slug.includes('draytek')) return imageSets.router[0];
  if (slug.includes('switch') || slug.includes('patch-panel') || slug.includes('commscope')) return imageSets.switch[0];
  if (slug.includes('wifi') || slug.includes('tp-link')) return imageSets.wifi[0];
  if (slug.includes('server') || slug.includes('may-chu')) return imageSets.server[0];
  if (slug.includes('pc') || slug.includes('laptop') || slug.includes('kiosk')) return imageSets.pc[0];
  if (slug.includes('pin') || slug.includes('solar') || slug.includes('mat-troi')) return imageSets.solar[0];
  if (slug.includes('inverter') || slug.includes('hoa-luoi')) return imageSets.inverter[0];
  if (slug.includes('ac-quy') || slug.includes('lithium') || slug.includes('chi')) return imageSets.battery[0];
  if (slug.includes('cap') || slug.includes('sfp') || slug.includes('odf')) return imageSets.cable[0];
  if (slug.includes('voip') || slug.includes('pbx') || slug.includes('dinstar')) return imageSets.voip[0];
  return imageSets.router[0];
}

// Hàm sinh nội dung SEO chuẩn HTML
function generateSeoDescription(productName: string, categoryName: string, brandOrType: string): { description: string, shortDescription: string, features: string[] } {
  const shortDescription = `${productName} chuyên dụng cho ${categoryName}. Thiết bị nhập khẩu chính hãng, bảo hành lâu dài, đạt tiêu chuẩn quốc tế, báo giá cạnh tranh nhất tại CTC Telecom.`;

  const features = [
    `Hiệu suất hoạt động vượt trội, đáp ứng tiêu chuẩn công nghiệp`,
    `Tích hợp các công nghệ bảo mật tiên tiến, chống quá tải và bảo vệ dữ liệu`,
    `Thiết kế nhỏ gọn, độ bền cao, dễ dàng lắp đặt và cấu hình`,
    `Hỗ trợ kỹ thuật 24/7 từ đội ngũ chuyên gia của CTC Telecom`,
    `Đầy đủ chứng nhận nguồn gốc CO/CQ chính hãng`
  ];

  const description = `
<div class="space-y-6 text-gray-700 dark:text-gray-300">
  <p class="text-base leading-relaxed">
    <strong>${productName}</strong> là giải pháp hàng đầu trong phân khúc <em>${categoryName}</em>. Sản phẩm được sản xuất trên dây chuyền công nghệ hiện đại, đáp ứng các tiêu chuẩn kỹ thuật khắt khe nhất của hạ tầng viễn thông và CNTT doanh nghiệp.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Tính Năng Nổi Bật Của ${productName}</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Hiệu năng mạnh mẽ:</strong> Vận hành mượt mà, chịu tải cao trong môi trường làm việc liên tục 24/7.</li>
    <li><strong>Tiết kiệm năng lượng:</strong> Tối ưu hóa điện năng tiêu thụ, thân thiện với môi trường.</li>
    <li><strong>Độ an toàn tuyệt đối:</strong> Trang bị hệ thống bảo vệ quá áp, ngắn mạch và chống nhiễu điện từ.</li>
    <li><strong>Khả năng tương thích cao:</strong> Dễ dàng tích hợp vào hệ thống hạ tầng sẵn có mà không gây xung đột.</li>
  </ul>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Ứng Dụng Thực Tế</h3>
  <p class="leading-relaxed">
    Sản phẩm <strong>${productName}</strong> rất phù hợp cho các văn phòng doanh nghiệp, tòa nhà thông minh, nhà máy sản xuất, trung tâm dữ liệu (Data Center) và các công trình điện mặt trời, hạ tầng viễn thông chuyên nghiệp.
  </p>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Thông Số Kỹ Thuật Chính</h3>
  <table class="w-full border-collapse border border-gray-200 dark:border-slate-700 text-sm">
    <tbody>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800 w-1/3">Dòng sản phẩm</td>
        <td class="p-2.5">${productName}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Phân loại danh mục</td>
        <td class="p-2.5">${categoryName}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Thương hiệu / Tiêu chuẩn</td>
        <td class="p-2.5">${brandOrType}</td>
      </tr>
      <tr class="border-b border-gray-200 dark:border-slate-700">
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Chứng nhận chất lượng</td>
        <td class="p-2.5">CO, CQ, ISO 9001:2015, CE, RoHS</td>
      </tr>
      <tr>
        <td class="p-2.5 font-bold bg-gray-50 dark:bg-slate-800">Chế độ bảo hành</td>
        <td class="p-2.5">12 - 36 tháng chính hãng (1 đổi 1 trong 30 ngày)</td>
      </tr>
    </tbody>
  </table>

  <h3 class="text-xl font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3">Lý Do Chọn Mua Tại CTC Telecom</h3>
  <p class="leading-relaxed">
    <strong>CTC Telecom</strong> tự hào là đối tác phân phối thiết bị viễn thông, CNTT và Năng lượng mặt trời hàng đầu. Khi đặt mua <strong>${productName}</strong> tại CTC Telecom, quý khách được đảm bảo:
  </p>
  <ul class="list-disc pl-6 space-y-1">
    <li>100% sản phẩm chính hãng, mới hoàn toàn.</li>
    <li>Mức giá cạnh tranh nhất thị trường (Chiết khấu ưu đãi cho dự án và đại lý).</li>
    <li>Tư vấn kỹ thuật tận tâm, hỗ trợ khảo sát và giao hàng toàn quốc.</li>
  </ul>
</div>
  `.trim();

  return { description, shortDescription, features };
}

async function seed300Products() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Delete all existing products
    console.log('\n🔥 Clearing existing products...');
    await Product.deleteMany({});
    console.log('✓ Cleared all old products');

    // 2. Fetch all categories
    const categories = await ProductCategory.find({ isActive: true });
    console.log(`\nFound ${categories.length} categories in database.`);

    if (categories.length === 0) {
      console.error('❌ No categories found! Please run npm run seed:categories first.');
      process.exit(1);
    }

    // Identify leaf categories (categories that are NOT parent to any other category)
    const parentIds = new Set(categories.map(c => c.parentId?.toString()).filter(Boolean));
    const leafCategories = categories.filter(c => !parentIds.has(c._id.toString()));
    console.log(`Targeting ${leafCategories.length} leaf categories for product generation.`);

    const TOTAL_PRODUCTS = 300;
    const baseCountPerCat = Math.floor(TOTAL_PRODUCTS / leafCategories.length); // ~8-9 per category
    let remaining = TOTAL_PRODUCTS - (baseCountPerCat * leafCategories.length);

    console.log(`Generating approx ${baseCountPerCat} products per category...`);

    let globalCounter = 1;
    const productsToInsert = [];

    for (let catIndex = 0; catIndex < leafCategories.length; catIndex++) {
      const cat = leafCategories[catIndex];
      const countForThisCat = baseCountPerCat + (remaining > 0 ? 1 : 0);
      if (remaining > 0) remaining--;

      for (let i = 1; i <= countForThisCat; i++) {
        const itemNumber = i;
        const codeNum = String(globalCounter).padStart(3, '0');
        const skuCode = `CTC-${cat.slug.substring(0, 4).toUpperCase()}-${codeNum}`;
        const productName = `${cat.name} CTC-Pro Series ${itemNumber}`;
        const imageUrl = getImageForSlug(cat.slug);

        const { description, shortDescription, features } = generateSeoDescription(
          productName,
          cat.name,
          'Chính Hãng CTC Telecom'
        );

        productsToInsert.push({
          name: productName,
          category: cat.name,
          categoryId: cat._id,
          categoryLabel: cat.name.toUpperCase(),
          code: skuCode,
          description: description,
          shortDescription: shortDescription,
          specifications: `Tiêu chuẩn quốc tế; Điện áp: 220V/50Hz; Chất liệu cao cấp; CO/CQ đầy đủ`,
          price: "0",
          originalPrice: "0",
          contactPrice: true,
          stockStatus: 'contact',
          stock: 100,
          warranty: '12 - 36 tháng',
          features: features,
          image: imageUrl,
          images: [imageUrl],
          isFeatured: globalCounter % 6 === 0, // Mark 1 out of 6 as featured
          isActive: true,
          focusKeyword: `${cat.name} chính hãng ${productName}`,
          views: Math.floor(Math.random() * 500) + 50,
          likes: Math.floor(Math.random() * 50) + 5
        });

        globalCounter++;
      }
    }

    console.log(`\n🚀 Inserting ${productsToInsert.length} products into MongoDB...`);
    const inserted = await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully inserted ${inserted.length} products! All prices set to "Liên hệ".`);

    // Update productCount for each category
    console.log('\n🔄 Updating category product counts...');
    for (const cat of categories) {
      // Find count of products for this category (direct + descendant)
      const count = await Product.countDocuments({ categoryId: cat._id });
      await ProductCategory.findByIdAndUpdate(cat._id, { productCount: count });
    }
    console.log('✓ Updated productCount for all categories!');

    console.log('\n🎉 Seed 300 products complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seed300Products();
