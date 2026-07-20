import React, { useEffect, useState } from 'react';
import { Folder, FileImage } from 'lucide-react';

interface UploadedFile {
  filename: string;
  url: string;
  type?: 'file' | 'folder';
  isDirectory?: boolean;
}

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api/uploads';
  }
  return `${protocol}//${hostname}:4000/api/uploads`;
};
const API_BASE = getApiBase();
const FileManager: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/images`);
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      setError('Không tải được danh sách file.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file: File) => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/images`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      console.log(`Uploaded ${result.files?.length || 0} files successfully`);
      await loadFiles();
      e.target.value = '';
    } catch (err) {
      setError('Upload thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    alert(`Đã copy: ${fullUrl}`);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Xóa file này?')) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/images/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      // 204 = deleted OK, 404 = file vốn đã không tồn tại => coi như thành công
      if (!res.ok && res.status !== 204 && res.status !== 404) {
        throw new Error('Delete failed');
      }
      await loadFiles();
    } catch (e) {
      setError('Xóa file thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý file</h2>
          <p className="text-gray-500 text-sm mt-1">Xem và tải lên file vào hệ thống (uploads/images) - Tối đa 5 file, 10MB/file</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md cursor-pointer hover:bg-secondary transition-all">
          <span>{uploading ? 'Đang upload...' : 'Upload file (1-5)'}</span>
          <input type="file" multiple className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-12">
            Chưa có file nào. Hãy upload một hình ảnh mới.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((f) => (
              <div key={f.filename} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {f.isDirectory || f.type === 'folder' ? (
                    <div className="flex flex-col items-center justify-center text-blue-500">
                      <Folder size={48} />
                      <span className="text-xs mt-1 text-gray-600">Folder</span>
                    </div>
                  ) : (
                    <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(f.filename)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                    title={f.isDirectory ? "Xóa folder" : "Xóa file"}
                  >
                    ×
                  </button>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  <div className="text-xs text-gray-700 truncate flex items-center gap-1" title={f.filename}>
                    {f.isDirectory || f.type === 'folder' ? (
                      <Folder size={12} className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <FileImage size={12} className="text-gray-500 flex-shrink-0" />
                    )}
                    {f.filename}
                  </div>
                  {!(f.isDirectory || f.type === 'folder') && (
                    <button
                      type="button"
                      className="mt-1 text-xs text-primary font-bold hover:underline text-left"
                      onClick={() => handleCopy(f.url)}
                    >
                      Copy link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
