import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

function generateObjectId(index) {
  const hexIndex = index.toString(16).padStart(6, '0');
  return `6a5b3bc65cf9276e${hexIndex}`;
}

const COMPANY_NAME = "Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)";
const COMPANY_SHORT = "CTC";
const CEO_NAME = "Nguyễn Văn Duy";
const HEADQUARTERS = "50B Nguyễn Du, Phường Thạch Thang, Quận Hải Châu, TP. Đà Nẵng";
const SLOGAN = "CTC – Niềm tin, Chất lượng";

const categoriesData = [
  {
    _id: "6a5b3bc65cf9276e000001",
    name: "Tài Chính - Cổ Đông CTC",
    slug: "tai-chinh-co-dong",
    description: "Báo cáo tài chính, doanh thu 288 tỷ năm 2025, cổ tức, đại hội cổ đông và quản trị CTC.",
    order: 1,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000002",
    name: "Hạ Tầng Viễn Thông & BTS",
    slug: "ha-tang-vien-thong",
    description: "Thi công tuyến cáp quang Bộ Công an, hạ tầng BTS, mạng truyền dẫn Metro Mobifone & VNPT Net.",
    order: 2,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000003",
    name: "Điện Mặt Trời & Solar EPC",
    slug: "dien-mat-troi-epc",
    description: "Các công trình Điện mặt trời mái nhà công nghiệp, Rooftop Solar, Commercial & Industrial EPC.",
    order: 3,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000004",
    name: "Điện Gió & Trạm Biến Áp 110kV",
    slug: "dien-gio-tram-bien-ap",
    description: "Nhà máy Điện gió Hướng Linh 4, Hướng Hiệp, trụ đo gió Điện Biên và trạm biến áp 110kV.",
    order: 4,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000005",
    name: "Trung Tâm Dữ Liệu & Data Center",
    slug: "data-center-cntt",
    description: "Hạ tầng Data Center chuẩn Tier III, Server, Cloud Hybrid và giải pháp số cho doanh nghiệp.",
    order: 5,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000006",
    name: "Giải Pháp An Ninh AI & IoT",
    slug: "an-ninh-ai-iot",
    description: "Hệ thống Camera AI giám sát công trường, kiểm soát truy cập sinh trắc học và IoT công nghiệp.",
    order: 6,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000007",
    name: "Văn Hóa & Con Người CTC",
    slug: "van-hoa-con-nguoi",
    description: "CTC Year End Party, Teambuilding, CTC Cup, chương trình Áo ấm cho em và vinh danh 53+ Kỹ sư.",
    order: 7,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000008",
    name: "Thông Báo Nội Bộ & Công Tác",
    slug: "thong-bao-cong-tac",
    description: "Thông báo lịch nghỉ lễ Tết, bảo trì tổng đài, lịch khám sức khỏe định kỳ và quy chế công tác.",
    order: 8,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000009",
    name: "Chính Sách & Năng Lượng Xanh",
    slug: "chinh-sach-xanh",
    description: "Phân tích Nghị định DPPA, chứng chỉ carbon REC, tiêu chuẩn CBAM Châu Âu và Net-Zero 2050.",
    order: 9,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  },
  {
    _id: "6a5b3bc65cf9276e000010",
    name: "Công Trình Quốc Phòng & Dân Dụng",
    slug: "cong-trinh-quoc-phong",
    description: "Hạ tầng kỹ thuật Công trình Quốc phòng A70, công trình công nghiệp dân dụng và chống sét xung.",
    order: 10,
    isActive: true,
    newsCount: 20,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z"
  }
];

// Unsplash high-res image pools
const imagesFinance = [
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200"
];

const imagesTelecom = [
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200"
];

const imagesSolar = [
  "https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1548613053-22087dd8edb8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1200"
];

const imagesWind = [
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=1200"
];

const imagesDataCenter = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200"
];

const imagesAI = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200"
];

const imagesCulture = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200"
];

const imagesNotice = [
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200"
];

const imagesPolicy = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1542744801-30d00f056a27?auto=format&fit=crop&q=80&w=1200"
];

const imagesDefense = [
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&q=80&w=1200"
];

