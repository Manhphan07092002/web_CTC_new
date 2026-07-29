import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import AiProjectWriterModal from './components/AiProjectWriterModal';

const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
import SeoAnalyzer from './components/SeoAnalyzer';

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

const ProjectForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  const [focusKeyword, setFocusKeyword] = useState('');

  const handleFocusKeywordChange = (kw: string) => {
    setFocusKeyword(kw);
    setFormData(prev => ({ ...prev, focusKeyword: kw }));
  };

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    capacity: '',
    completionDate: '',
    image: '',
    description: '',
    categoryId: '',
    category: '',
    focusKeyword: ''
  });

  const { showUnsavedModal, setShowUnsavedModal, setBaseline, confirmNavigation } = useUnsavedChanges(formData, loading);

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProject(id);
    } else {
      setBaseline(formData);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.projectCategories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const project = await api.projects.getById(projectId);
      const loadedKw = (project as any).focusKeyword || '';
      setFocusKeyword(loadedKw);
      const initialProjectData = {
        title: project.title || '',
        location: project.location || '',
        capacity: project.capacity || '',
        completionDate: project.completionDate || '',
        image: project.image || '',
        description: project.description || '',
        categoryId: project.categoryId || '',
        category: project.category || '',
        focusKeyword: loadedKw
      };
      setFormData(initialProjectData);
      setBaseline(initialProjectData);
    } catch (error) {
      console.error('Error loading project:', error);
      showToast('Lỗi khi tải dự án', 'error');
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

  const handleExit = () => {
    confirmNavigation(() => navigate('/admin/content?tab=projects'));
  };

  const saveProjectInternal = async (): Promise<boolean> => {
    if (!formData.title || !formData.location || !formData.capacity || !formData.completionDate || !formData.image || !formData.description) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return false;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        await api.projects.update(id, formData);
        showToast('Cập nhật dự án thành công!', 'success');
      } else {
        await api.projects.create(formData);
        showToast('Thêm dự án thành công!', 'success');
      }
      setBaseline(formData);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('Lỗi khi lưu dự án', 'error');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProjectInternal();
    if (success) {
      navigate('/admin/content?tab=projects');
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa Dự án' : 'Thêm Dự án mới'}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white rounded-xl text-sm font-black transition-all shadow-sm hover:shadow-md hover:scale-105 cursor-pointer"
              title="Mở Trợ lý AI tự động tạo hồ sơ Dự án chuẩn SEO Yoast 100/100"
            >
              <Sparkles size={16} className="text-amber-200 animate-pulse" />
              <span>✨ AI Tạo Dự Án</span>
            </button>
            <button
              onClick={handleExit}
              className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="VD: Hệ thống điện mặt trời áp mái nhà máy ABC"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: Đà Nẵng"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Công suất <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: 500 kWp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="VD: Tháng 12/2023"
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
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-48 h-32 object-cover rounded-lg border" />
              )}
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Chọn hình ảnh</span>
                </div>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mô tả chi tiết dự án <span className="text-red-500">*</span>
            </label>
            <Suspense fallback={<div className="h-48 flex items-center justify-center bg-gray-50 border rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Mô tả chi tiết về dự án, công nghệ, giải pháp thi công áp dụng..."
              />
            </Suspense>
          </div>

          {/* SEO Analyzer - Yoast-style for Projects */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> PHÂN TÍCH & CHẤM ĐIỂM SEO DỰ ÁN (YOAST-STYLE)
            </h3>
            <SeoAnalyzer
              title={formData.title}
              excerpt={`Dự án ${formData.title} tại ${formData.location} với công suất ${formData.capacity}.`}
              content={formData.description}
              image={formData.image}
              focusKeyword={focusKeyword}
              onFocusKeywordChange={handleFocusKeywordChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleExit}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors cursor-pointer"
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

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={() => {
          setShowUnsavedModal(false);
          navigate('/admin/content?tab=projects');
        }}
        onSaveAndExit={async () => {
          setShowUnsavedModal(false);
          const success = await saveProjectInternal();
          if (success) {
            navigate('/admin/content?tab=projects');
          }
        }}
        isSaving={loading}
      />

      {/* AI Project Generator Modal */}
      <AiProjectWriterModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        initialTitle={formData.title}
        initialLocation={formData.location}
        initialCategory={formData.category}
        onApply={(data) => {
          setFormData(prev => ({
            ...prev,
            title: data.title || prev.title,
            location: data.location || prev.location,
            capacity: data.capacity || prev.capacity,
            completionDate: data.completionDate || prev.completionDate,
            image: data.image || prev.image,
            description: data.content || prev.description,
            focusKeyword: data.focusKeyword || prev.focusKeyword
          }));
          if (data.focusKeyword) {
            handleFocusKeywordChange(data.focusKeyword);
          }
        }}
      />
    </div>
  );
};

export default ProjectForm;
