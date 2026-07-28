import React, { useEffect, useState } from 'react';
import { Folder, FileImage } from 'lucide-react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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
      setError('KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch file.');
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
      setError('Upload tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    alert(`ÄÃ£ copy: ${fullUrl}`);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    file: UploadedFile | null;
  }>({
    isOpen: false,
    file: null
  });

  const handleDeleteClick = (file: UploadedFile) => {
    setDeleteConfirm({
      isOpen: true,
      file
    });
  };

  const handleConfirmDelete = async () => {
    const file = deleteConfirm.file;
    if (!file) return;

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/images/${encodeURIComponent(file.filename)}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204 && res.status !== 404) {
        throw new Error('Delete failed');
      }
      await loadFiles();
    } catch (e) {
      setError('XÃ³a file tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setDeleteConfirm({ isOpen: false, file: null });
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quáº£n lÃ½ file</h2>
          <p className="text-gray-500 text-sm mt-1">Xem vÃ  táº£i lÃªn file vÃ o há»‡ thá»‘ng (uploads/images) - Tá»‘i Ä‘a 5 file, 10MB/file</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md cursor-pointer hover:bg-secondary transition-all">
          <span>{uploading ? 'Äang upload...' : 'Upload file (1-5)'}</span>
          <input type="file" multiple className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-lg">{error}</div>}

      <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60 flex-1 overflow-hidden p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-12">
            ChÆ°a cÃ³ file nÃ o. HÃ£y upload má»™t hÃ¬nh áº£nh má»›i.
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
                    onClick={() => handleDeleteClick(f)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                    title={f.isDirectory ? "XÃ³a folder" : "XÃ³a file"}
                  >
                    Ã—
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

      {/* Delete File Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, file: null })}
        onConfirm={handleConfirmDelete}
        title="XÃ¡c nháº­n xÃ³a tá»‡p"
        itemName={deleteConfirm.file?.filename}
        itemImage={deleteConfirm.file?.url}
        description={`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a tá»‡p "${deleteConfirm.file?.filename}"?`}
        warningText="Tá»‡p tin sáº½ bá»‹ xÃ³a vÄ©nh viá»…n khá»i thÆ° má»¥c uploads."
        confirmText="Äá»“ng Ã½ xÃ³a"
      />
    </div>
  );
};

export default FileManager;

