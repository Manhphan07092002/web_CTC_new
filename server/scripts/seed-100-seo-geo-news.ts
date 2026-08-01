/**
 * Seed 100 bài viết SEO + GEO cho CTC
 *
 * Cơ sở xây dựng:
 * - Cây sản phẩm/dịch vụ hiện có của ctcdn.vn.
 * - Hồ sơ năng lực HSNL 06.2026 CTC Solar.
 * - Cụm nhu cầu tìm kiếm: Solar, ắc quy, mạng, cáp quang, VoIP,
 *   máy chủ/Data Center, điện gió, trạm 110kV và dịch vụ theo khu vực.
 *
 * LƯU Ý SEO:
 * - Mặc định bài được tạo ở trạng thái draft và robots noindex.
 * - Chỉ bật xuất bản sau khi kỹ sư/biên tập viên kiểm tra thông số, nguồn,
 *   ảnh, liên kết nội bộ và phạm vi công việc của CTC.
 * - Không tạo doorway page chỉ thay tên tỉnh.
 *
 * Chạy:
 *   npx tsx server/scripts/seed-100-seo-geo-news.ts
 *
 * Docker:
 *   docker compose exec app npx tsx server/scripts/seed-100-seo-geo-news.ts
 */

import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://ctcdn.vn').replace(/\/$/, '');
const PUBLISH_NEWS = String(process.env.PUBLISH_NEWS || 'true').toLowerCase() === 'true';
const INDEX_NEWS = String(process.env.INDEX_NEWS || 'true').toLowerCase() === 'true';
const RESET_ALL = String(process.env.RESET_ALL || 'true').toLowerCase() !== 'false';
const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';

const SEED_SOURCE = 'ctcdn-keyword-plan-2026-v1';

const COMPANY = {
  name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
  alternateName: 'CTC',
  url: SITE_ORIGIN,
  address: {
    streetAddress: '50B Nguyễn Du',
    addressLocality: 'Đà Nẵng',
    addressCountry: 'VN',
  },
  areaServed: 'Việt Nam',
};

// -----------------------------------------------------------------------------
// Inline schema: không phụ thuộc tên model hiện có trong dự án.
// Hãy đối chiếu field với frontend trước khi chạy trên production.
// -----------------------------------------------------------------------------
const NewsCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    articleCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const NewsArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'NewsCategory' },
    coverImage: String,
    imageAlt: String,
    authorName: { type: String, default: 'Ban biên tập CTC' },
    reviewerName: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    tags: [String],
    seo: Schema.Types.Mixed,
    geo: Schema.Types.Mixed,
    structuredData: Schema.Types.Mixed,
    editorial: Schema.Types.Mixed,
    seedSource: String,
  },
  { timestamps: true, minimize: false }
);

const NewsCategory =
  mongoose.models.NewsCategory ||
  mongoose.model('NewsCategory', NewsCategorySchema);

const NewsArticle =
  mongoose.models.News ||
  mongoose.model('News', NewsArticleSchema);

type ClusterKey =
  | 'solar'
  | 'battery'
  | 'router'
  | 'switchwifi'
  | 'fiber'
  | 'voip'
  | 'datacenter'
  | 'energy'
  | 'ctc'
  | 'geo';

type Topic = {
  id: number;
  cluster: ClusterKey;
  title: string;
  primaryKeyword: string;
  answerFirst: string;
  region: string;
  keyPoints: string[];
};

type Cluster = {
  category: string;
  slug: string;
  description: string;
  overview: string;
  steps: string[];
  mistakes: string[];
  internalLinks: string[];
  image: string;
};

const CLUSTERS: Record<ClusterKey, Cluster> = {
  "solar": {
    "category": "Điện Mặt Trời",
    "slug": "dien-mat-troi",
    "description": "Kiến thức thiết kế, lựa chọn thiết bị, thi công, nghiệm thu và vận hành hệ thống điện mặt trời.",
    "overview": "Điện mặt trời là nhóm nội dung có khả năng tạo cả lưu lượng tìm kiếm thông tin lẫn nhu cầu tư vấn dự án. Nội dung cần đi từ bài toán phụ tải, hiện trạng mái, phương án đấu nối đến vận hành và bảo trì, thay vì chỉ giới thiệu thiết bị.",
    "steps": [
      "Thu thập hóa đơn điện, biểu đồ phụ tải và mục tiêu đầu tư.",
      "Khảo sát mái, kết cấu, hướng nắng, bóng che, tủ điện và điểm đấu nối.",
      "Thiết kế sơ bộ công suất DC/AC, chuỗi pin, bảo vệ và hệ thống giám sát.",
      "Đối chiếu phương án kỹ thuật, phạm vi công việc, tiến độ và điều kiện bảo hành.",
      "Nghiệm thu hồ sơ hoàn công, cấu hình giám sát và kế hoạch O&M."
    ],
    "mistakes": [
      "Chọn công suất chỉ theo diện tích mái mà không xét biểu đồ phụ tải.",
      "Sao chép thông số từ dự án khác mà không khảo sát kết cấu và điểm đấu nối.",
      "Chỉ so sánh giá thiết bị, bỏ qua bảo vệ điện, giám sát và chi phí vận hành."
    ],
    "internalLinks": [
      "/san-pham/tam-pin-nang-luong-mat-troi",
      "/san-pham/inverter-hoa-luoi",
      "/du-an/dien-mat-troi"
    ],
    "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=82"
  },
  "battery": {
    "category": "Ắc Quy & Lưu Trữ Điện",
    "slug": "ac-quy-luu-tru-dien",
    "description": "Hướng dẫn lựa chọn, kiểm tra, lắp đặt và bảo trì ắc quy Lithium, VRLA, OPzS và hệ thống lưu trữ.",
    "overview": "Nhóm từ khóa ắc quy có ý định mua hàng cao nhưng dễ phát sinh rủi ro nếu nội dung khẳng định thông số hoặc tuổi thọ thiếu nguồn. Bài viết nên tập trung vào điện áp hệ thống, dòng tải, thời gian lưu điện, môi trường lắp đặt và khả năng tích hợp BMS.",
    "steps": [
      "Xác định điện áp DC, công suất tải và thời gian dự phòng yêu cầu.",
      "Kiểm tra dòng sạc, dòng xả, số chu kỳ và giao thức giám sát.",
      "Tính số lượng chuỗi, tiết diện cáp, bảo vệ DC và không gian tủ.",
      "Đánh giá điều kiện nhiệt độ, thông gió, phòng cháy và bảo trì.",
      "Lập kế hoạch đo nội trở, cân bằng chuỗi và thay thế theo tình trạng."
    ],
    "mistakes": [
      "So sánh pin chỉ dựa trên dung lượng Ah mà bỏ qua điện áp và công suất xả.",
      "Trộn bình khác tuổi, khác dung lượng hoặc khác tình trạng trong cùng chuỗi.",
      "Không kiểm tra tương thích giữa BMS, bộ nguồn, UPS hoặc inverter."
    ],
    "internalLinks": [
      "/san-pham/ac-quy-lithium",
      "/san-pham/ac-quy-chi",
      "/san-pham/ac-quy-nuoc"
    ],
    "image": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1400&q=82"
  },
  "router": {
    "category": "Router & Thiết Bị Mạng",
    "slug": "router-thiet-bi-mang",
    "description": "Tư vấn router doanh nghiệp, cân bằng tải, VPN, QoS, bảo mật và thiết kế mạng đa WAN.",
    "overview": "Từ khóa router có thể tiếp cận người mua thiết bị và người đang cần xử lý lỗi mạng. Nội dung tốt phải gắn model với số người dùng, băng thông, số phiên kết nối, VPN, chính sách bảo mật và phương án dự phòng.",
    "steps": [
      "Đo băng thông thực tế, số người dùng đồng thời và loại ứng dụng.",
      "Xác định số đường WAN, nhu cầu VPN, QoS, captive portal và firewall.",
      "Lập sơ đồ mạng, VLAN, địa chỉ IP và chính sách truy cập.",
      "Thử tải, kiểm tra failover và lưu cấu hình dự phòng.",
      "Theo dõi CPU, RAM, phiên kết nối và nhật ký sau khi đưa vào vận hành."
    ],
    "mistakes": [
      "Chọn router theo tốc độ cổng mà không xét thông lượng khi bật firewall hoặc VPN.",
      "Cấu hình cân bằng tải nhưng không kiểm tra phiên ngân hàng, họp trực tuyến và ứng dụng nhạy IP.",
      "Không lưu cấu hình, không cập nhật firmware và không phân quyền tài khoản quản trị."
    ],
    "internalLinks": [
      "/san-pham/router",
      "/san-pham/thiet-bi-can-bang-tai",
      "/thuong-hieu/mikrotik",
      "/thuong-hieu/draytek"
    ],
    "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=82"
  },
  "switchwifi": {
    "category": "Switch & Wi-Fi Doanh Nghiệp",
    "slug": "switch-wifi-doanh-nghiep",
    "description": "Thiết kế mạng core/access, PoE, VLAN, Wi-Fi 6, roaming và vùng phủ cho doanh nghiệp.",
    "overview": "Switch và Wi-Fi là cụm chủ đề phù hợp với doanh nghiệp, khách sạn, trường học, nhà máy và kho vận. Bài viết nên giải thích kiến trúc core-access, ngân sách PoE, uplink, số lượng client và phương pháp khảo sát sóng.",
    "steps": [
      "Lập sơ đồ mặt bằng, vị trí tủ mạng, số điểm mạng và số thiết bị không dây.",
      "Tính số cổng, ngân sách PoE, uplink và dung lượng chuyển mạch.",
      "Thiết kế VLAN, STP, LACP, roaming và chính sách khách/nội bộ.",
      "Khảo sát phổ tần, bố trí AP và kiểm tra vùng phủ sau lắp đặt.",
      "Giám sát lỗi cổng, mức sử dụng PoE, nhiễu và trải nghiệm người dùng."
    ],
    "mistakes": [
      "Đếm số cổng nhưng không chừa dung lượng mở rộng và uplink.",
      "Bố trí AP theo khoảng cách đều mà không xét vật liệu tường và mật độ người dùng.",
      "Dùng chung một VLAN cho camera, khách, văn phòng và thiết bị quản trị."
    ],
    "internalLinks": [
      "/san-pham/switch",
      "/san-pham/wifi-access-point",
      "/thuong-hieu/tp-link",
      "/thuong-hieu/mikrotik"
    ],
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=82"
  },
  "fiber": {
    "category": "Cáp Quang & Hạ Tầng Kết Nối",
    "slug": "cap-quang-ha-tang-ket-noi",
    "description": "Kiến thức SFP, ODF, cáp quang, OTDR, suy hao, cáp mạng và hệ thống cáp cấu trúc.",
    "overview": "Cụm cáp quang có khả năng xây dựng uy tín kỹ thuật cho CTC vì gắn trực tiếp với năng lực thi công hạ tầng truyền dẫn. Nội dung nên làm rõ loại sợi, khoảng cách, đầu nối, ngân sách suy hao, phương pháp đo và hồ sơ nghiệm thu.",
    "steps": [
      "Xác định tuyến, khoảng cách, số core, môi trường treo/cống/chôn và dự phòng.",
      "Chọn loại sợi, cáp, ODF, adapter, pigtail và module quang tương thích.",
      "Lập ngân sách suy hao, kế hoạch hàn nối và đánh số tuyến.",
      "Đo OTDR, công suất quang hai chiều và kiểm tra đầu nối.",
      "Bàn giao sơ đồ tuyến, biên bản đo, ảnh mối hàn và kế hoạch bảo trì."
    ],
    "mistakes": [
      "Ghép sai bước sóng, loại sợi hoặc khoảng cách của SFP.",
      "Không vệ sinh đầu nối trước khi đo và trước khi cắm thiết bị.",
      "Thiếu nhãn, sơ đồ core và hồ sơ đo khiến việc xử lý sự cố kéo dài."
    ],
    "internalLinks": [
      "/san-pham/cap-quang",
      "/san-pham/sfp",
      "/san-pham/odf",
      "/san-pham/patch-panel"
    ],
    "image": "https://images.unsplash.com/photo-1551703599-6b3e8379aa8f?auto=format&fit=crop&w=1400&q=82"
  },
  "voip": {
    "category": "Tổng Đài & VoIP",
    "slug": "tong-dai-voip",
    "description": "Tư vấn VoIP Gateway, IP PBX, SIP Trunk, điện thoại IP và chuyển đổi tổng đài doanh nghiệp.",
    "overview": "Nội dung VoIP nên trả lời rõ doanh nghiệp có bao nhiêu máy lẻ, bao nhiêu cuộc gọi đồng thời, cần giữ số analog hay không, có ghi âm và kết nối chi nhánh hay không. Đây là cách chuyển truy vấn kỹ thuật thành nhu cầu tư vấn thực tế.",
    "steps": [
      "Thống kê số máy lẻ, số trung kế, số cuộc gọi đồng thời và số chi nhánh.",
      "Xác định cổng FXS/FXO/E1, SIP trunk, ghi âm, IVR và call center.",
      "Thiết kế VLAN thoại, QoS, nguồn PoE và phương án dự phòng Internet.",
      "Cấu hình bảo mật SIP, giới hạn cuộc gọi và sao lưu hệ thống.",
      "Kiểm thử chất lượng thoại, kịch bản chuyển cuộc và báo cáo cuộc gọi."
    ],
    "mistakes": [
      "Nhầm cổng FXS và FXO khi kết nối điện thoại hoặc đường bưu điện.",
      "Không tách VLAN thoại và không ưu tiên QoS.",
      "Mở SIP ra Internet mà không giới hạn IP, mật khẩu và chống dò quét."
    ],
    "internalLinks": [
      "/san-pham/voip-gateway",
      "/san-pham/ip-pbx",
      "/san-pham/dien-thoai-ip",
      "/thuong-hieu/dinstar"
    ],
    "image": "https://images.unsplash.com/photo-1580894732468-058f747280f2?auto=format&fit=crop&w=1400&q=82"
  },
  "datacenter": {
    "category": "Máy Chủ & Data Center",
    "slug": "may-chu-data-center",
    "description": "Máy chủ, tủ rack, UPS, làm mát, giám sát, sao lưu và vận hành phòng máy doanh nghiệp.",
    "overview": "Cụm máy chủ và Data Center cần gắn thiết bị với tải ứng dụng, độ sẵn sàng, dự phòng nguồn, làm mát và kế hoạch sao lưu. Nội dung chỉ liệt kê CPU/RAM sẽ khó tạo khác biệt và không giải quyết bài toán đầu tư.",
    "steps": [
      "Khảo sát ứng dụng, số người dùng, dữ liệu tăng trưởng và thời gian gián đoạn cho phép.",
      "Thiết kế máy chủ, lưu trữ, mạng, ảo hóa và dự phòng phù hợp.",
      "Tính tải điện, UPS, PDU, điều hòa, tủ rack và tiếp địa.",
      "Thiết lập giám sát, cảnh báo, sao lưu và kiểm thử khôi phục.",
      "Lập tài liệu vận hành, phân quyền và kế hoạch mở rộng."
    ],
    "mistakes": [
      "Mua cấu hình cao nhưng không có kế hoạch lưu trữ, sao lưu và bản quyền.",
      "Tính UPS theo công suất danh định mà bỏ qua thời gian lưu điện và hệ số tải.",
      "Không thử khôi phục dữ liệu định kỳ."
    ],
    "internalLinks": [
      "/san-pham/may-chu",
      "/san-pham/mini-pc",
      "/san-pham/kiosk",
      "/giai-phap/data-center"
    ],
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=82"
  },
  "energy": {
    "category": "Điện Gió & Trạm 110kV",
    "slug": "dien-gio-tram-110kv",
    "description": "Cột đo gió, SCADA, trạm biến áp 110kV, tiếp địa, bảo vệ và hạ tầng năng lượng tái tạo.",
    "overview": "Điện gió và trạm 110kV là cụm nội dung thể hiện năng lực dự án nhưng yêu cầu kiểm soát độ chính xác cao. Bài viết nên giải thích phạm vi công việc, giao diện giữa các hệ thống và hồ sơ nghiệm thu; không tự suy diễn thông số của dự án.",
    "steps": [
      "Xác định phạm vi thiết kế, cung cấp, xây lắp, thử nghiệm và bàn giao.",
      "Rà soát giao diện giữa phần nhất thứ, nhị thứ, SCADA, viễn thông và xây dựng.",
      "Lập kế hoạch an toàn, tiếp địa, thí nghiệm và cắt điện.",
      "Quản lý hồ sơ vật tư, bản vẽ, biên bản thử nghiệm và hoàn công.",
      "Bàn giao quy trình vận hành, bảo trì và xử lý cảnh báo."
    ],
    "mistakes": [
      "Không làm rõ ranh giới trách nhiệm giữa các nhà thầu.",
      "Thiếu đồng bộ địa chỉ tín hiệu và giao thức giữa thiết bị và SCADA.",
      "Tập trung tiến độ lắp đặt nhưng chậm hồ sơ thí nghiệm, hoàn công."
    ],
    "internalLinks": [
      "/du-an/dien-gio",
      "/du-an/tram-110kv",
      "/giai-phap/scada",
      "/lien-he"
    ],
    "image": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1400&q=82"
  },
  "ctc": {
    "category": "Dự Án & Năng Lực CTC",
    "slug": "du-an-nang-luc-ctc",
    "description": "Giới thiệu năng lực, kinh nghiệm và các dự án tiêu biểu có căn cứ từ hồ sơ năng lực CTC.",
    "overview": "Bài dự án phải phân biệt rõ dữ liệu đã được hồ sơ năng lực xác nhận với nhận định biên tập. Mỗi bài nên nêu quy mô, địa điểm, phạm vi công việc được ghi nhận và bài học kỹ thuật; không bổ sung giá trị, tiến độ hoặc hiệu quả nếu không có tài liệu.",
    "steps": [
      "Đối chiếu tên dự án, chủ đầu tư, địa điểm, công suất và trạng thái trong hồ sơ.",
      "Xác định chính xác phần việc do CTC thực hiện.",
      "Chọn hình ảnh, biên bản hoặc tài liệu có quyền sử dụng.",
      "Viết bài theo cấu trúc bối cảnh, phạm vi, giải pháp và bài học.",
      "Duyệt pháp lý và kỹ thuật trước khi công bố."
    ],
    "mistakes": [
      "Ghi CTC là tổng thầu EPC khi hồ sơ chỉ thể hiện nhân công hoặc vật tư phụ.",
      "Tự thêm sản lượng, mức tiết kiệm hoặc thời gian hoàn vốn.",
      "Dùng hình ảnh dự án khác hoặc ảnh minh họa nhưng không ghi chú."
    ],
    "internalLinks": [
      "/gioi-thieu",
      "/du-an",
      "/ho-so-nang-luc",
      "/lien-he"
    ],
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=82"
  },
  "geo": {
    "category": "Giải Pháp Theo Khu Vực",
    "slug": "giai-phap-theo-khu-vuc",
    "description": "Nội dung tư vấn theo điều kiện triển khai thực tế tại Đà Nẵng, miền Trung, Tây Nguyên và các trung tâm kinh tế.",
    "overview": "GEO không có nghĩa là thay một tên tỉnh vào cùng một bài viết. Nội dung địa phương phải có lý do tồn tại: điều kiện khí hậu, mô hình phụ tải, khoảng cách hỗ trợ, loại công trình hoặc kinh nghiệm dự án liên quan.",
    "steps": [
      "Xác định nhu cầu và loại công trình phổ biến tại khu vực.",
      "Phân tích điều kiện khí hậu, hạ tầng, khoảng cách vận chuyển và hỗ trợ kỹ thuật.",
      "Đề xuất nhóm giải pháp phù hợp thay vì liệt kê toàn bộ sản phẩm.",
      "Nêu rõ phạm vi phục vụ và đầu mối khảo sát.",
      "Liên kết đến bài kỹ thuật và dự án có liên quan."
    ],
    "mistakes": [
      "Tạo hàng loạt trang chỉ thay tên địa phương.",
      "Khẳng định có chi nhánh hoặc đội kỹ thuật tại địa phương khi không có.",
      "Dùng địa chỉ hoặc tọa độ không chính xác trong schema."
    ],
    "internalLinks": [
      "/lien-he",
      "/du-an",
      "/san-pham",
      "/giai-phap"
    ],
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82"
  }
} as Record<ClusterKey, Cluster>;

