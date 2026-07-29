import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Plus, Trash2, Star, Sparkles } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { chatService } from '../services/chatService';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';

const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
import SeoAnalyzer from './components/SeoAnalyzer';
import AiProductWriterModal from './components/AiProductWriterModal';
import { formatSeoProductHtml } from './utils/seoProductFormatter';
import { safeParseJson } from './utils/jsonParser';

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'main' | number>('main');
  
  const [focusKeyword, setFocusKeyword] = useState('');

  const handleFocusKeywordChange = (kw: string) => {
    setFocusKeyword(kw);
    setFormData(prev => ({ ...prev, focusKeyword: kw }));
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryId: '',
    categoryLabel: '',
    code: '',
    description: '',
    shortDescription: '',
    specifications: '',
    price: '',
    originalPrice: '',
    vat: 0 as number | string,
    contactPrice: false,
    image: '',
    images: [] as string[],
    stock: 0,
    stockStatus: 'in_stock' as 'in_stock' | 'out_of_stock' | 'contact',
    power: 0,
    efficiency: 0,
    warranty: '',
    features: [''],
    technicalSpecs: {} as { [key: string]: string },
    isFeatured: false,
    featuredOrder: 0,
    focusKeyword: ''
  });

  const { showUnsavedModal, setShowUnsavedModal, setBaseline, confirmNavigation } = useUnsavedChanges(formData, loading);

  const [techSpecKey, setTechSpecKey] = useState('');
  const [techSpecValue, setTechSpecValue] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleApplyAiProduct = (data: {
    name: string;
    code?: string;
    focusKeyword: string;
    shortDescription: string;
    description: string;
    specifications: string;
    power?: number;
    efficiency?: number;
    warranty?: string;
    features?: string[];
    technicalSpecs?: { [key: string]: string };
    image?: string;
    images?: string[];
  }) => {
    const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
      data.description,
      data.focusKeyword,
      data.image,
      data.images || []
    );

    setFocusKeyword(data.focusKeyword);
    setFormData(prev => ({
      ...prev,
      name: data.name || prev.name,
      code: data.code || prev.code,
      focusKeyword: data.focusKeyword,
      shortDescription: data.shortDescription || prev.shortDescription,
      description: cleanHtml || prev.description,
      specifications: data.specifications || prev.specifications,
      power: data.power || prev.power,
      efficiency: data.efficiency || prev.efficiency,
      warranty: data.warranty || prev.warranty,
      features: data.features && data.features.length > 0 ? data.features : prev.features,
      technicalSpecs: data.technicalSpecs || prev.technicalSpecs,
      image: finalMainImage || prev.image || '',
      images: finalExtraImages && finalExtraImages.length > 0 ? finalExtraImages : prev.images
    }));
  };

  const handleGenerateAIDescription = async () => {
    if (!formData.name) {
      showToast('Vui lòng nhập tên sản phẩm trước khi tạo mô tả bằng AI.', 'warning');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const customSystemInstruction = `Bạn là Chuyên gia Biên tập Nội dung & Kỹ thuật viên Sản phẩm cao cấp của Công ty CTC. Nhiệm vụ của bạn là tạo bài viết mô tả sản phẩm và bảng thông số kỹ thuật cực kỳ chi tiết, phong phú, dài từ 1000 đến 1500 từ, chuẩn SEO 100/100 bằng tiếng Việt. BẮT BUỘC có Bảng Thông Số Kỹ Thuật Chi Tiết (8-15 thông số cụ thể), Đặc Điểm Nổi Bật, Hiệu Năng & Ứng Dụng Thực Tế. TUYỆT ĐỐI KHÔNG viết ngắn hay sơ sài.`;

      const prompt = `Hãy viết bài mô tả sản phẩm và bảng thông số kỹ thuật CHUẨN SEO 100/100 & CHI TIẾT 100/100 bằng tiếng Việt cho sản phẩm sau:

━━━ THÔNG TIN ĐẦU VÀO ━━━
- Tên sản phẩm: "${formData.name}"
- Mã sản phẩm / SKU: "${formData.code || 'CTC-' + Math.floor(1000 + Math.random() * 9000)}"
- Danh mục: "${formData.categoryLabel || formData.category || 'Thiết bị Công Nghệ & Năng Lượng'}"

━━━ YÊU CẦU NỘI DUNG VÀ THÔNG SỐ BẮT BUỘC ━━━
1. BẢNG THÔNG SỐ KỸ THUẬT CHI TIẾT (technicalSpecs): BẮT BUỘC tạo 8 đến 15 cặp Key-Value thông số kỹ thuật chính xác và thực tế nhất phù hợp với loại sản phẩm "${formData.name}".
   - Nếu là thiết bị công nghệ (iPad, Laptop, Điện thoại, Máy tính...): CPU/Chipset, RAM, Bộ nhớ trong/SSD, Màn hình & Độ phân giải, Card đồ họa GPU, Camera, Pin & Công nghệ sạc, Hệ điều hành, Trọng lượng, Kích thước, Cổng kết nối, WiFi/Bluetooth, Chất liệu vỏ, Bảo hành.
   - Nếu là thiết bị điện/năng lượng (Pin mặt trời, Inverter, biến tần...): Công suất cực đại, Hiệu suất, Loại Cell, Điện áp hệ thống, Kích thước, Trọng lượng, Chuẩn kháng nước IP, Nhiệt độ vận hành, Tuổi thọ bảo hành.
   - Nếu là thiết bị khác: Công suất, Điện áp, Chất liệu, Trọng lượng, Kích thước, Xuất xứ, Tiêu chuẩn an toàn, Bảo hành.

2. NỘI DUNG BÀI VIẾT (description): 
   - Bài viết DÀI VÀ CHI TIẾT (từ 1000 - 1500 từ), phân tích cực kỳ đầy đủ.
   - BẮT BUỘC bao gồm các phần sau bằng thẻ <h2> và <h3>:
     * <h2>Giới Thiệu Tổng Quan & Đột Phá Thiết Kế [focusKeyword]</h2>
     * <h2>Hiệu Năng Vượt Trội & Công Nghệ Tiên Tiến</h2>
     * <h2>Bảng Thông Số Kỹ Thuật Chi Tiết</h2> (Chứa 1 bảng HTML <table> định dạng đẹp liệt kê 8-15 thông số ở trên)
     * <h2>Đặc Điểm & Tính Năng Nổi Bật</h2> (Chứa danh sách <ul><li>...</li></ul> liệt kê 5-8 tính năng hàng đầu)
     * <h2>Ứng Dụng Thực Tế & Trải Nghiệm Sử Dụng</h2>
     * <h2>Lý Do Nên Chọn Mua Sản Phẩm Tại CTC</h2>
   - Mật độ từ khóa Focus: 1.2% - 2.0%.
   - Dùng nhiều từ nối SEO: "Tuy nhiên", "Bên cạnh đó", "Do đó", "Vì vậy", "Đặc biệt", "Ngoài ra".
   - Thẻ <p> ngắn 2-3 câu, dễ đọc.

🔴 QUY TẮC CẮT BỎ HƯỚNG DẪN: Tuyệt đối KHÔNG copy các câu ví dụ hay câu hướng dẫn (như "Đoạn mở đầu...", "[focusKeyword]") vào kết quả. Viết nội dung bài viết đọc thực tế 100%!

Trả về KẾT QUẢ DUY NHẤT dưới dạng JSON thuần (không bọc trong markdown codeblock):

{
  "focusKeyword": "từ khóa focus chính",
  "shortDescription": "Viết đoạn mô tả ngắn chuẩn 120-160 ký tự...",
  "description": "Viết toàn bộ bài viết mã HTML hoàn chỉnh 1000-1500 từ chứa các thẻ h2, h3, p, ul, li...",
  "specifications": "Tóm tắt thông số kỹ thuật...",
  "power": 0,
  "efficiency": 0,
  "warranty": "24 tháng chính hãng",
  "features": [
    "Viết đặc điểm nổi bật 1",
    "Viết đặc điểm nổi bật 2",
    "Viết đặc điểm nổi bật 3",
    "Viết đặc điểm nổi bật 4",
    "Viết đặc điểm nổi bật 5"
  ],
  "technicalSpecs": {
    "Vi xử lý (CPU)": "Giá trị cụ thể",
    "Bộ nhớ RAM": "Giá trị cụ thể",
    "Màn hình": "Giá trị cụ thể",
    "Pin & Sạc": "Giá trị cụ thể",
    "Kích thước": "Giá trị cụ thể",
    "Trọng lượng": "Giá trị cụ thể",
    "Hệ điều hành": "Giá trị cụ thể",
    "Bảo hành": "Giá trị cụ thể"
  }
}
`;

      const response = await chatService.sendMessage(prompt, customSystemInstruction);
      const parsed: any = safeParseJson(response);

      if (parsed && (parsed.description || parsed.shortDescription || parsed.technicalSpecs || parsed.features)) {
        const generatedKw = parsed.focusKeyword || focusKeyword || formData.name.toLowerCase().trim();
        const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
          parsed.description || '',
          generatedKw,
          parsed.image || formData.image,
          parsed.images || [],
          [],
          (parsed.technicalSpecs && typeof parsed.technicalSpecs === 'object') ? parsed.technicalSpecs : undefined,
          parsed.specifications || ''
        );

        setFocusKeyword(generatedKw);
        setFormData(prev => ({
          ...prev,
          focusKeyword: generatedKw,
          shortDescription: parsed.shortDescription || prev.shortDescription,
          description: cleanHtml || prev.description,
          specifications: parsed.specifications || prev.specifications,
          power: typeof parsed.power === 'number' ? parsed.power : (parseFloat(parsed.power) || prev.power),
          efficiency: typeof parsed.efficiency === 'number' ? parsed.efficiency : (parseFloat(parsed.efficiency) || prev.efficiency),
          warranty: parsed.warranty || prev.warranty,
          features: Array.isArray(parsed.features) && parsed.features.length > 0 ? parsed.features : prev.features,
          technicalSpecs: (parsed.technicalSpecs && typeof parsed.technicalSpecs === 'object') ? parsed.technicalSpecs : prev.technicalSpecs,
          image: finalMainImage || prev.image || '',
          images: finalExtraImages && finalExtraImages.length > 0 ? finalExtraImages : prev.images
        }));
        showToast('✨ Đã tự động tạo bài viết chuẩn SEO Yoast, ảnh minh họa & từ khóa Focus thành công!', 'success');
      } else if (response) {
        const cleanText = response.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
        const fallbackKw = formData.name.toLowerCase().trim();
        const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
          cleanText,
          fallbackKw,
          formData.image,
          []
        );

        setFocusKeyword(fallbackKw);
        setFormData(prev => ({
          ...prev,
          focusKeyword: fallbackKw,
          description: cleanHtml,
          shortDescription: cleanText.replace(/<[^>]*>/g, '').slice(0, 150),
          image: finalMainImage || prev.image || '',
          images: finalExtraImages && finalExtraImages.length > 0 ? finalExtraImages : prev.images
        }));
        showToast('✨ Đã tạo nội dung mô tả & chèn ảnh chuẩn SEO thành công!', 'success');
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      showToast('Lỗi khi kết nối AI Gemini. Vui lòng thử lại.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
    } else {
      setBaseline(formData);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.productCategories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const formatPriceInput = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val).trim();
    if (!str) return '';
    const digits = str.replace(/\D/g, '');
    if (!digits) return str;
    return Number(digits).toLocaleString('en-US');
  };

  const handlePriceChange = (field: 'price' | 'originalPrice', value: string) => {
    const formatted = formatPriceInput(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const product = await api.products.getById(productId);
      const loadedKw = product.focusKeyword || '';
      setFocusKeyword(loadedKw);
      const initialProductData = {
        name: product.name || '',
        category: product.category || '',
        categoryId: product.categoryId || '',
        categoryLabel: product.categoryLabel || '',
        code: product.code || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        specifications: product.specifications || '',
        price: formatPriceInput(product.price),
        originalPrice: formatPriceInput(product.originalPrice),
        vat: product.vat !== undefined ? product.vat : 0,
        contactPrice: product.contactPrice || false,
        image: product.image || '',
        images: product.images || [],
        stock: product.stock || 0,
        stockStatus: product.stockStatus || 'in_stock',
        power: product.power || 0,
        efficiency: product.efficiency || 0,
        warranty: product.warranty || '',
        features: product.features && product.features.length > 0 ? product.features : [''],
        technicalSpecs: product.technicalSpecs || {},
        isFeatured: product.isFeatured || false,
        featuredOrder: product.featuredOrder || 0,
        focusKeyword: loadedKw
      };
      setFormData(initialProductData);
      setBaseline(initialProductData);
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Lỗi khi tải sản phẩm', 'error');
    }
    setLoading(false);
  };

  const handleImageSelect = (url: string) => {
    if (imagePickerTarget === 'main') {
      setFormData({ ...formData, image: url });
    } else if (typeof imagePickerTarget === 'number') {
      const newImages = [...formData.images];
      newImages[imagePickerTarget] = url;
      setFormData({ ...formData, images: newImages });
    }
    setShowImagePicker(false);
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddTechSpec = () => {
    if (techSpecKey && techSpecValue) {
      setFormData({
        ...formData,
        technicalSpecs: { ...formData.technicalSpecs, [techSpecKey]: techSpecValue }
      });
      setTechSpecKey('');
      setTechSpecValue('');
    }
  };

  const handleRemoveTechSpec = (key: string) => {
    const newSpecs = { ...formData.technicalSpecs };
    delete newSpecs[key];
    setFormData({ ...formData, technicalSpecs: newSpecs });
  };

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    setFormData({
      ...formData,
      categoryId,
      category: selectedCategory?.slug || '',
      categoryLabel: selectedCategory?.name || ''
    });
  };

  const handleExit = () => {
    confirmNavigation(() => navigate('/admin/content?tab=products'));
  };

  const saveProductInternal = async (): Promise<boolean> => {
    if (!formData.name || !formData.category || !formData.description || !formData.image) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return false;
    }

    setLoading(true);
    try {
      const parsedVat = typeof formData.vat === 'number'
        ? formData.vat
        : (parseFloat(String(formData.vat).replace(',', '.')) || 0);
      const finalVat = Math.max(0, Math.min(100, isNaN(parsedVat) ? 0 : parsedVat));

      const cleanedData = {
        ...formData,
        vat: finalVat,
        features: formData.features.filter(f => f.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (isEdit && id) {
        await api.products.update(id, cleanedData);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await api.products.create(cleanedData);
        showToast('Thêm sản phẩm thành công!', 'success');
      }
      setBaseline(cleanedData);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Lỗi khi lưu sản phẩm', 'error');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProductInternal();
    if (success) {
      navigate('/admin/content?tab=products');
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white rounded-xl text-sm font-black transition-all shadow-sm hover:shadow-md hover:scale-105 cursor-pointer"
              title="Mở Trợ lý AI tự động tạo toàn bộ thông tin sản phẩm chuẩn SEO Yoast 100/100"
            >
              <Sparkles size={16} className="text-amber-200 animate-pulse" />
              <span>✨ AI Tạo Sản Phẩm</span>
            </button>
            <button
              onClick={handleExit}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: Tấm pin năng lượng mặt trời 550W"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mã sản phẩm</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: TL-550W"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Giá khuyến mại (chưa VAT)</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handlePriceChange('price', e.target.value)}
                  disabled={formData.contactPrice}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 font-medium"
                  placeholder="VD: 17,900,000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Giá niêm yết (chưa VAT - tùy chọn)</label>
                <input
                  type="text"
                  value={formData.originalPrice}
                  onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                  disabled={formData.contactPrice}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 font-medium"
                  placeholder="VD: 22,990,000"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">VAT (%)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={formData.vat}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setFormData(prev => ({ ...prev, vat: '' }));
                      return;
                    }
                    const num = parseFloat(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setFormData(prev => ({ ...prev, vat: val }));
                    }
                  }}
                  disabled={formData.contactPrice}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 dark:disabled:bg-slate-800 font-medium"
                  placeholder="VD: 10, 8 hoặc 0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Thuế VAT (0-100%, mặc định: 0)</p>
              </div>
              
              <div className="md:col-span-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.contactPrice}
                    onChange={(e) => setFormData({ ...formData, contactPrice: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">💬 Liên hệ để biết giá (ẩn giá, hiển thị "Liên hệ báo giá")</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Hình ảnh chính <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border dark:border-slate-700"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 dark:bg-slate-900 rounded-lg border dark:border-slate-700 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setImagePickerTarget('main');
                  setShowImagePicker(true);
                }}
                className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <ImageIcon size={32} className="text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hình ảnh bổ sung</label>
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  {img ? (
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border dark:border-slate-700"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const fallbacks = [
                          'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800',
                          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
                          'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800'
                        ];
                        e.currentTarget.src = fallbacks[index % fallbacks.length];
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePickerTarget(index);
                        setShowImagePicker(true);
                      }}
                      className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                    >
                      <ImageIcon size={24} className="text-gray-400 dark:text-gray-500" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImage}
                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <Plus size={24} className="text-gray-400 dark:text-gray-500" />
              </button>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mô tả ngắn</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Mô tả ngắn gọn về sản phẩm..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Tự động tạo mô tả sản phẩm bằng AI Gemini"
              >
                <Sparkles size={14} className={isGeneratingAI ? 'animate-spin' : ''} />
                {isGeneratingAI ? 'Đang tạo mô tả bằng AI...' : 'Tạo mô tả bằng AI Gemini'}
              </button>
            </div>
            <Suspense fallback={<div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Mô tả chi tiết về sản phẩm, công nghệ, tính năng nổi bật..."
              />
            </Suspense>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông số kỹ thuật</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Chi tiết kỹ thuật..."
            />
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Công suất (kW)</label>
              <input
                type="number"
                step="0.01"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hiệu suất (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.efficiency}
                onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bảo hành</label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: 25 năm"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số lượng tồn kho</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Trạng thái kho</label>
              <select
                value={formData.stockStatus}
                onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as any })}
                className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="contact">Liên hệ</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tính năng nổi bật</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Nhập tính năng..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/60"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Thêm tính năng
              </button>
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thông số kỹ thuật chi tiết</label>
            <div className="space-y-2 mb-3">
              {Object.entries(formData.technicalSpecs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{key}:</span>
                  <span className="text-gray-600 dark:text-gray-300">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechSpec(key)}
                    className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={techSpecKey}
                onChange={(e) => setTechSpecKey(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Tên thông số (VD: Kích thước)"
              />
              <input
                type="text"
                value={techSpecValue}
                onChange={(e) => setTechSpecValue(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Giá trị (VD: 2278 x 1134 x 35mm)"
              />
              <button
                type="button"
                onClick={handleAddTechSpec}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200/60 dark:border-yellow-800/40 rounded-xl">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
              />
              <Star size={18} className="text-yellow-600 dark:text-yellow-400" fill={formData.isFeatured ? 'currentColor' : 'none'} />
              <span className="font-medium text-gray-700 dark:text-gray-200">Sản phẩm nổi bật</span>
            </label>
            {formData.isFeatured && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thứ tự:</label>
                <input
                  type="number"
                  value={formData.featuredOrder}
                  onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                  className="w-20 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>

          {/* SEO Analyzer - Yoast-style for Products */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> PHÂN TÍCH & CHẤM ĐIỂM SEO SẢN PHẨM (YOAST-STYLE)
            </h3>
            <SeoAnalyzer
              title={formData.name}
              excerpt={formData.shortDescription || formData.name}
              content={formData.description + (formData.specifications ? '\n' + formData.specifications : '')}
              image={formData.image}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={handleFocusKeywordChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleExit}
              className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEdit ? 'Cập nhật' : 'Thêm mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Picker Modal */}
      <FilePickerModal
        isOpen={showImagePicker}
        onSelect={handleImageSelect}
        onClose={() => setShowImagePicker(false)}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={() => {
          setShowUnsavedModal(false);
          navigate('/admin/content?tab=products');
        }}
        onSaveAndExit={async () => {
          setShowUnsavedModal(false);
          const success = await saveProductInternal();
          if (success) {
            navigate('/admin/content?tab=products');
          }
        }}
        isSaving={loading}
      />

      {/* AI Product Writer Modal */}
      <AiProductWriterModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleApplyAiProduct}
        initialName={formData.name}
        initialCode={formData.code}
        initialCategory={formData.categoryLabel || formData.category}
      />
    </div>
  );
};

export default ProductForm;
