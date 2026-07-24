import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Plus, Trash2, Star, Sparkles } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { chatService } from '../services/chatService';

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
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'main' | number>('main');
  
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
    featuredOrder: 0
  });

  const [techSpecKey, setTechSpecKey] = useState('');
  const [techSpecValue, setTechSpecValue] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateAIDescription = async () => {
    if (!formData.name) {
      showToast('Vui lòng nhập tên sản phẩm trước khi tạo mô tả bằng AI.', 'warning');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const prompt = `Viết bài mô tả chi tiết sản phẩm cho website Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC). 
Tên sản phẩm: "${formData.name}". 
Mã sản phẩm: "${formData.code || 'N/A'}". 
Công suất: ${formData.power ? formData.power + ' kW' : 'Tiêu chuẩn'}. 
Bảo hành: ${formData.warranty || 'Chính hãng CTC'}. 

Yêu cầu:
1. Viết 1 đoạn mô tả ngắn (khoảng 2 câu) tóm tắt điểm nổi bật.
2. Viết 1 bài mô tả chi tiết khoảng 3-4 đoạn trình bày về công nghệ, hiệu suất, tính an toàn và ứng dụng thực tế. 
3. Trả về kết quả dưới định dạng JSON duy nhất: {"shortDescription": "...", "description": "..."}`;

      const response = await chatService.sendMessage(prompt);
      let parsed: any = null;
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      } catch (e) {}

      if (parsed && (parsed.description || parsed.shortDescription)) {
        setFormData(prev => ({
          ...prev,
          shortDescription: parsed.shortDescription || prev.shortDescription,
          description: parsed.description || prev.description,
        }));
        showToast('Đã tạo thành công bài mô tả sản phẩm bằng AI Gemini!', 'success');
      } else if (response) {
        setFormData(prev => ({
          ...prev,
          description: response,
        }));
        showToast('Đã tạo mô tả sản phẩm bằng AI thành công!', 'success');
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
      showToast('Lỗi khi tạo mô tả bằng AI', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
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

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const product = await api.products.getById(productId);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        categoryId: product.categoryId || '',
        categoryLabel: product.categoryLabel || '',
        code: product.code || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        specifications: product.specifications || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
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
        featuredOrder: product.featuredOrder || 0
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.description || !formData.image) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty features and images
      const cleanedData = {
        ...formData,
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
      navigate('/admin/content?tab=products');
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Lỗi khi lưu sản phẩm', 'error');
    }
    setLoading(false);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h1>
          <button
            onClick={() => navigate('/admin/content?tab=products')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: Tấm pin năng lượng mặt trời 550W"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Mã sản phẩm</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: TL-550W"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá hiện tại</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={formData.contactPrice}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100"
                  placeholder="VD: 15,000,000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Giá gốc (tùy chọn)</label>
                <input
                  type="text"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  disabled={formData.contactPrice}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100"
                  placeholder="VD: 18000000"
                />
                <p className="text-xs text-gray-500 mt-1">Để tạo hiệu ứng giảm giá</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.contactPrice}
                    onChange={(e) => setFormData({ ...formData, contactPrice: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">💬 Liên hệ để biết giá (ẩn giá, hiển thị "Liên hệ báo giá")</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hình ảnh chính <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setImagePickerTarget('main');
                  setShowImagePicker(true);
                }}
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <ImageIcon size={32} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh bổ sung</label>
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  {img ? (
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePickerTarget(index);
                        setShowImagePicker(true);
                      }}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <ImageIcon size={24} className="text-gray-400" />
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
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus size={24} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Mô tả ngắn gọn về sản phẩm..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">
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
                {isGeneratingAI ? 'Đang tạo mô tả bằng AI...' : '✨ Tạo mô tả bằng AI Gemini'}
              </button>
            </div>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Mô tả chi tiết về sản phẩm..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Thông số kỹ thuật</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Chi tiết kỹ thuật..."
            />
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Công suất (kW)</label>
              <input
                type="number"
                step="0.01"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hiệu suất (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.efficiency}
                onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bảo hành</label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: 25 năm"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng tồn kho</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái kho</label>
              <select
                value={formData.stockStatus}
                onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as any })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="contact">Liên hệ</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tính năng nổi bật</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Nhập tính năng..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                Thêm tính năng
              </button>
            </div>
          </div>

          {/* Technical Specs */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Thông số kỹ thuật chi tiết</label>
            <div className="space-y-2 mb-3">
              {Object.entries(formData.technicalSpecs).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechSpec(key)}
                    className="ml-auto text-red-600 hover:text-red-700"
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
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Tên thông số (VD: Kích thước)"
              />
              <input
                type="text"
                value={techSpecValue}
                onChange={(e) => setTechSpecValue(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
          <div className="flex items-center gap-6 p-4 bg-yellow-50 rounded-xl">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded"
              />
              <Star size={18} className="text-yellow-600" fill={formData.isFeatured ? 'currentColor' : 'none'} />
              <span className="font-medium text-gray-700">Sản phẩm nổi bật</span>
            </label>
            {formData.isFeatured && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Thứ tự:</label>
                <input
                  type="number"
                  value={formData.featuredOrder}
                  onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/content?tab=products')}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default ProductForm;
