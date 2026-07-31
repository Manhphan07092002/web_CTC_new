import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { ProductCategory, Product } from '../models/index.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ctc_web_new';

export const TAXONOMY = [
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

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Map existing categories in DB to back up old ID mappings
    const oldCategories = await ProductCategory.find({});
    console.log(`Found ${oldCategories.length} existing categories in DB.`);

    const oldIdMap = new Map<string, any>();
    oldCategories.forEach(c => oldIdMap.set(c._id.toString(), c));

    // 2. Clear old categories
    console.log('Clearing old product categories...');
    await ProductCategory.deleteMany({});

    // 3. Insert new structured taxonomy
    const newCategoryMap = new Map<string, any>(); // key: slug -> doc

    async function insertNodes(nodes: any[], parentId?: string) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const catDoc = new ProductCategory({
          name: node.name,
          slug: node.slug,
          description: node.description || '',
          order: node.order || (i + 1),
          parentId: parentId || undefined,
          isActive: true,
          productCount: 0
        });

        const saved = await catDoc.save();
        newCategoryMap.set(node.slug, saved);
        console.log(`  ✓ Inserted category: "${saved.name}" (Slug: ${saved.slug}, ID: ${saved._id})`);

        if (node.children && node.children.length > 0) {
          await insertNodes(node.children, saved._id.toString());
        }
      }
    }

    console.log('\nInserting new taxonomy tree...');
    await insertNodes(TAXONOMY);

    // 4. Update existing Products categoryId, brand, and category references
    const products = await Product.find({ isDeleted: { $ne: true } });
    console.log(`\nRe-mapping ${products.length} products to new categories and brands...`);

    let updatedProducts = 0;

    for (const p of products) {
      let targetSlug = 'ha-tang-vien-thong-cntt';
      let brandName = (p as any).brand || '';

      // Infer brand and target category from product name, code, or old category
      const nameUpper = (p.name || '').toUpperCase();
      const catUpper = (p.category || '').toUpperCase();

      // Detect brand
      if (nameUpper.includes('COMMSOPE') || nameUpper.includes('COMMSCOPE') || catUpper.includes('COMMSOPE') || catUpper.includes('COMMSCOPE')) {
        brandName = 'CommScope';
      } else if (nameUpper.includes('DINSTAR') || catUpper.includes('DINSTAR')) {
        brandName = 'Dinstar';
      } else if (nameUpper.includes('DRAYTEK') || catUpper.includes('DRAYTEK')) {
        brandName = 'DrayTek';
      } else if (nameUpper.includes('MIKROTIK') || catUpper.includes('MIKROTIK')) {
        brandName = 'MikroTik';
      } else if (nameUpper.includes('TPLINK') || nameUpper.includes('TP-LINK') || catUpper.includes('TPLINK') || catUpper.includes('TP-LINK')) {
        brandName = 'TP-Link';
      }

      // Detect category
      if (catUpper.includes('ROUTER') || nameUpper.includes('ROUTER') || nameUpper.includes('VIGOR') || nameUpper.includes('HEX') || nameUpper.includes('CCR')) {
        targetSlug = 'router';
      } else if (catUpper.includes('SWITCH') || nameUpper.includes('SWITCH') || nameUpper.includes('CRS')) {
        targetSlug = 'switch';
      } else if (catUpper.includes('WIFI') || catUpper.includes('ACCESS POINT') || nameUpper.includes('ACCESS POINT') || nameUpper.includes('WIFI') || nameUpper.includes('CAP')) {
        targetSlug = 'wifi-access-point';
      } else if (catUpper.includes('CÂN BẰNG TẢI') || nameUpper.includes('LOAD BALANCER')) {
        targetSlug = 'thiet-bi-can-bang-tai';
      } else if (catUpper.includes('SFP') || nameUpper.includes('SFP') || nameUpper.includes('MODULE QUANG')) {
        targetSlug = 'sfp';
      } else if (catUpper.includes('ODF') || nameUpper.includes('ODF')) {
        targetSlug = 'odf';
      } else if (catUpper.includes('GATEWAY') || nameUpper.includes('GATEWAY') || nameUpper.includes('DAG') || nameUpper.includes('UC2000')) {
        targetSlug = 'voip-gateway';
      } else if (catUpper.includes('PBX') || nameUpper.includes('TONG DAI') || nameUpper.includes('TỔNG ĐÀI') || nameUpper.includes('IP PBX')) {
        targetSlug = 'ip-pbx';
      } else if (catUpper.includes('DIEN THOAI') || catUpper.includes('ĐIỆN THOẠI') || nameUpper.includes('IP PHONE') || nameUpper.includes('C60')) {
        targetSlug = 'dien-thoai-ip';
      } else if (catUpper.includes('CAP MANG') || catUpper.includes('CÁP MẠNG') || nameUpper.includes('CAT5E') || nameUpper.includes('CAT6') || nameUpper.includes('AMP')) {
        targetSlug = 'cap-mang';
      } else if (catUpper.includes('CAP QUANG') || catUpper.includes('CÁP QUANG') || nameUpper.includes('SINGLEMODE') || nameUpper.includes('MULTIMODE')) {
        targetSlug = 'cap-quang';
      } else if (catUpper.includes('PATCH PANEL') || nameUpper.includes('PATCH PANEL')) {
        targetSlug = 'patch-panel';
      } else if (catUpper.includes('PHU KIEN') || catUpper.includes('PHỤ KIỆN') || nameUpper.includes('HẠT MẠNG') || nameUpper.includes('RJ45')) {
        targetSlug = 'phu-kien-ket-noi';
      } else if (catUpper.includes('MAY CHU') || catUpper.includes('MÁY CHỦ') || nameUpper.includes('SERVER') || nameUpper.includes('POWEREDGE')) {
        targetSlug = 'may-chu';
      } else if (catUpper.includes('MINI PC') || nameUpper.includes('MINI PC') || nameUpper.includes('NUC')) {
        targetSlug = 'mini-pc';
      } else if (catUpper.includes('LAPTOP') || nameUpper.includes('LAPTOP') || nameUpper.includes('THINKPAD') || nameUpper.includes('ZENBOOK')) {
        targetSlug = 'laptop';
      } else if (catUpper.includes('MAY IN NHAN') || catUpper.includes('MÁY IN NHÃN') || nameUpper.includes('LABEL') || nameUpper.includes('BROTHER')) {
        targetSlug = 'may-in-nhan';
      } else if (catUpper.includes('KIOSK') || nameUpper.includes('KIOSK')) {
        targetSlug = 'kiosk';
      } else if (catUpper.includes('PC') || nameUpper.includes('MÁY TÍNH')) {
        targetSlug = 'pc';
      } else if (catUpper.includes('PIN') || catUpper.includes('TẤM PIN') || nameUpper.includes('SOLAR') || nameUpper.includes('PERC') || nameUpper.includes('CANADIAN') || nameUpper.includes('LONGI')) {
        targetSlug = 'tam-pin-nang-luong-mat-troi';
      } else if (catUpper.includes('INVERTER') || catUpper.includes('HÒA LƯỚI') || nameUpper.includes('INVERTER') || nameUpper.includes('BIẾN TẦN') || nameUpper.includes('HUAWEI')) {
        targetSlug = 'bo-hoa-luoi-inverter';
      } else if (catUpper.includes('LITHIUM') || nameUpper.includes('LITHIUM') || nameUpper.includes('LIFEPO4')) {
        targetSlug = 'ac-quy-lithium';
      } else if (catUpper.includes('NƯỚC') || catUpper.includes('NUOC') || nameUpper.includes('NƯỚC')) {
        targetSlug = 'ac-quy-nuoc';
      } else if (catUpper.includes('ẮC QUY') || catUpper.includes('AC QUY') || nameUpper.includes('ẮC QUY') || nameUpper.includes('BATTERY') || nameUpper.includes('CHI')) {
        targetSlug = 'ac-quy-chi';
      }

      const targetCatDoc = newCategoryMap.get(targetSlug) || newCategoryMap.get('ha-tang-vien-thong-cntt');

      if (targetCatDoc) {
        p.categoryId = targetCatDoc._id;
        p.category = targetCatDoc.name;
        p.categoryLabel = targetCatDoc.name.toUpperCase();
        if (brandName) (p as any).brand = brandName;

        await p.save();
        updatedProducts++;
      }
    }

    console.log(`✓ Updated ${updatedProducts} products to match new category hierarchy & brands.`);

    // 5. Calculate and update product counts for all categories (including parent categories)
    console.log('\nRecalculating product counts for category tree...');
    const allCategoryDocs = await ProductCategory.find({});

    const docMap = new Map<string, any>();
    allCategoryDocs.forEach(c => docMap.set(c._id.toString(), c));

    // Get direct counts
    const directCounts = new Map<string, number>();
    for (const cat of allCategoryDocs) {
      const cnt = await Product.countDocuments({ categoryId: cat._id, isDeleted: { $ne: true } });
      directCounts.set(cat._id.toString(), cnt);
    }

    // Helper to compute recursive count
    function getRecursiveCount(catId: string): number {
      let total = directCounts.get(catId) || 0;
      const children = allCategoryDocs.filter(c => c.parentId === catId);
      children.forEach(ch => {
        total += getRecursiveCount(ch._id.toString());
      });
      return total;
    }

    for (const cat of allCategoryDocs) {
      cat.productCount = getRecursiveCount(cat._id.toString());
      await cat.save();
    }

    console.log('✓ Updated category product counts recursively.');

    // 6. Sync seed-data/productcategories.json file
    const seedCategoriesPath = path.join(process.cwd(), 'seed-data', 'productcategories.json');
    const jsonCategories = allCategoryDocs.map(c => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      order: c.order || 0,
      isActive: c.isActive !== false,
      parentId: c.parentId || undefined,
      productCount: c.productCount || 0
    }));

    fs.writeFileSync(seedCategoriesPath, JSON.stringify(jsonCategories, null, 2), 'utf8');
    console.log(`✓ Exported clean categories tree to ${seedCategoriesPath}`);

    console.log('\n🎉 Category & Brand reorganization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reorganizing categories:', error);
    process.exit(1);
  }
}

run();