// Topic Generators for 10 Categories (20 unique topics each = 200 articles)
const financeTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC công bố kết quả kiểm toán 2025: Doanh thu vượt 288 tỷ đồng",
  "Đại hội Cổ đông CTC 2026: Thông qua kế hoạch chia cổ tức 15%",
  "CTC công bố tăng trưởng tài sản đạt mốc 181 tỷ đồng khẳng định vị thế",
  "Tổng Giám Đốc Nguyễn Văn Duy báo cáo chiến lược doanh thu 350 tỷ năm 2026",
  "CTC chốt danh sách cổ đông nhận tạm ứng cổ tức đợt 1 năm 2025",
  "Báo cáo quản trị CTC: Đảm bảo lợi ích tối đa cho cổ đông và minh bạch tài chính",
  "CTC hoàn thành thanh toán toàn bộ nghĩa vụ thuế 2025 đúng hạn",
  "Đánh giá rủi ro tài chính & quản trị dòng tiền tối ưu tại các dự án EPC",
  "CTC được các tổ chức tài chính xếp hạng tín nhiệm doanh nghiệp mức AA+",
  "CTC công bố báo cáo tài chính Quý I/2026 với lợi nhuận tăng trưởng 25%",
  "CTC huy động thành công nguồn vốn tín dụng xanh 50 tỷ tài trợ dự án Solar",
  "Hội đồng Quản trị CTC phê duyệt phương án đầu tư mở rộng hạ tầng số",
  "CTC công bố tài liệu họp Đại hội Cổ đông Thường niên năm 2026",
  "Tăng trưởng doanh thu mảng EPC Năng lượng đạt 140% trong niên độ 2025",
  "CTC tối ưu hóa chi phí quản lý doanh nghiệp giảm 12% nhờ chuyển đổi số",
  "Lịch chi trả cổ tức bằng tiền mặt cho các cổ đông CTC năm 2025",
  "CTC hoàn thành chỉ tiêu doanh thu Kế hoạch 5 năm giai đoạn 2021-2025",
  "Công bố Nghị quyết HĐQT về việc điều chỉnh kế hoạch kinh doanh Quý II",
  "Báo cáo đánh giá năng lực tài chính thi công các công trình trạm biến áp 110kV",
  "CTC khẳng định uy tín niêm yết và quản trị công ty theo tiêu chuẩn hiện đại"
][i]);

const telecomTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC bàn giao dự án Tuyến cáp quang chuyên dụng Bộ Công An đúng tiến độ",
  "CTC ký hợp tác chiến lược thi công tuyến truyền dẫn Metro Mobifone",
  "CTC hoàn thành lắp đặt 100 trạm BTS kiên cố chống bão cấp 15 tại Miền Trung",
  "Dự án tuyến cáp quang ngầm OSP cho VNPT Net do CTC thi công chính thức đóng điện",
  "CTC nâng tổng chiều dài tuyến cáp quang thi công lên mốc 5.000 km",
  "Nghiệm thu gói thầu hạ tầng viễn thông chuyên dụng cho Cục Kỹ thuật Nghiệp vụ I",
  "CTC triển khai công nghệ bọc cáp quang chống côn trùng gặm nhấm",
  "Đội ngũ kỹ sư viễn thông CTC hoàn thành xử lý sự cố đứt cáp mùa bão lũ",
  "CTC làm chủ kỹ thuật đo đạc sự cố tuyến cáp OTDR chính xác từng mét",
  "Thi công thành công tuyến hầm cáp viễn thông đô thị tại TP. Đà Nẵng",
  "CTC được Mobifone vinh danh Nhà thầu Hạ tầng Viễn thông xuất sắc nhất",
  "Bàn giao trạm phát sóng cột anten dây kéo chuyên dụng khu vực vùng sâu",
  "CTC triển khai giải pháp hạ tầng viễn thông xanh kết hợp điện mặt trời",
  "Nghiệm thu gói thầu lắp đặt hệ thống tổng đài IP và hạ tầng truyền dẫn",
  "CTC thử nghiệm thành công hạ tầng mạng 5G thử nghiệm tại Đà Nẵng",
  "Kiểm tra công tác an toàn thi công cột anten viễn thông cao 45m",
  "CTC trúng thầu thi công hạ tầng viễn thông KCN VSIP Quảng Ngãi",
  "Hoàn thành ngầm hóa 100km tuyến cáp viễn thông nội đô đạt chuẩn kỹ thuật",
  "CTC ứng dụng phần mềm quản lý tuyến cáp GIS nâng cao hiệu quả O&M",
  "Khẳng định 32 năm dẫn đầu trong lĩnh vực xây lắp hạ tầng bưu điện viễn thông"
][i]);

const solarTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC khởi công dự án Điện mặt trời mái nhà 10MWp tại KCN Hòa Khánh",
  "Bàn giao hệ thống Điện mặt trời mái xưởng Dệt may 3.5MWp tại Bình Dương",
  "CTC ký hợp đồng EPC Solar Rooftop 5MWp cho nhà máy thủy hải sản Đà Nẵng",
  "Nghiệm thu đưa vào sử dụng hệ thống Solar Commercial & Industrial 8MWp",
  "CTC ứng dụng tấm pin N-type TOPCon 580W nâng hiệu suất quang điện lên 22.5%",
  "Giải pháp EPC Solar trọn gói từ tư vấn PCCC đến nghiệm thu đấu nối EVN",
  "CTC triển khai mô hình đầu tư Điện mặt trời 0 đồng PPA cho nhà máy xuất khẩu",
  "Ứng dụng Inverter chuỗi String Inverter 330kW đạt hiệu suất 98.8%",
  "CTC bàn giao hệ thống điện mặt trời lưu trữ BESS 3MWh cho khu chế xuất",
  "Giải pháp robot rửa pin tự động nâng cao 5% sản lượng phát điện hàng năm",
  "CTC hoàn thành 50+ dự án Điện mặt trời mái nhà công nghiệp quy mô lớn",
  "Nghiệm thu hệ thống giám sát sản lượng điện mặt trời qua ứng dụng Cloud SCADA",
  "CTC nhận giải thưởng Đơn vị thi công Điện mặt trời xuất sắc Miền Trung",
  "Phân tích hiệu quả kinh tế mô hình Điện mặt trời mái nhà tự sản tự tiêu",
  "CTC áp dụng phần mềm PVSyst dự báo chính xác 99% sản lượng điện mặt trời",
  "Bàn giao hệ thống Solar Telecom cấp nguồn xanh cho 50 trạm BTS viễn thông",
  "CTC hướng dẫn quy trình bảo trì O&M định kỳ cho dàn pin mặt trời 25 năm",
  "Lắp đặt hệ thống phát hiện hồ quang Arc Fault Protection ngắt mạch tự động",
  "CTC hoàn thành gói thầu Điện mặt trời mái kho vận Logistics tại Quảng Nam",
  "Khẳng định thương hiệu CTC Solar - Đối tác tin cậy của các tập đoàn sản xuất"
][i]);

const windTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC đóng điện thành công Nhà máy Điện gió Hướng Linh 4 công suất 30MW",
  "CTC hoàn thành thi công hạ tầng Nhà máy Điện gió Hướng Hiệp tại Quảng Trị",
  "Nghiệm thu công trình cột đo gió chuyên dụng cao 120m tại tỉnh Điện Biên",
  "CTC hoàn thành gói thầu xây lắp Trạm biến áp 110kV đấu nối dự án Điện gió",
  "CTC ký hợp tác quốc tế cùng Dongfang Electric về thiết bị điện gió ngoài khơi",
  "Thi công móng trụ turbine điện gió đường kính 22m trong điều kiện địa chất phức tạp",
  "CTC vận chuyển thành công cánh quạt điện gió dài 75m qua địa hình đồi núi",
  "Hoàn thành đóng điện tuyến đường dây 110kV truyền tải điện gió về lưới quốc gia",
  "CTC áp dụng hệ thống cảnh báo sét & giám sát rung lắc trụ turbine điện gió",
  "Bàn giao trọn gói công tác O&M bảo trì vận hành Nhà máy Điện gió Hướng Linh",
  "CTC đón nhận bằng khen về thành tích thi công nhanh các dự án Điện gió",
  "Kiểm tra công tác an toàn lao động thi công lắp đặt turbine gió cao 130m",
  "CTC nghiên cứu giải pháp điện gió bờ biển kết hợp bảo vệ đê điều",
  "Thi công trạm phân phối điện 110kV đạt chuẩn kỹ thuật quốc tế IEC",
  "CTC đào tạo 30 Kỹ sư chuyên trách quản lý vận hành trạm biến áp điện gió",
  "Hoàn thành lắp đặt hệ thống SCADA tự động hóa trạm biến áp 110kV điện gió",
  "CTC khẳng định năng lực nhà thầu EPC điện gió uy tín tại Việt Nam",
  "Nghiệm thu hệ thống phòng cháy chữa cháy tự động cho trạm biến áp 110kV",
  "CTC triển khai giải pháp kéo dây siêu nhiệt chịu lực cho đường dây 110kV",
  "Đóng góp tích cực vào nguồn phát năng lượng xanh cho quốc gia"
][i]);

const dataCenterTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC trúng thầu dự án thi công Trung tâm Dữ liệu Data Center chuẩn Tier III",
  "Bàn giao hệ thống nguồn điện dự phòng UPS Modular công nghiệp 1000kVA",
  "CTC triển khai giải pháp làm mát chính xác Precision Cooling cho phòng Server",
  "Nghiệm thu hệ thống PCCC khí sạch FM200 bảo vệ Trung tâm Dữ liệu",
  "CTC lắp đặt hệ thống sàn nâng kỹ thuật chịu tải trọng cao cho Data Center",
  "Giải pháp Cloud Hybrid bảo mật dữ liệu cho cơ quan nhà nước do CTC thiết kế",
  "CTC áp dụng tiêu chuẩn an toàn thông tin ISO 27001 cho hạ tầng Data Center",
  "Kiểm tra chạy thử nghiệm hệ thống máy phát điện dự phòng 2000kVA tự động ATS",
  "CTC triển khai hạ tầng mạng Server tốc độ 100Gbps cho doanh nghiệp tài chính",
  "Bàn giao gói thầu quản lý truy cập và giám sát môi trường phòng Server IoT",
  "CTC đào tạo đội ngũ kỹ sư vận hành Data Center trực ca 24/7/365",
  "Nghiệm thu hệ thống chống sét lan truyền cho đường nguồn và tín hiệu Data Center",
  "CTC cung cấp giải pháp chuyển đổi số toàn diện cho ngân hàng thương mại",
  "Lắp đặt hệ thống lưu điện dự phòng BESS Lithi-ion nâng cao thời gian lưu điện",
  "CTC hoàn thành dự án nâng cấp hạ tầng máy chủ cho Tổng công ty VNPT Net",
  "Giải pháp tối ưu chỉ số hiệu quả sử dụng năng lượng PUE dưới 1.4 cho Data Center",
  "CTC đạt chứng chỉ đối tác triển khai hạ tầng Data Center cao cấp",
  "Thi công hệ thống dây cáp mạng Cat6A & Cáp quang MTP/MPO trong phòng máy chủ",
  "CTC hướng dẫn quy trình ứng cứu sự cố hạ tầng Data Center khẩn cấp",
  "Khẳng định vị thế nhà thầu EPC hạ tầng công nghệ thông tin uy tín"
][i]);

const aiTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC ứng dụng Camera AI thông minh giám sát an ninh toàn bộ công trường thi công",
  "Giải pháp kiểm soát ra vào sinh trắc học khuôn mặt AI cho văn phòng và nhà máy",
  "CTC triển khai hệ thống phân tích hình ảnh AI phát hiện vi phạm bảo hộ PPE",
  "Nghiệm thu hệ thống camera AI giao thông thông minh trên tuyến đường cao tốc",
  "CTC phát triển giải pháp IoT giám sát nhiệt độ và độ ẩm tủ điện từ xa",
  "Ứng dụng AI dự báo sự cố hỏng hóc thiết bị điện công nghiệp sớm 7 ngày",
  "CTC nghiệm thu hệ thống cảnh báo xâm nhập hồng ngoại AI cho công trình quốc phòng",
  "Giải pháp quản lý bãi xe thông minh nhận diện biển số xe AI tốc độ 0.5 giây",
  "CTC tích hợp AI trong ứng dụng giám sát sản lượng phát điện mặt trời SCADA",
  "Bàn giao hệ thống truyền thanh thông minh IP IoT cho đô thị hiện đại",
  "CTC thử nghiệm Robot AI tự động kiểm tra an toàn trạm biến áp 110kV",
  "Giải pháp đếm lưu lượng người và phương tiện AI cho trung tâm thương mại",
  "CTC áp dụng công nghệ nhận diện giọng nói Voicebot AI trong tổng đài chăm sóc",
  "Kiểm tra công tác vận hành hệ thống báo cháy thông minh kết nối Cloud IoT",
  "CTC triển khai hạ tầng chiếu sáng thông minh Smart Lighting điều khiển qua AI",
  "Nghiệm thu giải pháp giám sát nồng độ khí thải công nghiệp qua cảm biến IoT",
  "CTC hợp tác với các tập đoàn công nghệ hàng đầu phát triển giải pháp AIoT",
  "Giải pháp bảo mật dữ liệu Camera AI đảm bảo an toàn thông tin doanh nghiệp",
  "CTC đào tạo kỹ sư công nghệ làm chủ quy trình lắp đặt và cấu hình AI Camera",
  "Tiên phong mang công nghệ AI & IoT phục vụ phát triển hạ tầng thông minh"
][i]);

