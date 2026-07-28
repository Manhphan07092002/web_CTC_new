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
      showToast('Vui lÃ²ng chá»n file ZIP', 'error');
      return;
    }

    if (!file.name.endsWith('.zip')) {
      showToast('Chá»‰ há»— trá»£ Ä‘á»‹nh dáº¡ng file .zip', 'error');
      return;
    }

    setShowConfirm(true);
  };

  const proceedUpload = async () => {
    setShowConfirm(false);
    if (!file) return;

    setLoading(true);
    setLogs(['Äang táº£i file lÃªn mÃ¡y chá»§...']);

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
        showToast('Nháº­p dá»¯ liá»‡u thÃ nh cÃ´ng! Tá»± Ä‘á»™ng lÃ m má»›i trang sau 2 giÃ¢y...', 'success');
        setLogs(data.logs || ['HoÃ n táº¥t.']);
        fetchHistory();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showToast(data.error || 'Nháº­p dá»¯ liá»‡u tháº¥t báº¡i', 'error');
        setLogs(prev => [...prev, `Lá»—i: ${data.error}`]);
      }
    } catch (error: any) {
      showToast('ÄÃ£ xáº£y ra lá»—i khi táº£i lÃªn', 'error');
      setLogs(prev => [...prev, `Lá»—i há»‡ thá»‘ng: ${error.message}`]);
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
      
      showToast('Xuáº¥t dá»¯ liá»‡u thÃ nh cÃ´ng', 'success');
      fetchHistory();
    } catch (error) {
      showToast('CÃ³ lá»—i xáº£y ra khi xuáº¥t dá»¯ liá»‡u', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quáº£n LÃ½ Dá»¯ Liá»‡u (Import/Export)</h1>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
        >
          <Download size={18} />
          Xuáº¥t Dá»¯ Liá»‡u (Backup)
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <UploadCloud size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Táº£i LÃªn File Dá»¯ Liá»‡u</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Há»‡ thá»‘ng há»— trá»£ táº£i lÃªn 1 file <b>.zip</b> chá»©a cÃ¡c báº£ng dá»¯ liá»‡u (vd: Categories.json, Products.json, Blog.json, Users.json) Ä‘Ã£ Ä‘Æ°á»£c xuáº¥t tá»« há»‡ thá»‘ng SQL cÅ©.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 cursor-pointer'
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
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">{file.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => setFile(null)}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                  >
                    Há»§y bá»
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Äang xá»­ lÃ½...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Báº¯t Ä‘áº§u Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={48} className="text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800">KÃ©o tháº£ file ZIP vÃ o Ä‘Ã¢y</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">hoáº·c click Ä‘á»ƒ chá»n file tá»« mÃ¡y tÃ­nh</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg">
                  Chá»n File ZIP
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
              Tiáº¿n TrÃ¬nh Chuyá»ƒn Äá»•i (Logs)
            </h3>
          </div>
          <div className="p-4 h-64 overflow-y-auto font-mono text-sm text-green-400 space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`${log.startsWith('Lá»—i') || log.includes('Error') ? 'text-red-400' : ''}`}>
                <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
            {loading && (
              <div className="animate-pulse">_ Äang xá»­ lÃ½ dá»¯ liá»‡u...</div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-700">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Cáº£nh bÃ¡o ghi Ä‘Ã¨ dá»¯ liá»‡u!</h3>
              <p className="text-red-600/80 text-sm mb-4">
                QuÃ¡ trÃ¬nh nÃ y sáº½ <strong>XÃ“A Sáº CH</strong> danh má»¥c, sáº£n pháº©m, vÃ  bÃ i viáº¿t cÅ© trong há»‡ thá»‘ng vÃ  thay tháº¿ báº±ng dá»¯ liá»‡u tá»« file ZIP nÃ y. 
              </p>
              <p className="text-gray-600 text-sm">
                Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n tiáº¿p tá»¥c khÃ´ng?
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                Há»§y bá»
              </button>
              <button 
                onClick={proceedUpload}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors"
              >
                VÃ¢ng, Cháº¯c cháº¯n nháº­p!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/60">
          <h3 className="text-gray-800 dark:text-gray-100 font-medium flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            Lá»‹ch sá»­ Thao tÃ¡c
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3">Thá»i gian</th>
                <th scope="col" className="px-6 py-3">HÃ nh Ä‘á»™ng</th>
                <th scope="col" className="px-6 py-3">Tráº¡ng thÃ¡i</th>
                <th scope="col" className="px-6 py-3">Chi tiáº¿t</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item, idx) => (
                <tr key={idx} className="bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.action === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.action === 'import' ? 'Nháº­p' : 'Xuáº¥t'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'success' ? 'ThÃ nh cÃ´ng' : 'Lá»—i'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {item.details}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-slate-500">
                    ChÆ°a cÃ³ lá»‹ch sá»­ xuáº¥t nháº­p nÃ o.
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

