import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

// Inline Schemas
const NewsCategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  icon: String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  newsCount: { type: Number, default: 0 }
}, { timestamps: true });

const NewsSchema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'NewsCategory' },
  category: { type: String },
  content: { type: String },
  author: { type: String, default: 'Ban Biên Tập CTC' },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 }
}, { timestamps: true });

const NewsCategory: any = mongoose.models.NewsCategory || mongoose.model('NewsCategory', NewsCategorySchema);
const News: any = mongoose.models.News || mongoose.model('News', NewsSchema);

const DEFAULT_CATEGORIES = [
  { name: 'Tin Tức Công Ty', slug: 'tin-tuc-cong-ty', description: 'Tin tức, sự kiện và thông báo chính thức của CTC', icon: 'Building', color: '#3B82F6', order: 1 },
  { name: 'Công Nghệ Mới', slug: 'cong-nghe-moi', description: 'Cập nhật công nghệ điện mặt trời & lưu trữ BESS', icon: 'Lightbulb', color: '#F59E0B', order: 2 },
  { name: 'Chính Sách', slug: 'chinh-sach', description: 'Chính sách, nghị định & quy định về năng lượng tái tạo', icon: 'FileText', color: '#10B981', order: 3 },
  { name: 'Hướng Dẫn', slug: 'huong-dan', description: 'Hướng dẫn kỹ thuật, bảo trì & tính toán hiệu quả', icon: 'BookOpen', color: '#8B5CF6', order: 4 }
];

const UNSPLASH_NEWS_IMAGES = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80'
];

