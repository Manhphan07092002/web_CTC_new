import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag, Grid, Layers, FolderOpen } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PermissionGate } from '../contexts/PermissionContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  productCount?: number;
  newsCount?: number;
  projectCount?: number;
  resourceCount?: number;
  createdAt: string;
}

type CategoryType = 'product' | 'news' | 'project' | 'document';

const CategoryManagement: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<CategoryType>('product');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      let data: Category[] = [];
      switch (activeTab) {
        case 'product':
          data = await api.productCategories.getAll();
          break;
        case 'news':
          data = await api.newsCategories.getAll();
          break;
        case 'project':
          data = await api.projectCategories.getAll();
          break;
        case 'document':
          data = await api.documentCategories.getAdmin();
          break;
      }
      // Sort by order
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Lỗi khi tải danh mục', 'error');
    }
    setLoading(false);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      order: categories.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      order: category.order || 0,
      isActive: category.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?\n\nLưu ý: Các mục trong danh mục này sẽ không bị xóa.`)) return;

    try {
      switch (activeTab) {
        case 'product':
          await api.productCategories.delete(id);
          break;
        case 'news':
          await api.newsCategories.delete(id);
          break;
        case 'project':
          await api.projectCategories.delete(id);
          break;
        case 'document':
          await api.documentCategories.delete(id);
          break;
      }
      showToast(`Đã xóa danh mục ${name}`, 'success');
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.message || 'Lỗi khi xóa danh mục';
      showToast(errorMessage, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    // Auto-generate slug if empty
    const slug = formData.slug || generateSlug(formData.name);
    const dataToSave = { ...formData, slug };

    try {
      if (editingCategory) {
        switch (activeTab) {
          case 'product':
            await api.productCategories.update(editingCategory.id, dataToSave);
            break;
          case 'news':
            await api.newsCategories.update(editingCategory.id, dataToSave);
            break;
          case 'project':
            await api.projectCategories.update(editingCategory.id, dataToSave);
            break;
          case 'document':
            await api.documentCategories.update(editingCategory.id, dataToSave);
            break;
        }
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        switch (activeTab) {
          case 'product':
            await api.productCategories.create(dataToSave);
            break;
          case 'news':
            await api.newsCategories.create(dataToSave);
            break;
          case 'project':
            await api.projectCategories.create(dataToSave);
            break;
          case 'document':
            await api.documentCategories.create(dataToSave);
            break;
        }
        showToast('Thêm danh mục thành công!', 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.message || 'Lỗi khi lưu danh mục';
      showToast(errorMessage, 'error');
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name)
    });
  };

  const tabs = [
    { id: 'product' as CategoryType, label: 'Sản phẩm', icon: Grid },
    { id: 'project' as CategoryType, label: 'Dự án', icon: Tag },
    { id: 'news' as CategoryType, label: 'Tin tức', icon: Layers },
    { id: 'document' as CategoryType, label: 'Thể loại tài liệu', icon: FolderOpen }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-gray-500 mt-1">Quản lý danh mục cho sản phẩm, dự án, tin tức và tài liệu của hệ thống</p>
        </div>
        <PermissionGate permission="manage_product_categories">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm danh mục
          </button>
        </PermissionGate>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có danh mục nào</p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
          >
            Thêm danh mục đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-5 hover:shadow-md transition-all ${
                category.isActive !== false ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <PermissionGate permission="manage_product_categories">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="manage_product_categories">
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </PermissionGate>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {activeTab === 'product' && `${category.productCount || 0} sản phẩm`}
                  {activeTab === 'news' && `${category.newsCount || 0} tin tức`}
                  {activeTab === 'project' && `${category.projectCount || 0} dự án`}
                  {activeTab === 'document' && `${category.resourceCount || 0} tài liệu`}
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  category.isActive !== false
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="VD: Tấm pin năng lượng mặt trời"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                  placeholder="tam-pin-nang-luong-mat-troi"
                />
                <p className="text-xs text-gray-500 mt-1">Tự động tạo nếu để trống</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-2xl"
                    placeholder="🔋"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Màu sắc</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-11 border border-gray-300 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium"
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
