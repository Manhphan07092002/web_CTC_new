import { Router } from 'express';
import { Product, Project, News, Resource, Order } from '../../models';
import { logger } from '../../utils/logger';

const router = Router();

// Static list of Solutions
const STATIC_SOLUTIONS = [
  {
    title: "Điện mặt trời mái nhà",
    description: "Hệ thống điện mặt trời áp mái cho hộ gia đình và doanh nghiệp. Giải pháp tiết kiệm chi phí hiệu quả nhất.",
    category: "Giải pháp áp mái",
    slug: "rooftop",
    path: "/solutions/rooftop"
  },
  {
    title: "Trang trại Điện mặt trời",
    description: "Các dự án quy mô lớn, kết nối lưới điện quốc gia. Đóng góp quan trọng vào an ninh năng lượng và phát triển kinh tế.",
    category: "Giải pháp trang trại",
    slug: "farm",
    path: "/solutions/farm"
  },
  {
    title: "Điện mặt trời Nổi",
    description: "Công nghệ tiên tiến lắp đặt trên mặt nước (hồ chứa, đập thủy điện). Tăng hiệu suất và bảo vệ tài nguyên đất.",
    category: "Giải pháp nổi",
    slug: "floating",
    path: "/solutions/floating"
  },
  {
    title: "Hệ thống cơ điện",
    description: "Tư vấn, thiết kế và thi công hệ thống cơ điện công nghiệp, đường dây truyền tải và trạm biến áp.",
    category: "Cơ điện",
    slug: "electrical",
    path: "/solutions/electrical"
  },
  {
    title: "Trung tâm dữ liệu xanh",
    description: "Giải pháp năng lượng sạch và hệ thống làm mát hiệu quả cao cho các trung tâm dữ liệu hiện đại.",
    category: "Dữ liệu xanh",
    slug: "datacenter",
    path: "/solutions/datacenter"
  },
  {
    title: "Xây lắp công nghiệp",
    description: "Thi công xây dựng hạ tầng, nhà xưởng công nghiệp kết hợp tích hợp giải pháp năng lượng tái tạo.",
    category: "Xây lắp",
    slug: "construction",
    path: "/solutions/construction"
  }
];

// Escape RegExp special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Convert string to Vietnamese diacritic-insensitive regex pattern
function makeVietnameseRegex(str: string): RegExp {
  const map: { [key: string]: string } = {
    'a': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'à': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'á': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ả': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ã': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ạ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ă': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ằ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ắ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẳ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẵ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ặ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'â': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ầ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ấ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẩ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ẫ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'ậ': '[aàáảãạăằắẳẵặâầấẩẫậ]',
    'd': '[dđ]',
    'đ': '[dđ]',
    'e': '[eèéẻẽẹêềếểễệ]',
    'è': '[eèéẻẽẹêềếểễệ]',
    'é': '[eèéẻẽẹêềếểễệ]',
    'ẻ': '[eèéẻẽẹêềếểễệ]',
    'ẽ': '[eèéẻẽẹêềếểễệ]',
    'ẹ': '[eèéẻẽẹêềếểễệ]',
    'ê': '[eèéẻẽẹêềếểễệ]',
    'ề': '[eèéẻẽẹêềếểễệ]',
    'ế': '[eèéẻẽẹêềếểễệ]',
    'ể': '[eèéẻẽẹêềếểễệ]',
    'ễ': '[eèéẻẽẹêềếểễệ]',
    'ệ': '[eèéẻẽẹêềếểễệ]',
    'i': '[iìíỉĩị]',
    'ì': '[iìíỉĩị]',
    'í': '[iìíỉĩị]',
    'ỉ': '[iìíỉĩị]',
    'ĩ': '[iìíỉĩị]',
    'ị': '[iìíỉĩị]',
    'o': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ò': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ó': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ỏ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'õ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ọ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ô': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ồ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ố': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ổ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ỗ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ộ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ơ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ờ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ớ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ở': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ỡ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'ợ': '[oòóỏõọôồốổỗộơờớởỡợ]',
    'u': '[uùúủũụưừứửữự]',
    'ù': '[uùúủũụưừứửữự]',
    'ú': '[uùúủũụưừứửữự]',
    'ủ': '[uùúủũụưừứửữự]',
    'ũ': '[uùúủũụưừứửữự]',
    'ụ': '[uùúủũụưừứửữự]',
    'ư': '[uùúủũụưừứửữự]',
    'ừ': '[uùúủũụưừứửữự]',
    'ứ': '[uùúủũụưừứửữự]',
    'ử': '[uùúủũụưừứửữự]',
    'ữ': '[uùúủũụưừứửữự]',
    'ự': '[uùúủũụưừứửữự]',
    'y': '[yỳýỷỹỵ]',
    'ý': '[yỳýỷỹỵ]',
    'ỷ': '[yỳýỷỹỵ]',
    'ỹ': '[yỳýỷỹỵ]',
    'ỵ': '[yỳýỷỹỵ]'
  };

  let regexStr = '';
  for (const char of str.toLowerCase()) {
    regexStr += map[char] || escapeRegExp(char);
  }
  return new RegExp(regexStr, 'i');
}

