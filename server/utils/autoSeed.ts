import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function convertIds(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertIds);
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
        res[key] = new mongoose.Types.ObjectId(val);
      } else if (val && typeof val === 'object') {
        res[key] = convertIds(val);
      } else {
        res[key] = val;
      }
    }
    return res;
  }
  return obj;
}

/**
 * Automatically imports all JSON seed files from `seed-data/` if MongoDB is empty.
 * Triggered automatically on server startup or initial setup.
 */
export async function autoSeedIfEmpty(): Promise<boolean> {
  try {
    const db = mongoose.connection.db;
    if (!db) return false;

    // Check if products collection has documents
    const productsCount = await db.collection('products').countDocuments();
    const settingsCount = await db.collection('settings').countDocuments();

    // If products or settings already exist, skip auto-seeding
    if (productsCount > 0 && settingsCount > 0) {
      return false;
    }

    console.log('🌱 Database is empty! Auto-seeding initial data from seed-data/...');

    // Locate seed-data directory
    const seedDir = path.join(process.cwd(), 'seed-data');
    if (!fs.existsSync(seedDir)) {
      console.warn(`⚠️ seed-data directory not found at: ${seedDir}`);
      return false;
    }

    // Read all JSON files except summary
    const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    let totalImported = 0;

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(seedDir, file);

      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(fileContent);

        if (Array.isArray(data) && data.length > 0) {
          data = convertIds(data);
          const collection = db.collection(collectionName);
          
          // Clear any partial data before inserting
          await collection.deleteMany({});
          await collection.insertMany(data, { ordered: false });
          
          console.log(`   ✅ Loaded ${collectionName}: ${data.length} records`);
          totalImported += data.length;
        }
      } catch (err: any) {
        console.error(`   ❌ Error loading ${file}:`, err.message || err);
      }
    }

import { CompanyProfile, FinancialReport, BusinessSector } from '../../models';

/**
 * Automatically seeds Company Profile, Financial Reports, and Business Sectors if collections are empty.
 */
