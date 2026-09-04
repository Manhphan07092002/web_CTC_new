import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, FileText, Upload, Save, X, 
  FolderOpen, CheckCircle, XCircle, Download
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import FilePickerModal from '../../FilePickerModal';

interface ProfileStat {
  value: string;
  label: string;
}

interface CompanyProfileItem {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  year?: string;
  version?: string;
  tag?: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  thumbnail?: string;
  highlights?: string[];
  stats?: ProfileStat[];
  status: 'active' | 'inactive';
  sortOrder: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CompanyProfilesManagement: React.FC = () => {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<CompanyProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CompanyProfileItem | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<'file' | 'thumbnail'>('file');
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<CompanyProfileItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const initialFormState: CompanyProfileItem = {
    title: '',
    subtitle: '',
    year: new Date().getFullYear().toString(),
    version: '1.0',
    tag: `CTC-PROFILE-${new Date().getFullYear()}`,
    description: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: 'docx',
    thumbnail: '',
    highlights: [''],
    stats: [
      { value: '53+', label: 'Cán bộ kỹ thuật chủ chốt' },
      { value: '32+', label: 'Năm kinh nghiệm xây lắp' }
    ],
    status: 'active',
    sortOrder: 0
  };

  const [formData, setFormData] = useState<CompanyProfileItem>(initialFormState);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await api.companyProfiles.getAll(true);
      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        setProfiles([]);
      }
    } catch (error: any) {
      console.error('Error fetching company profiles:', error);
      showToast(error.message || 'Lỗi khi tải danh sách hồ sơ năng lực', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProfile(null);
    setFormData({
      ...initialFormState,
      year: new Date().getFullYear().toString(),
      tag: `CTC-PROFILE-${new Date().getFullYear()}`,
      sortOrder: profiles.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CompanyProfileItem) => {
    setEditingProfile(item);
    setFormData({
      ...item,
      highlights: item.highlights && item.highlights.length > 0 ? [...item.highlights] : [''],
      stats: item.stats && item.stats.length > 0 ? [...item.stats] : [{ value: '', label: '' }]
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item: CompanyProfileItem) => {
    const id = item.id || item._id;
    if (!id) return;
    try {
      await api.companyProfiles.toggleStatus(id);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchProfiles();
    } catch (error: any) {
      console.error('Error toggling profile status:', error);
      showToast(error.message || 'Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'file' | 'thumbnail') => {
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
        if (targetField === 'file') {
          const extension = file.name.split('.').pop()?.toLowerCase() || 'docx';
          setFormData(prev => ({
            ...prev,
            fileUrl: data.url,
            fileName: file.name,
            fileSize: file.size,
            fileType: extension
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            thumbnail: data.url
          }));
        }
        showToast('Tải lên tệp tin thành công', 'success');
      } else {
        throw new Error(data.message || 'Không thể upload tệp');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Lỗi tải lên tệp tin', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFilePicked = (url: string) => {
    if (filePickerTarget === 'file') {
      const fileName = url.split('/').pop() || 'document';
      const extension = fileName.split('.').pop()?.toLowerCase() || 'docx';
      setFormData(prev => ({
        ...prev,
        fileUrl: url,
        fileName: prev.fileName || fileName,
        fileType: extension
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        thumbnail: url
      }));
    }
    setShowFilePicker(false);
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
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề hồ sơ năng lực', 'warning');
      return;
    }
    if (!formData.fileUrl.trim()) {
      showToast('Vui lòng chọn hoặc tải lên tệp hồ sơ năng lực (.pdf, .docx)', 'warning');
      return;
    }

    try {
      const cleanedHighlights = (formData.highlights || []).map(s => s.trim()).filter(Boolean);
      const cleanedStats = (formData.stats || []).filter(s => s.value.trim() && s.label.trim());

      const payload = {
        ...formData,
        highlights: cleanedHighlights,
        stats: cleanedStats
      };

      const id = editingProfile?.id || editingProfile?._id;
      if (id) {
        await api.companyProfiles.update(id, payload);
        showToast('Cập nhật hồ sơ năng lực thành công', 'success');
      } else {
        await api.companyProfiles.create(payload);
        showToast('Tạo mới hồ sơ năng lực thành công', 'success');
      }

      setIsModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast(error.message || 'Lỗi khi lưu hồ sơ năng lực', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    const id = profileToDelete?.id || profileToDelete?._id;
    if (!id) return;

    try {
      setDeleting(true);
      await api.companyProfiles.delete(id);
      showToast('Đã xóa hồ sơ năng lực thành công', 'success');
      setDeleteModalOpen(false);
      setProfileToDelete(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      showToast(error.message || 'Lỗi khi xóa hồ sơ năng lực', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.year && p.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText size={16} />
            <span>Hồ Sơ Năng Lực (Company Profile)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quản Lý Hồ Sơ Năng Lực
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các ấn bản hồ sơ năng lực doanh nghiệp, tài liệu giới thiệu và số liệu kỹ thuật hiển thị trên trang chủ.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Thêm Hồ Sơ Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, năm, mã hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách hồ sơ năng lực...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy hồ sơ nào</h3>
            <p className="text-xs text-slate-400 mt-1">Hãy nhấn "Thêm Hồ Sơ Mới" để tạo ấn bản hồ sơ năng lực đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 text-center w-12">#</th>
                  <th className="py-4 px-4">Thông Tin Hồ Sơ</th>
                  <th className="py-4 px-4">Năm / Tag</th>
                  <th className="py-4 px-4">Tài Liệu Đính Kèm</th>
                  <th className="py-4 px-4 text-center">Điểm Nổi Bật</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredProfiles.map((item, idx) => (
                  <tr key={item.id || item._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0 font-bold text-xs uppercase">
                          {item.fileType || 'DOC'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.subtitle || 'Chưa có phụ đề'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {item.year || '2026'}
                        </span>
                        {item.tag && (
                          <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {item.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline max-w-[180px] truncate"
                            title={item.fileName || item.fileUrl}
                          >
                            <Download size={13} className="flex-shrink-0" />
                            <span className="truncate">{item.fileName || 'Tải file'}</span>
                          </a>
                          {item.fileSize ? (
                            <span className="text-[10px] text-slate-400">
                              ({formatFileSize(item.fileSize)})
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa có tệp</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {item.highlights?.length || 0} mục
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
                        title="Bấm để bật/tắt trạng thái hiển thị"
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
                          className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setProfileToDelete(item);
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
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="text-sky-500" size={20} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {editingProfile ? 'Chỉnh Sửa Hồ Sơ Năng Lực' : 'Thêm Mới Hồ Sơ Năng Lực'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tiêu Đề Hồ Sơ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: HỒ SƠ NĂNG LỰC DOANH NGHIỆP 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-medium"
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
                    placeholder="VD: Năng lực & Pháp lý"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Năm Phát Hành
                  </label>
                  <input
                    type="text"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="VD: 2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Version / Tag */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Mã Hồ Sơ / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="VD: CTC-PROFILE-2026"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Thứ Tự Sắp Xếp
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô Tả Tổng Quan
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung hồ sơ năng lực..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* File Attachment Upload */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tệp Tin Hồ Sơ Năng Lực (.pdf, .docx, .doc) <span className="text-rose-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="Đường dẫn file (VD: /file/HSNL 2024.docx hoặc URL)"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                  />

                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                      <Upload size={15} />
                      <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => handleDirectUpload(e, 'file')}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setFilePickerTarget('file');
                        setShowFilePicker(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <FolderOpen size={15} />
                      <span>Chọn file</span>
                    </button>
                  </div>
                </div>

                {formData.fileUrl && (
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Tên file: <strong className="text-slate-700 dark:text-slate-200">{formData.fileName || 'Chưa đặt tên'}</strong></span>
                    {formData.fileSize ? <span>Kích thước: <strong>{formatFileSize(formData.fileSize)}</strong></span> : null}
                  </div>
                )}
              </div>

              {/* Highlights / Năng lực nổi bật */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Các Điểm Năng Lực Nổi Bật (Bullets)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Thêm dòng
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(formData.highlights || []).map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(idx, e.target.value)}
                        placeholder={`Điểm nổi bật ${idx + 1}...`}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
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

              {/* Stats Widgets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Số Liệu Thống Kê Đi Kèm
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStat}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
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
                        placeholder="Số liệu (VD: 53+)"
                        className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                        placeholder="Nhãn (VD: Cán bộ kỹ thuật)"
                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
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

              {/* Status */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Trạng Thái:
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.status === 'active'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {formData.status === 'active' ? '✓ Đang kích hoạt (Hiển thị)' : '✕ Đang ẩn'}
                </button>
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
                  className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>{editingProfile ? 'Cập Nhật' : 'Lưu Hồ Sơ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE PICKER MODAL */}
      <FilePickerModal
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={handleFilePicked}
        title={filePickerTarget === 'file' ? 'Chọn Tệp Hồ Sơ Năng Lực' : 'Chọn Hình Ảnh Đại Diện'}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProfileToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={profileToDelete?.title}
        title="Xóa Hồ Sơ Năng Lực"
        description="Bạn có chắc chắn muốn xóa hồ sơ năng lực này? Dữ liệu sẽ được chuyển vào mục lưu trữ và ẩn khỏi website."
        type="soft"
      />
    </div>
  );
};

export default CompanyProfilesManagement;
