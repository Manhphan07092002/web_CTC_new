/**
 * Seed Categories Script
 * Xóa toàn bộ danh mục sản phẩm cũ và nạp cây danh mục đa cấp mới với mô tả Chuẩn SEO.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ProductCategory } from '../../models';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ctc_web_new';

const categoryHierarchy = [
  {
    name: 'HẠ TẦNG VIỄN THÔNG & CNTT',
    slug: 'ha-tang-vien-thong-cntt',
    description: 'Giải pháp toàn diện về hạ tầng viễn thông, thiết bị truyền dẫn quang, cáp mạng và hệ thống tổng đài VoIP cho doanh nghiệp.',
    order: 1,
    children: [
      {
        name: 'Thiết bị mạng',
        slug: 'thiet-bi-mang',
        description: 'Cung cấp Router, Switch, Wi-Fi Access Point và thiết bị cân bằng tải chính hãng, hiệu suất cao cho hạ tầng mạng doanh nghiệp.',
        children: [
          { 
            name: 'Router', 
            slug: 'router',
            description: 'Router định tuyến mạnh mẽ, hỗ trợ nhiều WAN, VPN và quản lý băng thông chuyên nghiệp cho doanh nghiệp.'
          },
          { 
            name: 'Switch', 
            slug: 'switch',
            description: 'Thiết bị chuyển mạch Switch PoE, Managed và Unmanaged chính hãng từ các thương hiệu uy tín.'
          },
          { 
            name: 'Wi-Fi / Access Point', 
            slug: 'wifi-access-point',
            description: 'Bộ phát Wi-Fi doanh nghiệp, Access Point chuẩn Wi-Fi 6/6E hỗ trợ Mesh và Roaming mượt mà.'
          },
          { 
            name: 'Thiết bị cân bằng tải', 
            slug: 'thiet-bi-can-bang-tai',
            description: 'Thiết bị cân bằng tải Load Balancer tối ưu tốc độ kết nối internet và chống đứt cáp cho doanh nghiệp.'
          }
        ]
      },
      {
        name: 'Thiết bị truyền dẫn quang',
        slug: 'thiet-bi-truyen-dan-quang',
        description: 'Module quang SFP, hộp phối quang ODF và các thiết bị truyền dẫn cáp quang tốc độ cao.',
        children: [
          { 
            name: 'SFP', 
            slug: 'sfp',
            description: 'Module quang SFP/SFP+ 1G, 10G, 40G, 100G chính hãng tương thích đa thiết bị mạng.'
          },
          { 
            name: 'ODF', 
            slug: 'odf',
            description: 'Hộp phối quang ODF trong nhà và ngoài trời chất lượng cao, bảo vệ mối nối cáp quang an toàn.'
          }
        ]
      },
      {
        name: 'Tổng đài và VoIP',
        slug: 'tong-dai-va-voip',
        description: 'Hệ thống tổng đài IP PBX, VoIP Gateway và điện thoại IP đáp ứng mọi nhu cầu liên lạc doanh nghiệp.',
        children: [
          { 
            name: 'VoIP Gateway', 
            slug: 'voip-gateway',
            description: 'Thiết bị chuyển đổi VoIP Gateway chuyển tín hiệu Analog sang IP chính hãng Dinstar, Yeastar.'
          },
          { 
            name: 'IP PBX', 
            slug: 'ip-pbx',
            description: 'Hệ thống tổng đài IP doanh nghiệp hiện đại, hỗ trợ nhiều máy nhánh, ghi âm cuộc gọi và IVR.'
          },
          { 
            name: 'Điện thoại IP', 
            slug: 'dien-thoai-ip',
            description: 'Điện thoại bàn IP Phone cao cấp hỗ trợ HD Voice, PoE và kết nối VoIP linh hoạt.'
          }
        ]
      },
      {
        name: 'Hạ tầng cáp và kết nối',
        slug: 'ha-tang-cap-va-ket-noi',
        description: 'Cáp mạng Cat5e/Cat6/Cat6A, cáp quang, Patch Panel và phụ kiện thi công mạng chuyên nghiệp.',
        children: [
          { 
            name: 'Cáp mạng', 
            slug: 'cap-mang',
            description: 'Cáp mạng UTP, FTP, SFTP Cat5e/Cat6/Cat6A chính hãng CommScope, Alantek chuẩn chất lượng.'
          },
          { 
            name: 'Cáp quang', 
            slug: 'cap-quang',
            description: 'Cáp quang Singlemode, Multimode luồn cống, treo ngoài trời chịu lực tốt và truyền dẫn ổn định.'
          },
          { 
            name: 'Patch Panel', 
            slug: 'patch-panel',
            description: 'Thanh quản lý cáp Patch Panel 24 port, 48 port Cat5e/Cat6 cho tủ Rack Server.'
          },
          { 
            name: 'Phụ kiện kết nối', 
            slug: 'phu-kien-ket-noi',
            description: 'Hạt mạng RJ45, nhân mạng, mặt âm tường, dây nhảy Patch Cord và công cụ thi công mạng.'
          }
        ]
      }
    ]
  },
  {
    name: 'THIẾT BỊ CNTT',
    slug: 'thiet-bi-cntt',
    description: 'Phân phối máy chủ Server, máy tính PC, Mini PC, Laptop doanh nghiệp và các thiết bị CNTT chuyên dụng.',
    order: 2,
    children: [
      { 
        name: 'Máy chủ', 
        slug: 'may-chu',
        description: 'Máy chủ Server Dell PowerEdge, HP ProLiant chính hãng cấu hình mạnh mẽ cho dữ liệu doanh nghiệp.'
      },
      { 
        name: 'PC', 
        slug: 'pc',
        description: 'Máy tính để bàn PC văn phòng, PC đồ họa và trạm làm việc Workstation hiệu năng cao.'
      },
      { 
        name: 'Mini PC', 
        slug: 'mini-pc',
        description: 'Máy tính siêu nhỏ Mini PC tiết kiệm điện năng, cấu hình cao thích hợp cho văn phòng và Kiosk.'
      },
      { 
        name: 'Laptop', 
        slug: 'laptop',
        description: 'Máy tính xách tay Laptop văn phòng, doanh nhân và đồ họa chuyên nghiệp từ Asus, Dell, HP, Lenovo.'
      },
      { 
        name: 'Máy in nhãn', 
        slug: 'may-in-nhan',
        description: 'Máy in nhãn mã vạch, tem nhãn chất lượng cao cho văn phòng, kho bãi và logistics.'
      },
      { 
        name: 'Kiosk', 
        slug: 'kiosk',
        description: 'Màn hình Kiosk cảm ứng tra cứu thông tin tự động cho ngân hàng, bệnh viện và trung tâm thương mại.'
      }
    ]
  },
  {
    name: 'NĂNG LƯỢNG MẶT TRỜI',
    slug: 'nang-luong-mat-troi',
    description: 'Hệ thống điện mặt trời mái nhà và công nghiệp: Tấm pin mặt trời Mono PERC/N-Type và Inverter hòa lưới.',
    order: 3,
    children: [
      { 
        name: 'Tấm pin năng lượng mặt trời', 
        slug: 'tam-pin-nang-luong-mat-troi',
        description: 'Tấm pin năng lượng mặt trời công nghệ N-Type, TopCon, Half-cell hiệu suất vượt trội.'
      },
      { 
        name: 'Bộ hòa lưới (Inverter)', 
        slug: 'bo-hoa-luoi-inverter',
        description: 'Bộ hòa lưới Inverter điện mặt trời hòa lưới và Hybrid chính hãng Huawei, Sungrow, Growatt.'
      }
    ]
  },
  {
    name: 'ẮC QUY VÀ LƯU TRỮ ĐIỆN',
    slug: 'ac-quy-va-luu-tru-dien',
    description: 'Giải pháp lưu trữ điện dự phòng: Ắc quy chì-axit, Ắc quy Lithium LiFePO4 và Ắc quy nước chuyên dụng.',
    order: 4,
    children: [
      { 
        name: 'Ắc quy chì', 
        slug: 'ac-quy-chi',
        description: 'Ắc quy chì-axit xả sâu AGM/GEL cho hệ thống lưu trữ điện UPS và điện mặt trời.'
      },
      { 
        name: 'Ắc quy Lithium', 
        slug: 'ac-quy-lithium',
        description: 'Pin lưu trữ Lithium LiFePO4 tuổi thọ cao, hỗ trợ sạc nhanh và xả sâu an toàn tuyệt đối.'
      },
      { 
        name: 'Ắc quy nước', 
        slug: 'ac-quy-nuoc',
        description: 'Ắc quy nước dung lượng lớn cho khởi động máy phát điện và ứng dụng công nghiệp.'
      }
    ]
  },
  {
    name: 'THƯƠNG HIỆU',
    slug: 'thuong-hieu',
    description: 'Đối tác nhà phân phối chính hãng các thương hiệu viễn thông và thiết bị mạng hàng đầu thế giới.',
    order: 5,
    children: [
      { 
        name: 'CommScope', 
        slug: 'commscope',
        description: 'Thiết bị cáp mạng, cáp quang và hạ tầng kết nối chính hãng CommScope AMP.'
      },
      { 
        name: 'Dinstar', 
        slug: 'dinstar',
        description: 'Giải pháp tổng đài VoIP, VoIP Gateway và thiết bị truyền thông chính hãng Dinstar.'
      },
      { 
        name: 'DrayTek', 
        slug: 'draytek',
        description: 'Router cân bằng tải Vigor, Access Point và Switch quản lý chuyên nghiệp từ DrayTek.'
      },
      { 
        name: 'MikroTik', 
        slug: 'mikrotik',
        description: 'Router RouterBOARD, Switch quang tốc độ cao và thiết bị định tuyến chuyên sâu MikroTik.'
      },
      { 
        name: 'TP-Link', 
        slug: 'tp-link',
        description: 'Thiết bị mạng văn phòng, Wi-Fi gia đình và doanh nghiệp TP-Link, Omada Cloud.'
      }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Delete ALL existing Product Categories
    console.log('\n🔥 Deleting ALL existing product categories...');
    const deleteResult = await ProductCategory.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} old product categories`);

    // 2. Recursive Seeding Function
    async function insertCategoryTree(nodes: any[], parentId?: string) {
      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        const newCat = new ProductCategory({
          name: item.name,
          slug: item.slug,
          description: item.description || '',
          order: item.order || (i + 1),
          isActive: true,
          parentId: parentId || undefined,
          productCount: 0
        });

        const savedCat = await newCat.save();
        console.log(`  └─ Created: "${item.name}" (ID: ${savedCat._id}) ${parentId ? `[ParentID: ${parentId}]` : '[ROOT Level 1]'}`);

        if (item.children && item.children.length > 0) {
          await insertCategoryTree(item.children, savedCat._id.toString());
        }
      }
    }

    console.log('\n🚀 Seeding new product category hierarchy with SEO descriptions...');
    await insertCategoryTree(categoryHierarchy);

    console.log('\n✅ Successfully seeded all product categories with SEO descriptions!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
