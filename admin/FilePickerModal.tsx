import React, { useEffect, useState, useMemo } from 'react';
import { 
  Folder, 
  FileImage, 
  ChevronRight, 
  Home, 
  Upload as UploadIcon,
  FileText,
  FileVideo,
  FileAudio,
  File,
  X,
  FolderPlus,
  Edit3,
  Search,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';

interface UploadedFile {
  filename: string;
  url: string;
  type?: 'file' | 'folder';
  isDirectory?: boolean;
  path?: string;
  mimeType?: string;
  size?: number;
}

interface FilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

const getApiBase = () => {
  const viteEnv = (import.meta as any).env;
  if (viteEnv?.VITE_API_URL) {
    return `${viteEnv.VITE_API_URL}/uploads`;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  if (!port || port === '80' || port === '443') {
    return '/api/uploads';
  }
  
  return `${protocol}//${hostname}:4000/api/uploads`;
};
const API_BASE = getApiBase();

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Helper function to get file type from extension
const getFileType = (filename: string): string => {
  const ext = getFileExtension(filename);
  
  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
    return 'image';
  }
  // Videos
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
    return 'video';
  }
  // Audio
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  // Documents
  if (['pdf'].includes(ext)) {
    return 'pdf';
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return 'document';
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return 'spreadsheet';
  }
  // Code
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(ext)) {
    return 'code';
  }
  
  return 'file';
};