const TOPICS: Topic[] = [
  {
    "id": 1,
    "cluster": "solar",
    "title": "Điện mặt trời áp mái nhà xưởng: Quy trình khảo sát trước khi báo giá",
    "primaryKeyword": "thi công điện mặt trời áp mái nhà xưởng",
    "answerFirst": "Một báo giá đáng tin cậy phải bắt đầu từ phụ tải điện, kết cấu mái, bóng che, điểm đấu nối và phạm vi nghiệm thu; chỉ dùng diện tích mái để ước tính là chưa đủ.",
    "region": "Đà Nẵng và miền Trung",
    "keyPoints": [
      "biểu đồ phụ tải theo giờ",
      "khả năng chịu tải của mái",
      "tỷ lệ DC/AC và điểm đấu nối",
      "phạm vi bảo vệ, giám sát và O&M"
    ]
  },
  {
    "id": 2,
    "cluster": "solar",
    "title": "Cách tính công suất điện mặt trời phù hợp cho doanh nghiệp",
    "primaryKeyword": "cách tính công suất điện mặt trời cho doanh nghiệp",
    "answerFirst": "Công suất phù hợp là mức giúp tối ưu điện tự dùng trong khung giờ nắng, phù hợp diện tích mái và giới hạn đấu nối, không phải lúc nào cũng là công suất lớn nhất có thể lắp.",
    "region": "Việt Nam",
    "keyPoints": [
      "điện năng tiêu thụ ban ngày",
      "diện tích và hướng mái khả dụng",
      "giới hạn công suất tủ điện",
      "mục tiêu tự dùng hay có lưu trữ"
    ]
  },
  {
    "id": 3,
    "cluster": "solar",
    "title": "Inverter hòa lưới 3 pha: 7 tiêu chí chọn cho nhà xưởng",
    "primaryKeyword": "inverter hòa lưới 3 pha",
    "answerFirst": "Doanh nghiệp nên so sánh inverter theo dải MPPT, dòng đầu vào, hiệu suất trong điều kiện vận hành, cấp bảo vệ, giao tiếp giám sát, bảo hành và khả năng hỗ trợ kỹ thuật.",
    "region": "Miền Trung",
    "keyPoints": [
      "số MPPT và dòng chuỗi",
      "điện áp lưới và công suất AC",
      "IP, chống ăn mòn và làm mát",
      "giao tiếp SCADA và bảo hành"
    ]
  },
  {
    "id": 4,
    "cluster": "solar",
    "title": "Tấm pin TOPCon và Mono PERC khác nhau thế nào?",
    "primaryKeyword": "tấm pin TOPCon và Mono PERC",
    "answerFirst": "TOPCon và PERC khác nhau về cấu trúc cell, hiệu suất, hệ số nhiệt và lộ trình suy giảm; lựa chọn phải dựa trên datasheet cùng điều kiện dự án thay vì chỉ nhìn công suất danh định.",
    "region": "Việt Nam",
    "keyPoints": [
      "hiệu suất module",
      "hệ số nhiệt công suất",
      "suy giảm năm đầu và dài hạn",
      "kích thước, tải trọng và bảo hành"
    ]
  },
  {
    "id": 5,
    "cluster": "solar",
    "title": "Hệ điện mặt trời 100 kWp cần những thiết bị gì?",
    "primaryKeyword": "hệ điện mặt trời 100 kWp",
    "answerFirst": "Một hệ 100 kWp thường gồm module PV, inverter, khung đỡ, tủ DC/AC, cáp, bảo vệ, tiếp địa, giám sát và hồ sơ nghiệm thu; cấu hình chi tiết phụ thuộc mái và lưới điện.",
    "region": "Quảng Nam - Đà Nẵng",
    "keyPoints": [
      "số lượng module theo công suất thực",
      "phân chuỗi và chọn inverter",
      "tủ điện, SPD và tiếp địa",
      "giám sát, hồ sơ và O&M"
    ]
  },
  {
    "id": 6,
    "cluster": "solar",
    "title": "Bảo trì điện mặt trời O&M: Checklist theo tháng, quý và năm",
    "primaryKeyword": "bảo trì điện mặt trời O&M",
    "answerFirst": "O&M hiệu quả không chỉ là vệ sinh tấm pin mà còn theo dõi sản lượng, nhiệt điểm, đầu nối, bảo vệ điện, kết cấu và cảnh báo inverter theo chu kỳ.",
    "region": "Việt Nam",
    "keyPoints": [
      "so sánh sản lượng kỳ vọng",
      "kiểm tra nhiệt điểm và đầu nối",
      "vệ sinh theo điều kiện môi trường",
      "lưu lịch sử lỗi và biên bản bảo trì"
    ]
  },
  {
    "id": 7,
    "cluster": "solar",
    "title": "Chống sét và tiếp địa cho hệ thống điện mặt trời áp mái",
    "primaryKeyword": "chống sét điện mặt trời áp mái",
    "answerFirst": "Thiết kế chống sét cần phối hợp SPD DC/AC, tiếp địa khung, phân vùng bảo vệ, khoảng cách cáp và hệ thống chống sét hiện hữu của công trình.",
    "region": "Miền Trung",
    "keyPoints": [
      "đánh giá hệ thống chống sét hiện hữu",
      "chọn SPD đúng điện áp và kiểu",
      "liên kết đẳng thế khung pin",
      "đo điện trở tiếp địa sau thi công"
    ]
  },
  {
    "id": 8,
    "cluster": "solar",
    "title": "Giám sát sản lượng điện mặt trời: Chỉ số nào cần theo dõi?",
    "primaryKeyword": "giám sát sản lượng điện mặt trời",
    "answerFirst": "Doanh nghiệp nên theo dõi sản lượng ngày, công suất đỉnh, PR hoặc chỉ số hiệu quả tương đương, cảnh báo inverter, mất kết nối và chênh lệch giữa các MPPT.",
    "region": "Việt Nam",
    "keyPoints": [
      "sản lượng thực tế so với kỳ vọng",
      "đường cong công suất trong ngày",
      "cảnh báo và thời gian mất điện",
      "chênh lệch chuỗi và MPPT"
    ]
  },
  {
    "id": 9,
    "cluster": "solar",
    "title": "Kiểm tra mái trước khi lắp điện mặt trời nhà xưởng",
    "primaryKeyword": "kiểm tra mái lắp điện mặt trời",
    "answerFirst": "Khảo sát mái phải đánh giá tuổi thọ tôn, xà gồ, tải trọng, thấm dột, hành lang bảo trì, thoát nước và phương án chống ăn mòn trước khi chốt thiết kế.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "hiện trạng tôn và xà gồ",
      "tải trọng bổ sung và tải gió",
      "đường đi bảo trì và thoát nước",
      "vật liệu liên kết chống ăn mòn"
    ]
  },
  {
    "id": 10,
    "cluster": "solar",
    "title": "Nghiệm thu hệ thống điện mặt trời: Hồ sơ và phép đo cần có",
    "primaryKeyword": "nghiệm thu điện mặt trời",
    "answerFirst": "Bộ hồ sơ nghiệm thu nên thể hiện bản vẽ hoàn công, serial thiết bị, phép đo điện, kiểm tra bảo vệ, cấu hình giám sát, hướng dẫn vận hành và biên bản bàn giao.",
    "region": "Việt Nam",
    "keyPoints": [
      "bản vẽ và sơ đồ một sợi hoàn công",
      "đo cách điện, tiếp địa và cực tính",
      "kiểm tra bảo vệ DC/AC",
      "tài khoản giám sát và hướng dẫn O&M"
    ]
  },
  {
    "id": 11,
    "cluster": "battery",
    "title": "Ắc quy Lithium 48V-100Ah cho trạm viễn thông: Cách chọn đúng",
    "primaryKeyword": "ắc quy Lithium 48V 100Ah viễn thông",
    "answerFirst": "Cần đối chiếu dải điện áp bộ nguồn, dòng xả cực đại, giao thức BMS, kích thước tủ, chuẩn kết nối và thời gian dự phòng trước khi thay thế ắc quy cho trạm viễn thông.",
    "region": "TP.HCM và toàn quốc",
    "keyPoints": [
      "điện áp làm việc và dòng tải",
      "CAN/RS485 và tương thích BMS",
      "kích thước rack và đầu nối",
      "chu kỳ, bảo hành và điều kiện nhiệt"
    ]
  },
  {
    "id": 12,
    "cluster": "battery",
    "title": "Ắc quy VRLA và Lithium: Nên chọn loại nào cho hệ thống dự phòng?",
    "primaryKeyword": "so sánh ắc quy VRLA và Lithium",
    "answerFirst": "VRLA có chi phí đầu tư ban đầu và quy trình vận hành quen thuộc; Lithium thường có mật độ năng lượng, khả năng giám sát và chu kỳ cao hơn. Quyết định phải dựa trên tổng chi phí vòng đời.",
    "region": "Việt Nam",
    "keyPoints": [
      "chi phí đầu tư và vòng đời",
      "khối lượng và diện tích lắp đặt",
      "khả năng giám sát từng module",
      "môi trường nhiệt và yêu cầu bảo trì"
    ]
  },
  {
    "id": 13,
    "cluster": "battery",
    "title": "Cách chọn ắc quy 2V-500Ah cho tủ nguồn và trạm viễn thông",
    "primaryKeyword": "ắc quy 2V 500Ah",
    "answerFirst": "Không nên chọn ắc quy 2V-500Ah chỉ theo dung lượng. Cần kiểm tra chế độ xả, điện áp cuối, nhiệt độ, kích thước bình, thanh nối và khả năng phối hợp bộ sạc.",
    "region": "Miền Trung",
    "keyPoints": [
      "đường cong xả theo thời gian",
      "điện áp cắt và dòng tải",
      "kích thước giá đỡ và thanh nối",
      "điện áp sạc nổi, sạc cân bằng"
    ]
  },
  {
    "id": 14,
    "cluster": "battery",
    "title": "Đo nội trở ắc quy có ý nghĩa gì trong bảo trì?",
    "primaryKeyword": "đo nội trở ắc quy",
    "answerFirst": "Nội trở giúp phát hiện xu hướng suy giảm và chênh lệch giữa các bình, nhưng phải so sánh theo lịch sử, cùng nhiệt độ và cùng loại thiết bị đo; không nên dùng một ngưỡng chung cho mọi hệ thống.",
    "region": "Việt Nam",
    "keyPoints": [
      "giá trị nền khi bình còn tốt",
      "xu hướng tăng theo thời gian",
      "độ đồng đều trong cùng chuỗi",
      "kết hợp điện áp, nhiệt độ và thử tải"
    ]
  },
  {
    "id": 15,
    "cluster": "battery",
    "title": "Thiết kế tủ ắc quy: Thông gió, cáp DC và an toàn vận hành",
    "primaryKeyword": "thiết kế tủ ắc quy",
    "answerFirst": "Tủ ắc quy cần bảo đảm tải trọng, khoảng hở thao tác, thông gió, bảo vệ DC, phân cực rõ ràng, bán kính uốn cáp và khả năng cô lập từng chuỗi.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "tải trọng sàn và kết cấu tủ",
      "thông gió và nhiệt độ",
      "cầu chì, MCCB và điểm cô lập",
      "nhãn cực tính và khoảng hở bảo trì"
    ]
  },
  {
    "id": 16,
    "cluster": "battery",
    "title": "Tính dung lượng ắc quy cho UPS phòng máy chủ",
    "primaryKeyword": "tính dung lượng ắc quy cho UPS",
    "answerFirst": "Dung lượng phải được tính từ tải thực, hiệu suất UPS, điện áp DC, thời gian lưu điện, hệ số lão hóa và điều kiện nhiệt độ; phép tính Ah đơn giản chỉ là bước đầu.",
    "region": "Việt Nam",
    "keyPoints": [
      "công suất tải thực và hệ số công suất",
      "hiệu suất inverter của UPS",
      "thời gian lưu điện mục tiêu",
      "hệ số lão hóa và nhiệt độ"
    ]
  },
  {
    "id": 17,
    "cluster": "battery",
    "title": "BMS trong pin Lithium hoạt động như thế nào?",
    "primaryKeyword": "BMS pin Lithium",
    "answerFirst": "BMS theo dõi điện áp cell, nhiệt độ, dòng sạc/xả, cân bằng và trạng thái bảo vệ; trong hệ thống công nghiệp, khả năng giao tiếp và ghi lịch sử lỗi quan trọng không kém dung lượng pin.",
    "region": "Việt Nam",
    "keyPoints": [
      "giám sát điện áp từng cell",
      "bảo vệ quá dòng và nhiệt",
      "cân bằng cell",
      "CAN/RS485 và nhật ký sự kiện"
    ]
  },
  {
    "id": 18,
    "cluster": "battery",
    "title": "Chu kỳ sạc xả của pin Lithium: Hiểu đúng để tránh quảng cáo sai",
    "primaryKeyword": "chu kỳ sạc xả pin Lithium",
    "answerFirst": "Số chu kỳ chỉ có ý nghĩa khi đi kèm độ sâu xả, nhiệt độ, dòng sạc/xả và dung lượng còn lại tại cuối phép thử. Không thể so sánh hai sản phẩm chỉ bằng một con số chu kỳ.",
    "region": "Việt Nam",
    "keyPoints": [
      "độ sâu xả DoD",
      "dung lượng còn lại cuối vòng đời",
      "nhiệt độ và C-rate",
      "điều kiện bảo hành thực tế"
    ]
  },
  {
    "id": 19,
    "cluster": "battery",
    "title": "Pin lưu trữ cho điện mặt trời: Khi nào doanh nghiệp nên đầu tư?",
    "primaryKeyword": "pin lưu trữ điện mặt trời doanh nghiệp",
    "answerFirst": "Lưu trữ phù hợp khi doanh nghiệp cần dự phòng, dịch chuyển phụ tải, giảm công suất đỉnh hoặc vận hành tải quan trọng; hiệu quả cần tính theo biểu đồ phụ tải và cơ chế giá điện thực tế.",
    "region": "Việt Nam",
    "keyPoints": [
      "mục tiêu dự phòng hay tối ưu phụ tải",
      "công suất PCS và dung lượng kWh",
      "số chu kỳ vận hành dự kiến",
      "không gian, an toàn và EMS"
    ]
  },
  {
    "id": 20,
    "cluster": "battery",
    "title": "An toàn phòng cháy cho hệ thống lưu trữ năng lượng",
    "primaryKeyword": "an toàn hệ thống lưu trữ năng lượng",
    "answerFirst": "Thiết kế an toàn cần xem xét phân khu, phát hiện sớm, thông gió, cách ly, bảo vệ điện, lối tiếp cận và quy trình ứng phó theo công nghệ pin và quy mô hệ thống.",
    "region": "Việt Nam",
    "keyPoints": [
      "phân khu và khoảng cách an toàn",
      "giám sát nhiệt và khói",
      "cô lập DC và ngắt khẩn cấp",
      "quy trình ứng phó và đào tạo"
    ]
  },
  {
    "id": 21,
    "cluster": "router",
    "title": "Cách chọn router doanh nghiệp theo số người dùng và băng thông",
    "primaryKeyword": "router doanh nghiệp",
    "answerFirst": "Router doanh nghiệp cần được chọn theo số phiên kết nối, lưu lượng thực, dịch vụ bật đồng thời và yêu cầu dự phòng; số cổng Gigabit không phản ánh đầy đủ năng lực xử lý.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "số người dùng và phiên đồng thời",
      "throughput khi bật firewall/VPN",
      "số WAN và cơ chế failover",
      "khả năng quản trị và hỗ trợ"
    ]
  },
  {
    "id": 22,
    "cluster": "router",
    "title": "MikroTik CCR và RB khác nhau thế nào?",
    "primaryKeyword": "MikroTik CCR và RB",
    "answerFirst": "CCR thường hướng tới lưu lượng và số phiên lớn hơn, trong khi nhiều mẫu RB phù hợp văn phòng hoặc chi nhánh. Cần đối chiếu kiến trúc CPU, cổng, RouterOS và bài toán thực tế.",
    "region": "Việt Nam",
    "keyPoints": [
      "CPU và kiến trúc phần cứng",
      "cổng Ethernet/SFP/SFP+",
      "throughput theo tính năng",
      "mức độ phức tạp khi vận hành"
    ]
  },
  {
    "id": 23,
    "cluster": "router",
    "title": "Router DrayTek Multi-WAN phù hợp với mô hình nào?",
    "primaryKeyword": "router DrayTek Multi-WAN",
    "answerFirst": "DrayTek Multi-WAN phù hợp doanh nghiệp cần quản trị tập trung, VPN, cân bằng nhiều đường truyền và chính sách ứng dụng; model cụ thể phụ thuộc băng thông và số tunnel.",
    "region": "Miền Trung",
    "keyPoints": [
      "số WAN vật lý và WAN dự phòng",
      "VPN site-to-site và remote",
      "quản trị AP/switch tích hợp",
      "lọc nội dung và báo cáo"
    ]
  },
  {
    "id": 24,
    "cluster": "router",
    "title": "Cân bằng tải Internet: Load balancing và failover khác gì nhau?",
    "primaryKeyword": "cân bằng tải Internet",
    "answerFirst": "Load balancing phân phối lưu lượng trên nhiều đường truyền; failover ưu tiên một đường và chuyển khi có lỗi. Doanh nghiệp thường cần kết hợp cả hai theo từng loại ứng dụng.",
    "region": "Việt Nam",
    "keyPoints": [
      "phân phối theo phiên hoặc chính sách",
      "health check đường truyền",
      "ứng dụng nhạy IP nguồn",
      "thời gian chuyển mạch khi lỗi"
    ]
  },
  {
    "id": 25,
    "cluster": "router",
    "title": "Thiết lập VPN Site-to-Site cho nhiều chi nhánh",
    "primaryKeyword": "VPN Site-to-Site nhiều chi nhánh",
    "answerFirst": "Thiết kế VPN cần thống nhất dải IP, giao thức mã hóa, định tuyến, dự phòng Internet, quản lý khóa và giám sát tunnel; cấu hình riêng lẻ từng điểm sẽ khó mở rộng.",
    "region": "Việt Nam",
    "keyPoints": [
      "quy hoạch địa chỉ không trùng",
      "topology hub-spoke hoặc full-mesh",
      "IPsec/WireGuard và quản lý khóa",
      "giám sát tunnel và failover"
    ]
  },
  {
    "id": 26,
    "cluster": "router",
    "title": "QoS cho họp trực tuyến và VoIP trên mạng doanh nghiệp",
    "primaryKeyword": "QoS mạng doanh nghiệp",
    "answerFirst": "QoS hiệu quả phải phân loại đúng lưu lượng, ưu tiên thoại/video nhưng vẫn giới hạn tải nền; chỉ bật một nút ưu tiên mà không đo lưu lượng thường không giải quyết được nghẽn.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "phân loại DSCP hoặc theo ứng dụng",
      "hàng đợi ưu tiên và giới hạn",
      "băng thông chiều lên thực tế",
      "đo jitter, latency và packet loss"
    ]
  },
  {
    "id": 27,
    "cluster": "router",
    "title": "Firewall router: 10 nguyên tắc cấu hình an toàn",
    "primaryKeyword": "cấu hình firewall router",
    "answerFirst": "Nguyên tắc cơ bản là chặn mặc định từ Internet, chỉ mở dịch vụ cần thiết, giới hạn nguồn quản trị, cập nhật firmware, lưu log và kiểm tra định kỳ các rule không còn sử dụng.",
    "region": "Việt Nam",
    "keyPoints": [
      "default deny từ WAN",
      "quản trị qua VPN hoặc whitelist",
      "phân tách mạng nội bộ",
      "log, backup và cập nhật"
    ]
  },
  {
    "id": 28,
    "cluster": "router",
    "title": "Router cho văn phòng 500 người dùng cần cấu hình gì?",
    "primaryKeyword": "router cho 500 người dùng",
    "answerFirst": "Quy mô 500 người dùng cần đánh giá ứng dụng, số phiên, băng thông, VPN, firewall, dự phòng và kiến trúc switch; không thể chọn model chỉ từ số nhân sự.",
    "region": "TP.HCM",
    "keyPoints": [
      "số thiết bị thực tế lớn hơn số nhân sự",
      "lưu lượng đỉnh và ứng dụng cloud",
      "HA hoặc thiết bị dự phòng",
      "uplink 10G và phân vùng mạng"
    ]
  },
  {
    "id": 29,
    "cluster": "router",
    "title": "Hai đường Internet cho doanh nghiệp: Thiết kế dự phòng đúng cách",
    "primaryKeyword": "hai đường Internet doanh nghiệp",
    "answerFirst": "Hai đường Internet chỉ tạo dự phòng khi khác tuyến, khác thiết bị đầu cuối hoặc có cơ chế phát hiện lỗi đủ tin cậy. Hai hợp đồng nhưng đi chung hạ tầng vẫn có thể gián đoạn cùng lúc.",
    "region": "Miền Trung",
    "keyPoints": [
      "đa dạng nhà mạng và tuyến cáp",
      "health check ngoài gateway",
      "DNS và phiên kết nối khi chuyển",
      "nguồn điện dự phòng cho modem/router"
    ]
  },
  {
    "id": 30,
    "cluster": "router",
    "title": "Audit hệ thống mạng doanh nghiệp gồm những bước nào?",
    "primaryKeyword": "audit hệ thống mạng doanh nghiệp",
    "answerFirst": "Audit mạng nên bao gồm sơ đồ vật lý, cấu hình, firmware, tài khoản, VLAN, hiệu năng, Wi-Fi, log, dự phòng và khả năng khôi phục cấu hình.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "kiểm kê thiết bị và phiên bản",
      "sơ đồ VLAN, IP và kết nối",
      "đo hiệu năng và lỗi cổng",
      "đánh giá bảo mật và backup"
    ]
  },
  {
    "id": 31,
    "cluster": "switchwifi",
    "title": "Switch Managed và Unmanaged: Doanh nghiệp nên chọn loại nào?",
    "primaryKeyword": "switch managed và unmanaged",
    "answerFirst": "Switch unmanaged phù hợp mạng rất đơn giản; doanh nghiệp cần VLAN, PoE, giám sát, dự phòng hoặc bảo mật nên chọn managed switch và thiết kế cấu hình rõ ràng.",
    "region": "Việt Nam",
    "keyPoints": [
      "VLAN và phân quyền",
      "STP/LACP và dự phòng",
      "PoE và giám sát cổng",
      "khả năng quản trị tập trung"
    ]
  },
  {
    "id": 32,
    "cluster": "switchwifi",
    "title": "Cách tính PoE Budget cho camera và Access Point",
    "primaryKeyword": "cách tính PoE Budget",
    "answerFirst": "PoE budget phải tính công suất tối đa của từng thiết bị, chuẩn PoE, tổn hao, công suất toàn switch và phần dự phòng; không chỉ đếm số cổng PoE.",
    "region": "Việt Nam",
    "keyPoints": [
      "chuẩn 802.3af/at/bt",
      "công suất cực đại từng thiết bị",
      "ngân sách PoE toàn switch",
      "dự phòng khi khởi động và mở rộng"
    ]
  },
  {
    "id": 33,
    "cluster": "switchwifi",
    "title": "Thiết kế mạng Core – Access cho văn phòng và nhà máy",
    "primaryKeyword": "thiết kế mạng core access",
    "answerFirst": "Kiến trúc core–access giúp tách lớp chuyển mạch trung tâm và lớp kết nối người dùng, dễ mở rộng, dự phòng và quản trị hơn mạng ghép nối tự phát.",
    "region": "Miền Trung",
    "keyPoints": [
      "uplink quang và băng thông",
      "dự phòng core và đường uplink",
      "phân vùng theo khu vực/VLAN",
      "quản trị, log và giám sát"
    ]
  },
  {
    "id": 34,
    "cluster": "switchwifi",
    "title": "VLAN là gì? Cách chia VLAN cho doanh nghiệp",
    "primaryKeyword": "chia VLAN doanh nghiệp",
    "answerFirst": "VLAN nên được chia theo mức độ tin cậy và chức năng như quản trị, nhân viên, khách, camera, VoIP và máy chủ; số VLAN vừa đủ để bảo mật mà vẫn dễ vận hành.",
    "region": "Việt Nam",
    "keyPoints": [
      "nhóm người dùng và thiết bị",
      "routing và chính sách firewall",
      "DHCP, DNS và captive portal",
      "tài liệu hóa VLAN/port"
    ]
  },
  {
    "id": 35,
    "cluster": "switchwifi",
    "title": "STP và RSTP giúp chống loop mạng như thế nào?",
    "primaryKeyword": "STP RSTP chống loop",
    "answerFirst": "STP/RSTP phát hiện đường dư thừa lớp 2 và chặn đường có thể tạo vòng lặp. Cần xác định root bridge, edge port và bảo vệ BPDU thay vì để mặc định toàn bộ.",
    "region": "Việt Nam",
    "keyPoints": [
      "root bridge chủ động",
      "cost và priority uplink",
      "edge/portfast đúng vị trí",
      "BPDU guard và loop protection"
    ]
  },
  {
    "id": 36,
    "cluster": "switchwifi",
    "title": "Wi-Fi 6 có lợi gì cho văn phòng đông người?",
    "primaryKeyword": "Wi-Fi 6 doanh nghiệp",
    "answerFirst": "Wi-Fi 6 cải thiện hiệu quả khi nhiều thiết bị cùng truy cập nhờ các cơ chế quản lý tài nguyên vô tuyến, nhưng hiệu quả vẫn phụ thuộc mật độ AP, kênh, uplink và thiết bị đầu cuối.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "mật độ client trên mỗi AP",
      "băng tần 5/6 GHz khả dụng",
      "uplink và PoE",
      "khảo sát nhiễu và roaming"
    ]
  },
  {
    "id": 37,
    "cluster": "switchwifi",
    "title": "Cách tính số lượng Access Point cho khách sạn và văn phòng",
    "primaryKeyword": "tính số lượng Access Point",
    "answerFirst": "Số AP phải dựa trên mặt bằng, vật liệu tường, số người dùng đồng thời, loại ứng dụng và mục tiêu tín hiệu; công thức theo diện tích chỉ dùng để ước tính ban đầu.",
    "region": "Miền Trung",
    "keyPoints": [
      "mặt bằng và suy hao vật cản",
      "mật độ người dùng",
      "băng thông ứng dụng",
      "mức tín hiệu và SNR mục tiêu"
    ]
  },
  {
    "id": 38,
    "cluster": "switchwifi",
    "title": "Roaming Wi-Fi: Vì sao đi giữa các tầng thường bị rớt mạng?",
    "primaryKeyword": "roaming Wi-Fi doanh nghiệp",
    "answerFirst": "Roaming phụ thuộc cả AP và thiết bị đầu cuối. Cần tối ưu công suất phát, vùng chồng phủ, kênh, chuẩn hỗ trợ và thời gian xác thực để hạn chế bám AP yếu.",
    "region": "Việt Nam",
    "keyPoints": [
      "vùng phủ chồng hợp lý",
      "công suất phát và ngưỡng RSSI",
      "802.11k/v/r khi phù hợp",
      "kiểm tra hành vi thiết bị đầu cuối"
    ]
  },
  {
    "id": 39,
    "cluster": "switchwifi",
    "title": "Access Point ngoài trời: Tiêu chí chọn cho nhà máy và kho bãi",
    "primaryKeyword": "Access Point ngoài trời",
    "answerFirst": "AP ngoài trời cần được đánh giá theo cấp bảo vệ, nhiệt độ, chống sét, anten, vùng phủ, phương án PoE và vị trí lắp đặt; không nên dùng AP trong nhà đặt trong hộp kín.",
    "region": "Tây Nguyên",
    "keyPoints": [
      "IP và nhiệt độ vận hành",
      "anten định hướng/đẳng hướng",
      "chống sét Ethernet và tiếp địa",
      "cột, gá và tuyến cáp"
    ]
  },
  {
    "id": 40,
    "cluster": "switchwifi",
    "title": "Wi-Fi chậm dù sóng mạnh: 8 nguyên nhân thường gặp",
    "primaryKeyword": "Wi-Fi chậm dù sóng mạnh",
    "answerFirst": "Sóng mạnh không đồng nghĩa tốc độ tốt. Nhiễu kênh, quá nhiều client, uplink nghẽn, roaming kém, DNS, cấu hình băng tần và thiết bị đầu cuối đều có thể gây chậm.",
    "region": "Việt Nam",
    "keyPoints": [
      "channel utilization",
      "số client và airtime",
      "uplink switch/router",
      "nhiễu, roaming và thiết bị đầu cuối"
    ]
  },
  {
    "id": 41,
    "cluster": "fiber",
    "title": "SFP Singlemode và Multimode: Chọn sai có hoạt động không?",
    "primaryKeyword": "SFP singlemode và multimode",
    "answerFirst": "Module quang phải phù hợp loại sợi, bước sóng, khoảng cách, tốc độ và đầu nối. Một số cấu hình có thể lên link tạm thời nhưng không bảo đảm ngân sách quang và độ ổn định.",
    "region": "Việt Nam",
    "keyPoints": [
      "SMF/MMF và bước sóng",
      "khoảng cách danh định",
      "đầu nối LC/SC và số sợi",
      "DDM và tương thích thiết bị"
    ]
  },
  {
    "id": 42,
    "cluster": "fiber",
    "title": "ODF 24FO, 48FO và 96FO: Cách chọn dung lượng",
    "primaryKeyword": "ODF 24FO 48FO 96FO",
    "answerFirst": "Dung lượng ODF nên bao gồm số core sử dụng, dự phòng, loại adapter, không gian cuộn sợi, bán kính uốn và khả năng thao tác bảo trì.",
    "region": "Miền Trung",
    "keyPoints": [
      "số core hiện tại và dự phòng",
      "SC/LC, UPC/APC",
      "rack unit và không gian hàn",
      "quản lý pigtail và nhãn"
    ]
  },
  {
    "id": 43,
    "cluster": "fiber",
    "title": "Ngân sách suy hao tuyến cáp quang được tính như thế nào?",
    "primaryKeyword": "tính suy hao tuyến cáp quang",
    "answerFirst": "Ngân sách suy hao gồm suy hao sợi theo chiều dài, mối hàn, đầu nối, splitter nếu có và phần dự phòng; kết quả phải thấp hơn công suất phát/độ nhạy thu theo thiết bị.",
    "region": "Việt Nam",
    "keyPoints": [
      "suy hao sợi theo km",
      "số mối hàn và đầu nối",
      "splitter và thiết bị thụ động",
      "engineering margin"
    ]
  },
  {
    "id": 44,
    "cluster": "fiber",
    "title": "Cáp quang 24FO, 48FO hay 96FO: Chọn theo nhu cầu nào?",
    "primaryKeyword": "cáp quang 24FO 48FO 96FO",
    "answerFirst": "Số core cần tính từ dịch vụ hiện tại, dự phòng, mô hình ring, thuê sợi và kế hoạch mở rộng. Chọn dư hợp lý thường rẻ hơn kéo lại tuyến sau này.",
    "region": "Miền Trung",
    "keyPoints": [
      "số liên kết và topology",
      "core dự phòng vận hành",
      "mở rộng 3–5 năm",
      "đường kính cáp và phụ kiện"
    ]
  },
  {
    "id": 45,
    "cluster": "fiber",
    "title": "Patch Panel Cat6 và Cat6A khác nhau thế nào?",
    "primaryKeyword": "Patch Panel Cat6 và Cat6A",
    "answerFirst": "Patch panel phải đồng bộ với loại cáp, module và yêu cầu băng thông. Cat6A yêu cầu kiểm soát nhiễu và thi công chặt chẽ hơn để hỗ trợ 10 Gigabit trên chiều dài tiêu chuẩn.",
    "region": "Việt Nam",
    "keyPoints": [
      "category đồng bộ toàn channel",
      "shielded hay unshielded",
      "quản lý cáp và tiếp địa",
      "chứng nhận bằng máy đo"
    ]
  },
  {
    "id": 46,
    "cluster": "fiber",
    "title": "Cáp mạng Cat6 và Cat6A: Khi nào cần nâng cấp?",
    "primaryKeyword": "cáp mạng Cat6 và Cat6A",
    "answerFirst": "Cat6 phù hợp nhiều hệ thống Gigabit; Cat6A phù hợp khi cần 10 Gigabit, PoE công suất cao hoặc dự phòng dài hạn. Quyết định cần xét chiều dài, bó cáp và môi trường nhiễu.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "băng thông mục tiêu",
      "chiều dài channel",
      "PoE và nhiệt bó cáp",
      "môi trường EMI và không gian máng"
    ]
  },
  {
    "id": 47,
    "cluster": "fiber",
    "title": "Đo OTDR và đo công suất quang khác nhau ra sao?",
    "primaryKeyword": "đo OTDR và công suất quang",
    "answerFirst": "OTDR giúp định vị sự kiện và đánh giá tuyến theo khoảng cách; máy đo công suất xác nhận mức quang đầu-cuối. Nghiệm thu tốt thường cần phối hợp cả hai phương pháp.",
    "region": "Việt Nam",
    "keyPoints": [
      "độ dài tuyến và pulse width",
      "launch/receive cable",
      "đo hai chiều khi cần",
      "so sánh với ngân sách quang"
    ]
  },
  {
    "id": 48,
    "cluster": "fiber",
    "title": "Bảo trì tuyến cáp quang: Quy trình xử lý suy hao tăng",
    "primaryKeyword": "bảo trì tuyến cáp quang",
    "answerFirst": "Khi suy hao tăng, cần kiểm tra lịch sử đo, vệ sinh đầu nối, đo công suất, OTDR hai đầu, khoanh vùng sự kiện và cập nhật hồ sơ sau sửa chữa.",
    "region": "Miền Trung",
    "keyPoints": [
      "baseline lúc nghiệm thu",
      "vệ sinh và soi đầu nối",
      "OTDR và định vị sự kiện",
      "biên bản hàn nối sau sửa"
    ]
  },
  {
    "id": 49,
    "cluster": "fiber",
    "title": "Hệ thống cáp cấu trúc cho Data Center cần những gì?",
    "primaryKeyword": "cáp cấu trúc Data Center",
    "answerFirst": "Cáp cấu trúc Data Center cần kiến trúc rõ ràng, quản lý đường đi, phân tách nguồn-tín hiệu, nhãn, dự phòng và chứng nhận từng liên kết để hỗ trợ vận hành lâu dài.",
    "region": "Việt Nam",
    "keyPoints": [
      "MDA/HDA/EDA theo quy mô",
      "cáp đồng và cáp quang",
      "máng cáp, bán kính uốn",
      "nhãn và hồ sơ chứng nhận"
    ]
  },
  {
    "id": 50,
    "cluster": "fiber",
    "title": "Cáp quang treo, cống và chôn trực tiếp: Chọn loại nào?",
    "primaryKeyword": "cáp quang treo cống chôn trực tiếp",
    "answerFirst": "Loại cáp phụ thuộc phương thức tuyến, lực kéo, độ ẩm, gặm nhấm, tải gió và phụ kiện. Không nên dùng cùng một cấu trúc cáp cho mọi môi trường.",
    "region": "Miền Trung và Tây Nguyên",
    "keyPoints": [
      "ADSS hoặc cáp có dây treo",
      "ống cống và lực kéo",
      "giáp chống gặm nhấm",
      "măng xông và dự phòng tuyến"
    ]
  },
  {
    "id": 51,
    "cluster": "voip",
    "title": "VoIP Gateway là gì? Khi nào doanh nghiệp cần dùng?",
    "primaryKeyword": "VoIP Gateway là gì",
    "answerFirst": "VoIP Gateway chuyển đổi giữa mạng thoại IP và cổng analog, GSM hoặc E1. Thiết bị cần khi doanh nghiệp muốn giữ điện thoại, đường trung kế hoặc thiết bị analog trong quá trình chuyển sang IP.",
    "region": "Việt Nam",
    "keyPoints": [
      "loại cổng FXS/FXO/GSM/E1",
      "số cuộc gọi đồng thời",
      "codec và SIP",
      "khả năng quản trị, bảo mật"
    ]
  },
  {
    "id": 52,
    "cluster": "voip",
    "title": "Cổng FXS và FXO khác nhau như thế nào?",
    "primaryKeyword": "FXS và FXO",
    "answerFirst": "FXS cấp tín hiệu và điện áp cho điện thoại analog; FXO nhận đường từ nhà cung cấp hoặc cổng FXS. Kết nối đúng nguyên tắc FXS–FXO giúp tránh chọn sai gateway.",
    "region": "Việt Nam",
    "keyPoints": [
      "thiết bị nào cấp dial tone",
      "đường PSTN hay máy lẻ",
      "số cổng cần chuyển đổi",
      "kiểm tra caller ID và impedance"
    ]
  },
  {
    "id": 53,
    "cluster": "voip",
    "title": "Cách tính số máy lẻ và cuộc gọi đồng thời cho IP PBX",
    "primaryKeyword": "tính cấu hình IP PBX",
    "answerFirst": "IP PBX phải được chọn theo số máy lẻ đăng ký, số cuộc gọi đồng thời, ghi âm, hội nghị, IVR và tích hợp CRM; số nhân viên chỉ là một đầu vào.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "extension đăng ký",
      "concurrent calls",
      "ghi âm và dung lượng lưu trữ",
      "tích hợp CRM/call center"
    ]
  },
  {
    "id": 54,
    "cluster": "voip",
    "title": "SIP Trunk là gì? Lợi ích khi thay đường trung kế truyền thống",
    "primaryKeyword": "SIP Trunk",
    "answerFirst": "SIP Trunk truyền cuộc gọi qua IP, giúp mở rộng kênh linh hoạt và kết nối nhiều địa điểm; doanh nghiệp cần bảo đảm Internet, QoS, SBC/firewall và phương án dự phòng.",
    "region": "Việt Nam",
    "keyPoints": [
      "số kênh đồng thời",
      "địa chỉ IP và xác thực",
      "codec và DTMF",
      "dự phòng đường truyền"
    ]
  },
  {
    "id": 55,
    "cluster": "voip",
    "title": "Hệ thống ghi âm tổng đài cần lưu ý điều gì?",
    "primaryKeyword": "ghi âm tổng đài",
    "answerFirst": "Cần xác định đối tượng được ghi, thời gian lưu, định dạng, quyền truy cập, sao lưu, tìm kiếm và yêu cầu tuân thủ nội bộ trước khi chọn dung lượng lưu trữ.",
    "region": "Việt Nam",
    "keyPoints": [
      "số cuộc gọi đồng thời",
      "thời gian lưu trữ",
      "phân quyền và nhật ký truy cập",
      "sao lưu và bảo mật"
    ]
  },
  {
    "id": 56,
    "cluster": "voip",
    "title": "Kết nối tổng đài giữa nhiều chi nhánh qua VPN",
    "primaryKeyword": "kết nối tổng đài nhiều chi nhánh",
    "answerFirst": "Kết nối chi nhánh cần quy hoạch extension, định tuyến cuộc gọi, VPN, QoS, dự phòng Internet và cơ chế hoạt động cục bộ khi mất kết nối trung tâm.",
    "region": "Miền Trung",
    "keyPoints": [
      "kế hoạch đánh số máy lẻ",
      "dial plan liên chi nhánh",
      "VPN và QoS",
      "local survivability"
    ]
  },
  {
    "id": 57,
    "cluster": "voip",
    "title": "Điện thoại IP cho lễ tân, quản lý và nhân viên khác nhau thế nào?",
    "primaryKeyword": "chọn điện thoại IP",
    "answerFirst": "Lễ tân thường cần nhiều phím DSS và tai nghe; quản lý cần hiển thị, hội nghị và Bluetooth; nhân viên phổ thông cần độ ổn định và PoE. Chọn theo vai trò giúp tối ưu chi phí.",
    "region": "Việt Nam",
    "keyPoints": [
      "số tài khoản SIP",
      "phím DSS/BLF",
      "PoE, tai nghe và Bluetooth",
      "màn hình và hội nghị"
    ]
  },
  {
    "id": 58,
    "cluster": "voip",
    "title": "QoS cho VoIP: Mức độ trễ, jitter và mất gói cần theo dõi",
    "primaryKeyword": "QoS cho VoIP",
    "answerFirst": "Chất lượng thoại phụ thuộc độ trễ, jitter và mất gói trên toàn tuyến. Cần ưu tiên lưu lượng thoại, kiểm soát uplink và đo thực tế trong giờ cao điểm.",
    "region": "Việt Nam",
    "keyPoints": [
      "latency hai chiều",
      "jitter và buffer",
      "packet loss",
      "DSCP và hàng đợi"
    ]
  },
  {
    "id": 59,
    "cluster": "voip",
    "title": "Bảo mật tổng đài IP: Cách giảm nguy cơ gọi cước quốc tế trái phép",
    "primaryKeyword": "bảo mật tổng đài IP",
    "answerFirst": "Cần giới hạn IP truy cập, mật khẩu mạnh, chặn quốc gia/đầu số không dùng, giới hạn cước, cập nhật phần mềm, theo dõi log và cảnh báo cuộc gọi bất thường.",
    "region": "Việt Nam",
    "keyPoints": [
      "whitelist và VPN quản trị",
      "giới hạn dial plan",
      "mật khẩu và chống brute force",
      "log và cảnh báo chi phí"
    ]
  },
  {
    "id": 60,
    "cluster": "voip",
    "title": "Lộ trình chuyển từ tổng đài analog sang IP PBX",
    "primaryKeyword": "chuyển tổng đài analog sang IP",
    "answerFirst": "Doanh nghiệp có thể chuyển đổi theo giai đoạn bằng gateway để giữ thiết bị analog, sau đó thay dần điện thoại và trung kế. Cần kiểm kê cổng, số máy và kịch bản cuộc gọi trước khi chuyển.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "kiểm kê máy lẻ và trung kế",
      "gateway chuyển tiếp",
      "kế hoạch đánh số và đào tạo",
      "phương án rollback"
    ]
  },
  {
    "id": 61,
    "cluster": "datacenter",
    "title": "Máy chủ Rack và Tower: Loại nào phù hợp doanh nghiệp?",
    "primaryKeyword": "máy chủ rack và tower",
    "answerFirst": "Tower dễ triển khai ở văn phòng nhỏ; rack tối ưu không gian, quản lý cáp và mở rộng trong phòng máy. Quyết định phụ thuộc số lượng server, độ ồn, nguồn, làm mát và kế hoạch tăng trưởng.",
    "region": "Việt Nam",
    "keyPoints": [
      "không gian và độ ồn",
      "khả năng mở rộng",
      "nguồn điện và làm mát",
      "quản lý cáp và bảo trì"
    ]
  },
  {
    "id": 62,
    "cluster": "datacenter",
    "title": "Ảo hóa máy chủ giúp doanh nghiệp tiết kiệm gì?",
    "primaryKeyword": "ảo hóa máy chủ doanh nghiệp",
    "answerFirst": "Ảo hóa giúp hợp nhất tài nguyên, triển khai nhanh và hỗ trợ dự phòng, nhưng cần thiết kế CPU/RAM/storage, bản quyền, backup và kế hoạch HA phù hợp.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "tỷ lệ overcommit tài nguyên",
      "storage và IOPS",
      "HA và live migration",
      "backup cấp VM và bản quyền"
    ]
  },
  {
    "id": 63,
    "cluster": "datacenter",
    "title": "RAID 1, RAID 5, RAID 6 và RAID 10 khác nhau thế nào?",
    "primaryKeyword": "RAID 1 5 6 10",
    "answerFirst": "Các mức RAID cân bằng khác nhau giữa dung lượng, hiệu năng và khả năng chịu lỗi. RAID không thay thế sao lưu, vì vẫn có rủi ro xóa nhầm, mã độc và lỗi hệ thống.",
    "region": "Việt Nam",
    "keyPoints": [
      "số ổ tối thiểu",
      "dung lượng sử dụng",
      "hiệu năng đọc/ghi",
      "thời gian rebuild và rủi ro"
    ]
  },
  {
    "id": 64,
    "cluster": "datacenter",
    "title": "Cách chọn UPS cho phòng máy chủ và tủ rack",
    "primaryKeyword": "UPS cho phòng máy chủ",
    "answerFirst": "UPS cần được tính theo tải thực, hệ số công suất, khả năng tăng trưởng, thời gian lưu điện, loại đầu ra, bypass và phương án máy phát điện.",
    "region": "Miền Trung",
    "keyPoints": [
      "kVA và kW thực",
      "online double-conversion",
      "thời gian lưu điện",
      "bypass, SNMP và máy phát"
    ]
  },
  {
    "id": 65,
    "cluster": "datacenter",
    "title": "Làm mát phòng server: Điều hòa dân dụng có đủ không?",
    "primaryKeyword": "làm mát phòng server",
    "answerFirst": "Phòng server cần vận hành liên tục, kiểm soát nhiệt độ, luồng gió và cảnh báo. Điều hòa dân dụng có thể phù hợp tải nhỏ nhưng phải đánh giá duty cycle, dự phòng và thoát nước.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "tải nhiệt thiết bị",
      "luồng khí nóng/lạnh",
      "dự phòng N+1 khi cần",
      "cảm biến và cảnh báo"
    ]
  },
  {
    "id": 66,
    "cluster": "datacenter",
    "title": "Tủ rack 19 inch: Cách chọn U, chiều sâu và tải trọng",
    "primaryKeyword": "cách chọn tủ rack 19 inch",
    "answerFirst": "Tủ rack phải đủ U, chiều sâu cho server và cáp, tải trọng, thông gió, PDU, tiếp địa và không gian bảo trì; chọn tủ theo số thiết bị hiện tại thường thiếu dự phòng.",
    "region": "Việt Nam",
    "keyPoints": [
      "chiều cao U và dự phòng",
      "chiều sâu thiết bị/cáp",
      "tải trọng tĩnh",
      "PDU, quạt và quản lý cáp"
    ]
  },
  {
    "id": 67,
    "cluster": "datacenter",
    "title": "Giám sát nhiệt độ và nguồn điện phòng máy từ xa",
    "primaryKeyword": "giám sát phòng máy từ xa",
    "answerFirst": "Hệ thống giám sát nên theo dõi nhiệt độ, độ ẩm, mất điện, UPS, cửa tủ, rò nước và gửi cảnh báo qua nhiều kênh; cảm biến cần đặt đúng vị trí luồng khí vào.",
    "region": "Việt Nam",
    "keyPoints": [
      "nhiệt độ cửa hút server",
      "độ ẩm và rò nước",
      "UPS/PDU qua SNMP",
      "SMS, email và escalation"
    ]
  },
  {
    "id": 68,
    "cluster": "datacenter",
    "title": "Quy tắc sao lưu 3-2-1 cho dữ liệu doanh nghiệp",
    "primaryKeyword": "sao lưu 3-2-1",
    "answerFirst": "Mô hình 3-2-1 duy trì ba bản dữ liệu, trên hai loại phương tiện và một bản ngoài hệ thống chính. Quan trọng nhất là kiểm tra khôi phục định kỳ và bảo vệ bản sao khỏi ransomware.",
    "region": "Việt Nam",
    "keyPoints": [
      "ba bản dữ liệu",
      "hai loại phương tiện",
      "một bản offsite/immutable",
      "kiểm thử restore"
    ]
  },
  {
    "id": 69,
    "cluster": "datacenter",
    "title": "Mini PC công nghiệp dùng cho Kiosk và Edge Computing",
    "primaryKeyword": "Mini PC công nghiệp",
    "answerFirst": "Mini PC công nghiệp phù hợp kiosk, giám sát, gateway IoT và xử lý tại biên khi có dải nhiệt, cổng I/O, nguồn, độ bền và hệ điều hành phù hợp.",
    "region": "Việt Nam",
    "keyPoints": [
      "dải nhiệt và fanless",
      "cổng COM/LAN/GPIO",
      "nguồn DC và mounting",
      "hệ điều hành, TPM và quản trị"
    ]
  },
  {
    "id": 70,
    "cluster": "datacenter",
    "title": "Checklist xây dựng phòng máy chủ cho doanh nghiệp vừa",
    "primaryKeyword": "checklist phòng máy chủ",
    "answerFirst": "Phòng máy cần được quy hoạch từ tải IT, tủ rack, điện, UPS, tiếp địa, làm mát, cáp, an ninh, PCCC, giám sát và quy trình vận hành.",
    "region": "Miền Trung",
    "keyPoints": [
      "mặt bằng và tải sàn",
      "nguồn/UPS/PDU",
      "làm mát và luồng khí",
      "an ninh, PCCC và giám sát"
    ]
  },
  {
    "id": 71,
    "cluster": "energy",
    "title": "Cột đo gió dùng để làm gì trong phát triển dự án điện gió?",
    "primaryKeyword": "cột đo gió",
    "answerFirst": "Cột đo gió thu thập tốc độ, hướng gió và dữ liệu khí tượng tại nhiều độ cao để đánh giá tài nguyên và hỗ trợ thiết kế dự án. Chất lượng lắp đặt, hiệu chuẩn và dữ liệu quyết định giá trị khảo sát.",
    "region": "Việt Nam",
    "keyPoints": [
      "chiều cao và vị trí cột",
      "cảm biến, hiệu chuẩn",
      "nguồn, logger và truyền dữ liệu",
      "kiểm tra, bảo trì và tính đầy đủ dữ liệu"
    ]
  },
  {
    "id": 72,
    "cluster": "energy",
    "title": "Hạ tầng viễn thông trong nhà máy điện gió gồm những gì?",
    "primaryKeyword": "viễn thông nhà máy điện gió",
    "answerFirst": "Hạ tầng thường kết nối turbine, trạm biến áp, SCADA, CCTV, thoại và mạng vận hành. Thiết kế cần dự phòng tuyến, chống sét, đồng bộ thời gian và phân tách mạng.",
    "region": "Miền Trung",
    "keyPoints": [
      "mạng cáp quang vòng ring",
      "switch công nghiệp và nguồn dự phòng",
      "SCADA/CCTV/VoIP",
      "tiếp địa và chống sét"
    ]
  },
  {
    "id": 73,
    "cluster": "energy",
    "title": "Trạm biến áp 110kV gồm những hệ thống chính nào?",
    "primaryKeyword": "trạm biến áp 110kV",
    "answerFirst": "Một trạm 110kV bao gồm thiết bị nhất thứ, hệ thống bảo vệ–điều khiển, đo lường, nguồn AC/DC, SCADA, viễn thông, tiếp địa và hạ tầng xây dựng.",
    "region": "Việt Nam",
    "keyPoints": [
      "thiết bị nhất thứ",
      "bảo vệ và điều khiển",
      "nguồn tự dùng AC/DC",
      "SCADA, viễn thông và xây dựng"
    ]
  },
  {
    "id": 74,
    "cluster": "energy",
    "title": "Hệ thống nhị thứ trạm 110kV có vai trò gì?",
    "primaryKeyword": "hệ thống nhị thứ trạm 110kV",
    "answerFirst": "Hệ thống nhị thứ thực hiện bảo vệ, điều khiển, đo lường, tín hiệu và liên động. Chất lượng thiết kế logic, đấu dây, thử nghiệm và quản lý phiên bản cấu hình rất quan trọng.",
    "region": "Việt Nam",
    "keyPoints": [
      "rơle bảo vệ",
      "mạch điều khiển/liên động",
      "đo lường và tín hiệu",
      "bản vẽ, setting và thử nghiệm"
    ]
  },
  {
    "id": 75,
    "cluster": "energy",
    "title": "SCADA trạm điện: Từ tín hiệu hiện trường đến trung tâm điều khiển",
    "primaryKeyword": "SCADA trạm điện",
    "answerFirst": "SCADA thu thập trạng thái, đo lường, cảnh báo và lệnh điều khiển từ thiết bị trạm. Cần thống nhất danh sách điểm, giao thức, đồng bộ thời gian và kiểm thử end-to-end.",
    "region": "Việt Nam",
    "keyPoints": [
      "point list và địa chỉ",
      "IEC 61850/IEC 60870 khi áp dụng",
      "đồng bộ thời gian",
      "FAT/SAT và end-to-end"
    ]
  },
  {
    "id": 76,
    "cluster": "energy",
    "title": "Tiếp địa trạm điện và trạm viễn thông khác nhau ở điểm nào?",
    "primaryKeyword": "tiếp địa trạm điện viễn thông",
    "answerFirst": "Cả hai đều cần kiểm soát điện áp nguy hiểm và nhiễu, nhưng mức dòng sự cố, diện tích lưới, yêu cầu phối hợp thiết bị và tiêu chuẩn thiết kế khác nhau theo công trình.",
    "region": "Miền Trung",
    "keyPoints": [
      "dòng sự cố dự kiến",
      "điện áp bước/chạm",
      "liên kết đẳng thế",
      "đo kiểm và hồ sơ"
    ]
  },
  {
    "id": 77,
    "cluster": "energy",
    "title": "Thi công tuyến cáp điều khiển trong trạm biến áp",
    "primaryKeyword": "thi công cáp điều khiển trạm biến áp",
    "answerFirst": "Tuyến cáp điều khiển cần phân loại, tách khỏi cáp lực, chống nhiễu, đánh số hai đầu, kiểm tra continuity/insulation và cập nhật bản vẽ hoàn công.",
    "region": "Việt Nam",
    "keyPoints": [
      "phân tuyến cáp lực/điều khiển",
      "shield và tiếp địa một đầu khi phù hợp",
      "đánh số và terminal",
      "đo cách điện, thông mạch"
    ]
  },
  {
    "id": 78,
    "cluster": "energy",
    "title": "EPC năng lượng tái tạo: Phạm vi công việc cần làm rõ trong hợp đồng",
    "primaryKeyword": "EPC năng lượng tái tạo",
    "answerFirst": "Hợp đồng cần làm rõ thiết kế, cung cấp, xây lắp, thử nghiệm, đấu nối, giấy phép, nghiệm thu, bảo hành và các điều kiện loại trừ để kiểm soát giao diện và chi phí.",
    "region": "Việt Nam",
    "keyPoints": [
      "ranh giới thiết kế",
      "danh mục thiết bị và tiêu chuẩn",
      "đấu nối/thí nghiệm/nghiệm thu",
      "bảo hành và loại trừ"
    ]
  },
  {
    "id": 79,
    "cluster": "energy",
    "title": "Hệ hybrid Solar – Wind cho trạm viễn thông vùng xa",
    "primaryKeyword": "hybrid solar wind trạm viễn thông",
    "answerFirst": "Hệ hybrid cần được mô phỏng từ tài nguyên nắng/gió, phụ tải trạm, mức độ tin cậy, dung lượng lưu trữ và nguồn dự phòng; không nên cộng công suất thiết bị theo kinh nghiệm đơn giản.",
    "region": "Tây Nguyên và miền núi",
    "keyPoints": [
      "biểu đồ phụ tải 24 giờ",
      "dữ liệu bức xạ và gió",
      "dung lượng pin và máy phát dự phòng",
      "EMS và bảo trì"
    ]
  },
  {
    "id": 80,
    "cluster": "energy",
    "title": "O&M trạm biến áp: Các hạng mục kiểm tra định kỳ",
    "primaryKeyword": "bảo trì trạm biến áp 110kV",
    "answerFirst": "O&M phải dựa trên quy trình được phê duyệt, lịch sử sự cố và khuyến cáo thiết bị, gồm kiểm tra nhất thứ, nhị thứ, nguồn DC, SCADA, tiếp địa và hồ sơ.",
    "region": "Việt Nam",
    "keyPoints": [
      "kiểm tra ngoại quan/nhiệt",
      "thí nghiệm thiết bị",
      "nguồn DC và rơle",
      "SCADA, tiếp địa và hồ sơ"
    ]
  },
  {
    "id": 81,
    "cluster": "ctc",
    "title": "CTC – Năng lực thi công hạ tầng viễn thông, năng lượng và CNTT",
    "primaryKeyword": "Công ty Xây lắp Bưu điện Miền Trung CTC",
    "answerFirst": "CTC định hướng cung cấp giải pháp trong năng lượng tái tạo, CNTT và hạ tầng viễn thông; bài giới thiệu cần dẫn người đọc tới hồ sơ năng lực, chứng chỉ và dự án có thể kiểm chứng.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "lĩnh vực kinh doanh chính",
      "chứng chỉ năng lực còn hiệu lực",
      "nhân sự và thiết bị",
      "dự án, hợp đồng và đầu mối xác minh"
    ]
  },
  {
    "id": 82,
    "cluster": "ctc",
    "title": "Năng lực thi công đường truyền cáp viễn thông Hạng I của CTC",
    "primaryKeyword": "nhà thầu cáp viễn thông Hạng I",
    "answerFirst": "Nội dung nên giải thích phạm vi năng lực được cơ quan quản lý công bố, liên kết tới nguồn xác minh và minh họa bằng các tuyến cáp quang CTC đã thực hiện.",
    "region": "Miền Trung",
    "keyPoints": [
      "phạm vi chứng chỉ",
      "kinh nghiệm tuyến cáp",
      "đo kiểm và hồ sơ",
      "an toàn và hoàn trả mặt bằng"
    ]
  },
  {
    "id": 83,
    "cluster": "ctc",
    "title": "Danh mục dự án điện mặt trời tiêu biểu của CTC",
    "primaryKeyword": "dự án điện mặt trời CTC",
    "answerFirst": "Hồ sơ năng lực ghi nhận nhiều dự án áp mái và farm solar; bài tổng hợp phải giữ nguyên tên, địa điểm, công suất và phân biệt rõ phần việc của CTC khi có dữ liệu.",
    "region": "Việt Nam",
    "keyPoints": [
      "dự án áp mái doanh nghiệp",
      "farm solar",
      "công suất và địa điểm",
      "nguồn hồ sơ và phạm vi công việc"
    ]
  },
  {
    "id": 84,
    "cluster": "ctc",
    "title": "Dự án điện mặt trời áp mái VNPT Quảng Nam 100 kWp",
    "primaryKeyword": "điện mặt trời VNPT Quảng Nam 100 kWp",
    "answerFirst": "Hồ sơ CTC ghi dự án tại Tam Kỳ, Quảng Nam với công suất khoảng 100 kWp và trạng thái đã thực hiện; nội dung chi tiết khác cần được xác minh từ hồ sơ dự án trước khi công bố.",
    "region": "Tam Kỳ - Quảng Nam (nay thuộc Đà Nẵng)",
    "keyPoints": [
      "công suất được hồ sơ ghi nhận",
      "mô hình áp mái tòa nhà",
      "phạm vi vật tư và nhân công",
      "bài học khảo sát và nghiệm thu"
    ]
  },
  {
    "id": 85,
    "cluster": "ctc",
    "title": "Farm Solar Gio Linh – Quảng Trị công suất 4 MWp",
    "primaryKeyword": "Farm Solar Gio Linh 4 MWp",
    "answerFirst": "Hồ sơ năng lực liệt kê Farm Solar tại Gio Linh, Quảng Trị với công suất 4 MWp trong nhóm dự án đã thực hiện; không nên tự bổ sung vai trò EPC nếu chưa có hợp đồng chứng minh.",
    "region": "Gio Linh - Quảng Trị",
    "keyPoints": [
      "quy mô 4 MWp",
      "điều kiện khu vực miền Trung",
      "phạm vi CTC cần xác minh",
      "hồ sơ hình ảnh và nghiệm thu"
    ]
  },
  {
    "id": 86,
    "cluster": "ctc",
    "title": "Điện mặt trời áp mái Nhà máy Dệt may Châu Giang 3 MWp",
    "primaryKeyword": "điện mặt trời Dệt may Châu Giang 3 MWp",
    "answerFirst": "Hồ sơ CTC ghi dự án áp mái Nhà máy Dệt may Châu Giang tại Nam Lý, Ninh Bình với công suất 3 MWp, thuộc nhóm dự án đã thực hiện.",
    "region": "Ninh Bình",
    "keyPoints": [
      "quy mô áp mái công nghiệp",
      "địa điểm Nam Lý",
      "công suất 3 MWp",
      "phạm vi và tiến độ cần đối chiếu hồ sơ"
    ]
  },
  {
    "id": 87,
    "cluster": "ctc",
    "title": "Dự án Coco Việt Nam giai đoạn 1 công suất 2.531 kWp",
    "primaryKeyword": "điện mặt trời Coco Việt Nam 2531 kWp",
    "answerFirst": "Hồ sơ năng lực ghi dự án Công ty TNHH Dệt Quốc tế Coco Việt Nam giai đoạn 1 tại KCN Đất Đỏ với công suất 2.531 kWp; bài đăng cần dùng hình ảnh và phạm vi công việc đã được duyệt.",
    "region": "KCN Đất Đỏ - TP.HCM",
    "keyPoints": [
      "công suất 2.531 kWp",
      "mô hình nhà máy dệt",
      "địa điểm KCN Đất Đỏ",
      "nguồn hình ảnh và phạm vi công việc"
    ]
  },
  {
    "id": 88,
    "cluster": "ctc",
    "title": "Tuyến cáp quang 96FO Phan Rang – Đà Lạt: Bài toán thi công đường dài",
    "primaryKeyword": "tuyến cáp quang 96FO Phan Rang Đà Lạt",
    "answerFirst": "Hồ sơ CTC ghi hợp đồng thi công tuyến cáp quang 96FO từ Phan Rang đến Đà Lạt ở trạng thái đang thi công tại thời điểm lập hồ sơ; trạng thái hiện tại cần cập nhật trước khi xuất bản.",
    "region": "Ninh Thuận - Lâm Đồng",
    "keyPoints": [
      "tuyến đường dài và địa hình",
      "cáp 96FO",
      "đo kiểm và hoàn trả",
      "cập nhật trạng thái dự án"
    ]
  },
  {
    "id": 89,
    "cluster": "ctc",
    "title": "Nhà máy điện gió Hướng Hiệp 1 và kinh nghiệm hạ tầng năng lượng",
    "primaryKeyword": "Nhà máy điện gió Hướng Hiệp 1 CTC",
    "answerFirst": "Hồ sơ năng lực liệt kê Nhà máy điện gió Hướng Hiệp 1 trong nhóm dự án đã thực hiện; bài viết chỉ nên trình bày phần việc có chứng cứ và tránh đồng nhất tên dự án với vai trò tổng thầu.",
    "region": "Quảng Trị",
    "keyPoints": [
      "dự án điện gió",
      "hạ tầng xây lắp",
      "giao diện viễn thông/điện",
      "phạm vi hợp đồng cần xác minh"
    ]
  },
  {
    "id": 90,
    "cluster": "ctc",
    "title": "Kinh nghiệm cung cấp và thi công trạm 110kV của CTC",
    "primaryKeyword": "trạm 110kV CTC",
    "answerFirst": "Hồ sơ CTC thể hiện kinh nghiệm tại trạm 110kV Hướng Linh và Thạnh Hải; bài năng lực cần nêu đúng thiết bị, dịch vụ và chủ đầu tư theo hợp đồng được phép công bố.",
    "region": "Miền Trung và Bến Tre",
    "keyPoints": [
      "trạm 110kV Hướng Linh",
      "trạm 110kV Thạnh Hải",
      "phần nhất thứ/nhị thứ",
      "thử nghiệm và hồ sơ bàn giao"
    ]
  },
  {
    "id": 91,
    "cluster": "geo",
    "title": "Đơn vị cung cấp thiết bị mạng doanh nghiệp tại Đà Nẵng: Cách đánh giá",
    "primaryKeyword": "thiết bị mạng Đà Nẵng",
    "answerFirst": "Doanh nghiệp nên đánh giá nhà cung cấp theo khả năng khảo sát, thiết kế, chứng minh nguồn gốc model, cấu hình, bảo hành và hỗ trợ sau bán hàng; không chỉ so sánh đơn giá.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "khảo sát và sơ đồ đề xuất",
      "model, serial và nguồn hàng",
      "cấu hình và bàn giao",
      "SLA hỗ trợ tại Đà Nẵng"
    ]
  },
  {
    "id": 92,
    "cluster": "geo",
    "title": "Thi công điện mặt trời áp mái tại Đà Nẵng cần lưu ý gì?",
    "primaryKeyword": "điện mặt trời áp mái Đà Nẵng",
    "answerFirst": "Công trình tại Đà Nẵng cần đặc biệt xem xét tải gió, ăn mòn, chống thấm, tiếp địa, hành lang bảo trì và giải pháp vận hành trong điều kiện nắng nóng, mưa bão.",
    "region": "Đà Nẵng",
    "keyPoints": [
      "tải gió và liên kết mái",
      "ăn mòn và vật liệu",
      "thoát nước/chống thấm",
      "khả năng hỗ trợ O&M địa phương"
    ]
  },
  {
    "id": 93,
    "cluster": "geo",
    "title": "Nhà thầu thi công cáp quang miền Trung: 8 tiêu chí lựa chọn",
    "primaryKeyword": "thi công cáp quang miền Trung",
    "answerFirst": "Nên lựa chọn nhà thầu dựa trên năng lực tuyến cáp, an toàn, thiết bị đo, đội ứng cứu, hồ sơ hoàn công và kinh nghiệm phối hợp địa phương.",
    "region": "Miền Trung",
    "keyPoints": [
      "chứng chỉ và kinh nghiệm",
      "máy hàn, OTDR và thiết bị",
      "ứng cứu sự cố",
      "hồ sơ tuyến và hoàn trả"
    ]
  },
  {
    "id": 94,
    "cluster": "geo",
    "title": "Ắc quy viễn thông tại TP.HCM: Chọn giải pháp thay thế theo tải trạm",
    "primaryKeyword": "ắc quy viễn thông TP.HCM",
    "answerFirst": "Thay ắc quy trạm cần khảo sát tải, tủ nguồn, dây cáp, nhiệt độ, khả năng vận chuyển và quy trình thu hồi bình cũ; không nên thay theo mã Ah duy nhất.",
    "region": "TP.HCM",
    "keyPoints": [
      "khảo sát tải và thời gian dự phòng",
      "kích thước tủ và cáp",
      "nhiệt độ phòng trạm",
      "thu hồi và bàn giao bình cũ"
    ]
  },
  {
    "id": 95,
    "cluster": "geo",
    "title": "Điện mặt trời tại Quảng Trị: Bài toán mái nhà xưởng và Farm Solar",
    "primaryKeyword": "điện mặt trời Quảng Trị",
    "answerFirst": "Quảng Trị có cả nhu cầu áp mái và dự án mặt đất; nội dung tư vấn cần phân biệt loại công trình, điều kiện gió bão, đấu nối và kế hoạch bảo trì.",
    "region": "Quảng Trị",
    "keyPoints": [
      "áp mái và farm solar",
      "gió bão và kết cấu",
      "đường dây/đấu nối",
      "O&M và tiếp cận dự án"
    ]
  },
  {
    "id": 96,
    "cluster": "geo",
    "title": "Thiết kế mạng cho doanh nghiệp tại Gia Lai và khu vực Tây Nguyên",
    "primaryKeyword": "thiết bị mạng Gia Lai",
    "answerFirst": "Doanh nghiệp Tây Nguyên cần chú ý khoảng cách điểm, chống sét, nguồn điện, kết nối liên chi nhánh và khả năng hỗ trợ từ xa khi thiết kế mạng.",
    "region": "Gia Lai - Tây Nguyên",
    "keyPoints": [
      "khoảng cách và uplink quang",
      "chống sét và nguồn dự phòng",
      "VPN chi nhánh",
      "giám sát từ xa"
    ]
  },
  {
    "id": 97,
    "cluster": "geo",
    "title": "Giải pháp Data Center và phòng máy cho doanh nghiệp tại Hà Nội",
    "primaryKeyword": "Data Center doanh nghiệp Hà Nội",
    "answerFirst": "Phòng máy doanh nghiệp cần được thiết kế theo tải IT, dự phòng, không gian, điều hòa, UPS, cáp và kế hoạch mở rộng; vị trí địa lý chỉ là một phần của bài toán.",
    "region": "Hà Nội",
    "keyPoints": [
      "tải IT và tăng trưởng",
      "UPS/làm mát",
      "tủ rack và cáp",
      "giám sát và sao lưu"
    ]
  },
  {
    "id": 98,
    "cluster": "geo",
    "title": "Điện mặt trời nhà xưởng tại Khánh Hòa: Quy trình từ khảo sát đến O&M",
    "primaryKeyword": "điện mặt trời nhà xưởng Khánh Hòa",
    "answerFirst": "Quy trình nên bao gồm phụ tải, kết cấu mái, môi trường ven biển nếu có, thiết kế điện, thi công, nghiệm thu và kế hoạch O&M phù hợp.",
    "region": "Khánh Hòa",
    "keyPoints": [
      "phụ tải ban ngày",
      "ăn mòn môi trường ven biển",
      "thiết kế bảo vệ và tiếp địa",
      "O&M và vệ sinh"
    ]
  },
  {
    "id": 99,
    "cluster": "geo",
    "title": "Thiết bị viễn thông tại Đắk Lắk: Router, cáp quang và nguồn dự phòng",
    "primaryKeyword": "thiết bị viễn thông Đắk Lắk",
    "answerFirst": "Giải pháp tại Đắk Lắk nên được thiết kế theo khoảng cách, mô hình chi nhánh, điều kiện nguồn, chống sét và khả năng quản trị từ xa thay vì chọn từng thiết bị rời rạc.",
    "region": "Đắk Lắk",
    "keyPoints": [
      "router/VPN chi nhánh",
      "uplink cáp quang",
      "nguồn và ắc quy dự phòng",
      "giám sát tập trung"
    ]
  },
  {
    "id": 100,
    "cluster": "geo",
    "title": "Nhà thầu hạ tầng viễn thông và năng lượng tái tạo trên toàn quốc",
    "primaryKeyword": "nhà thầu viễn thông năng lượng tái tạo",
    "answerFirst": "Một nhà thầu phù hợp phải chứng minh năng lực pháp lý, nhân sự, thiết bị, dự án tương tự, quy trình an toàn, hồ sơ nghiệm thu và khả năng hỗ trợ sau bàn giao.",
    "region": "Việt Nam",
    "keyPoints": [
      "năng lực và chứng chỉ",
      "dự án tương tự có xác minh",
      "quy trình chất lượng/an toàn",
      "hỗ trợ và bảo hành"
    ]
  }
] as Topic[];

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function cleanText(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number): string {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).trim() + '…';
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function getSecondaryKeywords(topic: Topic, cluster: Cluster): string[] {
  const regional =
    topic.region === 'Việt Nam'
      ? []
      : [
          `${topic.primaryKeyword} ${topic.region}`,
          `${cluster.category.toLowerCase()} ${topic.region}`,
        ];

  return unique([
    ...topic.keyPoints,
    ...regional,
    `tư vấn ${topic.primaryKeyword}`,
    `giải pháp ${cluster.category.toLowerCase()}`,
    'CTC Đà Nẵng',
  ]).slice(0, 10);
}