const cultureTopics = Array.from({ length: 20 }, (_, i) => [
  "CTC Year End Party 2025: 32 Năm Vững Bước Vươn Xa - Kế Thừa & Bứt Phá",
  "Giải bóng đá giao hữu CTC Cup 2026 chào mừng 22 năm cổ phần hóa (30/01)",
  "Chương trình Teambuilding CTC 2026: 'Đồng Xanh Kết Nối' tại bãi biển Đà Nẵng",
  "Đoàn Thanh niên CTC trao 200 phần quà từ thiện 'Áo ấm cho em' tại Nam Trà My",
  "Hội thao CTC Sports Day 2026 thu hút 150+ cán bộ kỹ sư tham gia thi đấu",
  "CTC tổ chức Lễ chúc mừng và tặng quà cho nữ CBCNV nhân ngày 08/03",
  "Ngày hội gia đình CTC Family Day 2026 tràn ngập niềm vui và tinh thần kết nối",
  "Trao Quỹ học bổng 'CTC Nâng Bước Tương Lai' cho con em CBCNV học giỏi",
  "Cuộc thi sáng kiến kỹ thuật CTC InnoSolar 2026 tôn vinh các giải pháp đột phá",
  "CTC hưởng ứng chiến dịch Giờ Trái Đất 2026 vì môi trường xanh bền vững",
  "Lễ tôn vinh 10 Kỹ sư công trường tiêu biểu đóng góp mốc doanh thu 288 tỷ",
  "CTC phát động giải chạy bộ Online 'Run For Green Future 2026'",
  "Hội thảo nội bộ: Nâng cao văn hóa doanh nghiệp và tinh thần trách nhiệm",
  "Đoàn công tác CTC tham quan và học tập kinh nghiệm quản lý tại Nhật Bản",
  "CTC đồng hành tài trợ Giải chạy việt dã Vì môi trường thành phố Đà Nẵng",
  "Chương trình hiến máu nhân đạo 'Giọt Hồng CTC - Trao Niềm Hy Vọng'",
  "Lễ ra mắt Câu lạc bộ Thể thao và Nghệ thuật đại gia đình CTC",
  "Hội thi tay nghề Kỹ sư Xây lắp Bưu điện & Kỹ sư Điện giỏi CTC 2026",
  "CTC tổ chức chương trình mừng sinh nhật quý cho toàn thể nhân viên",
  "Gala Dinner tri ân đội ngũ kỹ sư công trường đã hoàn thành xuất sắc nhiệm vụ"
][i]);

const noticeInternalTopics = Array.from({ length: 20 }, (_, i) => [
  "Thông báo Lịch nghỉ Tết Nguyên Đán Ất Tỵ năm 2026 của Công ty CTC",
  "Thông báo Lịch nghỉ lễ Quốc khánh 02/09 và phương án trực hotline 24/7",
  "Thông báo Lịch nghỉ lễ 30/04 và 01/05 cho toàn thể CBCNV CTC",
  "Thông báo Lịch nghỉ lễ Giỗ Tổ Hùng Vương (10/03 Âm lịch) năm 2026",
  "Thông báo Bảo trì hệ thống Server và Tổng đài 0236.374.5555 tại 50B Nguyễn Du",
  "Thông báo Lịch khám sức khỏe định kỳ năm 2026 cho 53+ Kỹ sư và CBCNV CTC",
  "Thông báo Diễn tập Phòng cháy chữa cháy (PCCC) tại trụ sở CTC Đà Nẵng",
  "Thông báo Áp dụng chế độ làm việc linh hoạt Hybrid Working mùa hè",
  "Thông báo Lịch nghỉ mát hè 2026 cho CBCNV CTC tại thành phố Phú Quốc",
  "Thông báo Chi trả tiền thưởng hiệu quả kinh doanh Quý IV/2025 & Quý I/2026",
  "Thông báo Quy định nghiêm ngặt trang bị bảo hộ PPE tại các công trường EPC",
  "Thông báo Lịch làm việc và phân công ca trực kỹ thuật O&M trong nghỉ Lễ Tết",
  "Thông báo Cập nhật thông tin địa điểm trụ sở chính tại 50B Nguyễn Du, Đà Nẵng",
  "Thông báo Tuyển dụng bổ sung 20 Kỹ sư Điện, Viễn thông & Quản lý Dự án",
  "Thông báo Phát động phong trào Tiết kiệm Năng lượng và Văn phòng Xanh",
  "Thông báo Kế hoạch đánh giá năng lực & quy hoạch cán bộ định kỳ 2026",
  "Thông báo Lịch nghỉ Tết Dương lịch và thời hạn chốt hóa đơn tài chính",
  "Thông báo Hướng dẫn công tác an toàn lưới điện công trường mùa mưa bão",
  "Thông báo Cập nhật thủ tục quy trình đấu nối & bù trừ điện mặt trời mái nhà",
  "Thông báo Lịch huấn luyện an toàn điện cao áp cho lực lượng thi công 110kV"
][i]);

