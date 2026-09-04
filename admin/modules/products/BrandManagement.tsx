import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Award, Globe, 
  CheckCircle, XCircle, ExternalLink, Image as ImageIcon,
  Star, X, EyeOff
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { Brand } from '../../../types';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import FilePickerModal from '../../FilePickerModal';

const POPULAR_COUNTRIES = [
  'Đức', 'Nhật Bản', 'Đài Loan', 'Trung Quốc', 'Mỹ', 
  'Việt Nam', 'Hàn Quốc', 'Ý', 'Thụy Sĩ', 'Áo', 'Israel'
];

export const BrandManagement: React.FC = () => {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);

  // Form State
  const initialFormData: Partial<Brand> = {
    name: '',
    slug: '',
    logo: '',
    website: '',
    country: '',
    description: '',
    featured: false,
    status: 'active',
    sortOrder: 0
  };

  const [formData, setFormData] = useState<Partial<Brand>>(initialFormData);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await api.brands.getAll(true);
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      showToast(error.message || 'Lỗi khi tải danh sách thương hiệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingBrand || prev.slug === generateSlug(prev.name || '') 
        ? generateSlug(name) 
        : prev.slug
    }));
  };

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setFormData({
      ...initialFormData,
      sortOrder: brands.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      website: brand.website || '',
      country: brand.country || brand.origin || '',
      description: brand.description || '',
      featured: brand.featured || false,
      status: brand.status || (brand.isActive ? 'active' : 'inactive') || 'active',
      sortOrder: brand.sortOrder ?? 0
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Vui lòng nhập tên thương hiệu', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<Brand> = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.name),
        sortOrder: Number(formData.sortOrder) || 0
      };

      if (editingBrand) {
        const id = editingBrand.id || editingBrand._id;
        await api.brands.update(id!, payload);
        showToast('Cập nhật thương hiệu thành công!', 'success');
      } else {
        await api.brands.create(payload);
        showToast('Thêm thương hiệu mới thành công!', 'success');
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      console.error('Error saving brand:', error);
      showToast(error.message || 'Lỗi khi lưu thương hiệu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    const id = brand.id || brand._id;
    if (!id) return;

    try {
      await api.brands.toggleStatus(id);
      showToast(`Đã chuyển trạng thái sang "${brand.status === 'active' ? 'Ẩn' : 'Hoạt động'}"`, 'success');
      fetchBrands();
    } catch (error: any) {
      console.error('Error toggling brand status:', error);
      showToast(error.message || 'Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleToggleFeatured = async (brand: Brand) => {
    const id = brand.id || brand._id;
    if (!id) return;

    try {
      await api.brands.update(id, { featured: !brand.featured });
      showToast(`Đã ${!brand.featured ? 'đánh dấu nổi bật' : 'bỏ nổi bật'}`, 'success');
      fetchBrands();
    } catch (error: any) {
      console.error('Error toggling featured:', error);
      showToast(error.message || 'Lỗi khi cập nhật nổi bật', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    const id = brandToDelete.id || brandToDelete._id;
    if (!id) return;

    try {
      await api.brands.delete(id);
      showToast('Đã xóa thương hiệu thành công!', 'success');
      setDeleteModalOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      showToast(error.message || 'Lỗi khi xóa thương hiệu', 'error');
    }
  };

  // Filtered List
  const filteredBrands = brands.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.country || b.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || b.status === statusFilter;

    const matchesFeatured = 
      featuredFilter === 'all' || (featuredFilter === 'featured' && b.featured);

    return matchesSearch && matchesStatus && matchesFeatured;
  });

  // Stats
  const totalCount = brands.length;
  const activeCount = brands.filter(b => b.status === 'active' || b.isActive).length;
  const featuredCount = brands.filter(b => b.featured).length;
  const countriesCount = new Set(brands.map(b => b.country || b.origin).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl shadow-md">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Thương hiệu & Hãng sản xuất
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Quản lý các hãng thiết bị (Solar, Viễn thông, Công nghệ, Điện máy, Thiết bị mạng...)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-medium rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-500/20 transition-all cursor-pointer text-sm"
        >
          <Plus size={18} />
          <span>Thêm thương hiệu mới</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl">
            <Award size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tổng thương hiệu</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Đang hoạt động</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <Star size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{featuredCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hãng tiêu biểu</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <Globe size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{countriesCount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Quốc gia xuất xứ</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hãng, quốc gia, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-gray-900 dark:text-white"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Đang ẩn</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tất cả thương hiệu</option>
            <option value="featured">Chỉ thương hiệu nổi bật ★</option>
          </select>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Đang tải danh sách thương hiệu...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <Award size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-3" />
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Không tìm thấy thương hiệu nào</p>
            <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc thêm mới thương hiệu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">STT</th>
                  <th className="py-3.5 px-4 w-20 text-center">Logo</th>
                  <th className="py-3.5 px-4">Tên thương hiệu</th>
                  <th className="py-3.5 px-4">Xuất xứ / Quốc gia</th>
                  <th className="py-3.5 px-4">Website</th>
                  <th className="py-3.5 px-4 text-center">Nổi bật</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-sm">
                {filteredBrands.map((brand, idx) => {
                  const id = brand.id || brand._id;
                  const isActive = brand.status === 'active' || brand.isActive;

                  return (
                    <tr 
                      key={id || idx}
                      className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-400">
                        {brand.sortOrder ?? (idx + 1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-1 overflow-hidden mx-auto shadow-2xs">
                          {brand.logo ? (
                            <img 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as any).src = 'https://via.placeholder.com/80?text=' + encodeURIComponent(brand.name.slice(0, 2));
                              }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-400 uppercase font-mono">
                              {brand.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{brand.name}</span>
                          {brand.featured && (
                            <span className="p-0.5 text-amber-500" title="Thương hiệu nổi bật">
                              <Star size={14} className="fill-amber-400" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{brand.slug}</div>
                        {brand.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 max-w-md">
                            {brand.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {(brand.country || brand.origin) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Globe size={12} className="text-sky-500" />
                            {brand.country || brand.origin}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa xác định</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {brand.website ? (
                          <a
                            href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline max-w-[180px] truncate"
                          >
                            <span className="truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={12} className="flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(brand)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            brand.featured 
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100' 
                              : 'text-gray-300 dark:text-gray-600 hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                          title={brand.featured ? 'Bấm để bỏ nổi bật' : 'Bấm để đặt làm nổi bật'}
                        >
                          <Star size={16} className={brand.featured ? 'fill-amber-400' : ''} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200'
                          }`}
                        >
                          {isActive ? <CheckCircle size={12} /> : <EyeOff size={12} />}
                          <span>{isActive ? 'Hoạt động' : 'Đang ẩn'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(brand)}
                            className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setBrandToDelete(brand);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa thương hiệu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Brand */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg">
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên thương hiệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Huawei, DrayTek, Hikvision, Canadian Solar..."
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (Đường dẫn tĩnh)
                </label>
                <input
                  type="text"
                  placeholder="tudong-tao-slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Logo Picker */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Logo thương hiệu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... hoặc chọn từ thư viện"
                    value={formData.logo || ''}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilePicker(true)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-300 dark:border-slate-700"
                  >
                    <ImageIcon size={14} />
                    <span>Chọn file</span>
                  </button>
                </div>
                {formData.logo && (
                  <div className="mt-2.5 p-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/40 inline-flex items-center gap-3">
                    <img 
                      src={formData.logo} 
                      alt="Preview" 
                      className="h-10 max-w-[120px] object-contain rounded"
                      onError={(e) => (e.target as any).style.display = 'none'}
                    />
                    <span className="text-xs text-gray-500">Xem trước logo</span>
                  </div>
                )}
              </div>

              {/* Country & Origin */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quốc gia / Xuất xứ
                </label>
                <input
                  type="text"
                  placeholder="Đức, Nhật Bản, Đài Loan, Việt Nam..."
                  value={formData.country || formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, origin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  list="countries-list"
                />
                <datalist id="countries-list">
                  {POPULAR_COUNTRIES.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <div className="flex gap-1.5 flex-wrap mt-1.5">
                  {POPULAR_COUNTRIES.slice(0, 6).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, country: c, origin: c })}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 rounded-md text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website chính hãng
                </label>
                <input
                  type="text"
                  placeholder="https://www.draytek.com"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả giới thiệu thương hiệu
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả ngắn gọn về thế mạnh, lịch sử hãng..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {/* Switches & Sort Order */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder ?? 0}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      ★ Thương hiệu nổi bật
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Hiển thị trên website
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-sky-500/20 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingBrand ? 'Lưu thay đổi' : 'Thêm thương hiệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Picker Modal */}
      {showFilePicker && (
        <FilePickerModal
          isOpen={showFilePicker}
          onClose={() => setShowFilePicker(false)}
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, logo: url }));
            setShowFilePicker(false);
          }}
          title="Chọn Logo thương hiệu"
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa thương hiệu"
        itemName={brandToDelete?.name || ''}
      />
    </div>
  );
};

export default BrandManagement;