const SEED_NEWS_DATA = [
  // 1
  {
    title: 'Thông báo Lịch nghỉ Tết Nguyên Đán 2026 của CTC',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2026-02-05',
    isFeatured: true,
    featuredOrder: 1,
    image: UNSPLASH_NEWS_IMAGES[3],
    author: 'Ban Hành Chính Nhân Sự CTC',
    excerpt: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) trân trọng thông báo lịch nghỉ Tết Nguyên Đán 2026 từ ngày 27 Âm lịch đến hết mùng 6 Tết. Đội ngũ kỹ thuật O&M trực 24/7.',
    content: `Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) trân trọng thông báo tới Quý Khách hàng, Quý Đối tác và toàn thể Cán bộ nhân viên (CBCNV) lịch nghỉ Tết Nguyên Đán Bính Ngọ 2026 như sau:

1. **Thời gian nghỉ lễ:**
- **Thời gian bắt đầu nghỉ:** Từ ngày **14/02/2026** (tức 27 tháng Chạp năm Ất Tỵ).
- **Thời gian làm việc trở lại:** Ngày **23/02/2026** (tức mùng 7 tháng Giêng năm Bính Ngọ).

2. **Công tác đảm bảo kỹ thuật & vận hành O&M:**
Trong suốt thời gian nghỉ lễ, hệ thống giám sát SCADA trung tâm và Đội ngũ Kỹ thuật vận hành bảo trì (O&M) của CTC vẫn hoạt động trực ca 24/7 nhằm đảm bảo các hệ thống điện mặt trời, trạm biến áp và hạ tầng kỹ thuật của Quý khách hàng vận hành an toàn, liên tục.

- Hotline hỗ trợ sự cố khẩn cấp: **0915 059 666**
- Email tiếp nhận yêu cầu: **info@ctcdn.vn**

Kính chúc Quý Khách hàng, Quý Đối tác một năm mới An Khang Thịnh Vượng - Vạn Sự Như Ý!`
  },
  // 2
  {
    title: 'CTC ký kết hợp tác chiến lược với Tập đoàn Huawei Digital Power',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2026-01-20',
    isFeatured: true,
    featuredOrder: 2,
    image: UNSPLASH_NEWS_IMAGES[2],
    author: 'Ban Truyền Thông CTC',
    excerpt: 'Lễ ký kết đánh dấu bước tiến lớn trong việc phân phối và triển khai các giải pháp Biến tần (Inverter) thông minh và Hệ thống lưu trữ năng lượng BESS cao cấp tại Việt Nam.',
    content: `Ngày 20/01/2026, tại TP. Đà Nẵng, Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) đã chính thức tổ chức Lễ ký kết Thỏa thuận Hợp tác Chiến lược với đại diện Tập đoàn Huawei Digital Power Việt Nam.

Theo thỏa thuận, CTC trở thành đối tác chiến lược hàng đầu trong việc phân phối, tích hợp giải pháp và cung cấp dịch vụ bảo hành ủy quyền cho các dòng Inverter thông minh (FusionSolar) và Hệ thống lưu trữ điện BESS công nghiệp của Huawei tại thị trường Miền Trung và Tây Nguyên.

Phát biểu tại buổi lễ, Đại diện Ban Giám đốc CTC khẳng định: "Sự kết hợp giữa năng lực thi công EPC giàu kinh nghiệm của CTC và công nghệ dẫn đầu thế giới của Huawei sẽ mang lại cho các doanh nghiệp giải pháp năng lượng sạch an toàn, tối ưu chi phí và hiệu suất cao nhất."`
  },
  // 3
  {
    title: 'Quy hoạch Điện VIII sửa đổi: Đột phá mới cho Điện mặt trời tự sản tự tiêu',
    categorySlug: 'chinh-sach',
    date: '2026-01-15',
    isFeatured: true,
    featuredOrder: 3,
    image: UNSPLASH_NEWS_IMAGES[0],
    author: 'Chuyên gia Năng lượng CTC',
    excerpt: 'Quy hoạch Điện VIII sửa đổi mở ra cơ chế pháp lý vô cùng thuận lợi, cho phép các nhà máy và KCN chủ động lắp đặt hệ thống điện mặt trời mái nhà phục vụ tự dùng không giới hạn công suất.',
    content: `Quy hoạch phát triển điện lực quốc gia (Quy hoạch Điện VIII sửa đổi) mới ban hành đã đưa ra những định hướng đột phá cho lĩnh vực năng lượng tái tạo tại Việt Nam.

**Những điểm mới nổi bật:**
1. Khuyến khích tối đa phát triển điện mặt trời mái nhà tự sản tự tiêu cho cơ quan công sở, nhà xưởng công nghiệp.
2. Đơn giản hóa thủ tục cấp phép đầu tư và đấu nối lưới điện cho các hệ thống không phát điện thừa lên lưới EVN.
3. Ưu đãi thuế tiêu thụ năng lượng xanh và chứng nhận công trình xanh ESG cho doanh nghiệp áp dụng năng lượng sạch.

Đội ngũ chuyên gia CTC sẵn sàng tư vấn miễn phí cho các doanh nghiệp quy trình pháp lý và giải pháp kỹ thuật tối ưu theo Quy hoạch Điện VIII sửa đổi.`
  },
  // 4
  {
    title: 'Nghị định cơ chế Mua bán điện trực tiếp (DPPA): Cú hích cho doanh nghiệp sản xuất',
    categorySlug: 'chinh-sach',
    date: '2026-01-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[1],
    author: 'Ban Pháp Lý CTC',
    excerpt: 'Cơ chế DPPA chính thức cho phép các đơn vị tiêu thụ điện lớn mua điện trực tiếp từ nhà máy điện mặt trời, điện gió thông qua lưới điện quốc gia hoặc đường dây riêng.',
    content: `Nghị định quy định cơ chế mua bán điện trực tiếp (DPPA) giữa đơn vị phát điện năng lượng tái tạo và khách hàng sử dụng điện lớn đang tạo nên sức hút mạnh mẽ cho làn sóng đầu tư xanh tại Việt Nam.

Thông qua DPPA, các tập đoàn đa quốc gia và doanh nghiệp FDI tại các KCN Miền Trung có thể dễ dàng tiếp cận nguồn điện sạch, mua chứng chỉ năng lượng tái tạo (REC) và đáp ứng các tiêu chuẩn khắt khe từ thị trường nhập khẩu quốc tế.`
  },
  // 5
  {
    title: 'CTC đóng điện thành công Dự án Điện mặt trời mái nhà 5MWp tại KCN Hòa Cầm',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2026-01-05',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[4],
    author: 'Ban Quản Lý Dự Án CTC',
    excerpt: 'Dự án đóng điện đúng tiến độ sau 45 ngày thi công kỷ lục, dự kiến cung cấp hơn 6.8 triệu kWh điện sạch mỗi năm cho khu liên hợp sản xuất may mặc.',
    content: `Vào lúc 10h00 ngày 05/01/2026, Đội ngũ kỹ sư EPC của CTC đã chính thức đóng điện thành công Hệ thống điện mặt trời mái nhà công suất 5MWp tại Khu Công Nghiệp Hòa Cầm, TP. Đà Nẵng.

Hệ thống sử dụng 9.200 tấm pin quang điện công suất cao N-type TOPCon kết hợp hệ thống Biến tần trung tâm. Dự án giúp chủ đầu tư giảm phát thải hơn 5.500 tấn CO2 mỗi năm và tiết kiệm hàng tỷ đồng chi phí tiền điện.`
  },
  // 6
  {
    title: 'Giải pháp Lưu trữ Năng lượng BESS công nghiệp: Xu hướng tất yếu năm 2026',
    categorySlug: 'cong-nghe-moi',
    date: '2025-12-28',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[7],
    author: 'Phòng R&D CTC',
    excerpt: 'Hệ thống BESS (Battery Energy Storage System) giúp doanh nghiệp tích trữ lượng điện mặt trời dư thừa ban ngày để xả điện vào giờ cao điểm giá cao.',
    content: `Công nghệ lưu trữ năng lượng bằng pin Lithium (BESS) đang trở thành giải pháp trung tâm cho các nhà máy công nghiệp hiện đại.

**Lợi ích cốt lõi của BESS:**
- Sạc điện giờ thấp điểm / ban ngày và xả điện vào giờ cao điểm (Peak Shaving).
- Đóng vai trò như hệ thống UPS công suất lớn, chống sụt áp và mất điện đột ngột.
- Tối ưu hóa 100% lượng điện năng mặt trời tự sản xuất.`
  },
  // 7
  {
    title: 'Thông báo Lịch nghỉ lễ Quốc khánh 2/9 & Kế hoạch trực hỗ trợ kỹ thuật',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-08-28',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[6],
    author: 'Ban Hành Chính CTC',
    excerpt: 'CTC xin thông báo lịch nghỉ lễ Quốc khánh 2/9 kéo dài 4 ngày. Tổng đài chăm sóc khách hàng và đội kỹ thuật trực ca O&M hoạt động 24/7.',
    content: `Chào mừng Kỷ niệm Ngày Quốc khánh nước Cộng hòa Xã hội Chủ nghĩa Việt Nam 2/9, CTC xin thông báo lịch nghỉ lễ như sau:
- Nghỉ lễ từ: Thứ Bảy ngày **30/08** đến hết Thứ Ba ngày **02/09**.
- Làm việc trở lại: Thứ Tư ngày **03/09**.

Hệ thống giám sát SCADA và hotline tư vấn 0915 059 666 vẫn sẵn sàng hỗ trợ Quý khách hàng.`
  },
  // 8
  {
    title: 'Hướng dẫn bảo trì & vệ sinh tấm pin mặt trời nâng cao 25% hiệu suất',
    categorySlug: 'huong-dan',
    date: '2025-12-15',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[8],
    author: 'Đội Kỹ Thuật O&M CTC',
    excerpt: 'Bụi bẩn, phân chim và rêu bám trên bề mặt pin có thể làm giảm tới 25% sản lượng điện. Hướng dẫn quy trình rửa pin an toàn, chuẩn kỹ thuật.',
    content: `Vệ sinh tấm pin định kỳ là công tác bảo dưỡng quan trọng hàng đầu trong vận hành hệ thống điện mặt trời.

**Các bước vệ sinh tiêu chuẩn:**
1. Rửa pin vào thời điểm sáng sớm hoặc chiều mát khi tấm pin nguội.
2. Sử dụng nước sạch đã qua xử lý lọc (chỉ số TDS thấp) và chổi xoay chuyên dụng bọc sợi micro-fiber.
3. Không dùng chất tẩy rửa hóa học mạnh hoặc vòi xịt áp lực quá cao làm hỏng lớp phủ chống phản xạ (ARC).`
  },
  // 9
  {
    title: 'CTC vinh dự nhận giải thưởng "Nhà thầu EPC Năng Lượng Tái Tạo Uy Tín 2025"',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-12-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[9],
    author: 'Ban Truyền Thông CTC',
    excerpt: 'Giải thưởng ghi nhận nỗ lực vượt bậc của CTC trong việc thi công hàng trăm công trình điện mặt trời, điện gió đạt tiêu chuẩn chất lượng quốc tế.',
    content: `Tại Diễn đàn Năng lượng Xanh Việt Nam 2025, Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC) đã vinh dự được xướng tên tại danh hiệu "Nhà thầu EPC Năng Lượng Tái Tạo Uy Tín Hàng Đầu".

Giải thưởng khẳng định uy tín, thương hiệu vững chắc và cam kết đồng hành cùng sự phát triển bền vững của doanh nghiệp Việt Nam.`
  },
  // 10
  {
    title: 'Công nghệ pin N-type TOPCon: Đỉnh cao hiệu suất quang điện thế hệ mới',
    categorySlug: 'cong-nghe-moi',
    date: '2025-11-25',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[0],
    author: 'Phòng Kỹ Thuật CTC',
    excerpt: 'Pin N-type TOPCon sở hữu hiệu suất chuyển đổi lên đến 22.8%, khả năng hấp thụ ánh sáng yếu vượt trội và tỷ lệ suy hao năm đầu tiên cực thấp.',
    content: `So với công nghệ P-type PERC cũ, công nghệ N-type TOPCon mang lại nhiều ưu điểm vượt trội:
- Tỷ lệ suy hao năm đầu < 1.0% (so với 2.0% của PERC).
- Hệ số nhiệt độ cực tốt (-0.30%/°C), giúp phát điện tối ưu trong thời tiết nắng nóng miền Trung.
- Tỷ lệ mặt sau phát điện (Bifaciality) đạt tới 80-85%.`
  },
  // 11
  {
    title: 'Bài toán tối ưu chi phí điện sản xuất khi giá điện điều chỉnh tăng',
    categorySlug: 'chinh-sach',
    date: '2025-11-18',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[1],
    author: 'Chuyên gia Tài chính CTC',
    excerpt: 'Đứng trước áp lực tăng giá điện theo biểu giá mới, các doanh nghiệp sản xuất lựa chọn đầu tư Solar Rooftop để cố định chi phí năng lượng trong 25 năm.',
    content: `Giá điện sản xuất tăng trực tiếp làm giảm biên lợi nhuận của doanh nghiệp. Việc chủ động tự phát điện mặt trời trên mái nhà xưởng giúp doanh nghiệp:
- Cắt giảm tiền điện giờ cao điểm với đơn giá lên tới 3.200đ/kWh.
- Làm mát mái nhà xưởng giảm từ 3 - 5°C, tiết kiệm điện điều hòa làm mát.
- Thu hồi toàn bộ vốn đầu tư chỉ sau 3.5 đến 4 năm.`
  },
  // 12
  {
    title: 'CTC khởi công Dự án Trạm biến áp 110kV & Đường dây nối lưới tại Quảng Nam',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-11-05',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[5],
    author: 'Ban Quản Lý Dự Án CTC',
    excerpt: 'Công trình Trạm 110kV nhằm giải tỏa công suất cho cụm nhà máy năng lượng sạch, đóng góp vào sự ổn định của lưới điện quốc gia.',
    content: `Ngày 05/11/2025, CTC chính thức khởi công dự án xây dựng Trạm biến áp 110kV và đường dây đấu nối 220kV tại Quảng Nam. Dự án có tổng mức đầu tư hơn 120 tỷ đồng, dự kiến hoàn thành đưa vào vận hành trong quý II/2026.`
  },
  // 13
  {
    title: 'Thông báo Lịch nghỉ lễ Giỗ Tổ Hùng Vương & Ngày 30/4 - 1/5',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-04-20',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[3],
    author: 'Ban Hành Chính CTC',
    excerpt: 'Thông báo lịch nghỉ lễ Giỗ Tổ Hùng Vương và Ngày Chiến thắng 30/4 - Quốc tế Lao động 1/5. Trung tâm giám sát SCADA duy trì ca trực 24/7.',
    content: `CTC xin thông báo lịch nghỉ lễ 30/4 - 1/5 và Giỗ Tổ Hùng Vương đến toàn thể Quý đối tác và Cán bộ nhân viên:
- Thời gian nghỉ: 5 ngày liên tục.
- Đội ngũ hỗ trợ sự cố O&M vẫn làm việc 24/24 qua Hotline: 0915 059 666.`
  },
  // 14
  {
    title: 'Chứng chỉ Carbon (REC) & Tiêu chuẩn ESG: Chìa khóa xuất khẩu vào Châu Âu',
    categorySlug: 'chinh-sach',
    date: '2025-10-22',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[2],
    author: 'Ban Thẩm Định ESG CTC',
    excerpt: 'Cơ chế điều chỉnh biên giới carbon (CBAM) của EU bắt buộc các doanh nghiệp xuất khẩu phải minh bạch dấu chân carbon và ưu tiên dùng điện sạch.',
    content: `Áp lực từ việc đáp ứng tiêu chuẩn ESG và chứng chỉ năng lượng tái tạo quốc tế (I-REC) đang thúc đẩy hàng loạt nhà máy tại Việt Nam chuyển đổi sang điện mặt trời mái nhà.`
  },
  // 15
  {
    title: 'So sánh Inverter chuỗi (String) và Inverter trung tâm (Central Inverter)',
    categorySlug: 'huong-dan',
    date: '2025-10-15',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[7],
    author: 'Kỹ sư Trưởng CTC',
    excerpt: 'Phân tích chi tiết ưu nhược điểm kỹ thuật, khả năng mở rộng và chi phí bảo trì giữa biến tần chuỗi và biến tần trung tâm cho các dự án công nghiệp.',
    content: `Mỗi loại Inverter có ưu thế riêng:
- **String Inverter:** Phù hợp mái nhà xưởng phức tạp, linh hoạt bảo trì thay thế, không lo rủi ro dừng toàn bộ hệ thống.
- **Central Inverter:** Phù hợp trang trại solar mặt đất công suất lớn (> 10MWp), chi phí suất đầu tư ban đầu thấp hơn.`
  },
  // 16
  {
    title: 'CTC tổ chức thành công Đại hội Đồng cổ đông Thường niên 2026',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-10-02',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[4],
    author: 'Ban Thư Ký CTC',
    excerpt: 'Đại hội thông qua kế hoạch doanh thu bứt phá năm 2026, mở rộng mảng Lưu trữ BESS và Xây lắp hạ tầng Viễn thông công nghệ cao.',
    content: `Đại hội Đồng cổ đông Thường niên CTC đã diễn ra thành công tốt đẹp với sự tham dự của hơn 95% cổ đông có quyền biểu quyết. Đại hội đã thống nhất cao các chỉ tiêu kinh doanh trọng điểm năm 2026.`
  },
  // 17
  {
    title: 'Ứng dụng hệ thống Giám sát SCADA & AI trong quản lý vận hành O&M',
    categorySlug: 'cong-nghe-moi',
    date: '2025-09-20',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[9],
    author: 'Trung Tâm SCADA CTC',
    excerpt: 'Giải pháp IoT kết hợp trí tuệ nhân tạo (AI) phát hiện tự động các chuỗi pin bị suy hao, giúp giảm thời gian gián đoạn phát điện xuống mức tối đa.',
    content: `Trung tâm giám sát vận hành SCADA của CTC cho phép theo dõi chỉ số sản lượng, dòng điện, điện áp và nhiệt độ của hàng ngàn tấm pin theo thời gian thực 24/7.`
  },
  // 18
  {
    title: 'CTC khai trương Văn phòng đại diện mới tại TP. Hồ Chí Minh',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-09-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[6],
    author: 'Ban Truyền Thông CTC',
    excerpt: 'Mở rộng hiện diện tại khu vực phía Nam nhằm tư vấn và thi công nhanh chóng cho các khách hàng KCN tại Bình Dương, Đồng Nai, Long An.',
    content: `Việc đưa văn phòng TP.HCM vào hoạt động đánh dấu mốc quan trọng trong chiến lược mở rộng mạng lưới dịch vụ EPC năng lượng tái tạo của CTC trên toàn quốc.`
  },
  // 19
  {
    title: 'Hướng dẫn tính toán công suất & thời gian hoàn vốn Điện mặt trời 2026',
    categorySlug: 'huong-dan',
    date: '2025-09-01',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[8],
    author: 'Phòng Tư Vấn Dự Án CTC',
    excerpt: 'Bảng công thức tính toán sản lượng điện thu được theo tọa độ địa lý và cách xác định dòng tiền tiết kiệm hàng tháng cho hộ kinh doanh & nhà máy.',
    content: `Công thức cơ bản tính sản lượng điện mặt trời hàng tháng:
**Sản lượng (kWh) = Công suất (kWp) × Số giờ nắng trung bình/ngày (4.2 - 4.8h) × 30 ngày × 0.82 (Hệ số hao hụt)**.`
  },
  // 20
  {
    title: 'CTC đồng hành cùng Giải chạy Thiện nguyện "Vì Năng Lượng Xanh 2026"',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-08-15',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[5],
    author: 'Ban Đoàn Thể CTC',
    excerpt: 'Hơn 200 CBCNV CTC tham gia chạy bộ gây quỹ trồng 5.000 cây xanh và trao tặng hệ thống đèn năng lượng mặt trời cho các điểm trường vùng cao.',
    content: `Giải chạy thường niên do CTC tài trợ chính đã quyên góp được hơn 300 triệu đồng ủng hộ công tác thiện nguyện vì cộng đồng và môi trường xanh.`
  },
  // 21
  {
    title: 'Nghị định mới về an toàn phòng cháy chữa cháy (PCCC) cho Điện mặt trời mái nhà',
    categorySlug: 'chinh-sach',
    date: '2025-08-05',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[1],
    author: 'Ban An Toàn CTC',
    excerpt: 'Tổng hợp quy định chuẩn về hồ sơ thiết kế thẩm duyệt PCCC, lối đi thoát nạn trên mái và thiết bị ngắt khẩn cấp Rapid Shutdown.',
    content: `Các công trình điện mặt trời mái nhà xưởng từ 100kWp trở lên bắt buộc phải tuân thủ nghiêm ngặt các quy định PCCC mới nhất để được nghiệm thu đưa vào sử dụng.`
  },
  // 22
  {
    title: 'Công nghệ lưu trữ Pin Sodium-ion: Liệu có thay thế được Pin Lithium-ion?',
    categorySlug: 'cong-nghe-moi',
    date: '2025-07-20',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[0],
    author: 'Phòng R&D CTC',
    excerpt: 'Pin Sodium-ion với nguyên liệu Natri dồi dào, chi phí thấp hơn 30% và khả năng chống cháy nổ tuyệt đối đang nhận được sự quan tâm lớn.',
    content: `So sánh chi tiết thông số kỹ thuật, chu kỳ sạc xả và tiềm năng thương mại hóa của công nghệ pin lưu trữ Sodium-ion trong giai đoạn 2026 - 2030.`
  },
  // 23
  {
    title: 'CTC nghiệm thu Hệ thống Microgrid độc lập cho Trạm thu phát sóng Viễn thông',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-07-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[2],
    author: 'Ban Viễn Thông CTC',
    excerpt: 'Mô hình điện mặt trời + lưu trữ BESS giúp các trạm thu phát sóng BTS ngoài đảo xa và vùng hải đảo duy trì sóng viễn thông liên tục 100%.',
    content: `CTC đã bàn giao công trình Microgrid nguồn điện độc lập cho trạm BTS vùng biển đảo, loại bỏ hoàn toàn sự phụ thuộc vào máy phát điện chạy dầu diesel đắt đỏ.`
  },
  // 24
  {
    title: 'Thông báo tuyển dụng 20 Kỹ sư Điện EPC & Quản lý Dự án Năng Lượng',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-07-01',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[4],
    author: 'Phòng Tuyển Dụng CTC',
    excerpt: 'CTC mở rộng đội ngũ nhân sự kỹ thuật, tuyển dụng Kỹ sư Thiết kế Điện, Kỹ sư Giám sát Thi công và Chuyên viên Quản lý Dự án làm việc tại Đà Nẵng.',
    content: `Ứng tuyển ngay để gia nhập môi trường làm việc năng động, chuyên nghiệp tại CTC với mức lương thưởng hấp dẫn và cơ hội đào tạo chuyên sâu.`
  },
  // 25
  {
    title: 'Giải pháp chống ngập & An toàn điện cho hệ thống Solar Rooftop mùa mưa bão',
    categorySlug: 'huong-dan',
    date: '2025-06-20',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[8],
    author: 'Đội Thi Công CTC',
    excerpt: 'Khuyến cáo kỹ thuật ứng phó mùa bão Miền Trung: Gia cố hệ thống kẹp xà gồ, siết lực bu-lông mạ kẽm nhúng nóng và kiểm tra điện trở tiếp địa.',
    content: `Mùa mưa bão tại Miền Trung đòi hỏi các hệ thống điện mặt trời phải được kiểm tra gia cố cơ khí chắc chắn, chịu được gió bão giật cấp 12 - 14.`
  },
  // 26
  {
    title: 'CTC tài trợ Học bổng "Kỹ Sư Năng Lượng Tương Lai" tại ĐH Bách Khoa Đà Nẵng',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-06-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[3],
    author: 'Ban Truyền Thông CTC',
    excerpt: 'Trao tặng 30 suất học bổng toàn phần và cam kết cơ hội thực tập, tuyển dụng trực tiếp cho sinh viên xuất sắc ngành Kỹ thuật Điện & Năng lượng.',
    content: `Chương trình hợp tác đào tạo giữa CTC và Đại học Bách Khoa Đà Nẵng góp phần xây dựng nguồn nhân lực chất lượng cao cho ngành năng lượng sạch Việt Nam.`
  },
  // 27
  {
    title: 'Xu hướng mô hình ESCO: Lắp điện mặt trời 0 đồng cho doanh nghiệp',
    categorySlug: 'chinh-sach',
    date: '2025-05-25',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[7],
    author: 'Ban Đầu Tư ESCO CTC',
    excerpt: 'Mô hình ESCO cho phép doanh nghiệp tận dụng mái nhà xưởng nhàn rỗi để lắp điện mặt trời mà không bỏ bất kỳ khoản vốn đầu tư ban đầu nào.',
    content: `Quỹ đầu tư đối tác của CTC chịu 100% chi phí thiết bị và thi công. Doanh nghiệp chỉ việc mua lại điện sạch với giá chiết khấu từ 15 - 25% so với giá EVN.`
  },
  // 28
  {
    title: 'Hội thảo Chuyên đề: "Chuyển đổi Xanh & Tiết kiệm Năng lượng cho Khu công nghiệp"',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-05-15',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[6],
    author: 'Ban Tổ Chức CTC',
    excerpt: 'Sự kiện quy tụ hơn 100 đại diện doanh nghiệp FDI và các chuyên gia hàng đầu thảo luận lộ trình Net-Zero và giải pháp giảm nhẹ dấu chân carbon.',
    content: `Hội thảo đã diễn ra thành công tại Đà Nẵng, mang lại nhiều góc nhìn thực tiễn và giải pháp tài chính xanh khả thi cho các nhà máy sản xuất.`
  },
  // 29
  {
    title: 'Bộ chuyển đổi Microinverter: Giải pháp an toàn tuyệt đối cho công trình dân dụng',
    categorySlug: 'cong-nghe-moi',
    date: '2025-05-02',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[9],
    author: 'Kỹ sư Sản Phẩm CTC',
    excerpt: 'Microinverter giúp từng tấm pin hoạt động độc lập, không lo giảm hiệu suất do che bóng cục bộ và triệt tiêu rủi ro điện áp DC cao áp trên mái.',
    content: `Giải pháp Microinverter là lựa chọn hoàn hảo cho các công trình biệt thự, tòa nhà văn phòng và các dự án đòi hỏi chuẩn an toàn cháy nổ cao nhất.`
  },
  // 30
  {
    title: 'Thông báo Lịch diễn tập An toàn lao động & PCCC định kỳ năm 2026 tại CTC',
    categorySlug: 'tin-tuc-cong-ty',
    date: '2025-04-10',
    isFeatured: false,
    featuredOrder: 0,
    image: UNSPLASH_NEWS_IMAGES[5],
    author: 'Ban An Toàn Lao Động CTC',
    excerpt: 'CTC phối hợp cùng Cảnh sát PCCC tổ chức đợt huấn luyện an toàn làm việc trên cao và tập huấn xử lý sự cố điện cho toàn bộ đội ngũ thi công.',
    content: `An toàn lao động và bảo vệ sức khỏe con người là ưu tiên hàng đầu tại mọi công trường do CTC đảm nhận thi công.`
  }
];

