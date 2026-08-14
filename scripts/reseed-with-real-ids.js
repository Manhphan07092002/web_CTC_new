/**
 * Reseed script - sử dụng ObjectId thật từ MongoDB
 * Xóa toàn bộ data cũ và insert lại với _id là ObjectId thực
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const COMPANY_NAME = "Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)";
const COMPANY_SHORT = "CTC";
const CEO_NAME = "Nguyễn Văn Duy";
const HEADQUARTERS = "50B Nguyễn Du, Phường Hải Châu, TP Đà Nẵng, Việt Nam";

// Tạo ObjectId thực để làm category IDs
const catIds = Array.from({ length: 10 }, () => new ObjectId());

const categoriesData = [
  { _id: catIds[0], name: "Tài Chính - Cổ Đông CTC", slug: "tai-chinh-co-dong", description: "Báo cáo tài chính, doanh thu, cổ tức và quản trị CTC.", order: 1, isActive: true },
  { _id: catIds[1], name: "Hạ Tầng Viễn Thông & BTS", slug: "ha-tang-vien-thong", description: "Hạ tầng BTS, mạng truyền dẫn, cáp quang.", order: 2, isActive: true },
  { _id: catIds[2], name: "Điện Mặt Trời & Solar EPC", slug: "dien-mat-troi-epc", description: "Điện mặt trời mái nhà công nghiệp, Rooftop Solar.", order: 3, isActive: true },
  { _id: catIds[3], name: "Điện Gió & Trạm Biến Áp 110kV", slug: "dien-gio-tram-bien-ap", description: "Nhà máy điện gió Hướng Linh 4, trạm biến áp 110kV.", order: 4, isActive: true },
  { _id: catIds[4], name: "Trung Tâm Dữ Liệu & Data Center", slug: "data-center", description: "Hạ tầng Data Center, Edge Computing.", order: 5, isActive: true },
  { _id: catIds[5], name: "Giải Pháp An Ninh AI & IoT", slug: "an-ninh-ai-iot", description: "Camera AI, IoT, an ninh thông minh.", order: 6, isActive: true },
  { _id: catIds[6], name: "Hoạt Động Nội Bộ & HR", slug: "noi-bo-hr", description: "Tuyển dụng, đào tạo, hoạt động nội bộ.", order: 7, isActive: true },
  { _id: catIds[7], name: "Dự Án Quốc Phòng & Chính Phủ", slug: "quoc-phong-chinh-phu", description: "Dự án A70, hạ tầng quốc phòng.", order: 8, isActive: true },
  { _id: catIds[8], name: "Thị Trường & Hội Nhập Quốc Tế", slug: "thi-truong-quoc-te", description: "Đối tác quốc tế, hội nhập, xuất khẩu dịch vụ.", order: 9, isActive: true },
  { _id: catIds[9], name: "CSR & Trách Nhiệm Xã Hội", slug: "csr-xa-hoi", description: "Từ thiện, hỗ trợ cộng đồng, môi trường.", order: 10, isActive: true },
];

function makeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function makeArticle(catIndex, articleIndex, title, excerpt, content) {
  const cat = categoriesData[catIndex];
  return {
    _id: new ObjectId(),
    title,
    excerpt,
    content,
    date: makeDate(articleIndex * 3 + catIndex * 2),
    image: `https://picsum.photos/seed/${catIndex * 20 + articleIndex}/800/500`,
    categoryId: cat._id,
    category: cat.name,
    author: CEO_NAME,
    isFeatured: articleIndex === 0 && catIndex < 3,
    featuredOrder: catIndex + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function fullContent(heading, paras) {
  return `<h2>${heading}</h2>` + paras.map(p => `<p>${p}</p>`).join('') +
    `<blockquote><strong>${COMPANY_SHORT}</strong> – ${HEADQUARTERS}</blockquote>`;
}

const newsData = [];

// --- Danh mục 0: Tài Chính - Cổ Đông CTC (20 bài) ---
const tc_titles = [
  ["Hội đồng Quản trị CTC phê duyệt phương án đầu tư mở rộng hạ tầng số",
    "Hội đồng Quản trị CTC chính thức phê duyệt phương án đầu tư 120 tỷ đồng mở rộng hạ tầng số giai đoạn 2026-2028.",
    fullContent("Phê duyệt đầu tư hạ tầng số 2026-2028",
      [`${COMPANY_NAME} vừa thông qua nghị quyết đầu tư chiến lược với tổng ngân sách 120 tỷ đồng, triển khai trong 3 năm 2026-2028.`,
       "Kế hoạch tập trung vào 4 trụ cột: Data Center biên, mạng cáp quang nội tỉnh, hệ thống giám sát IoT và nền tảng điện toán đám mây.",
       `CEO ${CEO_NAME} nhấn mạnh: "Đây là bước đi chiến lược giúp CTC giữ vững vị thế dẫn đầu trong lĩnh vực hạ tầng số tại miền Trung – Tây Nguyên."`,
       "Kế hoạch được kỳ vọng tạo thêm 150 việc làm chuyên môn cao và tăng doanh thu 35% trong 3 năm tới."])],
  ["CTC công bố kết quả kinh doanh Q1/2026: Doanh thu đạt 72 tỷ đồng",
    "Quý 1/2026, CTC đạt doanh thu thuần 72 tỷ đồng, tăng 24% so với cùng kỳ 2025, vượt kế hoạch đề ra 15%.",
    fullContent("Kết quả kinh doanh Q1/2026",
      ["Tổng doanh thu thuần đạt 72 tỷ đồng (+24% YoY), lợi nhuận trước thuế 8,5 tỷ đồng (+31% YoY).",
       "Mảng Solar EPC tiếp tục dẫn đầu với 28 tỷ đồng (39% tổng doanh thu). Viễn thông đóng góp 24 tỷ đồng.",
       "Đây là kết quả ấn tượng nhất trong lịch sử hoạt động Q1 của CTC, phản ánh chiến lược đa dạng hóa đúng hướng.",
       "Ban lãnh đạo đặt mục tiêu doanh thu 2026 đạt 310 tỷ đồng, tăng trưởng 8% so với năm 2025."])],
  ["Đại hội Cổ đông CTC 2026: Thông qua kế hoạch chia cổ tức 15%",
    "Đại hội đồng Cổ đông thường niên CTC năm 2026 đã thông qua tỷ lệ cổ tức 15% bằng tiền mặt và kế hoạch kinh doanh năm 2026.",
    fullContent("Đại hội Cổ đông thường niên 2026",
      ["Ngày 15/4/2026, CTC tổ chức thành công ĐHCĐ thường niên với 95% cổ đông tham dự (trực tiếp và ủy quyền).",
       "Đại hội thông qua: Cổ tức 2025 đạt 15% mệnh giá (1.500 đồng/cổ phiếu), kế hoạch doanh thu 310 tỷ đồng năm 2026.",
       "Cổ đông nhất trí thông qua phương án phát hành thêm 2 triệu cổ phiếu ESOP cho cán bộ chủ chốt.",
       `CEO ${CEO_NAME} phát biểu: "Chúng tôi cam kết duy trì tỷ lệ cổ tức ổn định tối thiểu 10% trong 3 năm tới."`])],
  ["CTC công bố báo cáo tài chính kiểm toán 2025: Doanh thu 288 tỷ, tổng tài sản 181 tỷ",
    "Báo cáo tài chính năm 2025 được kiểm toán bởi Big4 xác nhận doanh thu thuần 288 tỷ VND và tổng tài sản 181 tỷ VND.",
    fullContent("Báo cáo tài chính kiểm toán 2025",
      ["Năm 2025, CTC ghi nhận doanh thu thuần 288 tỷ VND, tăng 22% so với năm 2024. Lợi nhuận sau thuế đạt 18,5 tỷ VND.",
       "Tổng tài sản đạt 181 tỷ VND, trong đó tài sản cố định chiếm 42%. Vốn chủ sở hữu đạt 95 tỷ VND.",
       "Công ty duy trì hệ số nợ/vốn ở mức an toàn 0,9 lần, thanh khoản tốt với dự phòng tiền mặt 35 tỷ đồng.",
       "Đây là năm thứ 3 liên tiếp CTC đạt tăng trưởng doanh thu trên 20%."])],
  ["CTC phát hành trái phiếu 50 tỷ đồng để tài trợ dự án điện tái tạo",
    "CTC thông báo phát hành thành công 500 trái phiếu doanh nghiệp mệnh giá 100 triệu đồng/trái phiếu, lãi suất 9,5%/năm.",
    fullContent("Phát hành trái phiếu doanh nghiệp 50 tỷ",
      ["CTC phát hành thành công lô trái phiếu 50 tỷ đồng kỳ hạn 3 năm (2026-2029), lãi suất cố định 9,5%/năm.",
       "Toàn bộ nguồn vốn sẽ tài trợ cho các dự án Solar EPC và Điện gió trong pipeline 2026-2027.",
       "Lô trái phiếu được hấp thụ 100% trong 48 giờ, cho thấy niềm tin mạnh mẽ của nhà đầu tư vào CTC.",
       "Đây là lần phát hành trái phiếu thứ 2 của CTC, lần đầu vào 2023 với 30 tỷ đồng đã được thanh toán đúng hạn."])],
  ...Array.from({ length: 15 }, (_, i) => [
    `Báo cáo tài chính tháng ${i + 1}/2026 – CTC tiếp tục đà tăng trưởng`,
    `Kết quả kinh doanh tháng ${i + 1}/2026 của CTC cho thấy doanh thu đạt ${45 + i * 2} tỷ đồng, tăng ${18 + i}% so với cùng kỳ.`,
    fullContent(`Tài chính tháng ${i + 1}/2026`,
      [`Doanh thu tháng ${i + 1}/2026 đạt ${45 + i * 2} tỷ đồng, tăng ${18 + i}% so với cùng kỳ năm 2025.`,
       "Biên lợi nhuận gộp duy trì ổn định ở mức 22-25%, phản ánh hiệu quả kiểm soát chi phí.",
       `Số hợp đồng mới ký kết trong tháng: ${12 + i} hợp đồng với tổng giá trị ${30 + i * 3} tỷ đồng.`,
       "Ban lãnh đạo tự tin về việc đạt và vượt kế hoạch năm 2026."])
  ])
];

const vtg_titles = [
  ["Bàn giao trạm phát sóng cột anten dây kéo chuyên dụng khu vực vùng sâu",
   "CTC hoàn thành bàn giao 12 trạm BTS cột anten dây kéo tại vùng sâu vùng xa tỉnh Quảng Nam và Quảng Ngãi.",
   fullContent("Bàn giao 12 trạm BTS vùng sâu",
    ["CTC hoàn thành lắp đặt và bàn giao 12 trạm BTS cột anten dây kéo 45m tại các xã miền núi tỉnh Quảng Nam và Quảng Ngãi.",
     "Dự án thuộc Chương trình Phủ sóng vùng lõm do Bộ Thông tin và Truyền thông triển khai năm 2026.",
     "Mỗi trạm BTS phủ sóng bán kính 8-12km, cung cấp dịch vụ 4G cho hơn 50.000 người dân tại các khu vực từng là 'vùng trắng' sóng di động.",
     `CEO ${CEO_NAME}: "CTC tự hào góp phần thu hẹp khoảng cách số, đưa Internet về với bà con vùng sâu."`])],
  ["CTC triển khai mạng cáp quang Metropolitan 300km cho tỉnh Quảng Bình",
   "CTC trúng thầu và triển khai hệ thống cáp quang Metropolitan Area Network (MAN) dài 300km kết nối 8 huyện/thành phố tỉnh Quảng Bình.",
   fullContent("Mạng cáp quang Metropolitan 300km Quảng Bình",
    ["CTC chính thức khởi công xây dựng mạng MAN Quảng Bình, dự án có tổng chiều dài 300km cáp quang.",
     "Dự án kết nối 8 huyện/thành phố, 120 xã/phường, phục vụ hơn 200 cơ quan Nhà nước và 50.000 hộ gia đình.",
     "Băng thông thiết kế đạt 100Gbps trên trục chính, đủ năng lực phục vụ nhu cầu trong 15 năm tới.",
     "CTC huy động 120 kỹ sư và 45 tổ công nhân làm việc đồng thời trên 8 mũi thi công."])],
  ...Array.from({ length: 18 }, (_, i) => [
    `Hoàn thành tuyến cáp quang số ${i + 1} – Kết nối ${["Đà Nẵng", "Huế", "Quảng Nam", "Quảng Ngãi", "Bình Định"][i % 5]} với tốc độ 10Gbps`,
    `CTC hoàn thành lắp đặt tuyến cáp quang ${i + 1} dài ${20 + i * 5}km, kết nối thêm ${5000 + i * 1000} hộ dân.`,
    fullContent(`Tuyến cáp quang số ${i + 1} hoàn thành`,
      [`Tuyến cáp quang thứ ${i + 1} dài ${20 + i * 5}km được hoàn thành sau ${3 + i % 4} tháng thi công.`,
       `Kết nối thêm ${5000 + i * 1000} hộ dân và ${50 + i * 10} doanh nghiệp tại khu vực.`,
       "Hệ thống đạt tiêu chuẩn ITU-T G.652D, đảm bảo băng thông cao và độ ổn định tối đa.",
       "CTC tiếp tục là đơn vị dẫn đầu về năng lực thi công hạ tầng viễn thông tại miền Trung."])
  ])
];

// Tạo 20 bài cho mỗi danh mục
for (let catIdx = 0; catIdx < 10; catIdx++) {
  let titles;
  if (catIdx === 0) titles = tc_titles;
  else if (catIdx === 1) titles = vtg_titles;
  else {
    titles = Array.from({ length: 20 }, (_, i) => {
      const catName = categoriesData[catIdx].name;
      return [
        `${catName}: Cập nhật dự án số ${i + 1} – Tiến độ và Thành tựu`,
        `${COMPANY_SHORT} hoàn thành giai đoạn ${i + 1} dự án thuộc ${catName}, đạt tiến độ vượt kế hoạch 15%.`,
        fullContent(`${catName} – Dự án số ${i + 1}`,
          [`${COMPANY_NAME} vừa hoàn thành giai đoạn ${i + 1} của dự án thuộc ${catName}.`,
           `Dự án được triển khai bởi đội ngũ ${30 + i * 2} kỹ sư chuyên nghiệp với hơn ${5 + i} năm kinh nghiệm.`,
           `Tổng giá trị hợp đồng đạt ${15 + i * 5} tỷ đồng, hoàn thành trước tiến độ ${7 + i % 5} ngày.`,
           `CEO ${CEO_NAME}: "Đây là minh chứng rõ nét cho năng lực thực thi xuất sắc của CTC trong lĩnh vực ${catName}."`])
      ];
    });
  }

  for (let i = 0; i < 20; i++) {
    const t = titles[i] || titles[titles.length - 1];
    newsData.push(makeArticle(catIdx, i, t[0], t[1], t[2]));
  }
}

async function main() {
  console.log(`\n🔗 Kết nối tới ${MONGODB_URI}...`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🗑️  Xóa dữ liệu cũ...');
  await db.collection('news').deleteMany({});
  await db.collection('newscategories').deleteMany({});
  
  const catDocs = categoriesData.map(c => ({
    ...c,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  console.log(`📂 Inserting ${catDocs.length} danh mục...`);
  await db.collection('newscategories').insertMany(catDocs);
  
  console.log(`📰 Inserting ${newsData.length} bài viết...`);
  await db.collection('news').insertMany(newsData);

  // Verify
  const newsCount = await db.collection('news').countDocuments();
  const catCount = await db.collection('newscategories').countDocuments();
  const sample = await db.collection('news').findOne();
  
  console.log(`\n✅ Kết quả:`);
  console.log(`   📰 Bài viết: ${newsCount}`);
  console.log(`   📂 Danh mục: ${catCount}`);
  console.log(`   🔑 Sample _id: ${sample._id} (type: ${typeof sample._id})`);
  console.log(`   📰 Sample title: ${sample.title}`);
  
  await client.close();
  console.log('\n🎉 Xong! Tất cả _id đều là ObjectId thực, có thể click xem chi tiết!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
