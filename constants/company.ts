/**
 * Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)
 * Company Information Constants
 * Sử dụng file này để có thông tin công ty nhất quán trên toàn website
 */

export const COMPANY = {
  // Tên công ty
  name: 'Công ty Cổ phần Xây lắp Bưu điện Miền Trung',
  nameEn: 'CENTRAL VIETNAM POSTS AND TELECOMMUNICATIONS  CONSTRUCTION JOINT - STOCK COMPANY',
  shortName: 'CTC',
  brandName: 'CTC',
  
  // Pháp lý
  taxId: '0400458940',
  foundingDate: '2004-02-11',
  founder: 'Nguyễn Văn Duy',
  charterCapital: '9.987.660.000 VNĐ',
  
  // Liên hệ
  phone: '02363745555',
  phoneFormatted: '+84 236 3745 555',
  phoneDisplay: '0236 3745 555',
  hotline: '0915 059 666',
  email: 'info@ctcdn.vn',
  emailAlternate: 'khkd.ctc@gmail.com',
  website: 'https://www.ctcdn.vn',
  
  // Địa chỉ
  address: {
    street: '50B Nguyễn Du',
    ward: '',
    district: 'Hải Châu',
    city: 'Đà Nẵng',
    province: 'Đà Nẵng',
    postalCode: '550000',
    country: 'VN',
    countryName: 'Việt Nam',
    full: '50B Nguyễn Du, Hải Châu, Đà Nẵng',
    short: '50B Nguyễn Du, Hải Châu, Đà Nẵng'
  },
  
  // Tọa độ
  geo: {
    latitude: 16.0759,
    longitude: 108.2201
  },
  
  // Giờ làm việc
  workingHours: {
    weekdays: '08:00 - 17:30',
    saturday: '08:00 - 12:00',
    sunday: 'Nghỉ',
    display: 'T2-T6: 08:00-17:30 | T7: 08:00-12:00'
  },
  
  // Social Media
  social: {
    facebook: 'https://www.facebook.com/ctcdn',
    youtube: 'https://www.youtube.com/@ctcdn',
    zalo: 'https://zalo.me/0915059666',
    linkedin: '',
    instagram: ''
  },
  
  // Mô tả
  description: {
    vi: 'Thi công và xây lắp hạ tầng viễn thông, năng lượng tái tạo, xây dựng công nghiệp, dân dụng, công trình điện, công nghệ thông tin và chuyển đổi số.',
    en: 'Construction and installation of telecommunications infrastructure, renewable energy, industrial and civil construction, electrical works, information technology, and digital transformation.'
  },
  
  // Slogan
  slogan: {
    vi: 'Giải pháp tổng thể - Giá trị bền vững',
    en: 'Total Solutions - Sustainable Values'
  },
  
  // Keywords SEO
  keywords: {
    vi: 'CTC, công ty cổ phần xây lắp bưu điện miền trung, viễn thông, xây lắp điện, năng lượng tái tạo, điện mặt trời, điện gió, đà nẵng',
    en: 'CTC, central vietnam posts and telecommunications construction, telecommunications, renewable energy, solar power, da nang'
  }
};

// Type definition
export type CompanyInfo = typeof COMPANY;

// Default export
export default COMPANY;
