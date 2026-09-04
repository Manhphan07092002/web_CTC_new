import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Folder, 
  FolderPlus,
  FileImage, 
  FileText, 
  FileVideo, 
  FileAudio, 
  File, 
  Upload, 
  Trash2, 
  Edit3, 
  Copy, 
  Download, 
  Eye, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  Home, 
  Grid, 
  List, 
  CheckSquare, 
  Square, 
  X,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Check,
  Repeat
} from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useToast } from '../contexts/ToastContext';

interface UploadedFile {
  filename: string;
  url: string;
  type?: 'file' | 'folder';
  isDirectory?: boolean;
  path?: string;
  size?: number;
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

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// Get file extension
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Get file category
const getFileCategory = (filename: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
  const ext = getFileExtension(filename);
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return 'audio';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext)) return 'document';
  return 'other';
};

// Get file icon component
const renderFileIcon = (filename: string, size = 20) => {
  const cat = getFileCategory(filename);
  switch (cat) {
    case 'image':
      return <FileImage size={size} className="text-emerald-500 flex-shrink-0" />;
    case 'video':
      return <FileVideo size={size} className="text-purple-500 flex-shrink-0" />;
    case 'audio':
      return <FileAudio size={size} className="text-pink-500 flex-shrink-0" />;
    case 'document':
      return <FileText size={size} className="text-blue-500 flex-shrink-0" />;
    default:
      return <File size={size} className="text-gray-400 flex-shrink-0" />;
  }
};

