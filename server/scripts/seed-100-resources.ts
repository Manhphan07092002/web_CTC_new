import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const DocumentCategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ResourceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fileUrl: { type: String, required: true },
  type: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'DocumentCategory', required: true },
  size: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DocumentCategory: any = mongoose.models.DocumentCategory || mongoose.model('DocumentCategory', DocumentCategorySchema);
const Resource: any = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

const CATEGORIES_DATA = [
  { name: 'Catalogue & Brochure', description: 'Catalogue thông số kỹ thuật tấm pin, inverter và vật tư năng lượng mặt trời.' },
  { name: 'Hướng Dẫn Sử Dụng & Vận Hành', description: 'Cẩm nang hướng dẫn lắp đặt, vận hành và xử lý sự cố thiết bị.' },
  { name: 'Hồ Sơ Năng Lực & Pháp Lý', description: 'Hồ sơ năng lực nhà thầu EPC CTC, chứng chỉ năng lực hoạt động xây dựng và giấy phép.' },
  { name: 'Chứng Nhận CO/CQ & ISO', description: 'Chứng nhận xuất xứ CO, chứng nhận chất lượng CQ, chứng chỉ TUV, UL, ISO.' },
  { name: 'Bản Vẽ Kỹ Thuật CAD', description: 'Bản vẽ thiết kế hệ thống, sơ đồ nguyên lý điện và kết cấu khung giàn solar.' },
  { name: 'Phần Mềm & Firmware Biến Tần', description: 'Phần mềm giám sát SCADA, công cụ cấu hình inverter và bản cập nhật firmware.' }
];