export async function autoSeedProfileData(): Promise<void> {
  try {
    // 1. Company Profile
    const profileCount = await CompanyProfile.countDocuments({ isDeleted: { $ne: true } });
    if (profileCount === 0) {
      console.log('🌱 Seeding initial Company Profile...');
      await CompanyProfile.create({
        title: 'Hồ Sơ Năng Lực CTC 2026',
        subtitle: 'Năng Lực & Pháp Lý',
        description: 'Tổng hợp toàn diện về năng lực pháp lý, tài chính, đội ngũ nhân sự kỹ thuật cao và trang thiết bị thi công hiện đại của CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC).',
        year: '2026',
        version: 'v2026.1',
        fileUrl: '/file/HSNL 2024.docx',
        fileName: 'HoSoNangLuc_CTC_2026.docx',
        tag: 'CTC-PROFILE-2026',
        highlights: [
          'Đầy đủ chứng chỉ hành nghề và năng lực xây dựng Hạng I của Bộ Xây dựng.',
          'Đội ngũ nhân sự chuyên môn vững vàng với hơn 53+ kỹ sư, chỉ huy trưởng.',
          'Danh mục máy móc đo đạc, thi công chuyên biệt hiện đại nhập khẩu.',
          'Đối tác tin cậy của các tập đoàn Viễn thông, Công nghệ & Năng lượng lớn.'
        ],
        stats: [
          { value: '53+', label: 'Cán bộ kỹ thuật chủ chốt' },
          { value: '32+', label: 'Năm kinh nghiệm' }
        ],
        status: 'active',
        sortOrder: 1,
        isDeleted: false
      });
      console.log('   ✅ Company Profile seeded.');
    }

    // 2. Financial Reports
    const financeCount = await FinancialReport.countDocuments({ isDeleted: { $ne: true } });
    if (financeCount === 0) {
      console.log('🌱 Seeding initial Financial Reports...');
      const initialReports = [
        {
          title: 'Báo cáo tài chính năm 2025',
          year: '2025',
          reportType: 'financial_statement',
          reportTypeName: 'Báo cáo tài chính',
          description: 'Tổng kết năm 2025 với những bước tiến vượt bậc, khẳng định vị thế vững chắc trong lĩnh vực hạ tầng & năng lượng.',
          fileUrl: '/Tinh_Hinh_Tai_Chinh/BCTC 2025.pdf',
          fileName: 'BCTC 2025.pdf',
          status: 'active',
          sortOrder: 1,
          isDeleted: false
        },
        {
          title: 'Báo cáo tài chính năm 2024',
          year: '2024',
          reportType: 'financial_statement',
          reportTypeName: 'Báo cáo tài chính',
          description: 'Tổng kết năm 2024 với những bước tiến vượt bậc, khẳng định vị thế vững vàng.',
          fileUrl: '/Tinh_Hinh_Tai_Chinh/BCTC 2024.pdf',
          fileName: 'BCTC 2024.pdf',
          status: 'active',
          sortOrder: 2,
          isDeleted: false
        },
        {
          title: 'Báo cáo tài chính năm 2023',
          year: '2023',
          reportType: 'financial_statement',
          reportTypeName: 'Báo cáo tài chính',
          description: 'Phân tích kết quả kinh doanh năm 2023, làm cơ sở định hướng phát triển hạ tầng mạng viễn thông.',
          fileUrl: '/Tinh_Hinh_Tai_Chinh/BCTC 2023.pdf',
          fileName: 'BCTC 2023.pdf',
          status: 'active',
          sortOrder: 3,
          isDeleted: false
        },
        {
          title: 'Báo cáo tài chính năm 2022',
          year: '2022',
          reportType: 'financial_statement',
          reportTypeName: 'Báo cáo tài chính',
          description: 'Cung cấp cái nhìn tổng quan về tình hình tài chính năm 2022, làm cơ sở đầu tư và liên danh dự án.',
          fileUrl: '/Tinh_Hinh_Tai_Chinh/BCTC 2022.pdf',
          fileName: 'BCTC 2022.pdf',
          status: 'active',
          sortOrder: 4,
          isDeleted: false
        },
        {
          title: 'Xác nhận thực hiện nghĩa vụ thuế',
          year: '2025',
          reportType: 'tax_confirmation',
          reportTypeName: 'Xác nhận nghĩa vụ thuế',
          description: 'Giấy xác nhận thực hiện đầy đủ nghĩa vụ thuế nhà nước, cập nhật mới nhất từ Cục Thuế.',
          fileUrl: '/Tinh_Hinh_Tai_Chinh/Xác nhận không nợ thuế CTC đến 16-...pdf',
          fileName: 'Xac_Nhan_Khong_No_Thue_CTC.pdf',
          status: 'active',
          sortOrder: 5,
          isDeleted: false
        }
      ];
      await FinancialReport.insertMany(initialReports);
      console.log('   ✅ Financial Reports seeded: 5 reports.');
    }

    // 3. Business Sectors
    const sectorCount = await BusinessSector.countDocuments({ isDeleted: { $ne: true } });
    if (sectorCount === 0) {
      console.log('🌱 Seeding initial Business Sectors...');
      const initialSectors = [
        {
          name: 'Cung cấp giải pháp & sản phẩm công nghệ',
          slug: 'giai-phap-san-pham-cong-nghe',
          subtitle: 'CNTT & Viễn Thông',
          description: 'Cung cấp thiết bị tin học chuyên dụng, máy chủ server, mạng truyền dẫn và giải pháp phần mềm bản quyền doanh nghiệp.',
          icon: 'Laptop',
          highlights: [
            'Thiết bị tin học chuyên dụng, máy chủ, hệ thống lưu trữ.',
            'Thiết bị viễn thông, mạng truyền dẫn chuyên sâu.',
            'Hệ thống nghe nhìn (AV) chuyên nghiệp, phòng họp thông minh.',
            'Phần mềm bản quyền và các gói giải pháp doanh nghiệp.'
          ],
          stats: [
            { value: '100%', label: 'Chính hãng CO/CQ' },
            { value: '24/7', label: 'Hỗ trợ kỹ thuật' }
          ],
          status: 'active',
          sortOrder: 1,
          isDeleted: false
        },
        {
          name: 'Xây dựng hạ tầng & công trình',
          slug: 'xay-dung-ha-tang-cong-trinh',
          subtitle: 'Xây Lắp & M&E',
          description: 'Tổng thầu EPC xây dựng dân dụng, công nghiệp, hạ tầng trạm BTS viễn thông, trạm biến áp và hệ thống cơ điện công trình.',
          icon: 'Building2',
          highlights: [
            'Thi công tổng thầu EPC dân dụng và công nghiệp.',
            'Hạ tầng kỹ thuật viễn thông (trạm thu phát BTS, cáp ngầm cáp treo).',
            'Xây dựng trạm biến áp, hệ thống cơ điện công trình M&E.'
          ],
          stats: [
            { value: 'Hạng I', label: 'Năng lực xây dựng' },
            { value: '500+', label: 'Trạm & Công trình' }
          ],
          status: 'active',
          sortOrder: 2,
          isDeleted: false
        },
        {
          name: 'Cung cấp dịch vụ hỗ trợ',
          slug: 'cung-cap-dich-vu-ho-tro',
          subtitle: 'Tư Vấn & O&M',
          description: 'Tư vấn thiết kế kỹ thuật, khảo sát đo kiểm cấu hình nghiệm thu và dịch vụ bảo dưỡng ứng cứu sự cố O&M viễn thông 24/7.',
          icon: 'Wrench',
          highlights: [
            'Tư vấn kỹ thuật chuyên sâu, khảo sát lập thiết kế kỹ thuật.',
            'Dịch vụ lắp đặt, đo kiểm, cấu hình nghiệm thu thiết bị.',
            'Hợp đồng vận hành, bảo dưỡng khôi phục sự cố O&M.'
          ],
          stats: [
            { value: '32+', label: 'Năm kinh nghiệm' },
            { value: '99.9%', label: 'Độ sẵn sàng hệ thống' }
          ],
          status: 'active',
          sortOrder: 3,
          isDeleted: false
        },
        {
          name: 'Phát triển giải pháp tổng thể',
          slug: 'phat-trien-giai-phap-tong-the',
          subtitle: 'Năng Lượng & Chuyển Đổi Số',
          description: 'Triển khai dự án chìa khóa trao tay Turnkey, hạ tầng trung tâm dữ liệu thông minh và hệ thống điện mặt trời công nghiệp.',
          icon: 'SunMedium',
          highlights: [
            'Tích hợp công nghệ cao trong các dự án Chìa khóa trao tay.',
            'Hạ tầng trung tâm dữ liệu thông minh, chuyển đổi số Cloud.',
            'Giải pháp năng lượng mặt trời áp mái và nông nghiệp bền vững.'
          ],
          stats: [
            { value: '50MW+', label: 'Tổng công suất lắp đặt' },
            { value: 'Tiết kiệm 30%', label: 'Chi phí vận hành' }
          ],
          status: 'active',
          sortOrder: 4,
          isDeleted: false
        }
      ];
      await BusinessSector.insertMany(initialSectors);
      console.log('   ✅ Business Sectors seeded: 4 sectors.');
    }
  } catch (err: any) {
    console.error('❌ Error seeding profile data:', err.message || err);
  }
}