const policyTopics = Array.from({ length: 20 }, (_, i) => [
  "Nghị định DPPA chính thức mở đường cho Hợp đồng mua bán điện trực tiếp",
  "EVN công bố khung giá phát điện mới và lộ trình giá điện hai thành phần",
  "Thị trường chứng chỉ carbon REC và cơ hội cho doanh nghiệp xuất khẩu xanh",
  "Xu hướng ứng dụng hệ thống lưu trữ năng lượng BESS cho hạ tầng KCN 2026",
  "Việt Nam hướng tới mục tiêu Net-Zero 2050: Vai trò của năng lượng tái tạo",
  "Phân tích cơ chế giá FIT và các mô hình hợp tác PPA lắp điện mặt trời 0 đồng",
  "Tích hợp hạ tầng sạc xe điện EV tại các tòa nhà văn phòng và KCN",
  "Tiêu chuẩn xanh CBAM của Châu Âu: Thách thức và giải pháp cho doanh nghiệp",
  "Báo cáo toàn cảnh thị trường Điện gió bờ và tiềm năng Điện gió ngoài khơi",
  "Giải pháp phòng chống sự cố cháy nổ tủ điện và tấm pin mặt trời mái nhà",
  "Hạ tầng Viễn thông & Data Center: Động lực cho Chuyển đổi số Quốc gia",
  "Công nghệ pin mặt trời N-type TOPCon nâng hiệu suất phát điện lên 22.5%",
  "Ứng dụng AI trong dự báo sản lượng điện mặt trời và tối ưu SCADA",
  "Các gói tín dụng xanh hỗ trợ doanh nghiệp đầu tư năng lượng tái tạo",
  "Phân tích hiệu quả kinh tế mô hình Điện mặt trời mái nhà tự sản tự tiêu",
  "Công nghệ Inverter chuỗi công suất lớn giúp tối ưu chi phí thi công EPC",
  "Giải pháp vệ sinh lau rửa tấm pin mặt trời tự động bằng Robot chuyên dụng",
  "Quy hoạch điện VIII điều chỉnh: Ưu tiên năng lượng xanh & hạ tầng truyền dẫn",
  "Đánh giá tuổi thọ và quy trình tái chế tấm pin mặt trời sau 25 năm",
  "Tối ưu hóa chi phí vận hành O&M cho hệ thống điện mặt trời & trạm 110kV"
][i]);

const defenseTopics = Array.from({ length: 20 }, (_, i) => [
  "Nghiệm thu hệ thống tiếp địa chống sét Công trình Quốc phòng A70",
  "CTC thi công hoàn thành gói thầu hạ tầng kỹ thuật cho Bộ Công An",
  "Bàn giao công trình điện chiếu sáng & hạ tầng kỹ thuật khu công nghiệp",
  "CTC hoàn thành dự án đường dây và trạm biến áp 110kV cho hạ tầng đô thị",
  "Thi công hệ thống nguồn điện dự phòng UPS chuyên dụng cho công trình quốc phòng",
  "CTC áp dụng công nghệ mạ nhúng nóng xà thép chống ăn mòn muối biển 30 năm",
  "Nghiệm thu hạ tầng mạng truyền dẫn an ninh bảo mật cấp độ 4",
  "CTC hoàn thành gói thầu xây lắp công trình công nghiệp dân dụng quy mô lớn",
  "Giải pháp phòng chống xung sét 100kA bảo vệ thiết bị điện tử nhạy cảm",
  "CTC được trao tặng Bằng khen về thành tích hoàn thành xuất sắc công trình quốc phòng",
  "Thi công hạ tầng ngầm hóa đường cáp điện và viễn thông tại các đô thị",
  "CTC nghiệm thu hệ thống báo cháy tự động cho nhà xưởng công nghiệp 20.000m2",
  "Giải pháp làm mát và thông gió cưỡng bức cho công trình ngầm chuyên dụng",
  "CTC thử nghiệm thành công hệ thống máy phát điện công suất lớn 2500kVA",
  "Bàn giao trọn gói hạ tầng điện chiếu sáng thông minh cho dự án đường giao thông",
  "CTC kiểm tra đánh giá chất lượng công trình theo tiêu chuẩn quốc gia TCVN",
  "Thi công hệ thống tiếp địa với điện trở suất dưới 1 Ohm bằng hàn hóa nhiệt",
  "CTC hoàn thành bàn giao dự án hạ tầng kỹ thuật khu đô thị sinh thái",
  "Đội ngũ kỹ sư CTC tuân thủ nghiêm ngặt bảo mật thông tin công trình quốc phòng",
  "Khẳng định uy tín nhà thầu xây lắp hạ tầng kỹ thuật và công trình chuyên biệt"
][i]);

