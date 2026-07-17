import React, { useEffect, useState } from 'react';
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
  FolderPlus
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
}

const API_BASE = 'http://103.161.171.54:4000/api/uploads';

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

const FilePickerModal: React.FC<FilePickerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadFiles = async (path: string = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = path ? `${API_BASE}/images?path=${encodeURIComponent(path)}` : `${API_BASE}/images`;
      console.log('Loading files from:', endpoint);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      console.log('Files loaded:', data);
      console.log('Files count:', data.length);
      data.forEach((f: any, i: number) => {
        console.log(`File ${i}:`, f.filename, f.isDirectory ? '(folder)' : '(file)', f.path);
      });
      setFiles(data);
      setCurrentPath(path);
    } catch (e) {
      setError('Không tải được danh sách file.');
      console.error('Load files error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles('');
      setPathHistory(['']);
    }
  }, [isOpen]);

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file: File) => {
      formData.append('files', file);
    });
    
    // Add current path to form data if we're in a subfolder
    if (currentPath) {
      formData.append('path', currentPath);
    }

    try {
      setUploading(true);
      setError(null);
      const endpoint = currentPath ? `${API_BASE}/images?path=${encodeURIComponent(currentPath)}` : `${API_BASE}/images`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const body = await res.json();
      await loadFiles(currentPath);
      e.target.value = '';
      
      // If only one file uploaded, auto-select it
      if (body.files && body.files.length === 1) {
        const fullUrl = `${window.location.origin}${body.files[0].url}`;
        onSelect(fullUrl);
        onClose();
      }
    } catch (err) {
      setError('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleChoose = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    onSelect(fullUrl);
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
    if (!confirm('Xóa file này?')) return;

    try {
      setError(null);
      const fullPath = currentPath ? `${currentPath}/${filename}` : filename;
      const res = await fetch(`${API_BASE}/images/${encodeURIComponent(fullPath)}`, {
        method: 'DELETE',
      });
      // 204 = deleted OK, 404 = file vốn đã không tồn tại => coi như thành công
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
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
      const res = await fetch(`${API_BASE}/images/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      });
      
      if (!res.ok) throw new Error('Failed to create folder');
      
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadFiles(currentPath);
    } catch (e) {
      setError('Tạo folder thất bại. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Chọn file</h3>
            <p className="text-xs text-gray-500 mt-1">
              Duyệt folders và chọn file cần sử dụng
              {currentPath && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  📁 {currentPath}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow cursor-pointer hover:bg-green-700 transition-all"
            >
              <FolderPlus size={16} />
              <span>Tạo folder</span>
            </button>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow cursor-pointer hover:bg-secondary transition-all">
              <UploadIcon size={16} />
              <span>{uploading ? 'Đang upload...' : 'Upload'}</span>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" 
                className="hidden" 
                disabled={uploading} 
                onChange={handleUpload} 
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đóng"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{error}</div>
        )}

        {/* Create Folder Dialog */}
        {showCreateFolder && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <FolderPlus size={20} className="text-blue-600" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Nhập tên folder..."
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Tạo
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center gap-2 text-sm overflow-x-auto">
          <button
            onClick={() => handleBreadcrumbClick('')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-primary hover:bg-white transition-all font-medium"
          >
            <Home size={16} />
            <span>Root</span>
          </button>
          {currentPath && currentPath.split('/').map((segment, index, arr) => {
            const path = arr.slice(0, index + 1).join('/');
            const isLast = index === arr.length - 1;
            return (
              <React.Fragment key={path}>
                <ChevronRight size={16} className="text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(path)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    isLast 
                      ? 'text-primary bg-white font-bold shadow-sm' 
                      : 'text-gray-600 hover:text-primary hover:bg-white'
                  }`}
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <Folder size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-sm">Thư mục trống</p>
              <p className="text-gray-400 text-xs mt-1">Upload file để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((f) => (
                <div
                  key={f.filename}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col hover:border-primary hover:shadow-md transition-all"
                >
                  <button
                    type="button"
                    className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden w-full hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      if (f.isDirectory || f.type === 'folder') {
                        handleFolderClick(f.filename);
                      } else {
                        handleChoose(f.url);
                      }
                    }}
                  >
                    {f.isDirectory || f.type === 'folder' ? (
                      <div className="flex flex-col items-center justify-center text-blue-500">
                        <Folder size={48} />
                        <span className="text-xs mt-1 text-gray-600 font-semibold">Folder</span>
                      </div>
                    ) : getFileType(f.filename) === 'image' ? (
                      <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        {getFileIcon(f.filename, 48)}
                        <span className="text-xs mt-2 text-gray-600 font-medium">.{getFileExtension(f.filename).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="sr-only">{f.isDirectory ? 'Mở folder' : 'Chọn file'}</span>
                  </button>
                  <div className="p-2 text-xs text-gray-700 flex flex-col gap-1">
                    <div className="flex items-center gap-1 truncate" title={f.filename}>
                      {f.isDirectory || f.type === 'folder' ? (
                        <Folder size={12} className="text-blue-500 flex-shrink-0" />
                      ) : (
                        getFileIcon(f.filename, 12)
                      )}
                      <span className="truncate flex-1">{f.filename}</span>
                    </div>
                    {f.size && (
                      <div className="text-[10px] text-gray-500">
                        {formatFileSize(f.size)}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button
                        type="button"
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1"
                        onClick={() => handleDelete(f.filename)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
