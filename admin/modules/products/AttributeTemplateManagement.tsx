import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Sliders, CheckCircle, 
  X, Layers, RotateCcw, ArrowUp, ArrowDown, 
  Hash, Type, ToggleLeft, ListFilter, Sparkles
} from 'lucide-react';
import { api } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { AttributeTemplate, AttributeField } from '../../../types';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';

const DATA_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  text: { label: 'Văn bản (Text)', icon: Type, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  number: { label: 'Số + Đơn vị', icon: Hash, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  boolean: { label: 'Có / Không', icon: ToggleLeft, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  select: { label: 'Chọn 1 tùy chọn', icon: ListFilter, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  multi_select: { label: 'Chọn nhiều mục', icon: Layers, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' }
};

const COMMON_UNITS = ['W', 'kW', 'MW', 'V', 'A', 'Ah', '%', 'GB', 'TB', 'Mbps', 'Gbps', 'mm', 'cm', 'm', 'kg', 'g', 'MP', 'inch', 'trang/phút', 'cổng', 'năm', 'tháng'];

export const AttributeTemplateManagement: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AttributeTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AttributeTemplate | null>(null);

  // Form State
  const initialField: AttributeField = {
    key: '',
    name: '',
    type: 'text',
    unit: '',
    options: [],
    required: false,
    placeholder: '',
    isFilterable: true,
    isHighlight: false,
    order: 1
  };

  const initialFormData: Partial<AttributeTemplate> = {
    name: '',
    category: '',
    description: '',
    fields: [{ ...initialField }],
    status: 'active',
    sortOrder: 0
  };

  const [formData, setFormData] = useState<Partial<AttributeTemplate>>(initialFormData);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.attributeTemplates.getAll(true);
      if (Array.isArray(data)) {
        setTemplates(data);
      } else {
        setTemplates([]);
      }
    } catch (error: any) {
      console.error('Error fetching attribute templates:', error);
      showToast(error.message || 'Lỗi khi tải mẫu thông số', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.productCategories.getAll();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateFieldKey = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s_]/g, '')
      .trim()
      .replace(/\s+/g, '_');
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      ...initialFormData,
      fields: [
        { ...initialField, key: 'model', name: 'Model / Mã thiết bị', type: 'text', required: true, isHighlight: true, order: 1 },
        { ...initialField, key: 'origin', name: 'Xuất xứ / Nơi sản xuất', type: 'text', required: false, order: 2 }
      ],
      sortOrder: templates.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: AttributeTemplate) => {
    setEditingTemplate(tpl);
    const rawFields = tpl.fields || tpl.attributes || [];
    setFormData({
      name: tpl.name,
      category: tpl.category || tpl.categorySlug || tpl.categoryId || '',
      description: tpl.description || '',
      fields: Array.isArray(rawFields) && rawFields.length > 0 
        ? JSON.parse(JSON.stringify(rawFields)) 
        : [{ ...initialField }],
      status: tpl.status || (tpl.isActive ? 'active' : 'inactive') || 'active',
      sortOrder: tpl.sortOrder ?? 0
    });
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    const currentFields = formData.fields || [];
    setFormData({
      ...formData,
      fields: [
        ...currentFields,
        {
          ...initialField,
          order: currentFields.length + 1
        }
      ]
    });
  };

  const handleRemoveField = (index: number) => {
    const currentFields = [...(formData.fields || [])];
    if (currentFields.length <= 1) {
      showToast('Mẫu thông số cần có ít nhất 1 trường', 'error');
      return;
    }
    currentFields.splice(index, 1);
    setFormData({ ...formData, fields: currentFields });
  };

  const handleFieldChange = (index: number, key: keyof AttributeField, value: any) => {
    const currentFields = [...(formData.fields || [])];
    const field = { ...currentFields[index], [key]: value };

    if (key === 'name' && (!field.key || field.key === generateFieldKey(currentFields[index].name || ''))) {
      field.key = generateFieldKey(value);
    }

    currentFields[index] = field;
    setFormData({ ...formData, fields: currentFields });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const currentFields = [...(formData.fields || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentFields.length) return;

    const temp = currentFields[index];
    currentFields[index] = currentFields[targetIdx];
    currentFields[targetIdx] = temp;

    setFormData({ ...formData, fields: currentFields });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Vui lòng nhập tên mẫu thông số', 'error');
      return;
    }
    if (!formData.category?.trim()) {
      showToast('Vui lòng chọn hoặc nhập mã danh mục áp dụng', 'error');
      return;
    }

    const cleanedFields: AttributeField[] = (formData.fields || []).map((f, i) => ({
      ...f,
      name: f.name.trim(),
      key: f.key?.trim() || generateFieldKey(f.name),
      order: i + 1,
      options: typeof f.options === 'string' 
        ? (f.options as string).split(',').map(s => s.trim()).filter(Boolean)
        : (f.options || [])
    })).filter(f => f.name.length > 0);

    if (cleanedFields.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 thông số hợp lệ', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<AttributeTemplate> = {
        ...formData,
        name: formData.name.trim(),
        category: formData.category.trim(),
        fields: cleanedFields,
        sortOrder: Number(formData.sortOrder) || 0
      };

      if (editingTemplate) {
        const id = editingTemplate.id || editingTemplate._id;
        await api.attributeTemplates.update(id!, payload);
        showToast('Cập nhật mẫu thông số thành công!', 'success');
      } else {
        await api.attributeTemplates.create(payload);
        showToast('Thêm mẫu thông số mới thành công!', 'success');
      }

      setIsModalOpen(false);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      showToast(error.message || 'Lỗi khi lưu mẫu thông số', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('Khôi phục/Nạp các mẫu thông số chuẩn (Solar, Network, Camera, Laptop, Inverter, Máy in)? Các mẫu hiện tại không bị ghi đè.')) {
      return;
    }

    try {
      setSeeding(true);
      await api.attributeTemplates.seedDefaults();
      showToast('Đã nạp thành công các bộ mẫu thông số chuẩn!', 'success');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error seeding templates:', error);
      showToast(error.message || 'Lỗi khi nạp mẫu chuẩn', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    const id = templateToDelete.id || templateToDelete._id;
    if (!id) return;

    try {
      await api.attributeTemplates.delete(id);
      showToast('Đã xóa mẫu thông số thành công!', 'success');
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      showToast(error.message || 'Lỗi khi xóa mẫu thông số', 'error');
    }
  };

  // Filtered Templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = 
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || t.categorySlug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter || t.categorySlug === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-md">
              <Sliders size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mẫu thông số kỹ thuật (Dynamic Attributes)
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Định nghĩa các trường thông số linh hoạt theo từng ngành hàng (Camera, Switch mạng, Laptop, Solar, Inverter, v.v.)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-300 dark:border-slate-700 transition-all cursor-pointer text-sm"
            title="Tự động tạo các mẫu thông số phổ biến nhất"
          >
            <RotateCcw size={16} className={seeding ? 'animate-spin' : ''} />
            <span>Nạp mẫu chuẩn</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer text-sm"
          >
            <Plus size={18} />
            <span>Thêm mẫu thông số mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên mẫu, mã danh mục, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả ngành hàng / Danh mục</option>
            {templates.map(t => (
              <option key={t.category || t.categorySlug || t.id} value={t.category || t.categorySlug}>
                {t.name} ({t.category || t.categorySlug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải danh sách mẫu thông số...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-800">
          <Sliders size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-3" />
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Chưa có mẫu thông số kỹ thuật nào</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Hãy bấm "Nạp mẫu chuẩn" để tạo nhanh các mẫu Solar, Camera, Switch mạng, Laptop...</p>
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Nạp bộ mẫu chuẩn ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const id = tpl.id || tpl._id;
            const fieldsList = tpl.fields || tpl.attributes || [];
            const fieldsCount = fieldsList.length;

            return (
              <div
                key={id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Sliders size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {tpl.name}
                        </h3>
                        <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 mt-0.5">
                          {tpl.category || tpl.categorySlug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(tpl)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa mẫu"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setTemplateToDelete(tpl);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa mẫu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {tpl.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {tpl.description}
                    </p>
                  )}

                  {/* Fields Preview List */}
                  <div className="space-y-1.5 border-t border-gray-100 dark:border-slate-800 pt-3 mb-4">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Các thông số quy định</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{fieldsCount} trường</span>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {fieldsList.slice(0, 7).map((f, fi) => {
                        const typeInfo = DATA_TYPE_LABELS[f.type] || DATA_TYPE_LABELS.text;
                        const TypeIcon = typeInfo.icon;

                        return (
                          <div
                            key={f.key || fi}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-gray-50/80 dark:bg-slate-800/60"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                {f.name}
                              </span>
                              {f.unit && (
                                <span className="text-[10px] font-mono text-gray-400 bg-white dark:bg-slate-900 px-1 rounded border border-gray-200 dark:border-slate-700">
                                  {f.unit}
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeInfo.color} flex items-center gap-1 flex-shrink-0`}>
                              <TypeIcon size={11} />
                              <span>{f.type}</span>
                            </span>
                          </div>
                        );
                      })}
                      {fieldsCount > 7 && (
                        <div className="text-[11px] text-center text-gray-400 italic pt-1">
                          + {fieldsCount - 7} thông số khác...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-400">
                  <span>Thứ tự: {tpl.sortOrder ?? 0}</span>
                  <button
                    onClick={() => handleOpenEditModal(tpl)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Cấu hình chi tiết</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Template with Dynamic Field Builder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    {editingTemplate ? 'Chỉnh sửa mẫu thông số kỹ thuật' : 'Tạo mẫu thông số kỹ thuật mới'}
                  </h3>
                  <p className="text-xs text-gray-500">Định nghĩa danh sách các thông số kỹ thuật áp dụng cho danh mục sản phẩm</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên mẫu thông số <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mẫu thông số Camera giám sát"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã danh mục áp dụng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="camera, network, solar-panel, inverter..."
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.map((c: any) => (
                      <option key={c.slug || c.id} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả mục đích áp dụng
                </label>
                <input
                  type="text"
                  placeholder="Áp dụng cho các sản phẩm camera IP, PTZ, Dome, Bullet..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Field Builder Header */}
              <div className="pt-3 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                      <span>Danh sách các trường thông số</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
                        {formData.fields?.length || 0}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-400">Thêm, sửa kiểu dữ liệu và định nghĩa từng trường thông số kỹ thuật</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                  >
                    <Plus size={14} />
                    <span>Thêm trường thông số</span>
                  </button>
                </div>

                {/* Fields Builder List */}
                <div className="space-y-3">
                  {formData.fields?.map((field, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-mono">
                            {idx + 1}
                          </span>
                          <span>Thông số #{idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveField(idx, 'up')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (formData.fields?.length || 1) - 1}
                            onClick={() => handleMoveField(idx, 'down')}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer ml-1"
                            title="Xóa trường này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* Name */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            Tên thông số <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Độ phân giải, Công suất..."
                            value={field.name || ''}
                            onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Key */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            Mã thuộc tính (Key)
                          </label>
                          <input
                            type="text"
                            placeholder="resolution, power..."
                            value={field.key || ''}
                            onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg font-mono text-xs text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Type */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            Kiểu dữ liệu
                          </label>
                          <select
                            value={field.type || 'text'}
                            onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white"
                          >
                            <option value="text">Văn bản (Text)</option>
                            <option value="number">Số (Number + Đơn vị)</option>
                            <option value="boolean">Có / Không (Boolean)</option>
                            <option value="select">Chọn 1 giá trị (Select)</option>
                            <option value="multi_select">Chọn nhiều giá trị</option>
                          </select>
                        </div>

                        {/* Unit */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            Đơn vị tính
                          </label>
                          <input
                            type="text"
                            placeholder="W, kW, GB, mm..."
                            value={field.unit || ''}
                            onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white"
                            list="units-list"
                          />
                        </div>
                      </div>

                      {/* If select or multi_select -> show options input */}
                      {(field.type === 'select' || field.type === 'multi_select') && (
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            Các tùy chọn (cách nhau bằng dấu phẩy)
                          </label>
                          <input
                            type="text"
                            placeholder="VD: 2.8mm, 4.0mm, 6.0mm hoặc Intel i5, Intel i7, Apple M2..."
                            value={Array.isArray(field.options) ? field.options.join(', ') : (field.options || '')}
                            onChange={(e) => handleFieldChange(idx, 'options', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      {/* Flags Checkboxes */}
                      <div className="flex items-center gap-4 text-xs pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Bắt buộc nhập</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={field.isHighlight || false}
                            onChange={(e) => handleFieldChange(idx, 'isHighlight', e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Hiện nổi bật trên thẻ tóm tắt</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={field.isFilterable !== false}
                            onChange={(e) => handleFieldChange(idx, 'isFilterable', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Cho phép lọc</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <datalist id="units-list">
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u} />
                ))}
              </datalist>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingTemplate ? 'Lưu mẫu thông số' : 'Tạo mẫu thông số'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa mẫu thông số"
        itemName={templateToDelete?.name || ''}
      />
    </div>
  );
};

export default AttributeTemplateManagement;