function buildFaq(topic: Topic, cluster: Cluster) {
  return [
    {
      question: `${topic.primaryKeyword} cần kiểm tra yếu tố nào trước tiên?`,
      answer: `Cần bắt đầu từ nhu cầu thực tế, hiện trạng hệ thống và các tiêu chí: ${topic.keyPoints.join(', ')}. Không nên chốt thiết bị hoặc phương án chỉ từ một thông số đơn lẻ.`,
    },
    {
      question: `Có thể báo giá ${topic.primaryKeyword} mà không khảo sát không?`,
      answer: `Có thể đưa ra mức tham khảo ban đầu, nhưng báo giá triển khai cần xác nhận phạm vi, số lượng, điều kiện lắp đặt, cấu hình, đo kiểm, hồ sơ và trách nhiệm bảo hành.`,
    },
    {
      question: `CTC hỗ trợ khu vực nào?`,
      answer: `CTC có trụ sở tại Đà Nẵng và định hướng cung cấp giải pháp, thiết bị và dịch vụ dự án trên phạm vi Việt Nam. Khả năng khảo sát tại ${topic.region} cần được xác nhận theo từng yêu cầu cụ thể.`,
    },
  ];
}

function renderList(items: string[]): string {
  return items.map((item) => `<li>${item}</li>`).join('\n');
}

