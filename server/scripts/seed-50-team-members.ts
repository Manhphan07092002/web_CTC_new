/**
 * Seed 50 Nhân Sự Chính Thức CTC (Hồ Sơ Năng Lực 2026)
 * 
 * Mã nguồn tự động nạp danh sách 50 nhân sự thuộc 5 khối phòng ban CTC:
 * 1. Lãnh đạo Công ty
 * 2. Phòng Kế toán
 * 3. Phòng Kỹ thuật
 * 4. Phòng Kinh doanh
 * 5. Công ty CP Xây lắp Bưu điện Miền Trung Số 1
 * 
 * Lệnh chạy:
 *   npx tsx server/scripts/seed-50-team-members.ts
 * 
 * Trên Docker VPS:
 *   docker compose exec app npx tsx server/scripts/seed-50-team-members.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TeamMember } from '../../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

// Bộ ảnh avatar mẫu chất lượng cao phân loại theo Nam / Nữ
const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
];

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
];

// Danh sách 50 nhân sự chuẩn xác theo bảng Hồ Sơ Năng Lực CTC
const EMPLOYEES_DATA = [
  // ─── I. LÃNH ĐẠO CÔNG TY ─────────────────────────────────────────────
  {
    name: 'Nguyễn Văn Duy',
    birthYear: 1973,
    gender: 'Nam' as const,
    role: 'Tổng Giám Đốc',
    department: 'Lãnh Đạo Công Ty',
    projectsCount: 250,
    specialization: 'Kỹ sư Viễn thông',
    email: 'duynv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 1,
    bio: 'Hơn 25 năm kinh nghiệm chỉ đạo và quản lý tổng thầu EPC các dự án hạ tầng viễn thông Hạng I, trạm biến áp 110kV Hạng II và các trang trại Farm Solar quy mô lớn trên toàn quốc.',
  },
  {
    name: 'Dương Thái Xuyên',
    birthYear: 1972,
    gender: 'Nam' as const,
    role: 'Phó Tổng Giám Đốc',
    department: 'Lãnh Đạo Công Ty',
    projectsCount: 200,
    specialization: 'Kỹ sư Viễn thông',
    email: 'xuyendt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 2,
    bio: 'Chuyên gia điều hành kỹ thuật truyền dẫn viễn thông và hạ tầng mạng cáp quang quốc gia, điều phối trên 200 công trình trọng điểm Miền Trung & Tây Nguyên.',
  },
  {
    name: 'Trần Mạnh Hưởng',
    birthYear: 1985,
    gender: 'Nam' as const,
    role: 'Phó Tổng Giám Đốc',
    department: 'Lãnh Đạo Công Ty',
    projectsCount: 200,
    specialization: 'Kỹ sư Hệ thống điện',
    email: 'huongtm@ctcdn.vn',
    phone: '0236 3745 555',
    order: 3,
    bio: 'Chủ trì thiết kế và thi công hệ thống điện năng lượng tái tạo, trạm biến áp 110kV và đấu nối lưới điện quốc gia EVN cho hơn 200 công trình công nghiệp.',
  },

  // ─── II. PHÒNG KẾ TOÁN ──────────────────────────────────────────────
  {
    name: 'Tôn Thiện Toàn',
    birthYear: 1974,
    gender: 'Nam' as const,
    role: 'Trưởng Phòng Kế Toán',
    department: 'Phòng Kế Toán',
    projectsCount: 150,
    specialization: 'Cử nhân Kinh tế',
    email: 'toantt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 4,
    bio: 'Quản lý tài chính, hạch toán ngân sách và quyết toán dự án EPC cho hơn 150 công trình xây lắp bưu điện và năng lượng.',
  },
  {
    name: 'Lương Thị Mỹ Hạnh',
    birthYear: 1984,
    gender: 'Nữ' as const,
    role: 'Phó Phòng Kế Toán',
    department: 'Phòng Kế Toán',
    projectsCount: 100,
    specialization: 'Cử nhân Kinh tế',
    email: 'hanhltm@ctcdn.vn',
    phone: '0236 3745 555',
    order: 5,
    bio: 'Phụ trách kế toán dự án, thẩm định chi phí vật tư và thủ tục hoàn thuế công trình xây lắp.',
  },
  {
    name: 'Phan Huyền Tú Trinh',
    birthYear: 1976,
    gender: 'Nữ' as const,
    role: 'Kế Toán Viên (KTV)',
    department: 'Phòng Kế Toán',
    projectsCount: 150,
    specialization: 'Cử nhân Kinh tế',
    email: 'trinhpht@ctcdn.vn',
    phone: '0236 3745 555',
    order: 6,
    bio: 'Kiểm soát chứng từ kế toán, thanh quyết toán vật tư và bảo lãnh hợp đồng thi công.',
  },
  {
    name: 'Trương Công Trí',
    birthYear: 1983,
    gender: 'Nam' as const,
    role: 'Nhân Viên Lái Xe Công Vụ',
    department: 'Phòng Kế Toán',
    projectsCount: 30,
    specialization: 'Lái xe chuyên nghiệp',
    email: 'tritc@ctcdn.vn',
    phone: '0236 3745 555',
    order: 7,
    bio: 'Đảm bảo vận chuyển nhân sự kỹ thuật và thiết bị vật tư an toàn đến các công trường khu vực Đà Nẵng và các tỉnh lân cận.',
  },
  {
    name: 'Nguyễn Thị Chín',
    birthYear: 1976,
    gender: 'Nữ' as const,
    role: 'Nhân Viên Hành Chính',
    department: 'Phòng Kế Toán',
    projectsCount: 50,
    specialization: 'Cử nhân Anh Văn',
    email: 'chinnt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 8,
    bio: 'Quản lý hồ sơ văn bản pháp lý, biên dịch tài liệu kỹ thuật quốc tế và đối ngoại khách hàng.',
  },
  {
    name: 'Trần Xuân Phước',
    birthYear: 1994,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kế Toán',
    department: 'Phòng Kế Toán',
    projectsCount: 50,
    specialization: 'Cử nhân Kinh tế',
    email: 'phuoctx@ctcdn.vn',
    phone: '0236 3745 555',
    order: 9,
    bio: 'Theo dõi chi phí thi công hiện trường, đối soát khối lượng nghiệm thu công trình.',
  },

  // ─── III. PHÒNG KỸ THUẬT ─────────────────────────────────────────────
  {
    name: 'Vũ Trần Tuyên',
    birthYear: 1979,
    gender: 'Nam' as const,
    role: 'Phó Phòng Kỹ Thuật',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 250,
    specialization: 'Kỹ sư Viễn thông',
    email: 'tuyenvt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 10,
    bio: 'Chỉ huy trưởng kỹ thuật 250 công trình tuyến cáp quang truyền dẫn, trạm BTS và Data Center.',
  },
  {
    name: 'Hà Ngọc Bằng',
    birthYear: 1978,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 150,
    specialization: 'Kỹ thuật Xây dựng',
    email: 'banghn@ctcdn.vn',
    phone: '0236 3745 555',
    order: 11,
    bio: 'Giám sát thi công kết cấu xây dựng móng trạm biến áp, cột anten viễn thông và khung giàn pin mặt trời.',
  },
  {
    name: 'Mai Thế Hưng',
    birthYear: 1984,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 150,
    specialization: 'Cử nhân Kỹ thuật',
    email: 'hungmt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 12,
    bio: 'Kỹ thuật viên đo kiểm suy hao tuyến cáp quang bằng OTDR, thi công tủ ODF và hàn nối sợi quang.',
  },
  {
    name: 'Đỗ Văn Thuần',
    birthYear: 1986,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Kỹ Thuật Điện',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 150,
    specialization: 'Kỹ sư Điện',
    email: 'thuandv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 13,
    bio: 'Thiết kế tủ phân phối điện, đấu nối Inverter hòa lưới và kiểm tra hệ thống bảo vệ tiếp địa.',
  },
  {
    name: 'Huỳnh Sơn Mãn',
    birthYear: 1991,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện Tử Viễn Thông',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 15,
    specialization: 'Kỹ sư Điện tử viễn thông',
    email: 'manhs@ctcdn.vn',
    phone: '0236 3745 555',
    order: 14,
    bio: 'Chuyên trách lập trình cấu hình thiết bị VoIP Gateway Dinstar, Router MikroTik và tổng đài IP PBX.',
  },
  {
    name: 'Đỗ Văn Thuần (XD)',
    birthYear: 1986,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Kỹ Thuật Công Trình XD',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 30,
    specialization: 'Kỹ sư Kỹ thuật công trình XD',
    email: 'thuandv.xd@ctcdn.vn',
    phone: '0236 3745 555',
    order: 15,
    bio: 'Thẩm định hồ sơ thiết kế thi công công trình dân dụng, nhà xưởng công nghiệp và hạ tầng phụ trợ.',
  },
  {
    name: 'Hồ Sỹ Ngọc',
    birthYear: 1987,
    gender: 'Nam' as const,
    role: 'Cử Nhân Điện Tử Viễn Thông',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 60,
    specialization: 'CN Điện tử viễn thông',
    email: 'ngochsn@ctcdn.vn',
    phone: '0236 3745 555',
    order: 16,
    bio: 'Thi công triển khai mạng cáp mạng CommScope, cài đặt Wi-Fi doanh nghiệp và hệ thống Camera IP.',
  },
  {
    name: 'Trần Xuân Mạnh',
    birthYear: 1984,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Viễn Thông',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 60,
    specialization: 'Kỹ sư Viễn thông',
    email: 'manhtx@ctcdn.vn',
    phone: '0236 3745 555',
    order: 17,
    bio: 'Khảo sát tuyến luồn cáp cống bể, thi công mạng hạ tầng viễn thông các khu công nghiệp Miền Trung.',
  },
  {
    name: 'Nguyễn Văn Đợi',
    birthYear: 1991,
    gender: 'Nam' as const,
    role: 'Cử Nhân Kỹ Thuật',
    department: 'Phòng Kỹ Thuật',
    projectsCount: 20,
    specialization: 'CN Kỹ thuật',
    email: 'doinv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 18,
    bio: 'Kỹ thuật viên hiện trường thi công khung giàn đỡ pin mặt trời và hệ thống thang cáp công nghiệp.',
  },

  // ─── IV. PHÒNG KINH DOANH ────────────────────────────────────────────
  {
    name: 'Nguyễn Văn Đạt',
    birthYear: 1982,
    gender: 'Nam' as const,
    role: 'Giám Đốc Kinh Doanh Thiết Bị VT',
    department: 'Phòng Kinh Doanh',
    projectsCount: 200,
    specialization: 'Kỹ sư Viễn Thông',
    email: 'datnv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 19,
    bio: 'Phụ trách chiến lược kinh doanh phân phối thiết bị viễn thông CommScope, MikroTik, DrayTek, Dinstar và giải pháp năng lượng.',
  },
  {
    name: 'Nguyễn Thị Bích Lài',
    birthYear: 1985,
    gender: 'Nữ' as const,
    role: 'Chuyên Viên Kinh Doanh',
    department: 'Phòng Kinh Doanh',
    projectsCount: 80,
    specialization: 'Kỹ sư Viễn Thông',
    email: 'laintb@ctcdn.vn',
    phone: '0236 3745 555',
    order: 20,
    bio: 'Tư vấn giải pháp thiết bị mạng, chào giá dự án và chăm sóc khách hàng doanh nghiệp khối viễn thông.',
  },
  {
    name: 'Phạm Thị Hà Vy',
    birthYear: 1992,
    gender: 'Nữ' as const,
    role: 'Nhân Viên Kinh Doanh',
    department: 'Phòng Kinh Doanh',
    projectsCount: 40,
    specialization: 'Cử nhân Ngoại ngữ',
    email: 'vypth@ctcdn.vn',
    phone: '0236 3745 555',
    order: 21,
    bio: 'Phụ trách xuất nhập khẩu thiết bị, làm việc với các hãng quốc tế Huawei, LONGI, Canadian Solar, SMA.',
  },
  {
    name: 'Lê Đức Huy',
    birthYear: 1999,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật Mạng & Sales',
    department: 'Phòng Kinh Doanh',
    projectsCount: 25,
    specialization: 'Quản trị mạng máy tính',
    email: 'huyld@ctcdn.vn',
    phone: '0236 3745 555',
    order: 22,
    bio: 'Tư vấn giải pháp quản trị mạng nội bộ, hạ tầng Server Data Center và giải pháp bảo mật cho doanh nghiệp.',
  },
  {
    name: 'Hồ Ngọc Trí',
    birthYear: 1989,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Kỹ Thuật Mạng',
    department: 'Phòng Kinh Doanh',
    projectsCount: 35,
    specialization: 'Kỹ thuật mạng',
    email: 'trihn@ctcdn.vn',
    phone: '0236 3745 555',
    order: 23,
    bio: 'Hỗ trợ demo giải pháp kỹ thuật, cấu hình thử nghiệm sản phẩm Router, Switch cho khách hàng dự án.',
  },
  {
    name: 'Phan Xuân Mạnh',
    birthYear: 2002,
    gender: 'Nam' as const,
    role: 'Kỹ Sư An Toàn Thông Tin & Mạng',
    department: 'Phòng Kinh Doanh',
    projectsCount: 15,
    specialization: 'Kỹ sư ATTT & Mạng máy tính',
    email: 'manhpx@ctcdn.vn',
    phone: '0236 3745 555',
    order: 24,
    bio: 'Chuyên gia tư vấn an toàn thông tin, bảo mật hệ thống mạng doanh nghiệp và tường lửa Firewall.',
  },
  {
    name: 'Hoàng Gia Nhượng',
    birthYear: 1995,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện - Kinh Doanh Solar',
    department: 'Phòng Kinh Doanh',
    projectsCount: 30,
    specialization: 'Kỹ sư Điện',
    email: 'nhuonghg@ctcdn.vn',
    phone: '0236 3745 555',
    order: 25,
    bio: 'Tư vấn kỹ thuật và tính toán phương án tài chính hiệu quả đầu tư hệ thống Điện mặt trời áp mái C&I.',
  },
  {
    name: 'Võ Quý Bảo',
    birthYear: 2003,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện - Tư Vấn Dự Án',
    department: 'Phòng Kinh Doanh',
    projectsCount: 10,
    specialization: 'Kỹ sư Điện',
    email: 'baovq@ctcdn.vn',
    phone: '0236 3745 555',
    order: 26,
    bio: 'Hỗ trợ bóc tách khối lượng vật tư điện, lập báo giá kỹ thuật hệ thống điện mặt trời và trạm biến áp.',
  },

  // ─── V. CÔNG TY CP XÂY LẮP BƯU ĐIỆN MIỀN TRUNG SỐ 1 ──────────────────
  {
    name: 'Dương Thái Xuyên (GĐ)',
    birthYear: 1972,
    gender: 'Nam' as const,
    role: 'Giám Đốc Chi Nhánh Số 1',
    department: 'Công ty Số 1',
    projectsCount: 200,
    specialization: 'Kỹ sư Viễn thông',
    email: 'xuyendt.cn1@ctcdn.vn',
    phone: '0236 3745 555',
    order: 27,
    bio: 'Điều hành toàn bộ hoạt động thi công xây lắp viễn thông và trạm điện của Công ty CP Xây lắp Bưu điện Miền Trung Số 1.',
  },
  {
    name: 'Lương Thị Mỹ Hạnh (KTT)',
    birthYear: 1984,
    gender: 'Nữ' as const,
    role: 'Kế Toán Trưởng Chi Nhánh Số 1',
    department: 'Công ty Số 1',
    projectsCount: 100,
    specialization: 'Cử nhân Kinh tế',
    email: 'hanhltm.cn1@ctcdn.vn',
    phone: '0236 3745 555',
    order: 28,
    bio: 'Quản lý tài chính kế toán toàn diện cho các công trình thi công tại Chi nhánh Số 1.',
  },
  {
    name: 'Trần Thanh Sơn',
    birthYear: 1973,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Kỹ Thuật Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 150,
    specialization: 'Kỹ sư Viễn thông',
    email: 'sontt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 29,
    bio: 'Chỉ huy thi công các tuyến cáp quang liên tỉnh và hạ tầng trạm phát sóng viễn thông khu vực miền Trung.',
  },
  {
    name: 'Nguyễn Viết Tú',
    birthYear: 1983,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Xây Dựng Công Trình',
    department: 'Công ty Số 1',
    projectsCount: 30,
    specialization: 'Kỹ sư Xây dựng',
    email: 'tunv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 30,
    bio: 'Giám sát thi công xây dựng phần móng, trụ cống bể viễn thông và nhà trạm kỹ thuật.',
  },
  {
    name: 'Lê Trọng Sỹ',
    birthYear: 1973,
    gender: 'Nam' as const,
    role: 'Công Nhân Kỹ Thuật Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 120,
    specialization: 'CN Kỹ thuật',
    email: 'sylt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 31,
    bio: 'Kỹ thuật viên thi công kéo cáp quang treo, cáp ngầm và lắp đặt thiết bị nhà trạm.',
  },
  {
    name: 'Nguyễn Minh Vũ',
    birthYear: 1970,
    gender: 'Nam' as const,
    role: 'Công Nhân Kỹ Thuật',
    department: 'Công ty Số 1',
    projectsCount: 100,
    specialization: 'CN Kỹ thuật',
    email: 'vunm@ctcdn.vn',
    phone: '0236 3745 555',
    order: 32,
    bio: 'Tổ trưởng đội thi công hạ tầng viễn thông và lắp đặt thiết bị điện hiện trường.',
  },
  {
    name: 'Bùi Đình Liêm',
    birthYear: 1984,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Điện Tử Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 20,
    specialization: 'Cử nhân Điện Tử Viễn Thông',
    email: 'liembd@ctcdn.vn',
    phone: '0236 3745 555',
    order: 33,
    bio: 'Đo kiểm thông tuyến cáp quang, xử lý sự cố suy hao đường truyền viễn thông.',
  },
  {
    name: 'Hồ Tuấn Anh',
    birthYear: 1982,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Kỹ Thuật Điện Tử',
    department: 'Công ty Số 1',
    projectsCount: 20,
    specialization: 'Cử nhân Điện Tử Viễn Thông',
    email: 'anhht@ctcdn.vn',
    phone: '0236 3745 555',
    order: 34,
    bio: 'Cài đặt và hiệu chỉnh thiết bị truyền dẫn quang SFP, ODF và bộ chuyển đổi quang điện.',
  },
  {
    name: 'Trần Anh Tuấn',
    birthYear: 1982,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 50,
    specialization: 'Cử nhân Điện tử viễn thông',
    email: 'tuanta@ctcdn.vn',
    phone: '0236 3745 555',
    order: 35,
    bio: 'Thi công đấu nối tủ cáp Patch Panel, kéo dây cáp mạng Cat6 cho hạ tầng tòa nhà.',
  },
  {
    name: 'Nguyễn Quốc Hùng',
    birthYear: 1972,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện Tử Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 50,
    specialization: 'KS Điện tử - VT',
    email: 'hungnq@ctcdn.vn',
    phone: '0236 3745 555',
    order: 36,
    bio: 'Giám sát kỹ thuật đấu nối trạm biến áp và đường dây hạ áp phục vụ dự án điện mặt trời.',
  },
  {
    name: 'Đặng Công Vũ',
    birthYear: 1991,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật',
    department: 'Công ty Số 1',
    projectsCount: 20,
    specialization: 'Cử nhân Điện tử viễn thông',
    email: 'vudc@ctcdn.vn',
    phone: '0236 3745 555',
    order: 37,
    bio: 'Thi công lắp đặt thiết bị Wi-Fi Access Point và cài đặt hệ thống Camera giám sát an ninh.',
  },
  {
    name: 'Dương Tiểu Ni',
    birthYear: 1991,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện Tử Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 15,
    specialization: 'Kỹ sư Điện tử viễn thông',
    email: 'nidt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 38,
    bio: 'Cấu hình thiết bị mạng Switch Managed, chia VLAN và kiểm tra an toàn hệ thống mạng.',
  },
  {
    name: 'Trần Ngọc Lễ',
    birthYear: 1976,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật Hiện Trường',
    department: 'Công ty Số 1',
    projectsCount: 40,
    specialization: 'Trung cấp Kỹ thuật',
    email: 'letn@ctcdn.vn',
    phone: '0236 3745 555',
    order: 39,
    bio: 'Thi công lắp đặt thiết bị tủ rack, đi thang khay cáp điện và đấu nối tủ nguồn UPS.',
  },
  {
    name: 'Huỳnh Minh Phúc',
    birthYear: 1987,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Kinh Tế XD & QLDA',
    department: 'Công ty Số 1',
    projectsCount: 20,
    specialization: 'Kỹ sư Kinh tế XD & QLDA',
    email: 'phuchm@ctcdn.vn',
    phone: '0236 3745 555',
    order: 40,
    bio: 'Lập tiến độ dự án, quản lý chi phí công trình và nghiệm thu khối lượng thi công xây lắp.',
  },
  {
    name: 'Phan Anh Vũ',
    birthYear: 1980,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Trung cấp Viễn thông',
    email: 'vupa@ctcdn.vn',
    phone: '0236 3745 555',
    order: 41,
    bio: 'Kỹ thuật viên hàn cáp quang chuyên nghiệp, đo kiểm suy hao đường cáp trục Bắc Nam.',
  },
  {
    name: 'Phan Ngọc Quang',
    birthYear: 1970,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Viễn Thông Trưởng Đội',
    department: 'Công ty Số 1',
    projectsCount: 150,
    specialization: 'Kỹ sư Viễn thông',
    email: 'quangpn@ctcdn.vn',
    phone: '0236 3745 555',
    order: 42,
    bio: 'Đội trưởng thi công tuyến cáp viễn thông Hạng I, chỉ đạo 150 công trình kéo cáp ngầm và cáp treo.',
  },
  {
    name: 'Lê Thị Thanh Nga',
    birthYear: 1985,
    gender: 'Nữ' as const,
    role: 'Phụ Trách Kế Toán Công Trình',
    department: 'Công ty Số 1',
    projectsCount: 10,
    specialization: 'Cử nhân Kinh tế',
    email: 'ngaltt@ctcdn.vn',
    phone: '0236 3745 555',
    order: 43,
    bio: 'Phụ trách theo dõi chi phí công trình hiện trường, hóa đơn chứng từ và lương đội thi công.',
  },
  {
    name: 'Ninh Đức Thịnh',
    birthYear: 1973,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện Tử Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Kỹ sư Điện tử viễn thông',
    email: 'thinhnd@ctcdn.vn',
    phone: '0236 3745 555',
    order: 44,
    bio: 'Giám sát thi công hệ thống chống sét, tiếp địa an toàn trạm điện và phòng máy chủ Data Center.',
  },
  {
    name: 'Nguyễn Văn Khuyên',
    birthYear: 1990,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Điện Tự Động Tàu Thủy',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Điện tự động tàu thủy',
    email: 'khuyennv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 45,
    bio: 'Chuyên gia thi công các hệ thống điện tự động hóa chịu môi trường ăn mòn hơi muối biển tại các vùng ven biển Đà Nẵng, Khánh Hòa.',
  },
  {
    name: 'Trần Hồng Quân',
    birthYear: 1988,
    gender: 'Nam' as const,
    role: 'Kỹ Sư Công Trình Xây Dựng',
    department: 'Công ty Số 1',
    projectsCount: 50,
    specialization: 'Kỹ sư công trình xây dựng',
    email: 'quantb@ctcdn.vn',
    phone: '0236 3745 555',
    order: 46,
    bio: 'Thẩm định hồ sơ kết cấu khung giàn pin mặt trời nhà xưởng, nghiệm thu tải trọng mái tôn công nghiệp.',
  },
  {
    name: 'Đặng Công Hoan',
    birthYear: 1982,
    gender: 'Nam' as const,
    role: 'Nhân Viên Kỹ Thuật Điện Công Nghiệp',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Kỹ thuật điện công nghiệp',
    email: 'hoandc@ctcdn.vn',
    phone: '0236 3745 555',
    order: 47,
    bio: 'Thi công kéo dây cáp điện động lực DC/AC, lắp đặt tủ máy cắt CB và tủ bù công suất phản kháng.',
  },
  {
    name: 'Nguyễn Xuân Hiến',
    birthYear: 1980,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Truyền Dẫn Phát Sóng',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Truyền dẫn phát sóng',
    email: 'hiennx@ctcdn.vn',
    phone: '0236 3745 555',
    order: 48,
    bio: 'Chuyên trách cấu hình và cân chỉnh thiết bị truyền dẫn vô tuyến viba, trạm phát sóng BTS viễn thông.',
  },
  {
    name: 'Nguyễn Văn Thao',
    birthYear: 1992,
    gender: 'Nam' as const,
    role: 'Cử Nhân Quản Trị Mạng Máy Tính',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Cử nhân Quản trị mạng máy tính',
    email: 'thaonv@ctcdn.vn',
    phone: '0236 3745 555',
    order: 49,
    bio: 'Quản trị hệ thống máy chủ dữ liệu nội bộ, hạ tầng lưu trữ NAS và sao lưu dự phòng dữ liệu.',
  },
  {
    name: 'Đặng Thế Quyền',
    birthYear: 1989,
    gender: 'Nam' as const,
    role: 'Chuyên Viên Điện Tử Viễn Thông',
    department: 'Công ty Số 1',
    projectsCount: 70,
    specialization: 'Điện tử viễn thông',
    email: 'quyendq@ctcdn.vn',
    phone: '0236 3745 555',
    order: 50,
    bio: 'Kỹ thuật viên O&M bảo trì định kỳ 24/7 hệ thống điện mặt trời, xử lý sự cố thiết bị viễn thông hiện trường.',
  },
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
}

function formatMiddleAndFirstNameEmail(fullName: string): string {
  const cleanName = fullName.replace(/\s*\([^)]*\)/g, '').trim();
  const words = removeVietnameseTones(cleanName).split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return `contact@ctcdn.vn`;
  if (words.length === 1) return `${words[0].toLowerCase()}@ctcdn.vn`;

  const firstName = words[words.length - 1].toLowerCase();
  const middleName = words[words.length - 2].toLowerCase();
  
  return `${middleName}${firstName}@ctcdn.vn`;
}

async function main() {
  console.log('\n============================================================');
  console.log('CTC — SEED 50 NHÂN SỰ CHÍNH THỨC CHUẨN SEO + GEO');
  console.log('============================================================\n');

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.\n');

    console.log('🔥 Clearing existing team members...');
    await TeamMember.deleteMany({});
    console.log('✓ Cleared old team members.\n');

    const teamToInsert = EMPLOYEES_DATA.map((emp, idx) => {
      const avatarList = emp.gender === 'Nữ' ? FEMALE_AVATARS : MALE_AVATARS;
      const avatarUrl = avatarList[idx % avatarList.length];
      const cleanName = emp.name.replace(/\s*\([^)]*\)/g, '').trim();
      const formattedEmail = formatMiddleAndFirstNameEmail(emp.name);

      return {
        name: cleanName,
        role: emp.role,
        department: emp.department,
        birthYear: emp.birthYear,
        gender: emp.gender,
        projectsCount: emp.projectsCount,
        specialization: emp.specialization,
        bio: emp.bio,
        image: avatarUrl,
        email: formattedEmail,
        phone: emp.phone,
        order: emp.order,
        isActive: true,
      };
    });

    console.log(`🚀 Inserting ${teamToInsert.length} official CTC team members...`);
    const inserted = await TeamMember.insertMany(teamToInsert);
    console.log(`\n💾 Successfully inserted ${inserted.length} official CTC employees into MongoDB!`);

    console.log('\n============================================================');
    console.log('🎉 SEED 50 NHÂN SỰ CHÍNH THỨC CTC HOÀN TẤT!');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Error seeding team members:', error);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main();
