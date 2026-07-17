import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Download, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { usePermission } from '../contexts/PermissionContext';
import AccessDenied from '../components/AccessDenied';

const MigrationManagement: React.FC = () => {
  const { hasPermission } = usePermission();
  const { showToast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/migration/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching migration history', err);
    }
  };

  if (!hasPermission('settings_manage')) {
    return <AccessDenied />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Vui lòng chọn file ZIP', 'error');
      return;
    }

    if (!file.name.endsWith('.zip')) {
      showToast('Chỉ hỗ trợ định dạng file .zip', 'error');
      return;
    }

    setShowConfirm(true);
  };

  const proceedUpload = async () => {
    setShowConfirm(false);
    if (!file) return;

    setLoading(true);
    setLogs(['Đang tải file lên máy chủ...']);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Direct fetch to avoid api wrapper parsing issues with FormData
      const token = localStorage.getItem('token');
      const response = await fetch('/api/migration/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Nhập dữ liệu thành công! Tự động làm mới trang sau 2 giây...', 'success');
        setLogs(data.logs || ['Hoàn tất.']);
        fetchHistory();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showToast(data.error || 'Nhập dữ liệu thất bại', 'error');
        setLogs(prev => [...prev, `Lỗi: ${data.error}`]);
      }
    } catch (error: any) {
      showToast('Đã xảy ra lỗi khi tải lên', 'error');
      setLogs(prev => [...prev, `Lỗi hệ thống: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/migration/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `website_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Xuất dữ liệu thành công', 'success');
      fetchHistory();
    } catch (error) {
      showToast('Có lỗi xảy ra khi xuất dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Dữ Liệu (Import/Export)</h1>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
        >
          <Download size={18} />
          Xuất Dữ Liệu (Backup)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Tải Lên File Dữ Liệu</h2>
              <p className="text-sm text-gray-600 mt-1">
                Hệ thống hỗ trợ tải lên 1 file <b>.zip</b> chứa các bảng dữ liệu (vd: Categories.json, Products.json, Blog.json, Users.json) đã được xuất từ hệ thống SQL cũ.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            }`}
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".zip" 
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FileText size={48} className="text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">{file.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => setFile(null)}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Bắt đầu Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">Kéo thả file ZIP vào đây</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">hoặc click để chọn file từ máy tính</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
                  Chọn File ZIP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-medium flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              Tiến Trình Chuyển Đổi (Logs)
            </h3>
          </div>
          <div className="p-4 h-64 overflow-y-auto font-mono text-sm text-green-400 space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`${log.startsWith('Lỗi') || log.includes('Error') ? 'text-red-400' : ''}`}>
                <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
            {loading && (
              <div className="animate-pulse">_ Đang xử lý dữ liệu...</div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Cảnh báo ghi đè dữ liệu!</h3>
              <p className="text-red-600/80 text-sm mb-4">
                Quá trình này sẽ <strong>XÓA SẠCH</strong> danh mục, sản phẩm, và bài viết cũ trong hệ thống và thay thế bằng dữ liệu từ file ZIP này. 
              </p>
              <p className="text-gray-600 text-sm">
                Bạn có chắc chắn muốn tiếp tục không?
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={proceedUpload}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors"
              >
                Vâng, Chắc chắn nhập!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-gray-800 font-medium flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            Lịch sử Thao tác
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">Thời gian</th>
                <th scope="col" className="px-6 py-3">Hành động</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
                <th scope="col" className="px-6 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item, idx) => (
                <tr key={idx} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.action === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.action === 'import' ? 'Nhập' : 'Xuất'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'success' ? 'Thành công' : 'Lỗi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.details}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Chưa có lịch sử xuất nhập nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MigrationManagement;