function buildArticleContent(topic: Topic, cluster: Cluster): string {
  const faqs = buildFaq(topic, cluster);
  const related = cluster.internalLinks
    .map(
      (url) =>
        `<li><a href="${url}" title="Xem nội dung liên quan">${url}</a></li>`
    )
    .join('\n');

  return `
<article class="ctc-article">
  <p class="answer-first"><strong>Trả lời nhanh:</strong> ${topic.answerFirst}</p>

  <p>
    Bài viết này tập trung vào từ khóa <strong>${topic.primaryKeyword}</strong>,
    dành cho doanh nghiệp, chủ đầu tư và bộ phận kỹ thuật đang cần một cơ sở
    rõ ràng trước khi chọn thiết bị hoặc triển khai dự án tại
    <strong>${topic.region}</strong>.
  </p>

  <h2>Vì sao chủ đề này quan trọng?</h2>
  <p>${cluster.overview}</p>
  <p>
    Với mỗi dự án, thông số cuối cùng phải được đối chiếu bằng khảo sát,
    datasheet đúng model, bản vẽ, tiêu chuẩn áp dụng và điều kiện hợp đồng.
    Nội dung trên website không thay thế thiết kế kỹ thuật hoặc hồ sơ được phê duyệt.
  </p>

  <h2>${topic.title}: Các tiêu chí cần kiểm tra</h2>
  <ul>
    ${renderList(topic.keyPoints)}
  </ul>
  <p>
    Bốn nhóm tiêu chí trên nên được ghi thành bảng yêu cầu kỹ thuật để các phương án
    được so sánh trên cùng một cơ sở. Khi một nhà cung cấp chỉ đưa model và giá,
    người mua chưa có đủ dữ liệu để đánh giá phạm vi hoặc tổng chi phí vận hành.
  </p>

  <h2>Quy trình triển khai đề xuất</h2>
  <ol>
    ${renderList(cluster.steps)}
  </ol>
  <p>
    Tùy quy mô, quy trình có thể bổ sung bước thử nghiệm mẫu, FAT, SAT,
    kiểm thử chuyển đổi, đào tạo hoặc theo dõi sau bàn giao. Các mốc nghiệm thu
    nên được xác định ngay từ báo giá và hợp đồng.
  </p>

  <h2>Những sai lầm thường gặp</h2>
  <ul>
    ${renderList(cluster.mistakes)}
  </ul>
  <p>
    Sai lầm phổ biến nhất là dùng một cấu hình cho mọi công trình. Điều kiện tại
    ${topic.region} chỉ có giá trị khi được liên hệ với môi trường lắp đặt,
    phụ tải, khoảng cách hỗ trợ và loại công trình cụ thể; không nên dùng tên
    địa phương như một cách nhồi từ khóa.
  </p>

  <h2>Gợi ý chuẩn bị thông tin trước khi liên hệ CTC</h2>
  <ul>
    <li>Tên công trình, địa điểm và đầu mối kỹ thuật.</li>
    <li>Hiện trạng, sơ đồ hoặc ảnh khu vực cần khảo sát.</li>
    <li>Quy mô người dùng, tải, công suất, số lượng hoặc khoảng cách tuyến.</li>
    <li>Mục tiêu vận hành, thời gian triển khai và yêu cầu hồ sơ.</li>
    <li>Model hoặc tiêu chuẩn bắt buộc nếu hồ sơ mời thầu đã quy định.</li>
  </ul>

  <h2>Câu hỏi thường gặp</h2>
  ${faqs
    .map(
      (faq) => `
  <h3>${faq.question}</h3>
  <p>${faq.answer}</p>`
    )
    .join('\n')}

  <h2>Nội dung liên quan</h2>
  <ul>${related}</ul>

  <p class="editorial-note">
    <strong>Lưu ý biên tập:</strong> Bài được tạo từ kế hoạch nội dung SEO/GEO.
    Trước khi xuất bản, CTC cần bổ sung người duyệt chuyên môn, hình ảnh có quyền sử dụng,
    liên kết sản phẩm/dự án thực tế và nguồn cho mọi thông số cụ thể.
  </p>
</article>`.trim();
}

