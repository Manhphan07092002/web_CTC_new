import { Router } from 'express';
import { db } from '../../services/db-mongodb';
import { AttributeTemplate, ProductCategory } from '../../models';

const router = Router();

// Default templates definition for seeding
export const DEFAULT_ATTRIBUTE_TEMPLATES = [
  {
    name: 'Bộ thuộc tính Camera & An Ninh',
    categorySlug: 'camera',
    categoryName: 'Camera & Giám Sát',
    description: 'Thông số kỹ thuật chuẩn cho Camera quan sát, đầu ghi hình và phụ kiện an ninh',
    attributes: [
      { name: 'Độ phân giải', key: 'resolution', type: 'text', unit: 'MP', placeholder: 'VD: 4MP (2560 × 1440)', required: true, order: 1 },
      { name: 'Cảm biến hình ảnh', key: 'sensor', type: 'text', placeholder: 'VD: 1/3" Progressive Scan CMOS', required: false, order: 2 },
      { name: 'Ống kính', key: 'lens', type: 'text', unit: 'mm', placeholder: 'VD: 2.8mm / 4mm', required: false, order: 3 },
      { name: 'Tầm xa hồng ngoại', key: 'ir_distance', type: 'number', unit: 'm', placeholder: 'VD: 30', required: false, order: 4 },
      { name: 'Chuẩn chống nước', key: 'ip_rating', type: 'select', options: ['IP65', 'IP66', 'IP67', 'IP68', 'Trong nhà (Không chống nước)'], placeholder: 'Chọn chuẩn IP', required: false, order: 5 },
      { name: 'Chuẩn nén hình ảnh', key: 'compression', type: 'select', options: ['H.265+', 'H.265', 'H.264+', 'H.264', 'MJPEG'], placeholder: 'Chọn chuẩn nén', required: false, order: 6 },
      { name: 'Hỗ trợ thẻ nhớ', key: 'sd_card', type: 'text', placeholder: 'VD: MicroSD tối đa 256GB', required: false, order: 7 },
      { name: 'Hỗ trợ PoE', key: 'poe_support', type: 'boolean', placeholder: 'Có / Không', required: false, order: 8 },
      { name: 'Nguồn điện', key: 'power_supply', type: 'text', placeholder: 'VD: 12V DC / PoE (802.3af)', required: false, order: 9 },
      { name: 'Nhiệt độ hoạt động', key: 'operating_temp', type: 'text', placeholder: 'VD: -30°C đến 60°C', required: false, order: 10 }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Bộ thuộc tính Thiết Bị Mạng & Switch',
    categorySlug: 'thiet-bi-mang',
    categoryName: 'Thiết Bị Mạng',
    description: 'Thông số kỹ thuật chuẩn cho Switch, Router, Access Point và thiết bị truyền dẫn',
    attributes: [
      { name: 'Số cổng mạng', key: 'port_count', type: 'number', unit: 'cổng', placeholder: 'VD: 24', required: true, order: 1 },
      { name: 'Tốc độ cổng', key: 'port_speed', type: 'select', options: ['10/100 Mbps (Fast Ethernet)', '10/100/1000 Mbps (Gigabit)', '2.5 Gbps', '10 Gbps (10GbE)', '25 Gbps / 40 Gbps / 100 Gbps'], required: true, order: 2 },
      { name: 'Hỗ trợ PoE', key: 'poe', type: 'boolean', placeholder: 'Có / Không', required: false, order: 3 },
      { name: 'Tổng công suất PoE', key: 'poe_budget', type: 'number', unit: 'W', placeholder: 'VD: 370', required: false, order: 4 },
      { name: 'Cổng Uplink', key: 'uplink_ports', type: 'text', placeholder: 'VD: 4 × 1G/10G SFP+', required: false, order: 5 },
      { name: 'Băng thông chuyển mạch (Switching Capacity)', key: 'switching_capacity', type: 'text', unit: 'Gbps', placeholder: 'VD: 128 Gbps', required: false, order: 6 },
      { name: 'Bảng địa chỉ MAC', key: 'mac_table', type: 'text', placeholder: 'VD: 16K', required: false, order: 7 },
      { name: 'Loại quản lý', key: 'management_type', type: 'select', options: ['Unmanaged (Cắm là chạy)', 'Smart Managed / Web Managed', 'Layer 2 Managed', 'Layer 3 Managed'], required: false, order: 8 },
      { name: 'Kích thước / Dạng lắp', key: 'form_factor', type: 'select', options: ['Rackmount 19 inch (1U)', 'Desktop để bàn', 'Wallmount treo tường', 'DIN-Rail công nghiệp'], required: false, order: 9 }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Bộ thuộc tính Máy Tính, Laptop & Server',
    categorySlug: 'may-tinh',
    categoryName: 'Máy Tính & Server',
    description: 'Thông số kỹ thuật chuẩn cho Máy tính để bàn, Laptop văn phòng/kỹ thuật và Máy chủ Server',
    attributes: [
      { name: 'Bộ vi xử lý (CPU)', key: 'cpu', type: 'text', placeholder: 'VD: Intel Core i7-13700H (14 nhân, 20 luồng)', required: true, order: 1 },
      { name: 'Bộ nhớ trong (RAM)', key: 'ram', type: 'text', unit: 'GB', placeholder: 'VD: 16GB DDR5 4800MHz', required: true, order: 2 },
      { name: 'Ổ cứng lưu trữ', key: 'storage', type: 'text', placeholder: 'VD: 512GB SSD M.2 PCIe NVMe', required: true, order: 3 },
      { name: 'Card đồ họa (GPU)', key: 'gpu', type: 'text', placeholder: 'VD: NVIDIA GeForce RTX 4060 8GB / Intel Iris Xe', required: false, order: 4 },
      { name: 'Màn hình', key: 'display', type: 'text', placeholder: 'VD: 15.6 inch FHD (1920x1080) IPS 144Hz', required: false, order: 5 },
      { name: 'Hệ điều hành', key: 'os', type: 'select', options: ['Windows 11 Pro bản quyền', 'Windows 11 Home', 'Ubuntu / Linux', 'FreeDOS (Chưa cài OS)', 'macOS'], required: false, order: 6 },
      { name: 'Cổng kết nối', key: 'connectivity', type: 'text', placeholder: 'VD: 2x USB-A, 1x Thunderbolt 4, 1x HDMI 2.1, RJ45 LAN', required: false, order: 7 },
      { name: 'Dung lượng Pin', key: 'battery', type: 'text', placeholder: 'VD: 4-cell 70Wh', required: false, order: 8 },
      { name: 'Trọng lượng', key: 'weight', type: 'number', unit: 'kg', placeholder: 'VD: 1.8', required: false, order: 9 }
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Bộ thuộc tính Tấm Pin Năng Lượng Mặt Trời',
    categorySlug: 'tam-pin',
    categoryName: 'Tấm Pin Mặt Trời',
    description: 'Thông số kỹ thuật chuẩn cho Tấm pin Solar PV (Mono PERC, TOPCon, N-Type, HJT...)',
    attributes: [
      { name: 'Công suất cực đại (Pmax)', key: 'power', type: 'number', unit: 'W', placeholder: 'VD: 550', required: true, order: 1 },
      { name: 'Hiệu suất quang năng', key: 'efficiency', type: 'number', unit: '%', placeholder: 'VD: 21.5', required: true, order: 2 },
      { name: 'Công nghệ Cell Pin', key: 'cell_type', type: 'select', options: ['N-Type TOPCon', 'Mono PERC', 'HJT (Heterojunction)', 'Bifacial 2 mặt kính', 'Polycrystalline'], required: false, order: 3 },
      { name: 'Điện áp hở mạch (Voc)', key: 'voc', type: 'number', unit: 'V', placeholder: 'VD: 49.8', required: false, order: 4 },
      { name: 'Dòng điện ngắn mạch (Isc)', key: 'isc', type: 'number', unit: 'A', placeholder: 'VD: 14.05', required: false, order: 5 },
      { name: 'Điện áp làm việc (Vmp)', key: 'vmp', type: 'number', unit: 'V', placeholder: 'VD: 41.95', required: false, order: 6 },
      { name: 'Dòng điện làm việc (Imp)', key: 'imp', type: 'number', unit: 'A', placeholder: 'VD: 13.12', required: false, order: 7 },
      { name: 'Kích thước', key: 'dimensions', type: 'text', placeholder: 'VD: 2278 × 1134 × 35 mm', required: false, order: 8 },
      { name: 'Trọng lượng', key: 'weight', type: 'number', unit: 'kg', placeholder: 'VD: 27.5', required: false, order: 9 },
      { name: 'Bảo hành sản phẩm', key: 'warranty_product', type: 'text', placeholder: 'VD: 12 năm vật lý', required: false, order: 10 },
      { name: 'Bảo hành hiệu suất tuyến tính', key: 'warranty_linear', type: 'text', placeholder: 'VD: 25 - 30 năm (trên 84.8%)', required: false, order: 11 }
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Bộ thuộc tính Biến Tần & Inverter',
    categorySlug: 'inverter',
    categoryName: 'Inverter & Biến Tần',
    description: 'Thông số kỹ thuật chuẩn cho Biến tần hòa lưới, Biến tần Hybrid và Off-Grid',
    attributes: [
      { name: 'Công suất định mức', key: 'power_rating', type: 'number', unit: 'kW', placeholder: 'VD: 100', required: true, order: 1 },
      { name: 'Hiệu suất tối đa', key: 'max_efficiency', type: 'number', unit: '%', placeholder: 'VD: 98.8', required: false, order: 2 },
      { name: 'Loại Inverter', key: 'inverter_type', type: 'select', options: ['Hòa lưới On-Grid', 'Lưu trữ Hybrid', 'Độc lập Off-Grid', 'Micro-Inverter', 'Inverter Công nghiệp'], required: true, order: 3 },
      { name: 'Số lượng MPPT', key: 'mppt_count', type: 'number', unit: 'MPPT', placeholder: 'VD: 9', required: false, order: 4 },
      { name: 'Điện áp ngõ vào DC tối đa', key: 'max_dc_voltage', type: 'number', unit: 'V', placeholder: 'VD: 1100', required: false, order: 5 },
      { name: 'Dải điện áp MPPT', key: 'mppt_voltage_range', type: 'text', unit: 'V', placeholder: 'VD: 200V - 1000V', required: false, order: 6 },
      { name: 'Điện áp ngõ ra AC', key: 'ac_output_voltage', type: 'select', options: ['1 Pha 220V/230V', '3 Pha 380V/400V', '3 Pha 480V', '3 Pha 690V'], required: false, order: 7 },
      { name: 'Giao thức giám sát', key: 'monitoring', type: 'text', placeholder: 'VD: Wi-Fi, RS485, Ethernet, 4G Cloud Portal', required: false, order: 8 },
      { name: 'Cấp bảo vệ', key: 'protection_rating', type: 'select', options: ['IP65', 'IP66', 'IP67'], required: false, order: 9 }
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Bộ thuộc tính Máy In & Thiết Bị Văn Phòng',
    categorySlug: 'may-in',
    categoryName: 'Máy In & Văn Phòng',
    description: 'Thông số kỹ thuật chuẩn cho Máy in laser, Máy in phun, Máy photocopy đa chức năng',
    attributes: [
      { name: 'Tốc độ in', key: 'print_speed', type: 'number', unit: 'trang/phút', placeholder: 'VD: 40', required: true, order: 1 },
      { name: 'Công nghệ in', key: 'print_tech', type: 'select', options: ['Laser đơn sắc', 'Laser màu', 'Phun màu (Inkjet)', 'Nhiệt trực tiếp (Thermal)'], required: true, order: 2 },
      { name: 'Độ phân giải in', key: 'print_resolution', type: 'text', unit: 'dpi', placeholder: 'VD: 1200 × 1200 dpi', required: false, order: 3 },
      { name: 'In 2 mặt tự động (Duplex)', key: 'duplex', type: 'boolean', placeholder: 'Có / Không', required: false, order: 4 },
      { name: 'Khổ giấy hỗ trợ', key: 'paper_size', type: 'text', placeholder: 'VD: A4, A5, B5, Letter, Legal', required: false, order: 5 },
      { name: 'Cổng kết nối', key: 'connectivity', type: 'text', placeholder: 'VD: USB 2.0, Gigabit LAN, Wi-Fi 802.11b/g/n', required: false, order: 6 },
      { name: 'Khay nạp giấy', key: 'input_tray', type: 'number', unit: 'tờ', placeholder: 'VD: 250', required: false, order: 7 },
      { name: 'Bộ nhớ chuẩn', key: 'memory', type: 'text', placeholder: 'VD: 512 MB', required: false, order: 8 }
    ],
    isActive: true,
    sortOrder: 6
  }
];

// GET /api/attribute-templates
router.get('/', async (req, res) => {
  try {
    const admin = req.query.admin === 'true';
    const filter = admin ? { isDeleted: { $ne: true } } : { isActive: true, isDeleted: { $ne: true } };
    const items = await db.attributeTemplates.getAll(filter);
    res.json(items);
  } catch (error: any) {
    console.error('Error getting attribute templates:', error);
    res.status(500).json({ message: 'Failed to get attribute templates', error: error?.message });
  }
});

// GET /api/attribute-templates/by-category/:categoryIdOrSlug
router.get('/by-category/:cat', async (req, res) => {
  try {
    const { cat } = req.params;
    let template = null;

    // Try finding by categoryId first if valid ObjectId
    if (cat.match(/^[0-9a-fA-F]{24}$/)) {
      template = await db.attributeTemplates.getByCategoryId(cat);
    }

    // If not found, try finding by categorySlug
    if (!template) {
      template = await db.attributeTemplates.getByCategorySlug(cat);
    }

    // If still not found, try case-insensitive partial match on categorySlug
    if (!template) {
      template = await AttributeTemplate.findOne({
        isDeleted: { $ne: true },
        isActive: true,
        $or: [
          { categorySlug: new RegExp(cat, 'i') },
          { name: new RegExp(cat, 'i') }
        ]
      });
    }

    res.json(template || null);
  } catch (error: any) {
    console.error('Error getting template by category:', error);
    res.status(500).json({ message: 'Failed to get attribute template by category', error: error?.message });
  }
});

// GET /api/attribute-templates/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await db.attributeTemplates.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Attribute template not found' });
    res.json(item);
  } catch (error: any) {
    console.error('Error getting attribute template:', error);
    res.status(500).json({ message: 'Failed to get attribute template', error: error?.message });
  }
});

// POST /api/attribute-templates
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, categorySlug, categoryName, description, attributes, isActive, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Tên bộ thuộc tính không được để trống' });
    }

    const created = await db.attributeTemplates.add({
      name: name.trim(),
      categoryId: categoryId || undefined,
      categorySlug: categorySlug || '',
      categoryName: categoryName || '',
      description: description || '',
      attributes: Array.isArray(attributes) ? attributes : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: Number(sortOrder) || 0,
      isDeleted: false
    });

    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error creating attribute template:', error);
    res.status(500).json({ message: 'Failed to create attribute template', error: error?.message });
  }
});