// Sample PDF / Doc URLs
const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const SAMPLE_DOCS_DATA = [
  // ── Category 1: Catalogue & Brochure (20 docs) ──
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Tấm Pin Canadian Solar HiKu6 Mono PERC 550W - 570W', size: '3.8 MB', desc: 'Thông số kỹ thuật chi tiết, biểu đồ suy hao quang điện và kích thước cơ khí tấm pin Canadian Solar.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Tấm Pin LONGI Solar Hi-MO 6 Scientist 580W N-type TOPCon', size: '4.2 MB', desc: 'Tài liệu giới thiệu dòng tấm pin N-type hiệu suất cực cao 22.8% dùng cho dự án công nghiệp.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Biến Tần Huawei SUN2000-100KTL-M2 (100kW 3 Pha)', size: '2.9 MB', desc: 'Datasheet chi tiết dòng inverter chuỗi công suất lớn tích hợp bảo vệ AFCI thông minh của Huawei.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Biến Tần Hòa Lưới SMA Sunny Tripower CORE2 110kW', size: '5.1 MB', desc: 'Thông số kỹ thuật inverter thương hiệu Đức cao cấp hỗ trợ 12 MPPT độc lập.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Tấm Pin Trina Solar Vertex N 700W+ Siêu Công Suất', size: '3.4 MB', desc: 'Dòng pin 210mm N-type tối ưu chi phí LCOE cho các nhà máy điện mặt trời trang trại.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Hệ Thống Lưu Trữ Điện BESS Huawei LUNA2000-200KWH', size: '6.5 MB', desc: 'Hệ thống container lưu trữ năng lượng pin Lithium LFP công nghiệp tích hợp PCCC tự động.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Biến Tần Hybrid Deye 12kW 3 Pha Lưu Trữ Thông Minh', size: '2.1 MB', desc: 'Biến tần hybrid đa năng hỗ trợ kết nối máy phát điện và chạy độc lập Off-grid.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Tấm Pin Jinko Solar Tiger Neo N-type 565W - 585W', size: '3.9 MB', desc: 'Datasheet tấm pin Jinko công nghệ HOT 2.0 chống suy giảm nhiệt độ vượt trội.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Biến Tần Chuỗi Sungrow SG110CX 110kW', size: '2.7 MB', desc: 'Thông số inverter Sungrow công nghiệp hiệu suất 98.7% tiêu chuẩn bảo vệ IP66.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Tủ Điện Phân Phối AC/DC Chuyên Dụng Solar CTC-Combo', size: '1.8 MB', desc: 'Tủ điện tích hợp aptomat MCCB, chống sét lan truyền SPD và thiết bị đo đếm điện năng.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Hệ Thống Khung Giá Đỡ Mái Tôn Kẹp Seamlock Al6005-T5', size: '2.3 MB', desc: 'Catalogue phụ kiện nhôm định hình mạ anodized chịu sức gió bão cấp 14.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Dây Cáp Điện DC Solar 4mm2 / 6mm2 Tiêu Chuẩn EN 50618', size: '1.5 MB', desc: 'Cáp điện DC lõi đồng mạ tin chống oxy hóa, cách điện XLPO hai lớp chịu nhiệt 120°C.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Đầu Nối MC4 Staubli PV-KBT4 / KST4 Thụy Sỹ', size: '1.1 MB', desc: 'Giắc nối MC4 chính hãng Staubli chống nước IP68 chịu dòng điện DC 45A.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Biến Tần Hybrid Growatt SPH 10000TL3 BH-UP 10kW', size: '2.6 MB', desc: 'Datasheet inverter hybrid 3 pha phù hợp biệt thự và văn phòng công ty.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Pin Lưu Trữ Lithium LiFePO4 EVE 51.2V 100Ah / 200Ah', size: '3.1 MB', desc: 'Khối pin lưu trữ Lithium sắt phosphate tuổi thọ 6000 chu kỳ sạc xả.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Thiết Bị Chống Sét Lan Truyền DC SPD Dehn Guard 1000V', size: '1.9 MB', desc: 'Thiết bị bảo vệ quá áp chống sét lan truyền cao cấp xuất xứ CHLB Đức.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Đồng Hồ Đo Đếm Điện Năng 3 Pha Chuyện Dụng Chống Phát Lưới Smart Meter', size: '1.4 MB', desc: 'Thiết bị đo đếm bù công suất Zero-Export kết nối RS485 Modbus RTU.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Trạm Biến Áp Hợp Bộ Kiểu Kios 1000kVA 22/0.4kV CTC', size: '4.8 MB', desc: 'Trọn bộ trạm biến áp Kios vỏ thép sơn tĩnh điện ngoài trời phục vụ đóng lưới.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Brochure Máy Rửa Tấm Pin Solar Tự Động Bằng Robot CTC-Bot X1', size: '3.3 MB', desc: 'Robot rửa pin mặt trời điều khiển từ xa làm sạch 1000m2 mái tôn/giờ.' },
  { cat: 'Catalogue & Brochure', type: 'pdf', title: 'Catalogue Hệ Thống Giám Sát Năng Lượng Thông Minh CTC-SCADA Cloud', size: '2.5 MB', desc: 'Giải pháp phần mềm Web & App theo dõi sản lượng điện năng mặt trời 24/7.' },

  // ── Category 2: Hướng Dẫn Sử Dụng & Vận Hành (20 docs) ──
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Vận Hành & Bảo Trì Hệ Thống Điện Mặt Trời Mái Nhà CTC', size: '5.4 MB', desc: 'Quy trình vận hành an toàn, kiểm tra định kỳ và khắc phục các sự cố thường gặp.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Cẩm Nang Hướng Dẫn Cài Đặt Ứng Dụng Giám Sát Huawei FusionSolar App', size: '3.2 MB', desc: 'Hướng dẫn từng bước tạo tài khoản, quét mã QR thêm thiết bị và xem biểu đồ sản lượng.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Thi Công Lắp Đặt Khung Nhôm Định Hình & Kẹp Pin Mái Tôn', size: '4.1 MB', desc: 'Quy chuẩn lực siết bu-lông, khoảng cách xà gồ và giải pháp chống dột thấm nước.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Quy Trình An Toàn Lao Động & Thi Công Làm Việc Trên Mái Nhà Xưởng', size: '2.8 MB', desc: 'Quy định sử dụng dây an toàn, lưới hứng rơi và biện pháp đảm bảo an toàn điện.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Cấu Hình Chức Năng Bán Điện Tự Dùng Zero-Export Cho Inverter', size: '2.0 MB', desc: 'Các bước cài đặt giới hạn phát công suất lên lưới điện EVN qua Smart Meter.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Kiểm Tra & Đo Điện Trở Tiếp Địa Hệ Thống Chống Sét', size: '1.7 MB', desc: 'Phương pháp sử dụng máy đo điện trở cọc tiếp địa đạt chuẩn < 4 Ohm.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Cẩm Nang Xử Lý Lỗi Báo Động (Alarm Error Code) Biến Tần Huawei', size: '3.6 MB', desc: 'Danh sách mã lỗi báo động trên ứng dụng và hướng dẫn từng bước xử lý tại chỗ.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Bảo Dưỡng Rửa Tấm Pin Solar Bằng Dung Dịch Chuyên Dụng', size: '2.2 MB', desc: 'Nồng độ pha chế dung dịch tẩy rửa trung tính và lưu ý tuyệt đối không dùng nước cứng.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Quy Trình Đóng Cắt Điện & Thao Tác Tủ Điện Đấu Nối Hạ Áp 0.4kV', size: '2.9 MB', desc: 'Thứ tự thao tác đóng ngắt Aptomat DC, Aptomat AC và Cầu chì bảo vệ.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Đấu Nối Cáp Điện DC MC4 Đạt Chuẩn Chống Nước IP68', size: '1.6 MB', desc: 'Kỹ thuật dùng kìm tuốt dây, kìm bấm cốt rắc MC4 và thử tải lực kéo.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Kết Nối Wifi / 4G Smart Dongle Cho Inverter Khỏi Mất Kết Nối', size: '1.9 MB', desc: 'Cấu hình lại địa chỉ IP, Wifi router và cài đặt SIM 4G viễn thông.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Cài Đặt Thông Số Pin Lưu Trữ Lithium Cho Inverter Hybrid Deye', size: '3.0 MB', desc: 'Cấu hình điện áp sạc, dòng sạc tối đa và ngưỡng xả pin DOD 80%.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Quy Trình Kiểm Tra Định Kỳ Tủ Điện Chống Sét & Cầu Chì DC 1000V', size: '2.1 MB', desc: 'Đo kiểm thông mạch cầu chì chì DC và kiểm tra cửa sổ màu chỉ thị trạng thái SPD.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Sử Dụng Camera Nhiệt Chụp Phát Hiện Vệt Nóng Hotspot Tấm Pin', size: '3.7 MB', desc: 'Kỹ thuật rà quét phát hiện cell pin bị lỗi om nhiệt gây nguy cơ cháy nổ.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Cẩm Nang Khắc Phục Sự Cố Giảm Hiệu Suất Sản Lượng Điện Mặt Trời Mùa Mưa', size: '2.4 MB', desc: 'Các nguyên nhân dòng điện Voc/Isc giảm và cách kiểm tra cách điện dây dẫn (Iso Test).' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Cài Đặt Truyền Thông Modbus RS485 Cho Hệ Thống SCADA', size: '2.8 MB', desc: 'Sơ đồ chân dây nối RS485 A/B, địa chỉ slave ID và tốc độ bao Baudrate 9600.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Vận Hành An Toàn Máy Phát Điện Dự Phòng Tương Thích Solar', size: '3.3 MB', desc: 'Nguyên lý chuyển nguồn ATS tự động giữa Lưới điện - Solar - Máy phát.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Quy Trình Xử Lý Khẩn Cấp Khi Phát Hiện Sự Cố Cháy Nổ Tủ Điện Mái Nhà', size: '1.5 MB', desc: 'Thao tác nhấn nút ngắt khẩn Rapid Shutdown và dùng bình chữa cháy CO2/bọt.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Đăng Ký Tài Khoản Quản Trị Viên Doanh Nghiệp Trên Cloud CTC', size: '1.8 MB', desc: 'Ủy quyền phân quyền xem báo cáo sản lượng cho bộ phận kế toán và quản lý nhà máy.' },
  { cat: 'Hướng Dẫn Sử Dụng & Vận Hành', type: 'pdf', title: 'Hướng Dẫn Lập Báo Cáo Tiết Kiệm Năng Lượng & Giảm Phát Thải CO2 Hàng Tháng', size: '2.6 MB', desc: 'Xuất dữ liệu Excel từ phần mềm giám sát phục vụ báo cáo bền vững ESG.' },

  // ── Category 3: Hồ Sơ Năng Lực & Pháp Lý (20 docs) ──
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Hồ Sơ Năng Lực Nhà Thầu EPC Năng Lượng Tái Tạo CTC Năm 2026', size: '12.5 MB', desc: 'Bộ hồ sơ giới thiệu năng lực thi công, kinh nghiệm nhân sự và các dự án tiêu biểu CTC.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Giấy Chứng Nhận Đăng Ký Doanh Nghiệp CÔNG TY CP XÂY LẮP BƯU ĐIỆN MIỀN TRUNG', size: '1.2 MB', desc: 'Mã số doanh nghiệp 0400458940 đăng ký thay đổi lần thứ 15 do Sở KH&ĐT cấp.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Giấy Phép Hoạt Động Điện Lực - Lĩnh Vực Tương Đương Hạng 1 Bộ Công Thương', size: '2.1 MB', desc: 'Giấy phép tư vấn thiết kế, giám sát và thi công công trình đường dây & trạm biến áp.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Chứng Chỉ Năng Lực Hoạt Động Xây Dựng Hạng I - Bộ Xây Dựng Cấp', size: '2.8 MB', desc: 'Chứng chỉ đủ điều kiện làm tổng thầu EPC công trình công nghiệp năng lượng cấp I.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Chứng Nhận Hệ Thống Quản Lý Chất Lượng TCVN ISO 9001:2015 CTC', size: '1.6 MB', desc: 'Chứng chỉ chứng nhận quy trình thiết kế và thi công xây lắp đạt chuẩn ISO quốc tế.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Chứng Nhận Hệ Thống Quản Lý Môi Trường TCVN ISO 14001:2015 CTC', size: '1.5 MB', desc: 'Chứng nhận tuân thủ các quy định bảo vệ môi trường trong thi công xây lắp.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Chứng Nhận An Toàn & Sức Khỏe Nghề Nghiệp ISO 45001:2018 CTC', size: '1.7 MB', desc: 'Chứng nhận hệ thống quản lý an toàn lao động tại các công trình năng lượng.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Báo Cáo Tài Chính Đã Kiểm Toán 3 Năm Liên Tiếp (2023 - 2025) CTC', size: '6.8 MB', desc: 'Báo cáo tài chính minh bạch khẳng định năng lực tài chính vững mạnh của CTC.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Hồ Sơ Năng Lực Máy Móc Thiết Bị & Phương Tiện Thi Công Chuyên Dụng CTC', size: '4.5 MB', desc: 'Danh mục cẩu chuyên dụng, xe nâng, máy đo thử tải và thiết bị trắc đạc hiện đại.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Danh Sách Chứng Chỉ Hành Nghề Kỹ Sư Điện & Giám Sát Trưởng Công Trình CTC', size: '3.9 MB', desc: 'Tổng hợp chứng chỉ hành nghề xây dựng hạng I, II của đội ngũ kỹ sư chủ chốt.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Mẫu Hợp Đồng EPC Trọn Gói Thi Công Điện Mặt Trời Cho Doanh Nghiệp', size: '2.4 MB', desc: 'Dự thảo hợp đồng quy định rõ điều khoản cam kết tiến độ, bảo hành và phạt vi phạm.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Mẫu Hợp Đồng Hợp Tác Đầu Tư Mô Hình ESCO Năng Lượng Mặt Trời', size: '2.7 MB', desc: 'Hợp đồng hợp tác đầu tư 0 đồng dành cho các chủ sở hữu nhà xưởng công nghiệp.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Mẫu Hợp Đồng Dịch Vụ Vận Hành & Bảo Trì O&M Hệ Thống Solar Rooftop', size: '1.9 MB', desc: 'Các gói dịch vụ O&M tiêu chuẩn Gold/Platinum đảm bảo chỉ số sẵn sàng PR > 82%.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Văn Bản Cam Kết Bảo Hành Hiệu Suất 25 Năm Từ Nhà Sản Xuất Canadian Solar', size: '1.3 MB', desc: 'Thư cam kết bảo hành chính hãng được bảo hiểm bởi tập đoàn bảo hiểm Munich RE.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Văn Bản Cam Kết Bảo Hành 10 Năm Thiết Bị Biến Tần Huawei FusionSolar', size: '1.1 MB', desc: 'Chính sách bảo hành đổi mới 1 đổi 1 trong suốt thời hạn bảo hành của Huawei.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Quy Trình Thẩm Duyệt Hồ Sơ An Toàn Phòng Cháy Chữa Cháy PCCC Nhà Xưởng', size: '2.0 MB', desc: 'Hướng dẫn chuẩn bị tài liệu nộp Cảnh sát PCCC theo quy định Nghị định mới.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Hồ Sơ Thẩm Định Kiểm Định An Toàn Kết Cấu Mái Nhà Xưởng Chịu Tải Pin Solar', size: '3.6 MB', desc: 'Mẫu báo cáo kiểm định tải trọng mái tôn phục vụ cấp phép xây dựng.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Văn Bản Thỏa Thuận Đấu Nối Điện Mặt Trời Tự Sản Tự Tiêu Với Tập Đoàn EVN', size: '1.8 MB', desc: 'Mẫu biên bản thỏa thuận kỹ thuật đấu nối ranh giới tài sản với Điện lực.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Giấy Chứng Nhận Đăng Ký Nhãn Hiệu Thương Hiệu CTC Do Cục SHTT Cấp', size: '1.0 MB', desc: 'Bảo hộ bản quyền thương hiệu và logo CTC trên toàn quốc.' },
  { cat: 'Hồ Sơ Năng Lực & Pháp Lý', type: 'pdf', title: 'Chính Sách Bảo Mật Thông Tin Khách Hàng & An Toàn Dữ Liệu CTC', size: '1.2 MB', desc: 'Cam kết bảo mật tuyệt đối sơ đồ công nghệ và số liệu sản xuất của doanh nghiệp.' },

  // ── Category 4: Chứng Nhận CO/CQ & ISO (20 docs) ──
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận Xuất Xứ Hàng Hóa CO Form E - Tấm Pin Canadian Solar', size: '1.4 MB', desc: 'Chứng nhận xuất xứ nguyên gốc nhập khẩu chính ngạch có xác thực bộ công thương.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận Chất Lượng CQ Nhà Máy - Tấm Pin LONGI Solar Hi-MO 6', size: '1.6 MB', desc: 'Chứng chỉ chất lượng từng lô hàng thử nghiệm nghiệm thu tại nhà máy sản xuất.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận An Toàn Quốc Tế TÜV Rheinland IEC 61215 / IEC 61730 Tấm Pin Solar', size: '2.5 MB', desc: 'Chứng chỉ thử nghiệm độ bền cơ học, chống tải trọng tuyết gió và lão hóa nhiệt.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn An Toàn UL 1741 Cho Biến Tần Huawei FusionSolar', size: '2.1 MB', desc: 'Chứng chỉ kiểm định tiêu chuẩn an toàn điện khắt khe nhất của thị trường Mỹ.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận Tiêu Chuẩn Châu Âu CE Mark Cho Inverter Hòa Lưới SMA', size: '1.3 MB', desc: 'Chứng nhận tương thích điện từ EMC và an toàn hạ áp theo chỉ thị EU.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Kiểm Định Độ Bền Chống Sương Muối Salt Mist IEC 61701', size: '1.9 MB', desc: 'Chứng chỉ kiểm định độ bền tấm pin lắp đặt tại khu vực ven biển Miền Trung.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Kiểm Định Độ Bền Chống Ăn Mòn Amoniac Ammonia IEC 62716', size: '1.8 MB', desc: 'Chứng chỉ tấm pin phù hợp lắp đặt tại các chuồng trại chăn nuôi nông nghiệp.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Khả Năng Kháng Suy Hao Quang Điện PID Free Certificate', size: '1.5 MB', desc: 'Chứng chỉ đảm bảo tấm pin không bị hiện tượng suy hao điện áp PID trong 25 năm.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận CO Form AK - Biến Tần Sungrow Nhập Khẩu Chính Hãng', size: '1.2 MB', desc: 'Chứng nhận xuất xứ hải quan cho các dòng biến tần hòa lưới Sungrow.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn Bảo Vệ Chống Nước IP68 Đầu Nối Cáp MC4 Staubli', size: '1.1 MB', desc: 'Kết quả thử nghiệm ngâm nước độ sâu 1m trong 24 giờ của giắc cắm MC4.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn Chống Cháy UL 94 V-0 Cho Vỏ Tủ Điện Solar CTC', size: '1.7 MB', desc: 'Thử nghiệm tính tự dập tắt lửa của vật liệu nhựa và sơn tĩnh điện vỏ tủ.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Thử Nghiệm Ngắn Mạch 50kA Cho Aptomat MCCB Schneider Electric', size: '2.2 MB', desc: 'Báo cáo thử nghiệm khả năng cắt dòng ngắn mạch tại phòng thí nghiệm độc lập.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận Xuất Xứ CO - Cáp Điện DC Solar LappKabel CHLB Đức', size: '1.3 MB', desc: 'Chứng nhận cáp năng lượng mặt trời nhập khẩu trực tiếp từ Cộng hòa Liên bang Đức.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn Quốc Tế ISO 9001 Nhà Máy Sản Xuất Nhôm Khung Giàn', size: '1.6 MB', desc: 'Chứng chỉ quản lý chất lượng nhà máy đùn ép nhôm định hình Al6005-T5.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Quốc Tế UN 38.3 An Toàn Vận Chuyển Pin Lưu Trữ Lithium BESS', size: '2.0 MB', desc: 'Chứng chỉ kiểm định thử nghiệm va đập, nén ép và va chạm nhiệt độ cho khối pin.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận Chất Lượng CQ - Trụ Thép Mạ Kẽm Nhúng Nóng Đường Dây 110kV', size: '1.9 MB', desc: 'Kết quả đo chiều dày lớp mạ kẽm đạt chuẩn TCVN 5408 chống gỉ sét 30 năm.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Thử Nghiệm Chuẩn Xuất Khẩu RoHS Chống Chất Độc hại', size: '1.4 MB', desc: 'Chứng chỉ linh kiện không chứa chì, thủy ngân và kim loại nặng độc hại.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn Chống Va Đập Cơ Học IK10 Cho Vỏ Thiết Bị Biến Tần', size: '1.2 MB', desc: 'Thử nghiệm khả năng chịu lực va đập 20 Joule vào bề mặt thiết bị ngoài trời.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Giấy Chứng Nhận CO/CQ Lô Hàng Biến Tần Deye Hybrid Nhập Khẩu 2026', size: '1.5 MB', desc: 'Bộ chứng từ hải quan và chất lượng nhà máy cấp cho các model Deye Hybrid.' },
  { cat: 'Chứng Nhận CO/CQ & ISO', type: 'pdf', title: 'Chứng Nhận Tiêu Chuẩn Kết Nối Lưới Điện EVN Kỹ Thuật (Grid-Code Compliance)', size: '2.4 MB', desc: 'Báo cáo thử nghiệm tần số, điện áp và méo dạng sóng hài THD < 3%.' },

  // ── Category 5: Bản Vẽ Kỹ Thuật CAD (10 docs) ──
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ Thiết Kế CAD Sơ Đồ Nguyên Lý Điện Hệ Thống Solar 1MWp Mái Tôn', size: '8.4 MB', desc: 'File bản vẽ AutoCAD (.dwg) chi tiết chuỗi tấm pin, đấu nối tủ DC/AC và trạm biến áp.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Kết Cấu Khung Nhôm Đùn Định Hình Kẹp Pin Mái Seamlock', size: '5.2 MB', desc: 'Chi tiết mặt cắt chân kẹp mái Seamlock, kẹp biên, kẹp giữa và bu-lông chống trượt.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Thiết Kế Tủ Điện Kết Nối AC/DC 400V Chuyên Dụng Solar CTC', size: '6.1 MB', desc: 'Bản vẽ bố trí thiết bị trong tủ điện, sơ đồ nhị thứ và mặt bằng đục lỗ cáp.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Mẫu Trạm Biến Áp Kiểu Kios 1250kVA 22/0.4kV Trọn Bộ', size: '11.2 MB', desc: 'Bản vẽ xây dựng móng trạm Kios, vỏ thép trạm và sơ đồ đấu nối ngăn RMU.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Hệ Thống Tiếp Địa Chống Sét & Nối Đất An Toàn Nhà Xưởng', size: '4.8 MB', desc: 'Sơ đồ định vị cọc khoan tiếp địa, dây đồng trần 50mm2 và giếng tiếp địa.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Khung Chân Sàn Thép Mạ Kẽm Nhúng Nóng Cho Mái Ngói Biệt Thự', size: '7.3 MB', desc: 'Bản vẽ chi tiết chân xà gồ chịu lực, bản mã khoan cấy móc ngói không dột.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Mặt Bằng Bố Trí Tấm Pin Solar Tối Ưu Hướng Nắng 500kWp', size: '9.6 MB', desc: 'Bản vẽ khoảng cách bóng che giữa các hàng pin (Pitching Distance Calculator).' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Đường Dây Truyền Tải Trên Không 22kV Nối Lưới Điện Quốc Gia', size: '14.1 MB', desc: 'Bản vẽ móng cột bê tông ly tâm, xà thép mạ kẽm và cách điện chuỗi nén.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Hệ Thống Lưu Trữ Năng Lượng Container BESS 1MWh Khai Thác', size: '10.5 MB', desc: 'Mặt bằng bố trí khay pin Lithium, hệ thống điều hòa HVAC và bình chữa cháy xả khí.' },
  { cat: 'Bản Vẽ Kỹ Thuật CAD', type: 'dwg', title: 'Bản Vẽ CAD Mẫu Khung Giàn Điện Mặt Trời Nổi Trên Mặt Nước (Floating Solar)', size: '12.8 MB', desc: 'Bản vẽ phao nhựa HDPE nguyên sinh, dây neo móng lòng hồ và lối đi bảo trì.' },

  // ── Category 6: Phần Mềm & Firmware Biến Tần (10 docs) ──
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Phần Mềm Cấu Hình & Cập Nhật Firmware Biến Tần Huawei FusionSolar Assistant v3.5', size: '45.2 MB', desc: 'Bộ công cụ máy tính chạy Windows dùng nâng cấp firmware inverter và đọc dữ liệu ghi log.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Bản Cập Nhật Firmware Mới Nhất V100R001C00SPC125 Cho Inverter Huawei 100KTL', size: '18.4 MB', desc: 'Bản vá sửa lỗi truyền thông Modbus RS485 và tối ưu thuật toán bám điểm công suất MPPT.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Phần Mềm Giám Sát & Tính Toán Thiết Kế Hệ Thống Solar PV*SOL Premium 2026', size: '120.5 MB', desc: 'Phần mềm mô phỏng 3D bóng che và hạch toán sản lượng điện năng mặt trời chính xác 99%.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Công Cụ Cấu Hình Biến Tần SMA Sunny Design Web Offline Database 2026', size: '65.8 MB', desc: 'Bộ dữ liệu thông số kỹ thuật các dòng inverter SMA và thư viện tấm pin toàn cầu.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Phần Mềm Cài Đặt Biến Tần Deye Hybrid Multi-Inverter Parallel Configuration Tool', size: '14.2 MB', desc: 'Công cụ đồng bộ pha và ghép song song lên tới 16 máy inverter Deye 3 pha.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Bản Cập Nhật Firmware BESS Lithium BMS Battery Control Unit v2.1.0', size: '8.9 MB', desc: 'Firmware nâng cấp thuật toán cân bằng cell pin tự động và bảo vệ quá nhiệt BMS.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Phần Mềm Đọc Dữ Liệu Công Tơ Điện Tử Modbus RS485 Meter Scanner v1.2', size: '5.6 MB', desc: 'Phần mềm quét và thử nghiệm giao thức Modbus RTU cho các dòng đồng hồ Smart Meter.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Bộ Thư Viện Ký Hiệu Đồ Họa Điện Solar AutoCAD Block Electrical Symbols Library', size: '32.1 MB', desc: 'Thư viện block CAD tiêu chuẩn quốc tế IEC cho các kỹ sư thiết kế bản vẽ điện.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'Phần Mềm Đọc Ghi Log & Phân Tích Sóng Hài Điện Năng Power Quality Analyzer', size: '28.4 MB', desc: 'Công cụ phân phối phân tích độ lệch điện áp, tần số và sóng hài dòng điện.' },
  { cat: 'Phần Mềm & Firmware Biến Tần', type: 'zip', title: 'SDK & Tài Liệu Tích Hợp API Kết Nối Hệ Thống Giám Sát CTC-SCADA Cloud API v2', size: '11.3 MB', desc: 'Bộ mã nguồn mẫu RESTful API / MQTT cho các lập trình viên tích hợp dữ liệu điện mặt trời.' }
];

