import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Upload, Save, X } from 'lucide-react';

interface Resource {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  categoryId: string | { _id: string; name: string; isActive: boolean };
  size: string;
  isActive: boolean;
  createdAt: string;
}

interface DocumentCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/resources/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setResources(data);
      } else {
        console.error('Expected array of resources, got:', data);
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSave = async () => {
    if (!currentResource.title || !currentResource.fileUrl || !currentResource.categoryId) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc (Tiêu đề, Đường dẫn/File, Thể loại)');
      return;
    }

    try {
      const method = currentResource._id ? 'PUT' : 'POST';
      const url = currentResource._id ? `/api/resources/${currentResource._id}` : '/api/resources';
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentResource,
          // Gửi categoryId dạng string
          categoryId: typeof currentResource.categoryId === 'object' && currentResource.categoryId
            ? currentResource.categoryId._id
            : currentResource.categoryId
        })
      });

      if (response.ok) {
        setIsEditing(false);
        setCurrentResource({});
        fetchResources();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Có lỗi xảy ra khi lưu tài liệu');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchResources();
      } else {
        alert('Có lỗi xảy ra khi xóa tài liệu');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/uploads/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        // Calculate size in MB
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + 'MB';
        setCurrentResource(prev => ({ 
          ...prev, 
          fileUrl: data.files[0].url,
          size: sizeMB
        }));
      } else {
        alert(data.message || 'Lỗi khi tải file lên');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Lỗi khi tải file lên');
    } finally {
      setUploadingFile(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
    const resCategoryId = typeof res.categoryId === 'object' && res.categoryId ? res.categoryId._id : res.categoryId;
    const matchesType = filterType === 'all' || resCategoryId === filterType;
    return matchesSearch && matchesType;
  });

  const getCategoryName = (res: Resource) => {
    if (typeof res.categoryId === 'object' && res.categoryId) {
      return res.categoryId.name;
    }
    const found = categories.find(c => c._id === res.categoryId);
    return found ? found.name : 'Chưa phân loại';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Tài liệu</h1>
          <p className="text-gray-500 mt-1">Quản lý các tài liệu và file tài liệu kỹ thuật của hệ thống</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setCurrentResource({ 
                categoryId: categories[0]?._id || '', 
                isActive: true 
              });
              setIsEditing(true);
            }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Thêm mới</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-xl font-bold">{currentResource._id ? 'Chỉnh sửa Tài liệu' : 'Thêm Tài liệu mới'}</h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
              <input
                type="text"
                value={currentResource.title || ''}
                onChange={e => setCurrentResource(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="VD: Catalogue 2024 - Vol 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
              <input
                type="text"
                value={currentResource.description || ''}
                onChange={e => setCurrentResource(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Mô tả về tài liệu này..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại tài liệu *</label>
                <select
                  value={
                    typeof currentResource.categoryId === 'object' && currentResource.categoryId
                      ? currentResource.categoryId._id
                      : (currentResource.categoryId || '')
                  }
                  onChange={e => setCurrentResource(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>-- Chọn thể loại --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước file (Tùy chọn)</label>
                <input
                  type="text"
                  value={currentResource.size || ''}
                  onChange={e => setCurrentResource(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="VD: 5MB"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Tài liệu (Link URL hoặc Upload) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentResource.fileUrl || ''}
                  onChange={e => setCurrentResource(prev => ({ ...prev, fileUrl: e.target.value }))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="https://..."
                />
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 border border-gray-300">
                  <Upload size={18} />
                  <span>{uploadingFile ? 'Đang tải...' : 'Upload'}</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={currentResource.isActive !== false}
                onChange={e => setCurrentResource(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Hiển thị tài liệu này</label>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Save size={18} />
                <span>Lưu lại</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="all">Tất cả loại</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-600">Tiêu đề</th>
                    <th className="p-4 font-semibold text-gray-600">Loại</th>
                    <th className="p-4 font-semibold text-gray-600">Dung lượng</th>
                    <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResources.map(resource => (
                    <tr key={resource._id} className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{resource.title}</div>
                        {resource.description && <div className="text-sm text-gray-500 truncate max-w-xs">{resource.description}</div>}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-full w-fit">
                          <FileText size={16} className="text-primary" />
                          {getCategoryName(resource)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{resource.size || '-'}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${resource.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {resource.isActive ? 'Hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            // Chuyển categoryId sang dạng ID string khi đưa vào form edit
                            const catId = typeof resource.categoryId === 'object' && resource.categoryId
                              ? resource.categoryId._id
                              : resource.categoryId;
                            setCurrentResource({
                              ...resource,
                              categoryId: catId
                            });
                            setIsEditing(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(resource._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredResources.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Không tìm thấy tài liệu nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
