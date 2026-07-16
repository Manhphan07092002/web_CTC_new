/**
 * CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ
 * Company Information Constants
 * Sử dụng file này để có thông tin công ty nhất quán trên toàn website
 */

export const COMPANY = {
  // Tên công ty
  name: 'CÔNG TY CỔ PHẦN THIẾT BỊ ĐIỆN TRẦN LÊ',
  nameEn: 'TRAN LE ELECTRICAL EQUIPMENT CORPORATION',
  shortName: 'TRAN LE Electricity',
  brandName: 'TRAN LE',
  
  // Pháp lý
  taxId: '0402055834',
  foundingDate: '2020-07-28',
  founder: 'TRẦN THANH XUÂN',
  
  // Liên hệ
  phone: '02366562020',
  phoneFormatted: '+84 236 656 2020',
  phoneDisplay: '0236 656 2020',
  hotline: '0236 656 2020',
  email: 'info@tranle.vn',
  website: 'https://tranle.vn',
  
  // Địa chỉ
  address: {
    street: '275-279 Diên Hồng',
    ward: 'Phường Hòa Xuân',
    district: 'Quận Cẩm Lệ',
    city: 'Đà Nẵng',
    province: 'Đà Nẵng',
    postalCode: '550000',
    country: 'VN',
    countryName: 'Việt Nam',
    full: '275-279 Diên Hồng, Phường Hòa Xuân, Quận Cẩm Lệ, Đà Nẵng',
    short: '275-279 Diên Hồng, Cẩm Lệ, Đà Nẵng'
  },
  
  // Tọa độ
  geo: {
    latitude: 16.0190,
    longitude: 108.2208
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
    facebook: 'https://www.facebook.com/tranleelectricity',
    youtube: 'https://www.youtube.com/@tranleelectricity',
    zalo: 'https://zalo.me/0236656202',
    linkedin: '',
    instagram: ''
  },
  
  // Mô tả
  description: {
    vi: 'Thi công và lắp đặt hệ thống pin năng lượng mặt trời, máy phát điện năng lượng mặt trời, inverter, thiết bị năng lượng mặt trời tại Đà Nẵng và toàn quốc.',
    en: 'Installation of solar panel systems, solar generators, inverters, and solar equipment in Da Nang and nationwide Vietnam.'
  },
  
  // Slogan
  slogan: {
    vi: 'Đối tác tin cậy trong lĩnh vực năng lượng mặt trời',
    en: 'Your trusted partner in solar energy'
  },
  
  // Keywords SEO
  keywords: {
    vi: 'điện mặt trời, năng lượng mặt trời, tấm pin mặt trời, inverter, TRAN LE, lắp đặt điện mặt trời Đà Nẵng, hệ thống điện mặt trời',
    en: 'solar energy, solar panels, solar installation, inverter, TRAN LE, Da Nang solar, solar system'
  }
};

// Type definition
export type CompanyInfo = typeof COMPANY;

// Default export
export default COMPANY;