const FileManager: React.FC = () => {
  const { showToast } = useToast();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);

  // Modals state
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<UploadedFile | null>(null);
  const [newTargetName, setNewTargetName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<UploadedFile | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isBulk: boolean;
    file: UploadedFile | null;
  }>({
    isOpen: false,
    isBulk: false,
    file: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Load files from API
  const loadFiles = async (path = currentPath) => {
    try {
      setIsLoading(true);
      const query = path ? `?path=${encodeURIComponent(path)}` : '';
      const res = await fetch(`${API_BASE}/images${query}`);
      if (!res.ok) throw new Error('Không thể tải danh sách tệp tin');
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
      setSelectedItems(new Set());
    } catch (e: any) {
      showToast(e.message || 'Lỗi tải danh sách tệp tin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  // Handle drag and drop
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
      uploadFilesList(Array.from(e.dataTransfer.files));
    }
  };

  // Upload handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFilesList(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const uploadFilesList = async (fileList: File[]) => {
    if (fileList.length === 0) return;

    const formData = new FormData();
    fileList.forEach(f => formData.append('files', f));
    if (currentPath) {
      formData.append('path', currentPath);
    }

    try {
      setUploading(true);
      const query = currentPath ? `?path=${encodeURIComponent(currentPath)}` : '';
      const res = await fetch(`${API_BASE}/images${query}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Tải lên thất bại');
      }

      const result = await res.json();
      showToast(result.message || `Đã tải lên thành công ${fileList.length} tệp tin`, 'success');
      await loadFiles(currentPath);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải lên tệp tin', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Replace file handler
  const handleReplaceClick = (file: UploadedFile) => {
    setReplaceTarget(file);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTarget) return;

    try {
      setUploading(true);
      // Delete old file
      const oldPath = replaceTarget.path || replaceTarget.filename;
      await fetch(`${API_BASE}/images/${encodeURIComponent(oldPath)}`, { method: 'DELETE' });

      // Upload replacement file to same folder
      const formData = new FormData();
      formData.append('files', file);
      if (currentPath) {
        formData.append('path', currentPath);
      }

      const query = currentPath ? `?path=${encodeURIComponent(currentPath)}` : '';
      const res = await fetch(`${API_BASE}/images${query}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Không thể thay thế tệp tin');
      showToast(`Đã thay thế tệp "${replaceTarget.filename}" thành công!`, 'success');
      setReplaceTarget(null);
      await loadFiles(currentPath);
    } catch (err: any) {
      showToast(err.message || 'Thay thế tệp thất bại', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const folderPath = currentPath ? `${currentPath}/${trimmed}` : trimmed;

    try {
      const res = await fetch(`${API_BASE}/images/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Tạo thư mục thất bại');
      }

      showToast(`Đã tạo thư mục "${trimmed}" thành công!`, 'success');
      setCreateFolderModal(false);
      setNewFolderName('');
      await loadFiles(currentPath);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo thư mục', 'error');
    }
  };

  // Rename file/folder
  const handleOpenRename = (file: UploadedFile) => {
    setRenameTarget(file);
    setNewTargetName(file.filename);
  };

  const handleRename = async () => {
    if (!renameTarget || !newTargetName.trim()) return;
    if (newTargetName.trim() === renameTarget.filename) {
      setRenameTarget(null);
      return;
    }

    const oldPath = renameTarget.path || renameTarget.filename;

    try {
      setRenaming(true);
      const res = await fetch(`${API_BASE}/images/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath,
          newName: newTargetName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đổi tên thất bại');

      showToast(`Đổi tên thành công: ${newTargetName.trim()}`, 'success');
      setRenameTarget(null);
      setNewTargetName('');
      await loadFiles(currentPath);
    } catch (e: any) {
      showToast(e.message || 'Đổi tên thất bại', 'error');
    } finally {
      setRenaming(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (file: UploadedFile) => {
    setDeleteModal({
      isOpen: true,
      isBulk: false,
      file
    });
  };

  const handleBulkDeleteClick = () => {
    if (selectedItems.size === 0) return;
    setDeleteModal({
      isOpen: true,
      isBulk: true,
      file: null
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.isBulk) {
      // Bulk delete
      const pathsToDelete = Array.from(selectedItems);
      try {
        const res = await fetch(`${API_BASE}/images/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: pathsToDelete }),
        });

        if (!res.ok) throw new Error('Xóa hàng loạt thất bại');
        showToast(`Đã xóa thành công ${pathsToDelete.length} mục đã chọn`, 'success');
        setSelectedItems(new Set());
        await loadFiles(currentPath);
      } catch (err: any) {
        showToast(err.message || 'Lỗi khi xóa hàng loạt', 'error');
      }
    } else if (deleteModal.file) {
      // Single delete
      const filePath = deleteModal.file.path || deleteModal.file.filename;
      try {
        const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filePath)}`, {
          method: 'DELETE',
        });
        if (!res.ok && res.status !== 204 && res.status !== 404) {
          throw new Error('Xóa tệp thất bại');
        }
        showToast(`Đã xóa "${deleteModal.file.filename}"`, 'success');
        await loadFiles(currentPath);
      } catch (e: any) {
        showToast(e.message || 'Lỗi khi xóa', 'error');
      }
    }
    setDeleteModal({ isOpen: false, isBulk: false, file: null });
  };

  // Copy link
  const handleCopyLink = (url: string, isFull = false) => {
    const finalUrl = isFull ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(finalUrl).catch(() => {});
    showToast(`Đã sao chép: ${finalUrl}`, 'info');
  };

  // Selection toggle
  const toggleSelectItem = (itemPath: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemPath)) {
        next.delete(itemPath);
      } else {
        next.add(itemPath);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedFiles.length) {
      setSelectedItems(new Set());
    } else {
      const allPaths = filteredAndSortedFiles.map(f => f.path || f.filename);
      setSelectedItems(new Set(allPaths));
    }
  };

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(Boolean);
  }, [currentPath]);

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath('');
      return;
    }
    const newPath = breadcrumbs.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const openFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  // Filter & Sort
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter(f => {
      // Search query
      if (searchQuery.trim() && !f.filename.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      // Filter type
      if (filterType === 'folder') return f.isDirectory || f.type === 'folder';
      if (filterType === 'image') return !(f.isDirectory || f.type === 'folder') && getFileCategory(f.filename) === 'image';
      if (filterType === 'document') return !(f.isDirectory || f.type === 'folder') && getFileCategory(f.filename) === 'document';
      if (filterType === 'media') return !(f.isDirectory || f.type === 'folder') && ['video', 'audio'].includes(getFileCategory(f.filename));
      return true;
    });

    // Sort: Folders always first, then by chosen sort criteria
    result.sort((a, b) => {
      const isFolderA = a.isDirectory || a.type === 'folder';
      const isFolderB = b.isDirectory || b.type === 'folder';
      if (isFolderA && !isFolderB) return -1;
      if (!isFolderA && isFolderB) return 1;

      switch (sortBy) {
        case 'name-asc':
          return a.filename.localeCompare(b.filename);
        case 'name-desc':
          return b.filename.localeCompare(a.filename);
        case 'size-asc':
          return (a.size || 0) - (b.size || 0);
        case 'size-desc':
          return (b.size || 0) - (a.size || 0);
        case 'newest':
        default:
          return 0; // Maintain natural API directory order
      }
    });

    return result;
  }, [files, searchQuery, filterType, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const folderCount = files.filter(f => f.isDirectory || f.type === 'folder').length;
    const fileCount = files.length - folderCount;
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    return { folderCount, fileCount, totalBytes };
  }, [files]);

  return (
    <div 
      className="h-full flex flex-col space-y-4 max-w-7xl mx-auto pb-12"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        type="file"
        ref={replaceInputRef}
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Folder size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Quản Lý File & Media</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Quản lý, thêm, sửa, đổi tên, thay thế và xóa các tệp tin / hình ảnh trong hệ thống
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setCreateFolderModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 font-medium text-sm transition-colors cursor-pointer"
          >
            <FolderPlus size={18} className="text-blue-600 dark:text-blue-400" />
            Tạo thư mục
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload size={18} />
                Tải lên tệp
              </>
            )}
          </button>

          <button
            onClick={() => loadFiles(currentPath)}
            disabled={isLoading}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Breadcrumbs & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-sm font-medium py-1">
          <button
            onClick={() => navigateToBreadcrumb(-1)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentPath === ''
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home size={16} />
            <span>Gốc (uploads/images)</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              <button
                onClick={() => navigateToBreadcrumb(idx)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer truncate max-w-[150px] ${
                  idx === breadcrumbs.length - 1
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {crumb}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Toolbar: Search, Filter, Sort, ViewMode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tệp..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <option value="all">Tất cả loại tệp</option>
            <option value="image">Chỉ Hình ảnh</option>
            <option value="document">Chỉ Tài liệu / PDF</option>
            <option value="media">Video / Âm thanh</option>
            <option value="folder">Chỉ Thư mục</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <option value="newest">Mặc định</option>
            <option value="name-asc">Tên (A → Z)</option>
            <option value="name-desc">Tên (Z → A)</option>
            <option value="size-desc">Dung lượng lớn nhất</option>
            <option value="size-asc">Dung lượng nhỏ nhất</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title="Dạng lưới"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title="Dạng danh sách"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Banner (when items are selected) */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3.5 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Đã chọn {selectedItems.size} mục
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {selectedItems.size === filteredAndSortedFiles.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDeleteClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Trash2 size={14} />
              Xóa các mục đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Visual Overlay Area */}
      {isDragOver && (
        <div className="border-3 border-dashed border-blue-500 bg-blue-50/80 dark:bg-blue-950/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center animate-pulse">
          <Upload size={48} className="text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Thả tệp vào đây để tải lên ngay</h3>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
            Tệp sẽ được tải vào thư mục: <strong>{currentPath || 'Gốc'}</strong>
          </p>
        </div>
      )}

      {/* Main Files Display Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-800 p-5 flex-1 min-h-[400px]">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500">Đang tải danh sách tệp tin...</p>
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Thư mục trống</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              {searchQuery ? 'Không tìm thấy tệp nào phù hợp với từ khóa.' : 'Chưa có tệp tin hoặc thư mục nào tại vị trí này.'}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Tải lên tệp ngay
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAndSortedFiles.map(file => {
              const isFolder = file.isDirectory || file.type === 'folder';
              const itemPath = file.path || file.filename;
              const isSelected = selectedItems.has(itemPath);

              return (
                <div
                  key={file.filename}
                  className={`group relative border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:shadow-md hover:border-blue-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(itemPath);
                    }}
                    className={`absolute top-2 left-2 z-10 p-1 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/80 dark:bg-slate-900/80 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>

                  {/* Thumbnail / Icon Container */}
                  <div
                    onClick={() => isFolder ? openFolder(file.filename) : setPreviewFile(file)}
                    className="aspect-square bg-gray-100 dark:bg-slate-800/80 flex items-center justify-center overflow-hidden cursor-pointer relative"
                  >
                    {isFolder ? (
                      <div className="flex flex-col items-center justify-center text-amber-500 hover:scale-105 transition-transform">
                        <Folder size={52} className="fill-amber-400/20 text-amber-500" />
                        <span className="text-[11px] font-semibold text-gray-500 mt-1">Thư mục</span>
                      </div>
                    ) : getFileCategory(file.filename) === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        {renderFileIcon(file.filename, 40)}
                        <span className="text-[10px] font-mono uppercase text-gray-500 mt-1">
                          .{getFileExtension(file.filename)}
                        </span>
                      </div>
                    )}

                    {/* Quick Action Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {!isFolder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
                          title="Xem trước"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRename(file);
                        }}
                        className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
                        title="Đổi tên"
                      >
                        <Edit3 size={14} />
                      </button>
                      {!isFolder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplaceClick(file);
                          }}
                          className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors shadow-sm cursor-pointer"
                          title="Thay thế tệp"
                        >
                          <Repeat size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(file);
                        }}
                        className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer Info */}
                  <div className="p-2.5 flex flex-col justify-between flex-1 bg-white dark:bg-slate-850">
                    <div
                      onClick={() => isFolder && openFolder(file.filename)}
                      className={`text-xs font-semibold text-gray-800 dark:text-gray-200 truncate ${
                        isFolder ? 'cursor-pointer hover:text-blue-600' : ''
                      }`}
                      title={file.filename}
                    >
                      {file.filename}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-500">
                      <span>{isFolder ? 'Thư mục' : formatFileSize(file.size)}</span>
                      {!isFolder && (
                        <button
                          onClick={() => handleCopyLink(file.url)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium cursor-pointer"
                          title="Sao chép URL"
                        >
                          Copy link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="cursor-pointer text-gray-400 hover:text-gray-700"
                    >
                      {selectedItems.size === filteredAndSortedFiles.length && filteredAndSortedFiles.length > 0 ? (
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Tên tệp tin / Thư mục</th>
                  <th className="p-3">Loại</th>
                  <th className="p-3">Dung lượng</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredAndSortedFiles.map(file => {
                  const isFolder = file.isDirectory || file.type === 'folder';
                  const itemPath = file.path || file.filename;
                  const isSelected = selectedItems.has(itemPath);

                  return (
                    <tr
                      key={file.filename}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelectItem(itemPath)}
                          className="cursor-pointer text-gray-400 hover:text-gray-700"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                        <div
                          onClick={() => isFolder ? openFolder(file.filename) : setPreviewFile(file)}
                          className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {isFolder ? (
                            <Folder size={20} className="text-amber-500 flex-shrink-0" />
                          ) : getFileCategory(file.filename) === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.filename}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            renderFileIcon(file.filename, 20)
                          )}
                          <span className="truncate max-w-xs sm:max-w-md">{file.filename}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-500 uppercase">
                        {isFolder ? 'Thư mục' : getFileExtension(file.filename) || 'Tệp tin'}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {isFolder ? '—' : formatFileSize(file.size)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isFolder && (
                            <>
                              <button
                                onClick={() => setPreviewFile(file)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                                title="Xem trước"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleCopyLink(file.url)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                                title="Copy link"
                              >
                                <Copy size={15} />
                              </button>
                              <button
                                onClick={() => handleReplaceClick(file)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                                title="Thay thế tệp"
                              >
                                <Repeat size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenRename(file)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                            title="Đổi tên"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(file)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
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

      {/* Footer Info Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
        <div>
          Tổng số: <strong>{stats.fileCount}</strong> tệp tin, <strong>{stats.folderCount}</strong> thư mục 
          {stats.totalBytes > 0 && ` (Tổng dung lượng: ${formatFileSize(stats.totalBytes)})`}
        </div>
        <div>
          Vị trí hiện tại: <span className="font-mono">{currentPath ? `/uploads/images/${currentPath}` : '/uploads/images'}</span>
        </div>
      </div>

      {/* Create Folder Modal */}
      {createFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800 animate-scale-up">
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <FolderPlus size={20} className="text-blue-600 dark:text-blue-400" />
              Tạo thư mục mới
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Thư mục sẽ được tạo tại: <span className="font-mono text-gray-700 dark:text-gray-300">/{currentPath || 'gốc'}</span>
            </p>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Nhập tên thư mục (vd: banners, products_2026)..."
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800 animate-scale-up">
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Edit3 size={18} className="text-blue-600 dark:text-blue-400" />
              {renameTarget.isDirectory || renameTarget.type === 'folder' ? 'Đổi tên thư mục' : 'Đổi tên tệp tin'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Tên hiện tại: <span className="font-semibold text-gray-700 dark:text-gray-300">{renameTarget.filename}</span>
            </p>
            <input
              type="text"
              value={newTargetName}
              onChange={e => setNewTargetName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              placeholder="Nhập tên mới..."
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-gray-100"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRenameTarget(null);
                  setNewTargetName('');
                }}
                disabled={renaming}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRename}
                disabled={renaming || !newTargetName.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {renaming ? 'Đang lưu...' : 'Lưu tên mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                {renderFileIcon(previewFile.filename, 18)}
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{previewFile.filename}</h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Preview */}
            <div className="p-6 flex items-center justify-center bg-gray-50 dark:bg-slate-950/80 overflow-auto flex-1 min-h-[250px]">
              {getFileCategory(previewFile.filename) === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.filename}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : getFileCategory(previewFile.filename) === 'document' ? (
                <div className="text-center p-8">
                  <FileText size={64} className="text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tài liệu: {previewFile.filename}</p>
                  <p className="text-xs text-gray-500 mt-1">Dung lượng: {formatFileSize(previewFile.size)}</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  {renderFileIcon(previewFile.filename, 64)}
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">{previewFile.filename}</p>
                </div>
              )}
            </div>

            {/* Modal Footer & Actions */}
            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-gray-500">
                <span>Dung lượng: <strong>{formatFileSize(previewFile.size)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(previewFile.url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  <Copy size={13} />
                  Copy Link
                </button>
                <a
                  href={previewFile.url}
                  download={previewFile.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Download size={13} />
                  Tải xuống
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false, file: null })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.isBulk ? `Xác nhận xóa ${selectedItems.size} mục` : 'Xác nhận xóa tệp'}
        itemName={deleteModal.isBulk ? `${selectedItems.size} tệp/thư mục đã chọn` : deleteModal.file?.filename}
        itemImage={!deleteModal.isBulk && getFileCategory(deleteModal.file?.filename || '') === 'image' ? deleteModal.file?.url : undefined}
        description={
          deleteModal.isBulk
            ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedItems.size} mục đã chọn không?`
            : `Bạn có chắc chắn muốn xóa "${deleteModal.file?.filename}"?`
        }
        warningText="Tệp tin sẽ bị xóa hoàn toàn khỏi máy chủ uploads và không thể khôi phục."
        confirmText="Đồng ý xóa"
      />
    </div>
  );
};

export default FileManager;