async function seed30News() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Ensure categories exist
    console.log('\nChecking News Categories...');
    const categoryMap: { [slug: string]: any } = {};

    for (const catData of DEFAULT_CATEGORIES) {
      let cat = await NewsCategory.findOne({ slug: catData.slug });
      if (!cat) {
        cat = new NewsCategory({ ...catData, newsCount: 0 });
        await cat.save();
        console.log(`+ Created Category: ${cat.name}`);
      } else {
        console.log(`= Existing Category: ${cat.name}`);
      }
      categoryMap[catData.slug] = cat;
    }

    // 2. Clear existing news and insert 30 new items
    console.log('\nClearing existing news items...');
    await News.deleteMany({});
    console.log('Cleared existing news items.');

    console.log('\nInserting 30 news articles...');
    let count = 0;
    for (const itemData of SEED_NEWS_DATA) {
      const categoryObj = categoryMap[itemData.categorySlug];
      
      const newsArticle = new News({
        title: itemData.title,
        excerpt: itemData.excerpt,
        date: itemData.date,
        image: itemData.image,
        content: itemData.content,
        author: itemData.author,
        isFeatured: itemData.isFeatured,
        featuredOrder: itemData.featuredOrder,
        categoryId: categoryObj ? categoryObj._id : undefined,
        category: categoryObj ? categoryObj.name : 'Tin Tức Công Ty'
      });

      await newsArticle.save();
      count++;
      console.log(`✓ [${count}/30] ${itemData.title}`);
    }

    // 3. Update category counts
    console.log('\nUpdating news counts per category...');
    for (const slug in categoryMap) {
      const catObj = categoryMap[slug];
      const itemCount = await News.countDocuments({ categoryId: catObj._id });
      await NewsCategory.findByIdAndUpdate(catObj._id, { newsCount: itemCount });
      console.log(`Updated ${catObj.name}: ${itemCount} articles.`);
    }

    console.log('\n✅ Successfully seeded 30 rich news articles!');
  } catch (error) {
    console.error('Error seeding 30 news articles:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed30News();
