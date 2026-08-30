import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag, Grid, Layers, FolderOpen, CornerDownRight, FolderPlus, FolderTree, ChevronDown, ChevronRight, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PermissionGate } from '../contexts/PermissionContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { flattenCategoryTreeForSelect, buildCategoryTree, CategoryNode } from '../utils/categoryTreeHelper';
import { Category } from '../types';

interface CategoryTreeItemProps {
  node: CategoryNode;
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
  onAddSub: (parentId: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  getItemCountLabel: (cat: Category) => string;
}

const RecursiveCategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  node,
  expandedNodes,
  toggleNode,
  onAddSub,
  onEdit,
  onDelete,
  getItemCountLabel
}) => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/60 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div 
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center gap-1.5 min-w-0 flex-1 select-none ${hasChildren ? 'cursor-pointer group' : ''}`}
        >
          {/* Toggle Chevron for items with children */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 -ml-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Thu gọn danh mục con' : 'Bấm để mở rộng danh mục con'}
            >
              {isExpanded ? (
                <ChevronDown size={15} className="text-sky-500 font-bold transition-transform" />
              ) : (
                <ChevronRight size={15} className="text-slate-400 group-hover:text-sky-500 transition-transform" />
              )}
            </button>
          ) : (
            <span className="text-xs font-bold text-slate-300 dark:text-slate-600 font-mono w-4 text-center">
              {node.level === 2 ? '↳' : node.level === 3 ? '└' : '•'}
            </span>
          )}

          <span className="text-sm flex-shrink-0">{node.icon || '📁'}</span>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`font-bold text-xs text-gray-800 dark:text-gray-100 truncate ${hasChildren ? 'group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors' : ''}`}>
                {node.name}
              </h4>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                node.level === 2 ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300' :
                node.level === 3 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' :
                'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
              }`}>
                Cấp {node.level}
              </span>
              {hasChildren && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {node.children.length} danh mục con {isExpanded ? '▼' : '▶'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono block truncate">{node.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            {getItemCountLabel(node)}
          </span>
          <PermissionGate permission="manage_product_categories">
            <button
              onClick={() => onAddSub(node.id)}
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
              title={`Thêm danh mục con cấp ${node.level + 1}`}
            >
              <FolderPlus size={13} />
              <span className="text-[10px] hidden sm:inline">+ Cấp {node.level + 1}</span>
            </button>
            <button
              onClick={() => onEdit(node)}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Sửa"
            >
              <Edit size={13} />
            </button>
            <button
              onClick={() => onDelete(node)}
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 size={13} />
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Recursive children rendering ONLY when expanded */}
      {hasChildren && isExpanded && (
        <div className="pl-3 sm:pl-4 pt-1.5 space-y-2 border-l-2 border-slate-200/80 dark:border-slate-700/50 mt-1">
          {node.children.map(childNode => (
            <RecursiveCategoryTreeItem
              key={childNode.id}
              node={childNode}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onAddSub={onAddSub}
              onEdit={onEdit}
              onDelete={onDelete}
              getItemCountLabel={getItemCountLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type CategoryType = 'product' | 'news' | 'project' | 'document';

const CategoryManagement: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<CategoryType>('product');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    order: 0,
    isActive: true,
    parentId: ''
  });

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      let data: Category[] = [];
      switch (activeTab) {
        case 'product':
          data = await api.productCategories.getAll();
          break;
        case 'news':
          data = await api.newsCategories.getAll();
          break;
        case 'project':
          data = await api.projectCategories.getAll();
          break;
        case 'document':
          data = await api.documentCategories.getAdmin();
          break;
      }
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showToast('Lỗi khi tải danh mục', 'error');
    }
    setLoading(false);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAdd = (parentIdParam: string = '') => {
    setEditingCategory(null);
    const parentCat = categories.find(c => c.id === parentIdParam);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: parentCat?.icon || '',
      color: parentCat?.color || '#3B82F6',
      order: categories.length,
      isActive: true,
      parentId: parentIdParam
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      order: category.order || 0,
      isActive: category.isActive !== false,
      parentId: category.parentId || ''
    });
    setIsModalOpen(true);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({
    isOpen: false,
    category: null
  });

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({
      isOpen: true,
      category
    });
  };

  const handleConfirmDelete = async () => {
    const category = deleteConfirm.category;
    if (!category) return;

    try {
      switch (activeTab) {
        case 'product':
          await api.productCategories.delete(category.id);
          break;
        case 'news':
          await api.newsCategories.delete(category.id);
          break;
        case 'project':
          await api.projectCategories.delete(category.id);
          break;
        case 'document':
          await api.documentCategories.delete(category.id);
          break;
      }
      showToast(`Đã xóa danh mục "${category.name}" thành công!`, 'success');
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.message || 'Lỗi khi xóa danh mục';
      showToast(errorMessage, 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, category: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    const slug = formData.slug || generateSlug(formData.name);
    const dataToSave = { 
      ...formData, 
      slug,
      parentId: formData.parentId || undefined
    };

    try {
      if (editingCategory) {
        switch (activeTab) {
          case 'product':
            await api.productCategories.update(editingCategory.id, dataToSave);
            break;
          case 'news':
            await api.newsCategories.update(editingCategory.id, dataToSave);
            break;
          case 'project':
            await api.projectCategories.update(editingCategory.id, dataToSave);
            break;
          case 'document':
            await api.documentCategories.update(editingCategory.id, dataToSave);
            break;
        }
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        switch (activeTab) {
          case 'product':
            await api.productCategories.create(dataToSave);
            break;
          case 'news':
            await api.newsCategories.create(dataToSave);
            break;
          case 'project':
            await api.projectCategories.create(dataToSave);
            break;
          case 'document':
            await api.documentCategories.create(dataToSave);
            break;
        }
        showToast('Thêm danh mục thành công!', 'success');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.message || 'Lỗi khi lưu danh mục';
      showToast(errorMessage, 'error');
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name)
    });
  };

  // Set of node IDs that are expanded (Mặc định thu gọn tất cả để giao diện gọn gàng)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(c => c.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const tabs = [
    { id: 'product' as CategoryType, label: 'Sản phẩm', icon: Grid },
    { id: 'project' as CategoryType, label: 'Dự án', icon: Tag },
    { id: 'news' as CategoryType, label: 'Tin tức', icon: Layers },
    { id: 'document' as CategoryType, label: 'Thể loại tài liệu', icon: FolderOpen }
  ];

  // Organize parent and sub categories
  const parentCategories = categories.filter(c => !c.parentId);
  const getSubCategories = (parentId: string) => categories.filter(c => c.parentId === parentId);
  const orphanSubCategories = categories.filter(c => c.parentId && !categories.some(p => p.id === c.parentId));

  const getItemCountLabel = (cat: Category) => {
    if (activeTab === 'product') return `${cat.productCount || 0} sản phẩm`;
    if (activeTab === 'news') return `${cat.newsCount || 0} tin tức`;
    if (activeTab === 'project') return `${cat.projectCount || 0} dự án`;
    return `${cat.resourceCount || 0} tài liệu`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FolderTree className="text-primary" size={32} />
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Phân cấp danh mục chính & danh mục con cho sản phẩm, dự án, tin tức</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={expandAll}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-slate-200/60 dark:border-slate-700"
            title="Mở rộng toàn bộ cây danh mục"
          >
            <ChevronsUpDown size={14} className="text-sky-500" />
            <span>Mở rộng tất cả</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-slate-200/60 dark:border-slate-700"
            title="Thu gọn toàn bộ cây danh mục"
          >
            <ChevronsDownUp size={14} className="text-amber-500" />
            <span>Thu gọn tất cả</span>
          </button>
          <PermissionGate permission="manage_product_categories">
            <button
              onClick={() => handleAdd('')}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium flex items-center gap-2 shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Plus size={18} />
              Thêm danh mục chính
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-1.5 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Đang tải danh mục...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800/90 rounded-xl border border-gray-100 dark:border-slate-700/60">
          <Tag size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có danh mục nào</p>
          <button
            onClick={() => handleAdd('')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium shadow-sm"
          >
            Thêm danh mục đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Parent Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buildCategoryTree(categories).map((parentCategory) => {
              const isCardExpanded = expandedNodes.has(parentCategory.id);
              const childrenCount = parentCategory.children?.length || 0;

              return (
                <div
                  key={parentCategory.id}
                  className={`bg-white dark:bg-slate-800/90 rounded-2xl shadow-sm border-2 p-5 hover:shadow-md transition-all flex flex-col justify-between ${
                    parentCategory.isActive !== false 
                      ? 'border-gray-100 dark:border-slate-700/60' 
                      : 'border-gray-200 dark:border-slate-700 opacity-60'
                  }`}
                  style={{ borderLeftColor: parentCategory.color || '#3B82F6', borderLeftWidth: '5px' }}
                >
                  <div>
                    {/* Header line - Clickable to expand/collapse */}
                    <div 
                      onClick={() => toggleNode(parentCategory.id)}
                      className="flex items-start justify-between mb-3 p-2 -m-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(parentCategory.id);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-primary/20 flex items-center justify-center text-slate-500 hover:text-primary transition-colors flex-shrink-0"
                          title={isCardExpanded ? 'Thu gọn danh mục con' : 'Bấm để mở rộng danh mục con'}
                        >
                          {isCardExpanded ? (
                            <ChevronDown size={18} className="text-primary font-bold transition-transform" />
                          ) : (
                            <ChevronRight size={18} className="text-slate-400 group-hover:text-primary transition-transform" />
                          )}
                        </button>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: parentCategory.color || '#3B82F6' }}
                        >
                          {parentCategory.icon || '📂'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base truncate group-hover:text-primary transition-colors" title={parentCategory.name}>
                              {parentCategory.name}
                            </h3>
                            <span className="text-[10px] uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-black">
                              Cấp 1
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                              {childrenCount} danh mục con {isCardExpanded ? '▼' : '▶'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{parentCategory.slug}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <PermissionGate permission="manage_product_categories">
                          <button
                            onClick={() => handleAdd(parentCategory.id)}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                            title="Thêm danh mục con vào đây"
                          >
                            <FolderPlus size={16} />
                            <span className="hidden sm:inline">+ Cấp 2</span>
                          </button>
                          <button
                            onClick={() => handleEdit(parentCategory)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                            title="Sửa danh mục chính"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(parentCategory)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                            title="Xóa danh mục chính"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>

                    {parentCategory.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 my-3 line-clamp-2 leading-relaxed">
                        {parentCategory.description}
                      </p>
                    )}

                    {/* Sub categories recursive tree list with Accordion header */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div 
                        onClick={() => toggleNode(parentCategory.id)}
                        className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 p-2 -mx-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-700/50 cursor-pointer select-none transition-colors group mb-2"
                        title={isCardExpanded ? 'Bấm để thu gọn danh mục con' : 'Bấm để mở rộng danh mục con'}
                      >
                        <span className="flex items-center gap-2">
                          {isCardExpanded ? (
                            <ChevronDown size={16} className="text-primary font-bold transition-transform" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-primary transition-transform" />
                          )}
                          <span className="font-bold text-gray-800 dark:text-gray-100">
                            Danh mục con ({childrenCount})
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {isCardExpanded ? '• Bấm để thu gọn' : '• Bấm để mở rộng Cấp 2'}
                          </span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(parentCategory.id);
                          }}
                          className="text-primary hover:underline text-[11px] font-bold cursor-pointer"
                        >
                          + Thêm mới
                        </button>
                      </div>

                      {isCardExpanded && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          {(!parentCategory.children || parentCategory.children.length === 0) ? (
                            <p className="text-xs italic text-gray-400 dark:text-gray-500 py-2 pl-2">
                              Chưa có danh mục con. Bấm "+ Danh mục con" để chia nhỏ danh mục này.
                            </p>
                          ) : (
                            parentCategory.children.map((subNode) => (
                              <RecursiveCategoryTreeItem
                                key={subNode.id}
                                node={subNode}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                                onAddSub={handleAdd}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                getItemCountLabel={getItemCountLabel}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-gray-100 dark:border-slate-700/50">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">
                      Tổng: {getItemCountLabel(parentCategory)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      parentCategory.isActive !== false
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {parentCategory.isActive !== false ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Orphan sub categories if any */}
          {orphanSubCategories.length > 0 && (
            <div className="mt-8 bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                <CornerDownRight size={16} /> Danh mục con tự do (Chưa gán danh mục chính):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphanSubCategories.map(cat => (
                  <div key={cat.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{cat.slug}</p>
                    </div>
                    <button onClick={() => handleEdit(cat)} className="text-xs text-blue-600 font-bold hover:underline">
                      Gán danh mục cha
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 border border-transparent dark:border-slate-700 text-gray-800 dark:text-gray-100">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <FolderTree size={20} className="text-primary" />
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Select Parent Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phân cấp danh mục (Danh mục cha)
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium"
                >
                  <option value="">📁 Không có (Tạo làm Danh mục chính Cấp 1)</option>
                  {flattenCategoryTreeForSelect(categories)
                    .filter(item => item.id !== editingCategory?.id)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.indentName} (Cấp {item.level})
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-primary font-medium mt-1">
                  {formData.parentId 
                    ? `👉 Sẽ tạo danh mục con nằm trong: "${parentCategories.find(c => c.id === formData.parentId)?.name}"`
                    : '👉 Sẽ tạo làm Danh mục chính cấp 1'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder={formData.parentId ? "VD: Tấm pin Solar N-Type (Danh mục con)" : "VD: Thiết Bị Điện Mặt Trời (Danh mục chính)"}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                  placeholder="tam-pin-solar-n-type"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tự động tạo nếu để trống</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Icon/Emoji</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-2xl"
                    placeholder="🔋"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Màu sắc</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-11 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-secondary font-medium shadow-sm cursor-pointer"
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        itemName={deleteConfirm.category?.name}
        itemType="category"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirm.category?.name}"?`}
        warningText={getSubCategories(deleteConfirm.category?.id || '').length > 0 
          ? `⚠️ Danh mục này có ${getSubCategories(deleteConfirm.category?.id || '').length} danh mục con! Các danh mục con sẽ chuyển thành danh mục tự do.` 
          : "Các sản phẩm / dự án / bài viết nằm trong danh mục này sẽ không bị xóa."}
        confirmText="Đồng ý xóa"
      />
    </div>
  );
};

export default CategoryManagement;