// GET search suggestions (Live autocomplete)
router.get('/live', async (req: any, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.toString().trim()) {
      return res.json({ success: true, data: { products: [], projects: [], solutions: [], resources: [], news: [] } });
    }

    const searchVal = q.toString().trim();
    const regex = makeVietnameseRegex(searchVal);

    // 1. Products search
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { code: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    }).limit(5).select('name code category price image');

    // 2. Projects search
    const projects = await Project.find({
      $or: [
        { title: { $regex: regex } },
        { category: { $regex: regex } },
        { location: { $regex: regex } }
      ]
    }).limit(5).select('title category image location');

    // 3. News search
    const news = await News.find({
      $or: [
        { title: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    }).limit(5).select('title category image date');

    // 4. Resources / Documents search
    const resources = await Resource.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).limit(5).select('title fileUrl size');

    // 5. Solutions search (in-memory)
    const solutions = STATIC_SOLUTIONS.filter(sol => 
      regex.test(sol.title) || 
      regex.test(sol.description) || 
      regex.test(sol.category)
    ).slice(0, 5);

    res.json({
      success: true,
      data: {
        products,
        projects,
        solutions,
        resources,
        news
      }
    });
  } catch (error) {
    logger.error('Error in live search:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET full search query with pagination and filters
router.get('/', async (req: any, res) => {
  try {
    const { q, type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!q || !q.toString().trim()) {
      return res.json({
        success: true,
        data: {
          results: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          counts: { products: 0, projects: 0, solutions: 0, resources: 0, news: 0, orders: 0 }
        }
      });
    }

    const searchVal = q.toString().trim();
    const regex = makeVietnameseRegex(searchVal);

    // Get count for each category
    const productsCount = await Product.countDocuments({
      $or: [
        { name: { $regex: regex } },
        { code: { $regex: regex } },
        { category: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    });

    const projectsCount = await Project.countDocuments({
      $or: [
        { title: { $regex: regex } },
        { category: { $regex: regex } },
        { location: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    });

    const newsCount = await News.countDocuments({
      $or: [
        { title: { $regex: regex } },
        { category: { $regex: regex } },
        { excerpt: { $regex: regex } },
        { content: { $regex: regex } }
      ]
    });

    const resourcesCount = await Resource.countDocuments({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    });

    const matchingSolutions = STATIC_SOLUTIONS.filter(sol => 
      regex.test(sol.title) || 
      regex.test(sol.description) || 
      regex.test(sol.category)
    );
    const solutionsCount = matchingSolutions.length;

    // Search orders if user is authenticated
    let ordersCount = 0;
    let matchingOrders: any[] = [];
    if (req.user) {
      const orderQuery: any = {};
      if (req.user.role !== 'admin' && req.user.role !== 'editor') {
        orderQuery.$or = [
          { email: req.user.email },
          { phone: req.user.phone }
        ];
      }
      orderQuery.$and = [
        {
          $or: [
            { orderCode: { $regex: regex } },
            { customerName: { $regex: regex } },
            { phone: { $regex: regex } },
            { status: { $regex: regex } }
          ]
        }
      ];
      ordersCount = await Order.countDocuments(orderQuery);
      if (!type || type === 'orders') {
        matchingOrders = await Order.find(orderQuery).sort({ createdAt: -1 });
      }
    }

    const counts = {
      products: productsCount,
      projects: projectsCount,
      solutions: solutionsCount,
      resources: resourcesCount,
      news: newsCount,
      orders: ordersCount
    };

    let results: any[] = [];
    let total = 0;

    // Retrieve data based on selected filter type
    if (!type || type === 'all') {
      // Return a aggregated preview of everything (max 4 per group)
      const p = await Product.find({
        $or: [
          { name: { $regex: regex } },
          { code: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      }).limit(4).select('name code category price image');

      const proj = await Project.find({
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      }).limit(4).select('title category image location');

      const n = await News.find({
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } }
        ]
      }).limit(4).select('title category image date');

      const r = await Resource.find({
        $or: [
          { title: { $regex: regex } }
        ]
      }).limit(4).select('title fileUrl size');

      const sol = matchingSolutions.slice(0, 4);

      results = [
        ...p.map(x => ({ ...x.toObject(), searchType: 'products' })),
        ...proj.map(x => ({ ...x.toObject(), searchType: 'projects' })),
        ...sol.map(x => ({ ...x, searchType: 'solutions' })),
        ...r.map(x => ({ ...x.toObject(), searchType: 'resources' })),
        ...n.map(x => ({ ...x.toObject(), searchType: 'news' })),
        ...matchingOrders.slice(0, 4).map(x => ({ ...x.toObject(), searchType: 'orders' }))
      ];
      total = productsCount + projectsCount + solutionsCount + resourcesCount + newsCount + ordersCount;
    } else if (type === 'products') {
      const data = await Product.find({
        $or: [
          { name: { $regex: regex } },
          { code: { $regex: regex } },
          { category: { $regex: regex } },
          { description: { $regex: regex } }
        ]
      }).skip(skip).limit(limit);
      results = data.map(x => ({ ...x.toObject(), searchType: 'products' }));
      total = productsCount;
    } else if (type === 'projects') {
      const data = await Project.find({
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } },
          { location: { $regex: regex } },
          { description: { $regex: regex } }
        ]
      }).skip(skip).limit(limit);
      results = data.map(x => ({ ...x.toObject(), searchType: 'projects' }));
      total = projectsCount;
    } else if (type === 'solutions') {
      const data = matchingSolutions.slice(skip, skip + limit);
      results = data.map(x => ({ ...x, searchType: 'solutions' }));
      total = solutionsCount;
    } else if (type === 'resources') {
      const data = await Resource.find({
        $or: [
          { title: { $regex: regex } },
          { description: { $regex: regex } }
        ]
      }).skip(skip).limit(limit);
      results = data.map(x => ({ ...x.toObject(), searchType: 'resources' }));
      total = resourcesCount;
    } else if (type === 'news') {
      const data = await News.find({
        $or: [
          { title: { $regex: regex } },
          { category: { $regex: regex } },
          { excerpt: { $regex: regex } },
          { content: { $regex: regex } }
        ]
      }).skip(skip).limit(limit);
      results = data.map(x => ({ ...x.toObject(), searchType: 'news' }));
      total = newsCount;
    } else if (type === 'orders' && req.user) {
      const data = await Order.find({
        $and: [
          {
            $or: [
              { orderCode: { $regex: regex } },
              { customerName: { $regex: regex } },
              { phone: { $regex: regex } }
            ]
          },
          req.user.role !== 'admin' && req.user.role !== 'editor'
            ? { $or: [{ email: req.user.email }, { phone: req.user.phone }] }
            : {}
        ].filter(Boolean) as any
      }).skip(skip).limit(limit).sort({ createdAt: -1 });
      results = data.map(x => ({ ...x.toObject(), searchType: 'orders' }));
      total = ordersCount;
    }

    res.json({
      success: true,
      data: {
        results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts
      }
    });
  } catch (error) {
    logger.error('Error in search query:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