function buildStructuredData(
  topic: Topic,
  cluster: Cluster,
  slug: string,
  metaDescription: string,
  faq: ReturnType<typeof buildFaq>
) {
  const canonical = `${SITE_ORIGIN}/tin-tuc/${slug}`;

  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: topic.title,
    description: metaDescription,
    mainEntityOfPage: canonical,
    url: canonical,
    image: [cluster.image],
    inLanguage: 'vi-VN',
    about: [
      { '@type': 'Thing', name: topic.primaryKeyword },
      { '@type': 'Thing', name: cluster.category },
    ],
    contentLocation: {
      '@type': 'Place',
      name: topic.region,
    },
    spatialCoverage: 'Việt Nam',
    author: {
      '@type': 'Organization',
      name: COMPANY.name,
      url: COMPANY.url,
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY.name,
      alternateName: COMPANY.alternateName,
      url: COMPANY.url,
    },
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tin tức',
        item: `${SITE_ORIGIN}/tin-tuc`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cluster.category,
        item: `${SITE_ORIGIN}/tin-tuc/danh-muc/${cluster.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: topic.title,
        item: canonical,
      },
    ],
  };

  return [article, faqPage, breadcrumb];
}

async function ensureCategories() {
  const map = new Map<string, mongoose.Types.ObjectId>();
  let order = 1;

  for (const cluster of Object.values(CLUSTERS)) {
    const existing = await NewsCategory.collection.findOne({ slug: cluster.slug });
    const categoryId = (existing?._id as mongoose.Types.ObjectId | undefined) || new mongoose.Types.ObjectId();

    await NewsCategory.collection.updateOne(
      { _id: categoryId },
      {
        $set: {
          name: cluster.category,
          slug: cluster.slug,
          description: cluster.description,
          order,
          isActive: true,
        },
      },
      { upsert: true }
    );

    map.set(cluster.slug, categoryId);
    order += 1;
  }

  return map;
}

function validateTopics(): void {
  if (TOPICS.length !== 100) {
    throw new Error(`Phải có đúng 100 chủ đề, hiện có ${TOPICS.length}.`);
  }

  const titles = new Set<string>();
  const slugs = new Set<string>();

  for (const topic of TOPICS) {
    if (!CLUSTERS[topic.cluster]) {
      throw new Error(`Cluster không hợp lệ: ${topic.cluster}`);
    }
    if (topic.keyPoints.length < 4) {
      throw new Error(`Chủ đề ${topic.id} chưa đủ 4 key points.`);
    }

    const titleKey = topic.title.toLowerCase();
    const slug = slugify(topic.title);

    if (titles.has(titleKey)) throw new Error(`Trùng title: ${topic.title}`);
    if (slugs.has(slug)) throw new Error(`Trùng slug: ${slug}`);

    titles.add(titleKey);
    slugs.add(slug);
  }
}

async function writePreview(rows: unknown[]): Promise<void> {
  const cacheDir = path.resolve(__dirname, '../.cache/seed-100-news');
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(
    path.join(cacheDir, 'news-preview.json'),
    JSON.stringify(rows, null, 2),
    'utf8'
  );
}

async function main(): Promise<void> {
  validateTopics();

  console.log('\n============================================================');
  console.log('CTC — SEED 100 BÀI VIẾT SEO + GEO');
  console.log('============================================================');
  console.log(`PUBLISH_NEWS : ${PUBLISH_NEWS}`);
  console.log(`INDEX_NEWS   : ${INDEX_NEWS}`);
  console.log(`DRY_RUN      : ${DRY_RUN}`);
  console.log('============================================================\n');

  const preview = TOPICS.map((topic) => {
    const cluster = CLUSTERS[topic.cluster];
    const slug = slugify(topic.title);
    const content = buildArticleContent(topic, cluster);
    const metaTitle = truncate(`${topic.title} | CTC`, 62);
    const metaDescription = truncate(
      `${topic.answerFirst} Tư vấn từ CTC tại ${topic.region}.`,
      158
    );
    const secondaryKeywords = getSecondaryKeywords(topic, cluster);
    const faq = buildFaq(topic, cluster);

    return {
      title: topic.title,
      slug,
      primaryKeyword: topic.primaryKeyword,
      category: cluster.category,
      region: topic.region,
      wordCountApprox: cleanText(content).split(/\s+/).length,
      metaTitle,
      metaDescription,
      secondaryKeywords,
    };
  });

  await writePreview(preview);

  if (DRY_RUN) {
    console.log('🧪 DRY_RUN=true: đã tạo preview, chưa ghi MongoDB.');
    console.log(`✅ Số bài hợp lệ: ${preview.length}`);
    return;
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB.');

  if (RESET_ALL) {
    const db = mongoose.connection.db;
    if (db) {
      const res1 = await db.collection('news').deleteMany({}).catch(() => ({ deletedCount: 0 }));
      const res2 = await db.collection('newsarticles').deleteMany({}).catch(() => ({ deletedCount: 0 }));
      const res3 = await db.collection('newscategories').deleteMany({}).catch(() => ({ deletedCount: 0 }));
      console.log(`🗑️ Đã xóa sạch toàn bộ bài viết cũ (${(res1.deletedCount || 0) + (res2.deletedCount || 0)} bài) và danh mục tin tức cũ (${res3.deletedCount || 0} danh mục).`);
    }
  }

  const categoryMap = await ensureCategories();
  let upserted = 0;

  for (const topic of TOPICS) {
    const cluster = CLUSTERS[topic.cluster];
    const slug = slugify(topic.title);
    const canonicalPath = `/tin-tuc/${slug}`;
    const content = buildArticleContent(topic, cluster);
    const excerpt = truncate(topic.answerFirst, 220);
    const metaTitle = truncate(`${topic.title} | CTC`, 62);
    const metaDescription = truncate(
      `${topic.answerFirst} Tư vấn từ CTC tại ${topic.region}.`,
      158
    );
    const secondaryKeywords = getSecondaryKeywords(topic, cluster);
    const faq = buildFaq(topic, cluster);

    const doc = {
      title: topic.title,
      slug,
      excerpt,
      content,
      category: cluster.category,
      categoryId: categoryMap.get(cluster.slug),
      coverImage: cluster.image,
      imageAlt: `${topic.title} - hình minh họa chuyên ngành`,
      authorName: 'Ban biên tập CTC',
      reviewerName: '',
      status: PUBLISH_NEWS ? 'published' : 'draft',
      isPublished: PUBLISH_NEWS,
      publishedAt: PUBLISH_NEWS ? new Date() : undefined,
      tags: unique([
        topic.primaryKeyword,
        cluster.category,
        topic.region,
        ...secondaryKeywords.slice(0, 5),
      ]),
      seo: {
        metaTitle,
        metaDescription,
        focusKeyword: topic.primaryKeyword,
        secondaryKeywords,
        canonicalPath,
        canonicalUrl: `${SITE_ORIGIN}${canonicalPath}`,
        robotsIndex: PUBLISH_NEWS && INDEX_NEWS,
        robotsFollow: true,
        ogTitle: metaTitle,
        ogDescription: metaDescription,
        ogImage: cluster.image,
      },
      geo: {
        standard: 'SEO-GEO-AEO-v1',
        answerFirst: topic.answerFirst,
        primaryEntity: topic.primaryKeyword,
        contentLocation: topic.region,
        primaryOffice: COMPANY.address,
        areaServed: COMPANY.areaServed,
        questionsAnswered: faq.map((item) => item.question),
        keyFacts: topic.keyPoints,
        factualBoundary:
          'Không tự suy diễn thông số, giá, chứng nhận, vai trò dự án hoặc trạng thái công trình. Phải kiểm tra datasheet, hợp đồng và hồ sơ được duyệt trước khi xuất bản.',
        citationReady: false,
      },
      structuredData: buildStructuredData(
        topic,
        cluster,
        slug,
        metaDescription,
        faq
      ),
      editorial: {
        reviewRequired: true,
        technicalReviewerRequired: true,
        imageRightsReviewRequired: true,
        sourceStatus:
          topic.cluster === 'ctc'
            ? 'Đối chiếu HSNL 06.2026 CTC Solar và hồ sơ hợp đồng.'
            : 'Cần bổ sung datasheet, tiêu chuẩn hoặc nguồn kỹ thuật phù hợp.',
        internalLinkSuggestions: cluster.internalLinks,
        searchIntent:
          topic.cluster === 'ctc'
            ? 'navigational-commercial'
            : topic.cluster === 'geo'
              ? 'local-commercial'
              : 'informational-commercial',
      },
      seedSource: SEED_SOURCE,
    };

    await NewsArticle.collection.updateOne(
      { slug },
      { $set: doc },
      { upsert: true }
    );

    upserted += 1;
    console.log(`✅ ${String(upserted).padStart(3, '0')}/100 — ${topic.title}`);
  }

  for (const cluster of Object.values(CLUSTERS)) {
    const categoryId = categoryMap.get(cluster.slug);
    const count = await NewsArticle.countDocuments({ categoryId });
    if (categoryId) {
      await NewsCategory.collection.updateOne(
        { _id: categoryId },
        { $set: { articleCount: count } }
      );
    }
  }

  console.log(`\n🎉 Hoàn thành upsert ${upserted} bài viết.`);
  console.log(
    PUBLISH_NEWS
      ? '⚠️ Bài đã được xuất bản theo cấu hình. Hãy kiểm tra kỹ nội dung.'
      : '📝 Bài đang ở trạng thái draft/noindex để duyệt biên tập.'
  );
}

main()
  .catch((error) => {
    console.error('\n❌ Seed thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