async function seed100Resources() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Create or Find Document Categories
    console.log('\nChecking Document Categories...');
    const categoryMap: { [name: string]: any } = {};

    for (const catData of CATEGORIES_DATA) {
      let cat = await DocumentCategory.findOne({ name: catData.name });
      if (!cat) {
        cat = new DocumentCategory({ ...catData, isActive: true });
        await cat.save();
        console.log(`+ Created Category: ${cat.name}`);
      } else {
        console.log(`= Existing Category: ${cat.name}`);
      }
      categoryMap[catData.name] = cat;
    }

    // 2. Clear existing resources and insert 100 resources
    console.log('\nClearing existing technical resources...');
    await Resource.deleteMany({});
    console.log('Cleared existing resources.');

    console.log('\nInserting 100 technical documents & resources...');
    let count = 0;

    for (const doc of SAMPLE_DOCS_DATA) {
      const catObj = categoryMap[doc.cat];

      const resourceDoc = new Resource({
        title: doc.title,
        description: doc.desc,
        fileUrl: SAMPLE_PDF_URL,
        type: doc.type,
        categoryId: catObj ? catObj._id : undefined,
        size: doc.size,
        isActive: true
      });

      await resourceDoc.save();
      count++;
      console.log(`✓ [${count}/100] (${doc.type.toUpperCase()}) ${doc.title}`);
    }

    console.log('\n✅ Successfully seeded 100 rich technical documents into MongoDB!');
  } catch (error) {
    console.error('Error seeding 100 resources:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed100Resources();
