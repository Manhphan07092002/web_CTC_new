import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, TrendingUp, Upload, Save, X, 
  FolderOpen, CheckCircle, XCircle, Download, FileText, Calendar, Filter
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import FilePickerModal from '../../FilePickerModal';

export type ReportType = 'financial_statement' | 'annual_report' | 'audit_report' | 'tax_confirmation' | 'governance_report' | 'other';

interface FinancialReportItem {
  id?: string;
  _id?: string;
  title: string;
  year: string;
  reportType: ReportType;
  reportTypeName?: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const REPORT_TYPES: { type: ReportType; name: string; color: string }[] = [
  { type: 'financial_statement', name: 'Báo Cáo Tài Chính', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/40' },
  { type: 'annual_report', name: 'Báo Cáo Thường Niên', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/40' },
  { type: 'audit_report', name: 'Báo Cáo Kiểm Toán', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
  { type: 'tax_confirmation', name: 'Xác Nhận Thuế', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/40' },
  { type: 'governance_report', name: 'Báo Cáo Quản Trị', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40' },
  { type: 'other', name: 'Tài Liệu Khác', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
];

const FinancialReportsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<FinancialReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReportItem | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<FinancialReportItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const initialFormState: FinancialReportItem = {
    title: '',
    year: new Date().getFullYear().toString(),
    reportType: 'financial_statement',
    reportTypeName: 'Báo Cáo Tài Chính',
    description: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    status: 'active',
    sortOrder: 0
  };

  const [formData, setFormData] = useState<FinancialReportItem>(initialFormState);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.financialReports.getAll(true);
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (error: any) {
      console.error('Error fetching financial reports:', error);
      showToast(error.message || 'Lỗi khi tải danh sách báo cáo tài chính', 'error');
    } finally {
      setLoading(false);
    }
  };

  const availableYears = Array.from(new Set(reports.map(r => r.year).filter(Boolean))).sort().reverse();

  const handleOpenAdd = () => {
    setEditingReport(null);
    setFormData({
      ...initialFormState,
      year: new Date().getFullYear().toString(),
      sortOrder: reports.length
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FinancialReportItem) => {
    setEditingReport(item);
    setFormData({
      ...item
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item: FinancialReportItem) => {
    const id = item.id || item._id;
    if (!id) return;
    try {
      await api.financialReports.toggleStatus(id);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchReports();
    } catch (error: any) {
      console.error('Error toggling report status:', error);
      showToast(error.message || 'Lỗi khi đổi trạng thái', 'error');
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
          fileUrl: data.url,
          fileName: file.name,
          fileSize: file.size
        }));
        showToast('Tải lên tệp thành công', 'success');
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
    const fileName = url.split('/').pop() || 'document.pdf';
    setFormData(prev => ({
      ...prev,
      fileUrl: url,
      fileName: prev.fileName || fileName
    }));
    setShowFilePicker(false);
  };

  const handleTypeSelect = (type: ReportType) => {
    const typeObj = REPORT_TYPES.find(t => t.type === type);
    setFormData(prev => ({
      ...prev,
      reportType: type,
      reportTypeName: typeObj?.name || 'Khác'
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề báo cáo tài chính', 'warning');
      return;
    }
    if (!formData.year.trim()) {
      showToast('Vui lòng nhập năm báo cáo', 'warning');
      return;
    }
    if (!formData.fileUrl.trim()) {
      showToast('Vui lòng chọn hoặc tải lên tệp PDF báo cáo', 'warning');
      return;
    }

    try {
      const typeObj = REPORT_TYPES.find(t => t.type === formData.reportType);
      const payload = {
        ...formData,
        reportTypeName: formData.reportTypeName || typeObj?.name
      };

      const id = editingReport?.id || editingReport?._id;
      if (id) {
        await api.financialReports.update(id, payload);
        showToast('Cập nhật báo cáo tài chính thành công', 'success');
      } else {
        await api.financialReports.create(payload);
        showToast('Thêm mới báo cáo tài chính thành công', 'success');
      }

      setIsModalOpen(false);
      fetchReports();
    } catch (error: any) {
      console.error('Error saving report:', error);
      showToast(error.message || 'Lỗi khi lưu báo cáo tài chính', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    const id = reportToDelete?.id || reportToDelete?._id;
    if (!id) return;

    try {
      setDeleting(true);
      await api.financialReports.delete(id);
      showToast('Đã xóa báo cáo tài chính thành công', 'success');
      setDeleteModalOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      showToast(error.message || 'Lỗi khi xóa báo cáo', 'error');
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

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.year.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesYear = yearFilter === 'all' ? true : r.year === yearFilter;
    const matchesType = typeFilter === 'all' ? true : r.reportType === typeFilter;
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;

    return matchesSearch && matchesYear && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp size={16} />
            <span>Báo Cáo Tài Chính & Kiểm Toán (Financial Reports)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Quản Lý Báo Cáo Tài Chính
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đăng tải và quản lý các tài liệu kiểm toán, báo cáo thường niên, xác nhận nghĩa vụ thuế của công ty.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Plus size={18} />
          <span>Thêm Báo Cáo Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, năm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả các năm ({availableYears.length})</option>
            {availableYears.map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả loại báo cáo</option>
            {REPORT_TYPES.map(t => (
              <option key={t.type} value={t.type}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải danh sách báo cáo tài chính...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center">
            <TrendingUp size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy báo cáo nào</h3>
            <p className="text-xs text-slate-400 mt-1">Hãy nhấn "Thêm Báo Cáo Mới" để đăng tải tài liệu tài chính.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-4 text-center w-12">#</th>
                  <th className="py-4 px-4">Tên Báo Cáo / Tài Liệu</th>
                  <th className="py-4 px-4">Năm</th>
                  <th className="py-4 px-4">Phân Loại</th>
                  <th className="py-4 px-4">Tệp PDF</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredReports.map((item, idx) => {
                  const typeObj = REPORT_TYPES.find(t => t.type === item.reportType) || REPORT_TYPES[0];
                  return (
                    <tr key={item.id || item._id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {item.year}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeObj.color}`}>
                          {item.reportTypeName || typeObj.name}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {item.fileUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline max-w-[160px] truncate"
                              title={item.fileName || item.fileUrl}
                            >
                              <Download size={13} className="flex-shrink-0" />
                              <span className="truncate">{item.fileName || 'Xem PDF'}</span>
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
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setReportToDelete(item);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col relative z-10 animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-indigo-500" size={20} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  {editingReport ? 'Chỉnh Sửa Báo Cáo Tài Chính' : 'Thêm Mới Báo Cáo Tài Chính'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tiêu Đề Báo Cáo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Báo cáo tài chính năm 2025"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Năm Báo Cáo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="VD: 2025"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Loại Báo Cáo
                  </label>
                  <select
                    value={formData.reportType}
                    onChange={(e: any) => handleTypeSelect(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {REPORT_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô Tả Tóm Tắt (Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về tình hình tài chính hoặc nội dung báo cáo..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* File Attachment Upload */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tệp Tin PDF Báo Cáo <span className="text-rose-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="Đường dẫn file (VD: /Tinh_Hinh_Tai_Chinh/BCTC 2025.pdf hoặc URL)"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />

                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                      <Upload size={15} />
                      <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleDirectUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowFilePicker(true)}
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
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
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>{editingReport ? 'Cập Nhật' : 'Lưu Báo Cáo'}</span>
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
        title="Chọn Tệp Báo Cáo Tài Chính"
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={reportToDelete?.title}
        title="Xóa Báo Cáo Tài Chính"
        description="Bạn có chắc chắn muốn xóa báo cáo tài chính này? Dữ liệu sẽ được ẩn khỏi website."
        type="soft"
      />
    </div>
  );
};

export default FinancialReportsManagement;