function generate200Articles() {
  const articles = [];
  let articleIndex = 1;

  const topicGroups = [
    { cat: categoriesData[0], topics: financeTopics, imgPool: imagesFinance },
    { cat: categoriesData[1], topics: telecomTopics, imgPool: imagesTelecom },
    { cat: categoriesData[2], topics: solarTopics, imgPool: imagesSolar },
    { cat: categoriesData[3], topics: windTopics, imgPool: imagesWind },
    { cat: categoriesData[4], topics: dataCenterTopics, imgPool: imagesDataCenter },
    { cat: categoriesData[5], topics: aiTopics, imgPool: imagesAI },
    { cat: categoriesData[6], topics: cultureTopics, imgPool: imagesCulture },
    { cat: categoriesData[7], topics: noticeInternalTopics, imgPool: imagesNotice },
    { cat: categoriesData[8], topics: policyTopics, imgPool: imagesPolicy },
    { cat: categoriesData[9], topics: defenseTopics, imgPool: imagesDefense }
  ];

  topicGroups.forEach(({ cat, topics, imgPool }) => {
    topics.forEach((title, i) => {
      const image = imgPool[i % imgPool.length];
      const dateObj = new Date(2025, (i % 12), 1 + (i % 27), 8 + (i % 9), 10 + (i % 45));

      articles.push({
        _id: generateObjectId(articleIndex),
        title: title,
        excerpt: `${title}. ${COMPANY_NAME} khẳng định năng lực uy tín với 32+ năm kinh nghiệm, doanh thu 288 tỷ VNĐ, tổng tài sản 181 tỷ VNĐ và 53+ kỹ sư chuyên nghiệp quản lý 500+ dự án.`,
        date: dateObj.toISOString(),
        image: image,
        categoryId: cat._id,
        category: cat.name,
        content: `
          <p className="lead font-medium text-lg text-slate-700">Trong bối cảnh đẩy mạnh phát triển hạ tầng kỹ thuật, viễn thông và năng lượng tái tạo tại Việt Nam, bài viết <strong>${title}</strong> mang đến cái nhìn toàn diện và chi tiết nhất về thành tựu của ${COMPANY_SHORT}.</p>
          
          <h2>1. Tổng quan bối cảnh & Năng lực thực chiến CTC</h2>
          <p>Thành lập từ năm 1993 và cổ phần hóa ngày 30/01/2004 với MST 0400458940, trụ sở chính tại <em>${HEADQUARTERS}</em>, ${COMPANY_NAME} là nhà thầu uy tín hàng đầu do Bộ Xây dựng cấp chứng chỉ năng lực Hạng 1.</p>

          <p>Với kết quả kinh doanh ấn tượng đạt doanh thu <strong>288 tỷ VNĐ</strong> trong năm 2025 và tổng tài sản tích lũy <strong>181 tỷ VNĐ</strong>, CTC khẳng định tiềm lực tài chính vững chắc và khả năng làm chủ các công trình quy mô lớn.</p>

          <img src="${image}" alt="${title}" className="w-full h-80 object-cover rounded-2xl my-6 shadow-xl" />

          <h2>2. Điểm nhấn giải pháp & Kết quả triển khai</h2>
          <p>Dưới sự điều hành chiến lược của Tổng Giám Đốc <strong>${CEO_NAME}</strong>, đội ngũ 53+ kỹ sư chủ chốt của CTC đã hoàn thành xuất sắc nhiệm vụ với các tiêu chuẩn khắt khe:</p>

          <ul>
            <li><strong>Chất lượng thi công:</strong> Tuân thủ nghiêm ngặt chuẩn ISO 9001 và ISO 45001 về an toàn lao động.</li>
            <li><strong>Tiến độ bàn giao:</strong> Đảm bảo bàn giao đúng hoặc trước thời hạn cam kết với chủ đầu tư.</li>
            <li><strong>Dịch vụ O&M bảo trì:</strong> Hỗ trợ kỹ thuật 24/7 với hotline <span className="text-red-600 font-bold">0915 059 666</span> và tổng đài <span className="text-primary font-bold">0236 374 5555</span>.</li>
          </ul>

          <blockquote className="my-6 p-6 bg-slate-900 text-white rounded-2xl border-l-8 border-primary">
            <p className="text-base font-semibold italic">"${SLOGAN} - CTC cam kết mang tới giải pháp kỹ thuật trọn gói chất lượng cao, tối ưu chi phí vận hành và đồng hành lâu dài cùng sự phát triển của Quý Khách hàng."</p>
            <footer className="text-xs text-amber-400 mt-2 font-bold">— Phát biểu chỉ đạo từ Ban Lãnh đạo CTC</footer>
          </blockquote>

          <h2>3. Bảng tổng hợp các chỉ số kỹ thuật nổi bật</h2>
          <p>Dưới đây là bảng số liệu chi tiết minh chứng cho hiệu quả công trình và năng lực CTC:</p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <thead className="text-xs text-white uppercase bg-slate-900 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3">Chỉ tiêu năng lực</th>
                  <th className="px-6 py-3">Thông số đạt được</th>
                  <th className="px-6 py-3">Tiêu chuẩn áp dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4 font-bold">Kinh nghiệm hoạt động</td>
                  <td className="px-6 py-4 text-emerald-600 font-extrabold">32+ Năm (Từ 1993)</td>
                  <td className="px-6 py-4">22 năm cổ phần hóa (2004 - 2026)</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4 font-bold">Tổng dự án thực hiện</td>
                  <td className="px-6 py-4 font-extrabold">500+ Công trình lớn nhỏ</td>
                  <td className="px-6 py-4">Viễn thông, Solar, Điện gió, TBA 110kV</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4 font-bold">Đội ngũ kỹ thuật</td>
                  <td className="px-6 py-4 font-extrabold">53+ Kỹ sư chủ chốt</td>
                  <td className="px-6 py-4">Trực tiếp tham gia 100-250 dự án/người</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>Thành công của dự án một lần nữa khẳng định vị thế thương hiệu vững chắc của Công ty Cổ phần Xây lắp Bưu điện Miền Trung trên toàn quốc.</p>
        `,
        author: "6a5b3bc65cf9276e000000",
        translations: {},
        __v: 0,
        createdAt: dateObj.toISOString(),
        updatedAt: dateObj.toISOString()
      });
      articleIndex++;
    });
  });

  return articles;
}