// Helper function to get icon component
const getFileIcon = (filename: string, size: number = 16) => {
  const fileType = getFileType(filename);
  
  switch (fileType) {
    case 'image':
      return <FileImage size={size} className="text-green-500 flex-shrink-0" />;
    case 'video':
      return <FileVideo size={size} className="text-purple-500 flex-shrink-0" />;
    case 'audio':
      return <FileAudio size={size} className="text-pink-500 flex-shrink-0" />;
    case 'pdf':
      return <FileText size={size} className="text-red-500 flex-shrink-0" />;
    case 'document':
      return <FileText size={size} className="text-blue-500 flex-shrink-0" />;
    case 'spreadsheet':
      return <FileText size={size} className="text-green-600 flex-shrink-0" />;
    case 'code':
      return <FileText size={size} className="text-orange-500 flex-shrink-0" />;
    default:
      return <File size={size} className="text-gray-500 flex-shrink-0" />;
  }
};

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const FilePickerModal: React.FC<FilePickerModalProps> = ({ isOpen, onClose, onSelect, title }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<UploadedFile | null>(null);
  const [newTargetName, setNewTargetName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleOpenRename = (file: UploadedFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenameTarget(file);
    setNewTargetName(file.filename);
  };

  const handleRename = async () => {
    if (!renameTarget || !newTargetName.trim()) return;
    if (newTargetName.trim() === renameTarget.filename) {
      setRenameTarget(null);
      return;
    }

    try {
      setRenaming(true);
      setError(null);
      const oldPath = currentPath ? `${currentPath}/${renameTarget.filename}` : renameTarget.filename;
      const res = await fetch(`${API_BASE}/images/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath,
          newName: newTargetName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đổi tên thất bại');
      }

      setRenameTarget(null);
      setNewTargetName('');
      await loadFiles(currentPath);
    } catch (e: any) {
      setError(e.message || 'Đổi tên thất bại. Vui lòng thử lại.');
    } finally {
      setRenaming(false);
    }
  };

  const loadFiles = async (path: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = path ? `${API_BASE}/images?path=${encodeURIComponent(path)}` : `${API_BASE}/images`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Không thể tải danh sách tệp');
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
      setCurrentPath(path);
    } catch (e) {
      setError('Không tải được danh sách tệp tin.');
      console.error('Load files error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles('');
      setPathHistory(['']);
      setSearchQuery('');
      setFilterType('all');
    }
  }, [isOpen]);

  const uploadFiles = async (fileList: File[]) => {
    if (fileList.length === 0) return;

    const formData = new FormData();
    fileList.forEach((file: File) => {
      formData.append('files', file);
    });
    
    // Add current path to form data if we're in a subfolder
    if (currentPath) {
      formData.append('path', currentPath);
    }

    try {
      setUploading(true);
      setError(null);
      const query = currentPath ? `?path=${encodeURIComponent(currentPath)}` : '';
      const endpoint = `${API_BASE}/images${query}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Tải lên thất bại');
      }
      const body = await res.json();
      await loadFiles(currentPath);
      
      // If only one file uploaded, auto-select it
      if (body.files && body.files.length === 1) {
        onSelect(body.files[0].url);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChoose = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setPathHistory([...pathHistory, newPath]);
    loadFiles(newPath);
  };

  const handleBreadcrumbClick = (path: string) => {
    const index = pathHistory.indexOf(path);
    if (index !== -1) {
      setPathHistory(pathHistory.slice(0, index + 1));
    }
    loadFiles(path);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Xóa tệp "${filename}"?`)) return;

    try {
      setError(null);
      const fullPath = currentPath ? `${currentPath}/${filename}` : filename;
      const res = await fetch(`${API_BASE}/images/${encodeURIComponent(fullPath)}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204 && res.status !== 404) throw new Error('Delete failed');
      await loadFiles(currentPath);
    } catch (e) {
      setError('Xóa file thất bại. Vui lòng thử lại.');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Vui lòng nhập tên folder');
      return;
    }

    try {
      setError(null);
      const folderPath = currentPath ? `${currentPath}/${newFolderName.trim()}` : newFolderName.trim();
      const res = await fetch(`${API_BASE}/images/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Tạo folder thất bại');
      }
      
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadFiles(currentPath);
    } catch (e: any) {
      setError(e.message || 'Tạo folder thất bại. Vui lòng thử lại.');
    }
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // Search query
      if (searchQuery.trim() && !f.filename.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      // Filter type
      if (filterType === 'folder') return f.isDirectory || f.type === 'folder';
      if (filterType === 'image') return !(f.isDirectory || f.type === 'folder') && getFileType(f.filename) === 'image';
      if (filterType === 'document') return !(f.isDirectory || f.type === 'folder') && ['pdf', 'document', 'spreadsheet'].includes(getFileType(f.filename));
      if (filterType === 'media') return !(f.isDirectory || f.type === 'folder') && ['video', 'audio'].includes(getFileType(f.filename));
      return true;
    });
  }, [files, searchQuery, filterType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div 
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 transition-all ${
          isDragOver ? 'ring-4 ring-blue-500 ring-offset-2' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title || 'Chọn file / hình ảnh'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Duyệt thư mục trong <span className="font-mono text-gray-700 dark:text-gray-300">/uploads{currentPath ? `/${currentPath}` : ''}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-semibold shadow-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
            >
              <FolderPlus size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Tạo thư mục</span>
            </button>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-blue-700 transition-all">
              <UploadIcon size={15} />
              <span>{uploading ? 'Đang tải...' : 'Tải lên'}</span>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" 
                className="hidden" 
                disabled={uploading} 
                onChange={handleUpload} 
              />
            </label>
            <button
              onClick={() => loadFiles(currentPath)}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900">{error}</div>
        )}

        {/* Create Folder Dialog */}
        {showCreateFolder && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-3">
              <FolderPlus size={18} className="text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Nhập tên thư mục mới..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-gray-100"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs cursor-pointer"
              >
                Tạo
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors font-medium text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Rename Dialog */}
        {renameTarget && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  placeholder="Nhập tên mới..."
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs text-gray-800 dark:text-gray-100"
                  autoFocus
                />
              </div>
              <button
                onClick={handleRename}
                disabled={renaming || !newTargetName.trim()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                {renaming ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setRenameTarget(null);
                  setNewTargetName('');
                }}
                className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors font-medium text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation & Search Toolbar */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-850 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => handleBreadcrumbClick('')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                currentPath === '' 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-750'
              }`}
            >
              <Home size={14} />
              <span>Gốc (uploads)</span>
            </button>
            {currentPath && currentPath.split('/').map((segment, index, arr) => {
              const path = arr.slice(0, index + 1).join('/');
              const isLast = index === arr.length - 1;
              return (
                <React.Fragment key={path}>
                  <ChevronRight size={13} className="text-gray-400" />
                  <button
                    onClick={() => handleBreadcrumbClick(path)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap truncate max-w-[120px] ${
                      isLast 
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {segment}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative flex-1 sm:w-36">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-7 pr-2 py-1 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="image">Hình ảnh</option>
              <option value="document">Tài liệu</option>
              <option value="media">Video/Audio</option>
              <option value="folder">Thư mục</option>
            </select>
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100/50 dark:bg-slate-950/60 min-h-[300px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <Folder size={54} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {searchQuery ? 'Không tìm thấy tệp tin phù hợp' : 'Thư mục trống'}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Kéo thả hoặc bấm Tải lên để thêm tệp tin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredFiles.map((f) => {
                const isDir = f.isDirectory || f.type === 'folder';
                return (
                  <div
                    key={f.filename}
                    className="group border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex flex-col hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <button
                      type="button"
                      className="relative aspect-square bg-gray-50 dark:bg-slate-800/60 flex items-center justify-center overflow-hidden w-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => {
                        if (isDir) {
                          handleFolderClick(f.filename);
                        } else {
                          handleChoose(f.url);
                        }
                      }}
                    >
                      {isDir ? (
                        <div className="flex flex-col items-center justify-center text-blue-500">
                          <Folder size={44} />
                          <span className="text-[11px] mt-1 text-gray-600 dark:text-gray-400 font-semibold">Thư mục</span>
                        </div>
                      ) : getFileType(f.filename) === 'image' ? (
                        <img 
                          src={f.url} 
                          alt={f.filename} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          {getFileIcon(f.filename, 40)}
                          <span className="text-[10px] mt-2 text-gray-600 dark:text-gray-400 font-bold uppercase">
                            .{getFileExtension(f.filename)}
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="p-2 text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-1 border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 truncate" title={f.filename}>
                        {isDir ? (
                          <Folder size={12} className="text-blue-500 flex-shrink-0" />
                        ) : (
                          getFileIcon(f.filename, 12)
                        )}
                        <span className="truncate flex-1 text-[11px] font-medium">{f.filename}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{f.size ? formatFileSize(f.size) : isDir ? 'Thư mục' : ''}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-gray-100 dark:border-slate-800">
                        <button
                          type="button"
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                          onClick={(e) => handleOpenRename(f, e)}
                          title="Đổi tên"
                        >
                          <Edit3 size={10} />
                          Sửa
                        </button>
                        
                        {!isDir && (
                          <button
                            type="button"
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                            onClick={() => handleChoose(f.url)}
                          >
                            Chọn
                          </button>
                        )}

                        <button
                          type="button"
                          className="text-[10px] text-red-500 hover:underline font-medium cursor-pointer"
                          onClick={() => handleDelete(f.filename)}
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center justify-between text-xs text-gray-500">
          <div>
            Đang hiển thị <strong>{filteredFiles.length}</strong> mục
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