// PUT /api/attribute-templates/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, categoryId, categorySlug, categoryName, description, attributes, isActive, sortOrder } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (categoryId !== undefined) updateData.categoryId = categoryId || undefined;
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (description !== undefined) updateData.description = description;
    if (attributes !== undefined) updateData.attributes = Array.isArray(attributes) ? attributes : [];
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updated = await db.attributeTemplates.update(req.params.id, updateData);
    if (!updated) return res.status(404).json({ message: 'Attribute template not found' });
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating attribute template:', error);
    res.status(500).json({ message: 'Failed to update attribute template', error: error?.message });
  }
});

// DELETE /api/attribute-templates/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await db.attributeTemplates.delete(req.params.id, true);
    if (!ok) return res.status(404).json({ message: 'Attribute template not found' });
    res.json({ message: 'Attribute template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting attribute template:', error);
    res.status(500).json({ message: 'Failed to delete attribute template', error: error?.message });
  }
});

// POST /api/attribute-templates/seed-defaults
router.post('/seed-defaults', async (req, res) => {
  try {
    let createdCount = 0;
    for (const tpl of DEFAULT_ATTRIBUTE_TEMPLATES) {
      // Find category in DB if exists to associate ID
      let matchedCat = null;
      if (tpl.categorySlug) {
        matchedCat = await ProductCategory.findOne({
          $or: [
            { slug: tpl.categorySlug },
            { slug: new RegExp(tpl.categorySlug, 'i') },
            { name: new RegExp(tpl.categorySlug, 'i') }
          ]
        });
      }

      const existing = await AttributeTemplate.findOne({
        $or: [
          { name: tpl.name },
          { categorySlug: tpl.categorySlug }
        ],
        isDeleted: { $ne: true }
      });

      if (!existing) {
        await AttributeTemplate.create({
          ...tpl,
          categoryId: matchedCat ? matchedCat._id : undefined,
          categoryName: matchedCat ? matchedCat.name : tpl.categoryName,
          isDeleted: false
        });
        createdCount++;
      }
    }

    const all = await db.attributeTemplates.getAll();
    res.json({ success: true, message: `Đã khởi tạo ${createdCount} bộ thuộc tính mẫu.`, data: all });
  } catch (error: any) {
    console.error('Error seeding attribute templates:', error);
    res.status(500).json({ message: 'Failed to seed attribute templates', error: error?.message });
  }
});

export default router;