async function runSeed() {
  console.log('🌱 Starting seed for 200 Rich CTC News Articles across 10 Brand-New Categories...');
  
  const newsArticles = generate200Articles();

  const seedNewsPath = path.join(__dirname, '../seed-data/news.json');
  const seedCatsPath = path.join(__dirname, '../seed-data/newscategories.json');

  fs.writeFileSync(seedNewsPath, JSON.stringify(newsArticles, null, 2), 'utf8');
  fs.writeFileSync(seedCatsPath, JSON.stringify(categoriesData, null, 2), 'utf8');

  console.log(`✅ Saved ${newsArticles.length} articles to seed-data/news.json`);
  console.log(`✅ Saved ${categoriesData.length} new categories to seed-data/newscategories.json`);

  try {
    console.log('🔌 Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const db = mongoose.connection.db;

    await db.collection('news').deleteMany({});
    await db.collection('newscategories').deleteMany({});
    console.log('🧹 Cleared all old news and newscategories from MongoDB.');

    await db.collection('newscategories').insertMany(categoriesData);
    await db.collection('news').insertMany(newsArticles);

    console.log(`🎉 Successfully imported 200 rich news articles into 10 new categories!`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn('⚠️ MongoDB direct import failed (will rely on seed-data JSON files):', err.message);
  }
  
  process.exit(0);
}

runSeed();
