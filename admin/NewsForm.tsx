import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

const NewsForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    categoryId: '',
    category: '',
    author: ''
  });

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadNews(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.newsCategories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNews = async (newsId: string) => {
    setLoading(true);
    try {
      const news = await api.news.getById(newsId);
      setFormData({
        title: news.title || '',
        excerpt: news.excerpt || '',
        content: news.content || '',
        date: news.date || new Date().toISOString().split('T')[0],
        image: news.image || '',
        categoryId: news.categoryId || '',
        category: news.category || '',
        author: news.author || ''
      });
    } catch (error) {
      console.error('Error loading news:', error);
      showToast('Lỗi khi tải tin tức', 'error');
    }
    setLoading(false);
  };

  const handleImageSelect = (url: string) => {
    setFormData({ ...formData, image: url });
    setShowImagePicker(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    setFormData({
      ...formData,
      categoryId,
      category: selectedCategory?.name || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.date || !formData.image) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await api.news.update(id, formData);
        showToast('Cập nhật tin tức thành công!', 'success');
      } else {
        await api.news.create(formData);
        showToast('Thêm tin tức thành công!', 'success');
      }
      navigate('/admin/content?tab=news');
    } catch (error) {
      console.error('Error saving news:', error);
      showToast('Lỗi khi lưu tin tức', 'error');
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa Tin tức' : 'Thêm Tin tức mới'}
          </h1>
          <button
            onClick={() => navigate('/admin/content?tab=news')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="VD: Xu hướng năng lượng mặt trời năm 2024"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
            />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày đăng <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
              <select
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Tác giả</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hình ảnh đại diện <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-64 h-40 object-cover rounded-lg border" />
              )}
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="text-center">
                  <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Chọn hình ảnh</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung chi tiết</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
              placeholder="Nội dung đầy đủ của bài viết..."
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Mẹo: Bạn có thể sử dụng Markdown để định dạng nội dung
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/content?tab=news')}
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

export default NewsForm;
