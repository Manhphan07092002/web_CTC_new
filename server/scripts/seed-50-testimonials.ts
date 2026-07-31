/**
 * Seed 50 đánh giá khách hàng thực tế về CTC
 * Dữ liệu dựa trên: constants/company_profile.md
 *
 * Chạy lệnh:
 *   npx tsx server/scripts/seed-50-testimonials.ts
 *
 * Hoặc trong Docker:
 *   docker compose exec app npx tsx server/scripts/seed-50-testimonials.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Testimonial } from '../../models/index.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

// ─── Avatar placeholder (Dicebear Avatars - đa dạng giới tính/phong cách) ───
const avatarBase = (seed: string, style: 'adventurer' | 'personas' | 'avataaars' | 'micah' | 'notionists') =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

// ─── 50 đánh giá thực tế ─────────────────────────────────────────────────────
const TESTIMONIALS = [
  // === Khách hàng Viễn thông / CNTT ===
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Trưởng phòng Kỹ thuật – Mobifone Khu vực 3',
    content:
      'CTC đã triển khai hơn 120 trạm BTS cho Mobifone tại khu vực miền Trung với tiến độ đúng cam kết, chất lượng vượt tiêu chuẩn kỹ thuật. Đội ngũ kỹ sư của CTC rất chuyên nghiệp và xử lý sự cố nhanh chóng. Chúng tôi rất hài lòng khi lựa chọn CTC là đối tác chiến lược.',
    image: avatarBase('MinhTuan', 'avataaars'),
  },
  {
    name: 'Trần Thị Hương',
    role: 'Giám đốc Dự án – VNPT Net',
    content:
      'Hợp tác với CTC trong dự án hạ tầng OSP và mạng Metro là quyết định đúng đắn nhất của chúng tôi trong năm. Họ có đội ngũ 53 kỹ sư chủ chốt với kinh nghiệm thực chiến trên hàng trăm công trình. Tôi đặc biệt ấn tượng với khả năng quản lý tiến độ và an toàn lao động.',
    image: avatarBase('TranHuong', 'micah'),
  },
  {
    name: 'Lê Văn Bình',
    role: 'Phó Giám đốc – Cục Kỹ thuật Nghiệp vụ I, Bộ Công an',
    content:
      'Tuyến cáp quang chuyên dụng do CTC thi công đạt yêu cầu kỹ thuật nghiêm ngặt về an ninh và độ bền. Đội ngũ CTC làm việc bảo mật và có trách nhiệm. Đây là nhà thầu hiếm hoi đáp ứng được tiêu chuẩn công trình của Bộ Công an.',
    image: avatarBase('VanBinh', 'personas'),
  },
  {
    name: 'Phạm Quốc Hùng',
    role: 'Giám đốc Kỹ thuật – VNPT Đà Nẵng',
    content:
      'CTC triển khai hệ thống truyền dẫn viễn thông cho chúng tôi với độ chính xác kỹ thuật cao và thời gian hoàn thành trước tiến độ 2 tuần. Đội ngũ tư vấn của họ rất sâu sắc về giải pháp tổng thể EPC. Chúng tôi đã ký thêm 3 hợp đồng tiếp theo ngay sau dự án đầu tiên.',
    image: avatarBase('QuocHung', 'notionists'),
  },
  {
    name: 'Đỗ Thị Lan Anh',
    role: 'Trưởng ban CNTT – Tập đoàn Điện lực Miền Trung',
    content:
      'Chúng tôi tin tưởng giao CTC thi công hạ tầng mạng nội bộ và hệ thống camera giám sát cho toàn bộ cụm trụ sở. Kết quả vượt kỳ vọng: hệ thống ổn định 24/7, bảo hành tận tình. CTC thực sự sống đúng với khẩu hiệu Niềm tin – Chất lượng.',
    image: avatarBase('LanAnh', 'adventurer'),
  },

  // === Khách hàng Năng lượng tái tạo ===
  {
    name: 'Nguyễn Thế Anh',
    role: 'CEO – Công ty Cổ phần Điện gió Hướng Linh',
    content:
      'CTC thi công toàn bộ phần điện và cơ khí cho nhà máy điện gió Hướng Linh 4. Dự án quy mô lớn nhưng họ quản lý an toàn tốt, không có sự cố lao động nào. Năng lực EPC của CTC trong lĩnh vực điện gió thực sự xứng tầm với các nhà thầu quốc tế.',
    image: avatarBase('TheAnh', 'avataaars'),
  },
  {
    name: 'Võ Xuân Trường',
    role: 'Giám đốc Đầu tư – Dongfang Electric International',
    content:
      'Làm việc với CTC trong dự án điện gió Hướng Hiệp rất chuyên nghiệp. Họ am hiểu tiêu chuẩn kỹ thuật quốc tế, giao tiếp bằng tiếng Anh thành thạo và xử lý vấn đề kỹ thuật nhanh chóng. Đây là nhà thầu Việt Nam hiếm hoi đủ năng lực làm việc trong dự án liên doanh quốc tế.',
    image: avatarBase('XuanTruong', 'micah'),
  },
  {
    name: 'Lê Thị Bích Trân',
    role: 'Giám đốc Vận hành – Công ty Điện mặt trời Quảng Nam',
    content:
      'CTC lắp đặt hệ thống solar áp mái cho toàn bộ nhà máy chúng tôi (750kWp). Chất lượng thi công tốt, hệ thống SCADA giám sát hoạt động ổn định. Công suất thực tế phát điện vượt 5% so với thiết kế. Tôi sẽ tiếp tục giới thiệu CTC cho các đối tác trong ngành.',
    image: avatarBase('BichTran', 'personas'),
  },
  {
    name: 'Hoàng Văn Phúc',
    role: 'Chủ đầu tư – Trang trại Solar Bình Định',
    content:
      'Tôi đầu tư hệ thống điện mặt trời nông nghiệp 500kWp thông qua CTC. Từ khảo sát, thiết kế đến thi công và kết nối lưới điện chỉ mất 45 ngày. Doanh thu bán điện tháng đầu tiên đạt 98% công suất dự kiến. Rất hài lòng!',
    image: avatarBase('VanPhuc', 'notionists'),
  },
  {
    name: 'Trần Ngọc Sơn',
    role: 'Kỹ sư Năng lượng – VNEEC',
    content:
      'CTC là đối tác tư vấn kỹ thuật đáng tin cậy trong nhiều dự án năng lượng mà chúng tôi tư vấn. Họ luôn cung cấp hồ sơ kỹ thuật đầy đủ, trung thực về năng lực và không hứa hẹn những điều không thể thực hiện. Đó là phẩm chất hiếm có của một nhà thầu.',
    image: avatarBase('NgocSon', 'adventurer'),
  },

  // === Khách hàng Xây dựng hạ tầng ===
  {
    name: 'Bùi Thị Thu Hà',
    role: 'Chủ nhiệm Dự án – Ban Quản lý Dự án Tỉnh Quảng Trị',
    content:
      'CTC thi công trạm biến áp 110kV đúng tiến độ, đúng kỹ thuật. Hồ sơ nghiệm thu đầy đủ, minh bạch. Trong 32 năm hoạt động của CTC, họ đã tích lũy được kinh nghiệm mà ít nhà thầu địa phương nào có được. Chúng tôi sẽ tiếp tục ưu tiên CTC trong các dự án tới.',
    image: avatarBase('ThuHa', 'micah'),
  },
  {
    name: 'Nguyễn Thanh Hải',
    role: 'Phó Giám đốc Kỹ thuật – Điện lực Thừa Thiên Huế',
    content:
      'Hệ thống đường dây tải điện và trạm biến áp do CTC thi công vận hành ổn định suốt 3 năm nay không có sự cố lớn. Bảo hành sau bàn giao của CTC rất tốt, hotline luôn phản hồi trong vòng 2 giờ. Đây là điểm khác biệt lớn so với nhiều nhà thầu khác.',
    image: avatarBase('ThanhHai', 'avataaars'),
  },
  {
    name: 'Lê Hữu Nghĩa',
    role: 'Chủ đầu tư – Khu công nghiệp Phú Bài mở rộng',
    content:
      'CTC thiết kế và thi công toàn bộ hạ tầng điện kỹ thuật cho khu công nghiệp của chúng tôi theo mô hình EPC. Thay vì phải quản lý nhiều nhà thầu phụ, chúng tôi chỉ cần một đầu mối là CTC. Tiết kiệm đáng kể thời gian và chi phí quản lý dự án.',
    image: avatarBase('HuuNghia', 'personas'),
  },
  {
    name: 'Phạm Thị Hồng Nhung',
    role: 'Giám đốc Hành chính – Tập đoàn bất động sản Miền Trung',
    content:
      'CTC triển khai hạ tầng kỹ thuật cho dự án khu dân cư của chúng tôi với độ chính xác cao trong thiết kế. Đội ngũ kỹ sư trẻ nhưng rất có kinh nghiệm thực tế. Tổng Giám đốc Nguyễn Văn Duy trực tiếp kiểm tra công trình mỗi tuần – điều đó cho thấy sự cam kết thực sự của lãnh đạo công ty.',
    image: avatarBase('HongNhung', 'notionists'),
  },
  {
    name: 'Trương Văn Cường',
    role: 'Chỉ huy trưởng công trình – Quân khu 5',
    content:
      'Công trình quốc phòng A70 do CTC thực hiện đáp ứng đầy đủ các yêu cầu kỹ thuật đặc thù và bảo mật. Đội ngũ CTC làm việc kỷ luật, không để xảy ra sự cố an toàn nào trong suốt thời gian thi công. Đây là tiêu chuẩn bắt buộc với công trình quân sự và CTC đã hoàn thành xuất sắc.',
    image: avatarBase('VanCuong', 'adventurer'),
  },

  // === Khách hàng dịch vụ Data Center / Chuyển đổi số ===
  {
    name: 'Vũ Thanh Tùng',
    role: 'CTO – Fintech Startup Đà Nẵng',
    content:
      'CTC thiết kế hạ tầng Data Center nhỏ cho văn phòng chúng tôi với chi phí tối ưu. Họ tư vấn rất thực tế, không đẩy chúng tôi mua thiết bị dư thừa. Hệ thống UPS, làm mát và camera an ninh đều hoạt động ổn định từ ngày đầu. Đúng là đối tác tin cậy như lời giới thiệu.',
    image: avatarBase('ThanhTung', 'micah'),
  },
  {
    name: 'Ngô Thị Cẩm Tú',
    role: 'Trưởng phòng IT – Bệnh viện Đa khoa Đà Nẵng',
    content:
      'Hệ thống mạng LAN/WAN và phòng máy chủ do CTC triển khai cho bệnh viện chạy ổn định liên tục. Chúng tôi đặc biệt đánh giá cao việc CTC hoàn thành trong giờ thấp điểm để không ảnh hưởng đến hoạt động khám chữa bệnh. Đội ngũ rất chuyên nghiệp và thấu hiểu đặc thù môi trường y tế.',
    image: avatarBase('CamTu', 'personas'),
  },
  {
    name: 'Đinh Văn Minh',
    role: 'Giám đốc Vận hành – Cảng Tiên Sa Đà Nẵng',
    content:
      'CTC lắp đặt hệ thống camera AI và mạng truyền dữ liệu cho cảng chúng tôi. Đây là hệ thống quan trọng phục vụ an ninh và logistics, nên yêu cầu kỹ thuật rất cao. CTC đáp ứng toàn bộ và còn đào tạo nhân viên vận hành miễn phí. Thái độ dịch vụ sau bán hàng rất chu đáo.',
    image: avatarBase('VanMinh', 'avataaars'),
  },
  {
    name: 'Lương Thị Phương',
    role: 'CEO – Công ty Logistics Miền Trung',
    content:
      'Chúng tôi chọn CTC để xây dựng hạ tầng số cho kho thông minh: hệ thống WiFi công nghiệp, RFID và camera. Họ tích hợp toàn bộ vào một hệ thống quản lý thống nhất. Hiệu suất kho tăng 30% sau khi triển khai. Khoản đầu tư này hoàn vốn nhanh hơn dự kiến.',
    image: avatarBase('ThiPhuong', 'notionists'),
  },
  {
    name: 'Cao Xuân Hậu',
    role: 'Giám đốc Kỹ thuật – Nhà máy sản xuất Quảng Ngãi',
    content:
      'Nhà máy chúng tôi cần hệ thống mạng công nghiệp OT (Operational Technology) để kết nối các máy CNC và robot. CTC là nhà thầu địa phương duy nhất hiểu được yêu cầu kỹ thuật này. Kỹ sư của họ đã từng làm dự án tương tự, nên triển khai rất trơn tru.',
    image: avatarBase('XuanHau', 'adventurer'),
  },

  // === Khách hàng doanh nghiệp vừa và nhỏ ===
  {
    name: 'Phan Thị Bảo Châu',
    role: 'Chủ doanh nghiệp – Khách sạn 4 sao Hội An',
    content:
      'CTC lắp đặt hệ thống điện toàn bộ cho khách sạn 120 phòng của chúng tôi. Thi công sạch sẽ, gọn gàng, không ảnh hưởng đến các khu vực đã hoạt động. Hệ thống tiết kiệm điện thông minh họ tư vấn giúp giảm 22% hóa đơn điện hàng tháng. Rất đáng đầu tư!',
    image: avatarBase('BaoChau', 'micah'),
  },
  {
    name: 'Nguyễn Hữu Đạt',
    role: 'Giám đốc – Trường Cao đẳng Kỹ thuật Đà Nẵng',
    content:
      'CTC tài trợ tư vấn thiết kế mạng và thi công phòng máy thực hành cho trường chúng tôi với giá ưu đãi. Đây là cử chỉ đẹp của một doanh nghiệp 32 năm luôn đặt giá trị cộng đồng lên cao. Hệ thống mạng chuẩn Cisco họ thi công đang được dùng để dạy sinh viên CNTT.',
    image: avatarBase('HuuDat', 'personas'),
  },
  {
    name: 'Trần Thị Thu Thảo',
    role: 'Chủ đầu tư – Nhà hàng – Khu nghỉ dưỡng Lăng Cô',
    content:
      'CTC lắp đặt điện mặt trời áp mái 80kWp cho khu resort của tôi. Giờ đây chi phí điện giảm 70%, và điều đó giúp chúng tôi hạ giá phòng để cạnh tranh hơn. Dịch vụ bảo trì định kỳ của CTC rất chu đáo, họ chủ động nhắc nhở lịch bảo dưỡng thay vì đợi mình gọi.',
    image: avatarBase('ThuThao', 'notionists'),
  },
  {
    name: 'Võ Minh Quang',
    role: 'Giám đốc – Công ty thương mại điện tử Đà Nẵng',
    content:
      'Chúng tôi cần hạ tầng mạng tốc độ cao và UPS để đảm bảo website không bao giờ down. CTC tư vấn giải pháp redundancy rất phù hợp với ngân sách startup của chúng tôi. Đặc biệt, họ hỗ trợ từ xa 24/7 – điều này cực kỳ quan trọng với chúng tôi.',
    image: avatarBase('MinhQuang', 'avataaars'),
  },
  {
    name: 'Lê Anh Khoa',
    role: 'CIO – Ngân hàng BIDV Chi nhánh Đà Nẵng',
    content:
      'CTC thi công phòng server dự phòng (DR Site) cho chi nhánh đạt tiêu chuẩn Tier 3. Quy trình kiểm tra chất lượng của họ rất nghiêm ngặt, phù hợp với yêu cầu của ngành ngân hàng. Đây là đối tác đáng tin cậy cho các công trình đòi hỏi cao về bảo mật và tính liên tục.',
    image: avatarBase('AnhKhoa', 'adventurer'),
  },

  // === Khách hàng khu vực khác (34 tỉnh thành) ===
  {
    name: 'Hồ Văn Thắng',
    role: 'Phó Chủ tịch UBND – Huyện Hướng Hóa, Quảng Trị',
    content:
      'CTC đã triển khai nhiều công trình hạ tầng viễn thông và năng lượng tái tạo tại địa bàn miền núi khó khăn của chúng tôi. Họ luôn hoàn thành đúng tiến độ dù điều kiện địa lý phức tạp. Đây là đóng góp thực sự vào sự phát triển kinh tế – xã hội của địa phương.',
    image: avatarBase('VanThang', 'personas'),
  },
  {
    name: 'Nguyễn Thị Mỹ Linh',
    role: 'Giám đốc Chi nhánh – Viettel Quảng Bình',
    content:
      'CTC đã là đối tác thi công của Viettel trong nhiều năm tại khu vực Bắc Trung Bộ. Khả năng huy động lực lượng nhanh chóng và bảo đảm an toàn tuyệt đối là điểm mạnh của CTC so với các nhà thầu khác. Chúng tôi đặc biệt đánh giá cao tính kỷ luật của đội ngũ thi công.',
    image: avatarBase('MyLinh', 'micah'),
  },
  {
    name: 'Đặng Quốc Dũng',
    role: 'Trưởng phòng Đầu tư – Sở KH&ĐT tỉnh Điện Biên',
    content:
      'CTC đã thực hiện lắp đặt trụ đo gió phục vụ dự án điện gió tại Điện Biên trong điều kiện địa hình cực kỳ khó khăn. Họ huy động phương tiện và nhân lực phù hợp, không để chậm tiến độ. Rất ấn tượng với năng lực điều phối của ban lãnh đạo CTC.',
    image: avatarBase('QuocDung', 'notionists'),
  },
  {
    name: 'Trương Thị Bích Phượng',
    role: 'Giám đốc – Công ty CP Thủy sản Khánh Hòa',
    content:
      'Chúng tôi lắp hệ thống solar áp mái 200kWp cho nhà máy chế biến thủy sản thông qua CTC. Hiệu quả tiết kiệm điện rõ rệt, hệ thống SCADA giám sát từ xa rất tiện lợi. Sau 18 tháng vận hành, chưa một lần phải gọi sửa chữa khẩn cấp – đó là minh chứng cho chất lượng thi công.',
    image: avatarBase('BichPhuong', 'avataaars'),
  },
  {
    name: 'Lý Minh Sáng',
    role: 'Giám đốc – Khu công nghiệp Quảng Nam',
    content:
      'CTC thi công hệ thống điện chiếu sáng thông minh toàn bộ khu công nghiệp 150ha. Tiết kiệm 40% điện năng nhờ hệ thống điều khiển tự động và đèn LED. Chi phí bảo trì giảm đáng kể vì họ chọn thiết bị chất lượng cao với tuổi thọ dài. Tầm nhìn dài hạn trong tư vấn là điểm cộng lớn.',
    image: avatarBase('MinhSang', 'personas'),
  },
  {
    name: 'Phùng Thị Lan',
    role: 'Trưởng phòng Cơ sở hạ tầng – Trường Đại học Bách khoa Đà Nẵng',
    content:
      'CTC cải tạo toàn bộ hạ tầng mạng nội bộ cho trường với kinh phí tối ưu. Họ kế thừa tối đa hạ tầng cũ, chỉ thay thế những phần thực sự cần thiết. Kết quả là chúng tôi có hạ tầng hiện đại với ngân sách bằng 60% so với dự toán ban đầu. Đội ngũ CTC thực sự hiểu bài toán chi phí.',
    image: avatarBase('ThiLan', 'adventurer'),
  },

  // === Đánh giá về chất lượng sản phẩm / thiết bị ===
  {
    name: 'Nguyễn Duy Khải',
    role: 'Kỹ sư tự do – Freelance Network Engineer',
    content:
      'Tôi thường giới thiệu khách hàng mua thiết bị mạng Draytek, Mikrotik qua CTC vì họ là đại lý chính hãng. Giá cạnh tranh, giao hàng nhanh và quan trọng nhất là bảo hành chính hãng đúng như cam kết. Chưa có trường hợp nào tôi giới thiệu mà khách hàng phàn nàn về chất lượng sản phẩm.',
    image: avatarBase('DuyKhai', 'micah'),
  },
  {
    name: 'Bùi Thành Long',
    role: 'Giám đốc Kỹ thuật – ISP địa phương Quảng Nam',
    content:
      'Chúng tôi mua toàn bộ thiết bị định tuyến và switch cho mạng ISP qua CTC. Họ tư vấn giải pháp phù hợp với quy mô và ngân sách, không cố gắng bán thiết bị đắt hơn mức cần thiết. Đặc biệt, kỹ sư CTC hỗ trợ cấu hình miễn phí khi có vấn đề kỹ thuật phức tạp.',
    image: avatarBase('ThanhLong', 'personas'),
  },
  {
    name: 'Trần Thị Quỳnh Như',
    role: 'Trưởng phòng Mua sắm – Chuỗi nhà hàng Hải sản Đà Nẵng',
    content:
      'Đặt mua máy in nhãn và thiết bị POS qua CTC rất tiện lợi. Giao hàng đúng hẹn, hóa đơn VAT đầy đủ và bảo hành tại chỗ. Khi gặp lỗi, họ cử kỹ thuật viên đến trong vòng 4 giờ. Đó là dịch vụ mà nhiều đơn vị khác không làm được.',
    image: avatarBase('QuynhNhu', 'notionists'),
  },
  {
    name: 'Hoàng Trung Hiếu',
    role: 'IT Manager – Khách sạn Intercontinental Đà Nẵng Sun Peninsula',
    content:
      'Chúng tôi trang bị hệ thống WiFi enterprise cho resort 5 sao qua CTC. Yêu cầu kỹ thuật rất cao: phủ sóng ổn định toàn bộ 200+ phòng, không gian ngoài trời, bể bơi và nhà hàng. CTC thực hiện khảo sát sóng radio rất kỹ trước khi lắp đặt và kết quả đúng như cam kết.',
    image: avatarBase('TrungHieu', 'avataaars'),
  },
  {
    name: 'Mai Thị Kim Anh',
    role: 'Giám đốc – Trung tâm Y tế huyện Hòa Vang',
    content:
      'CTC cung cấp và lắp đặt hệ thống UPS bảo vệ thiết bị y tế cho trung tâm y tế chúng tôi. Thiết bị chính hãng, chứng từ đầy đủ, giá trong ngưỡng ngân sách nhà nước. Khi kiểm toán, hồ sơ của CTC rất hoàn chỉnh và minh bạch. Rất quan trọng với đơn vị sử dụng ngân sách công.',
    image: avatarBase('KimAnh', 'adventurer'),
  },

  // === Đánh giá về nhân sự và văn hóa công ty ===
  {
    name: 'Lê Công Thành',
    role: 'Phó Tổng Giám đốc – Công ty Xây dựng Hòa Bình',
    content:
      'Làm việc với CTC trong dự án hợp tác, tôi rất ấn tượng với văn hóa công ty của họ: nghiêm túc, kỷ luật nhưng linh hoạt. Đội ngũ kỹ sư 53 người của họ được đào tạo bài bản và thực chiến thực sự trên hàng trăm công trình. Không có khoảng cách giữa kiến thức và thực hành ở CTC.',
    image: avatarBase('CongThanh', 'micah'),
  },
  {
    name: 'Nguyễn Thị Xuân Mai',
    role: 'Nhà đầu tư thiên thần – Angel Investor Đà Nẵng',
    content:
      'Tôi đã theo dõi CTC trong nhiều năm trước khi đầu tư. Doanh thu 2025 đạt 288 tỷ VNĐ với tổng tài sản 181 tỷ là con số rất ấn tượng với một doanh nghiệp địa phương. Quan trọng hơn, họ tăng trưởng bền vững qua nhiều chu kỳ kinh tế khó khăn. Đó là nền tảng của sự tin cậy.',
    image: avatarBase('XuanMai', 'personas'),
  },
  {
    name: 'Trịnh Văn Phú',
    role: 'Cựu sinh viên – Kỹ sư Điện tử Viễn thông làm việc tại CTC',
    content:
      'Tôi gia nhập CTC sau khi tốt nghiệp và được trực tiếp tham gia vào 15 công trình thực tế trong 2 năm đầu. Không nơi nào đào tạo thực chiến tốt như CTC. Ban lãnh đạo, đặc biệt là Tổng Giám đốc Nguyễn Văn Duy, luôn quan tâm đến sự phát triển của nhân viên trẻ.',
    image: avatarBase('VanPhu', 'notionists'),
  },
  {
    name: 'Phan Minh Đức',
    role: 'Trưởng nhóm Kỹ sư – Đối tác Thiết kế Cộng tác',
    content:
      'Chúng tôi thường hợp tác với CTC trong giai đoạn thiết kế kỹ thuật. Họ rất mở trong việc chia sẻ thông tin và trao đổi kỹ thuật. Phòng Kỹ thuật của CTC có chuyên môn sâu và luôn đưa ra phản hồi kỹ thuật có giá trị. Đây là đối tác cộng tác lý tưởng.',
    image: avatarBase('MinhDuc', 'avataaars'),
  },
  {
    name: 'Bùi Thị Ngọc Lan',
    role: 'Chuyên gia tư vấn độc lập – Tư vấn Năng lượng',
    content:
      'Trong các cuộc đấu thầu tôi chứng kiến, CTC luôn nộp hồ sơ năng lực đầy đủ, rõ ràng và trung thực. Họ không thổi phồng năng lực như nhiều nhà thầu khác. Vốn điều lệ gần 10 tỷ, doanh thu 288 tỷ năm 2025 là minh chứng rõ nhất cho sự phát triển thực chất.',
    image: avatarBase('NgocLan', 'adventurer'),
  },

  // === Đánh giá về dự án an toàn và an ninh quốc gia ===
  {
    name: 'Thiếu tá Nguyễn Hải Đăng',
    role: 'Cán bộ kỹ thuật – Biên phòng Tỉnh Thừa Thiên Huế',
    content:
      'CTC thi công hạ tầng truyền tin và camera giám sát biên giới cho đơn vị chúng tôi. Đây là công trình bảo mật cao, yêu cầu đội ngũ có lý lịch trong sạch và kỹ thuật đáng tin cậy. CTC đáp ứng tốt mọi yêu cầu. Tính bảo mật thông tin trong suốt quá trình thi công được đảm bảo tuyệt đối.',
    image: avatarBase('HaiDang', 'micah'),
  },
  {
    name: 'Hoàng Thị Thanh Hòa',
    role: 'Giám đốc Chi nhánh – Công ty Bảo hiểm Bảo Việt Đà Nẵng',
    content:
      'Chúng tôi đã lựa chọn bảo hiểm cho nhiều công trình do CTC thi công. Qua thực tế, CTC có hồ sơ an toàn lao động rất tốt: tỷ lệ tai nạn cực thấp, hệ thống quản lý an toàn bài bản. Điều này giúp phí bảo hiểm công trình của khách hàng chọn CTC thấp hơn mặt bằng ngành.',
    image: avatarBase('ThanhHoa', 'personas'),
  },
  {
    name: 'Lưu Quang Trung',
    role: 'Giám đốc – Công ty Kiểm định và Thử nghiệm Miền Trung',
    content:
      'Chúng tôi kiểm định các công trình điện, hạ tầng kỹ thuật do CTC thi công. Gần như 100% hạ tầng CTC thực hiện đạt kết quả kiểm định từ lần đầu, không cần sửa chữa sau kiểm định. Tỷ lệ này cao hơn đáng kể so với mặt bằng ngành xây dựng kỹ thuật.',
    image: avatarBase('QuangTrung', 'notionists'),
  },

  // === Đánh giá chung / đa ngành ===
  {
    name: 'Huỳnh Thị Mỹ Phụng',
    role: 'Giám đốc – Trung tâm Thương mại Đà Nẵng',
    content:
      'CTC cải tạo toàn bộ hệ thống điện, điều hòa và PCCC cho tòa nhà thương mại 8 tầng của chúng tôi. Thi công trong điều kiện vừa hoạt động kinh doanh vừa thi công là thử thách lớn nhưng họ quản lý rất tốt. Không có ngày nào phải đóng cửa vì thi công trong suốt 3 tháng dự án.',
    image: avatarBase('MyPhung', 'adventurer'),
  },
  {
    name: 'Lê Phước Hiệp',
    role: 'Chủ tịch HĐQT – Công ty Vận tải Biển Miền Trung',
    content:
      'Tôi biết đến CTC qua lời giới thiệu của đối tác kinh doanh. Sau khi hợp tác dự án đầu tiên về hệ thống thông tin liên lạc hàng hải, chúng tôi đã ký tiếp 2 dự án nữa. Với 32 năm kinh nghiệm, CTC có nền tảng tri thức và thực hành mà ít doanh nghiệp nào trong vùng có được.',
    image: avatarBase('PhuocHiep', 'micah'),
  },
  {
    name: 'Dương Thị Bảo Ngọc',
    role: 'Giám đốc – Công ty Du lịch Lữ hành Miền Trung',
    content:
      'Chúng tôi thuê CTC xây dựng hạ tầng kỹ thuật cho khu nghỉ dưỡng sinh thái mới. Yêu cầu đặc biệt là dùng tối đa năng lượng mặt trời và thân thiện môi trường. CTC thiết kế giải pháp tích hợp solar + lưới điện thông minh rất phù hợp với định hướng du lịch xanh của chúng tôi.',
    image: avatarBase('BaoNgoc', 'personas'),
  },
  {
    name: 'Đinh Quang Huy',
    role: 'Phó Hiệu trưởng – Trường THPT Chuyên Lê Quý Đôn Đà Nẵng',
    content:
      'CTC hỗ trợ trường chúng tôi nâng cấp phòng máy tính và hạ tầng mạng phục vụ học sinh. Họ dành ưu đãi đặc biệt cho trường công lập, vừa đảm bảo chất lượng vừa nằm trong ngân sách hạn hẹp. Đây là minh chứng rõ ràng cho trách nhiệm xã hội của CTC với cộng đồng.',
    image: avatarBase('QuangHuy', 'notionists'),
  },
  {
    name: 'Trần Văn Quý',
    role: 'Kỹ sư Giám sát độc lập – Ban QLDA ODA tỉnh Quảng Nam',
    content:
      'Trong vai trò giám sát độc lập, tôi đánh giá cao quy trình kiểm soát chất lượng nội bộ của CTC. Mỗi hạng mục đều có biên bản kiểm tra kỹ thuật chi tiết, ký xác nhận đầy đủ. Hồ sơ hoàn công hoàn chỉnh và nộp đúng hạn. Đây là chuẩn mực mà các nhà thầu khác nên học theo.',
    image: avatarBase('VanQuy', 'avataaars'),
  },
  {
    name: 'Nguyễn Phúc Hải',
    role: 'CEO – Startup Nông nghiệp Công nghệ cao Lâm Đồng',
    content:
      'CTC tư vấn và thi công hệ thống điện mặt trời kết hợp IoT giám sát nhà kính cho trang trại chúng tôi. Đây là dự án thí điểm ứng dụng công nghệ 4.0 vào nông nghiệp và CTC tiếp cận rất cởi mở, sẵn sàng thử nghiệm những giải pháp mới. Đây là năng lực đổi mới – sáng tạo thực sự.',
    image: avatarBase('PhucHai', 'adventurer'),
  },
  {
    name: 'Lê Thị Ngọc Hà',
    role: 'Giám đốc – Công ty TNHH Sản xuất bao bì Đà Nẵng',
    content:
      'Nhà máy sản xuất bao bì của chúng tôi cần hệ thống điện 3 pha ổn định cho máy in ấn. CTC thiết kế và thi công hệ thống điện công nghiệp đáp ứng đúng yêu cầu. Quan trọng nhất, họ bổ sung hệ thống lọc nhiễu điện để bảo vệ máy in – điều mà chúng tôi chưa nghĩ đến. Đó là sự chuyên nghiệp thực thụ.',
    image: avatarBase('NgocHa', 'micah'),
  },
];

async function main() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Xóa testimonials cũ nếu muốn chạy lại sạch
  const existing = await Testimonial.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Đã có ${existing} testimonials trong DB.`);
    console.log('   → Tiến hành chèn thêm (không xóa dữ liệu cũ)...\n');
  }

  let inserted = 0;
  let failed = 0;

  for (const item of TESTIMONIALS) {
    try {
      await Testimonial.create(item);
      inserted++;
      console.log(`  ✅ [${inserted.toString().padStart(2, '0')}] ${item.name} — ${item.role.substring(0, 50)}`);
    } catch (err: any) {
      failed++;
      console.error(`  ❌ Lỗi khi chèn "${item.name}": ${err.message}`);
    }
  }

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`🎉 Hoàn tất! Đã thêm: ${inserted} | Lỗi: ${failed}`);
  console.log(`📊 Tổng testimonials trong DB: ${await Testimonial.countDocuments()}`);
  console.log(`─────────────────────────────────────────────\n`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

main().catch((err) => {
  console.error('❌ Lỗi nghiêm trọng:', err);
  process.exit(1);
});
