import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Building2, Save, X, 
  FolderOpen, CheckCircle, XCircle, ArrowUp, ArrowDown,
  Layers, Upload, Handshake, Server, Zap, Network,
  Cpu, ShieldCheck, Activity, HardHat, Sun, Wind,
  Wrench, Globe, Radio, Boxes, Database, Smartphone,
  LineChart, Check, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import FilePickerModal from '../../FilePickerModal';

// Icon Map for dynamic icon rendering and selection
export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Handshake,
  Building2,
  Server,
  Zap,
  Network,
  Cpu,
  ShieldCheck,
  Activity,
  HardHat,
  Sun,
  Wind,
  Wrench,
  Globe,
  Radio,
  Boxes,
  Database,
  Smartphone,
  LineChart,
  Layers
};

export const renderSectorIcon = (iconName?: string, size = 20, className = '') => {
  const IconComponent = (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Handshake;
  return <IconComponent size={size} className={className} />;
};

interface SectorStat {
  value: string;
  label: string;
}

interface BusinessSectorItem {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  icon?: string;
  image?: string;
  gallery?: string[];
  highlights?: string[];
  stats?: SectorStat[];
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

const BusinessSectorsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [sectors, setSectors] = useState<BusinessSectorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<BusinessSectorItem | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<BusinessSectorItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initialFormState: BusinessSectorItem = {
    name: '',
    slug: '',
    subtitle: '',
    description: '',
    icon: 'Handshake',
    image: '',
    highlights: [''],
    stats: [
      { value: '100%', label: 'Chuẩn quy trình EPC' }
    ],
    status: 'active',
    sortOrder: 0
  };

  const [formData, setFormData] = useState<BusinessSectorItem>(initialFormState);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const data = await api.businessSectors.getAll(true);
      if (Array.isArray(data)) {
        setSectors(data);
      } else {
        setSectors([]);
      }
    } catch (error: any) {
      console.error('Error fetching business sectors:', error);
      showToast(error.message || 'Lỗi khi tải danh sách lĩnh vực hoạt động', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleOpenAdd = () => {
    setEditingSector(null);
    setFormData({
      ...initialFormState,
      sortOrder: sectors.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BusinessSectorItem) => {
    setEditingSector(item);
    setFormData({
      ...item,
      highlights: item.highlights && item.highlights.length > 0 ? [...item.highlights] : [''],
      stats: item.stats && item.stats.length > 0 ? [...item.stats] : [{ value: '', label: '' }]
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingSector ? generateSlug(name) : prev.slug
    }));
  };

  const handleToggleStatus = async (item: BusinessSectorItem) => {
    const id = item.id || item._id;
    if (!id) return;
    try {
      await api.businessSectors.toggleStatus(id);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchSectors();
    } catch (error: any) {
      console.error('Error toggling sector status:', error);
      showToast(error.message || 'Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectors.length) return;

    const newSectors = [...sectors];
    const temp = newSectors[index];
    newSectors[index] = newSectors[targetIndex];
    newSectors[targetIndex] = temp;

    // Update sortOrder values
    const itemsToReorder = newSectors.map((s, idx) => ({
      id: (s.id || s._id) as string,
      sortOrder: idx
    }));

    setSectors(newSectors);

    try {
      await api.businessSectors.reorder(itemsToReorder);
      showToast('Cập nhật thứ tự hiển thị thành công', 'success');
    } catch (error: any) {
      console.error('Error reordering sectors:', error);
      showToast(error.message || 'Lỗi khi sắp xếp thứ tự', 'error');
      fetchSectors();
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: uploadFormData
      });

      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          image: data.url
        }));
        showToast('Tải lên hình ảnh thành công', 'success');
      } else {
        throw new Error(data.message || 'Không thể upload ảnh');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Lỗi tải lên hình ảnh', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const next = [...(formData.highlights || [])];
    next[index] = value;
    setFormData(prev => ({ ...prev, highlights: next }));
  };

  const handleAddHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), '']
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== index)
    }));
  };

  const handleStatChange = (index: number, field: 'value' | 'label', val: string) => {
    const next = [...(formData.stats || [])];
    next[index] = { ...next[index], [field]: val };
    setFormData(prev => ({ ...prev, stats: next }));
  };

  const handleAddStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }]
    }));
  };

  const handleRemoveStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên lĩnh vực hoạt động', 'warning');
      return;
    }

    try {
      const cleanedHighlights = (formData.highlights || []).map(s => s.trim()).filter(Boolean);
      const cleanedStats = (formData.stats || []).filter(s => s.value.trim() && s.label.trim());

      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        highlights: cleanedHighlights,
        stats: cleanedStats
      };

      const id = editingSector?.id || editingSector?._id;
      if (id) {
        await api.businessSectors.update(id, payload);
        showToast('Cập nhật lĩnh vực hoạt động thành công', 'success');
      } else {
        await api.businessSectors.create(payload);
        showToast('Tạo mới lĩnh vực hoạt động thành công', 'success');
      }

      setIsModalOpen(false);
      fetchSectors();
    } catch (error: any) {
      console.error('Error saving sector:', error);
      showToast(error.message || 'Lỗi khi lưu lĩnh vực hoạt động', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    const id = sectorToDelete?.id || sectorToDelete?._id;
    if (!id) return;

    try {
      setDeleting(true);
      await api.businessSectors.delete(id);
      showToast('Đã xóa lĩnh vực hoạt động thành công', 'success');
      setDeleteModalOpen(false);
      setSectorToDelete(null);
      fetchSectors();
    } catch (error: any) {
      console.error('Error deleting sector:', error);
      showToast(error.message || 'Lỗi khi xóa lĩnh vực', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSectors = sectors.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 size={16} />
            <span>Lĩnh Vực Hoạt Động (Business Sectors)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quản Lý Lĩnh Vực Hoạt Động
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các khối ngành kinh doanh, dịch vụ EPC viễn thông, cơ điện M&E và năng lượng hiển thị trên trang chủ.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Thêm Lĩnh Vực Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên lĩnh vực, phụ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt (Active)</option>
            <option value="inactive">Đang ẩn (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách lĩnh vực hoạt động...</p>
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy lĩnh vực nào</h3>
            <p className="text-xs text-slate-400 mt-1">Hãy nhấn "Thêm Lĩnh Vực Mới" để tạo khối ngành hoạt động đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 text-center w-14">Thứ tự</th>
                  <th className="py-4 px-4">Lĩnh Vực & Dịch Vụ</th>
                  <th className="py-4 px-4">Biểu Tượng</th>
                  <th className="py-4 px-4 text-center">Dịch Vụ Con</th>
                  <th className="py-4 px-4 text-center">Chỉ Số</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredSectors.map((item, idx) => (
                  <tr key={item.id || item._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-20 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            disabled={idx === filteredSectors.length - 1}
                            onClick={() => handleMoveOrder(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-amber-600 disabled:opacity-20 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">#{item.sortOrder ?? idx}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                          {renderSectorIcon(item.icon, 20)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.subtitle || 'Chưa có phụ đề'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {renderSectorIcon(item.icon, 14)}
                        <span>{item.icon || 'Handshake'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                        {item.highlights?.length || 0} dịch vụ
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.stats?.length || 0} chỉ số
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          item.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Bấm để bật/tắt hiển thị"
                      >
                        {item.status === 'active' ? (
                          <>
                            <CheckCircle size={13} />
                            <span>Hiển thị</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Đang ẩn</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSectorToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col relative z-10 animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="text-amber-500" size={20} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {editingSector ? 'Chỉnh Sửa Lĩnh Vực Hoạt Động' : 'Thêm Mới Lĩnh Vực Hoạt Động'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sector Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên Lĩnh Vực Hoạt Động <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="VD: Cung Cấp Giải Pháp & Sản Phẩm Công Nghệ"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Phụ Đề (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="VD: Hạ tầng viễn thông & CNTT"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Đường dẫn tĩnh (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="VD: it-telecom-solutions"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Icon Selector Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Biểu Tượng Đại Diện (Icon)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                  {Object.keys(ICON_MAP).map((iconKey) => {
                    const isSelected = (formData.icon || 'Handshake') === iconKey;
                    return (
                      <button
                        type="button"
                        key={iconKey}
                        onClick={() => setFormData({ ...formData, icon: iconKey })}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/25 scale-105'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:bg-amber-50/50'
                        }`}
                        title={iconKey}
                      >
                        {renderSectorIcon(iconKey, 20)}
                        <span className="text-[9px] truncate max-w-full font-medium">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô Tả Tổng Quan Lĩnh Vực
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt thế mạnh, năng lực triển khai..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Dynamic Highlights / Service Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Danh Sách Hạng Mục / Dịch Vụ Con (Bullets)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Thêm dịch vụ
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(formData.highlights || []).map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(idx, e.target.value)}
                        placeholder={`Nội dung dịch vụ ${idx + 1}... (VD: Thiết bị tin học chuyên dụng, máy chủ...)`}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                      />
                      {(formData.highlights || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Chỉ Số Đo Lường (Stats)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStat}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Thêm chỉ số
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formData.stats || []).map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                        placeholder="Số liệu (VD: 100%)"
                        className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                        placeholder="Nhãn (VD: Chuẩn quy trình EPC)"
                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      {(formData.stats || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStat(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Thứ Tự Sắp Xếp
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Trạng Thái
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.status === 'active'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {formData.status === 'active' ? '✓ Đang kích hoạt (Hiển thị)' : '✕ Đang ẩn'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>{editingSector ? 'Cập Nhật' : 'Lưu Lĩnh Vực'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSectorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={sectorToDelete?.name}
        title="Xóa Lĩnh Vực Hoạt Động"
        description="Bạn có chắc chắn muốn xóa lĩnh vực hoạt động này? Dữ liệu sẽ được ẩn khỏi website."
        type="soft"
      />
    </div>
  );
};

export default BusinessSectorsManagement;
