import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Sparkles, Plus, Trash2 } from 'lucide-react';
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
  const [imagePickerTarget, setImagePickerTarget] = useState<'main' | number>('main');
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
    images: [] as string[],
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
        images: Array.isArray((project as any).images) ? (project as any).images : [],
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
    if (imagePickerTarget === 'main') {
      setFormData(prev => ({ ...prev, image: url }));
    } else {
      setFormData(prev => {
        const nextImages = [...prev.images];
        nextImages[imagePickerTarget] = url;
        return { ...prev, images: nextImages };
      });
    }
    setShowImagePicker(false);
  };

  const handleAddImage = () => {
    if (formData.images.length >= 10) {
      showToast('Tối đa 10 hình ảnh cho mỗi dự án', 'warning');
      return;
    }
    setImagePickerTarget(formData.images.length);
    setShowImagePicker(true);
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

          {/* Main Image */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Hình ảnh đại diện chính <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 items-center flex-wrap">
              {formData.image ? (
                <div className="relative group w-48 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm bg-gray-50">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget('main');
                      setShowImagePicker(true);
                    }}
                    className="absolute inset-0 bg-black/50 text-white font-bold text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    Đổi ảnh đại diện
                  </button>
                </div>
              ) : (
                <div className="w-48 h-32 bg-gray-100 dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400 text-xs">
                  Chưa chọn ảnh đại diện
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setImagePickerTarget('main');
                  setShowImagePicker(true);
                }}
                className="w-48 h-32 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <ImageIcon size={28} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 font-semibold">{formData.image ? 'Đổi ảnh đại diện' : 'Chọn ảnh đại diện'}</span>
              </button>
            </div>
          </div>

          {/* Additional Images (Album 3-5 ảnh) */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Bộ sưu tập ảnh dự án (Thêm 3 - 5 ảnh thực tế công trình)
              </label>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                {formData.images.length} ảnh trong bộ sưu tập
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Thêm các góc chụp công trình, tấm pin, inverter, trạm biến áp, nghiệm thu... để khách hàng xem dạng trình chiếu/gallery chi tiết.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group aspect-4/3 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 shadow-xs">
                  <img
                    src={img}
                    alt={`Ảnh dự án ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePickerTarget(index);
                        setShowImagePicker(true);
                      }}
                      className="px-2 py-1 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-[11px] font-bold shadow cursor-pointer"
                      title="Đổi ảnh này"
                    >
                      Đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs shadow cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-semibold">
                    #{index + 1}
                  </span>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddImage}
                className="aspect-4/3 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <Plus size={24} className="text-gray-400 group-hover:text-primary transition-colors mb-1" />
                <span className="text-xs text-gray-500 group-hover:text-primary font-bold">+ Thêm ảnh</span>
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
