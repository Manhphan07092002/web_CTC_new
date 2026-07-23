import React, { useState, useEffect } from 'react';
import { 
  Sliders, Phone, Image, Link as LinkIcon, Plus, Edit2, Trash2, ChevronUp, ChevronDown, 
  Save, RefreshCw, Eye, EyeOff, Layers, Sparkles, Check, X, MoveUp, MoveDown, Info, Zap, Lock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { Category } from '../types';

interface SubMenuItem {
  id: string;
  name: string;
  path: string;
}

interface NavItem {
  id: string;
  name: string;
  path: string;
  key?: string;
  order: number;
  submenu?: SubMenuItem[];
}

export const HeaderManagement: React.FC = () => {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'topbar' | 'logo_cta' | 'navigation'>('navigation');

  // Product categories auto-sync
  const [productCategories, setProductCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.productCategories.getAll()
      .then(data => setProductCategories(data || []))
      .catch(() => setProductCategories([]));
  }, []);

  // Form State
  const [showTopbar, setShowTopbar] = useState(true);
  const [topbarSlogan, setTopbarSlogan] = useState('');
  const [hotlineLabel, setHotlineLabel] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');

  const [logoHeader, setLogoHeader] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');

  const [navLinks, setNavLinks] = useState<NavItem[]>([]);

  // Modals state
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  // Nav Item Modal State
  const [showNavModal, setShowNavModal] = useState(false);
  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [navName, setNavName] = useState('');
  const [navPath, setNavPath] = useState('');
  const [navOrder, setNavOrder] = useState<number>(1);

  // Submenu Modal State
  const [showSubModal, setShowSubModal] = useState(false);
  const [targetNavIdForSub, setTargetNavIdForSub] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subPath, setSubPath] = useState('');

  // Confirm Delete Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    icon: 'nav' | 'sub';
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', icon: 'nav', onConfirm: () => {} });

  // Populate state from SettingsContext
  useEffect(() => {
    if (settings) {
      setShowTopbar(settings.headerShowTopbar ?? true);
      setTopbarSlogan(settings.headerSlogan || 'CTC – Nhà thầu EPC, Xây lắp điện và Giải pháp Năng lượng tái tạo tại Việt Nam');
      setHotlineLabel(settings.headerHotlineLabel || 'Hotline');
      setHotlinePhone(settings.headerHotlinePhone || settings.phone || '023 6374 5555');

      setLogoHeader(settings.logoHeader || settings.logo || '/uploads/images/logo/logodo.png');
      setCtaText(settings.headerCtaText || 'LIÊN HỆ');
      setCtaLink(settings.headerCtaLink || 'https://zalo.me/0915059666');

      if (settings.headerNavLinks && settings.headerNavLinks.length > 0) {
        setNavLinks(settings.headerNavLinks);
      } else {
        // Fallback default navigation links
        setNavLinks([
          { id: 'nav-1', name: 'Trang chủ', path: '/', key: 'home', order: 1 },
          { id: 'nav-2', name: 'Giới thiệu', path: '/about', key: 'about', order: 2 },
          { 
            id: 'nav-3', name: 'Giải pháp', path: '/solutions', key: 'solutions', order: 3,
            submenu: [
              { id: 'sub-3-1', name: 'GIẢI PHÁP TOÀN DIỆN', path: '/solutions' },
              { id: 'sub-3-2', name: 'HẠ TẦNG VIỄN THÔNG & CNTT', path: '/solutions/floating' },
              { id: 'sub-3-3', name: 'ĐIỆN MẶT TRỜI (SOLAR EPC)', path: '/solutions/rooftop' },
              { id: 'sub-3-4', name: 'ĐIỆN GIÓ (WIND POWER EPC)', path: '/solutions/farm' },
              { id: 'sub-3-5', name: 'ĐƯỜNG DÂY & TRẠM BIẾN ÁP 110KV', path: '/solutions/electrical' },
              { id: 'sub-3-6', name: 'DATA CENTER & HẠ TẦNG SỐ', path: '/solutions/datacenter' },
              { id: 'sub-3-7', name: 'XÂY DỰNG DÂN DỤNG & CÔNG NGHIỆP', path: '/solutions/construction' }
            ]
          },
          { 
            id: 'nav-4', name: 'Sản phẩm', path: '/products', key: 'products', order: 4,
            submenu: [] // Auto-synced from product categories DB
          },
          { id: 'nav-5', name: 'Dự án', path: '/projects', key: 'projects', order: 5 },
          { id: 'nav-6', name: 'Tin tức', path: '/news', key: 'news', order: 6 },
          { id: 'nav-7', name: 'Tài liệu', path: '/resources', key: 'resources', order: 7 },
          { id: 'nav-8', name: 'Liên hệ', path: '/contact', key: 'contact', order: 8 }
        ]);
      }
    }
  }, [settings]);

  // Handle Save All Settings
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings({
        headerShowTopbar: showTopbar,
        headerSlogan: topbarSlogan,
        headerHotlineLabel: hotlineLabel,
        headerHotlinePhone: hotlinePhone,
        logoHeader: logoHeader,
        headerCtaText: ctaText,
        headerCtaLink: ctaLink,
        headerNavLinks: navLinks
      });
      showToast('Đã lưu cấu hình Header thành công!', 'success');
      await refreshSettings();
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình Header:', error);
      showToast('Lỗi khi lưu cấu hình Header. Vui lòng thử lại!', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Nav Links Handlers
  const handleOpenAddNavModal = () => {
    setEditingNavId(null);
    setNavName('');
    setNavPath('');
    setNavOrder(navLinks.length + 1);
    setShowNavModal(true);
  };

  const handleOpenEditNavModal = (item: NavItem) => {
    setEditingNavId(item.id);
    setNavName(item.name);
    setNavPath(item.path);
    setNavOrder(item.order);
    setShowNavModal(true);
  };

  const handleSaveNav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navName.trim() || !navPath.trim()) {
      showToast('Vui lòng nhập tên và đường dẫn menu!', 'warning');
      return;
    }

    const clampedOrder = Math.max(1, Math.min(navOrder, editingNavId ? navLinks.length : navLinks.length + 1));

    if (editingNavId) {
      // Edit existing: remove item, reinsert at new order position
      setNavLinks(prev => {
        const filtered = prev.filter(item => item.id !== editingNavId);
        const editedItem = prev.find(item => item.id === editingNavId)!;
        const updated = { ...editedItem, name: navName.trim(), path: navPath.trim() };
        filtered.splice(clampedOrder - 1, 0, updated);
        return filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
      showToast('Đã cập nhật menu!', 'info');
    } else {
      // Add new at specified order position
      const newItem: NavItem = {
        id: `nav-${Date.now()}`,
        name: navName.trim(),
        path: navPath.trim(),
        order: clampedOrder,
        submenu: []
      };
      setNavLinks(prev => {
        const updated = [...prev];
        updated.splice(clampedOrder - 1, 0, newItem);
        return updated.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
      showToast('Đã thêm menu mới!', 'success');
    }

    setShowNavModal(false);
  };

  const handleDeleteNav = (id: string) => {
    const item = navLinks.find(n => n.id === id);
    setConfirmModal({
      show: true,
      title: 'Xóa Menu Chính',
      message: `Xóa "${item?.name || 'menu'}" và toàn bộ ${item?.submenu?.length || 0} menu con bên trong?`,
      icon: 'nav',
      onConfirm: () => {
        setNavLinks(prev => prev.filter(n => n.id !== id));
        showToast('Đã xóa menu!', 'info');
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === navLinks.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newLinks = [...navLinks];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;
    
    // Update order values
    newLinks.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setNavLinks(newLinks);
  };

  // Submenu Handlers
  const handleOpenAddSubModal = (navId: string) => {
    setTargetNavIdForSub(navId);
    setEditingSubId(null);
    setSubName('');
    setSubPath('');
    setShowSubModal(true);
  };

  const handleOpenEditSubModal = (navId: string, subItem: SubMenuItem) => {
    setTargetNavIdForSub(navId);
    setEditingSubId(subItem.id);
    setSubName(subItem.name);
    setSubPath(subItem.path);
    setShowSubModal(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subPath.trim() || !targetNavIdForSub) {
      showToast('Vui lòng nhập tên và đường dẫn menu con!', 'warning');
      return;
    }

    setNavLinks(prev => prev.map(item => {
      if (item.id !== targetNavIdForSub) return item;

      const currentSub = item.submenu || [];
      if (editingSubId) {
        // Edit existing sub
        return {
          ...item,
          submenu: currentSub.map(sub => 
            sub.id === editingSubId ? { ...sub, name: subName.trim(), path: subPath.trim() } : sub
          )
        };
      } else {
        // Add new sub
        const newSubItem: SubMenuItem = {
          id: `sub-${Date.now()}`,
          name: subName.trim(),
          path: subPath.trim()
        };
        return {
          ...item,
          submenu: [...currentSub, newSubItem]
        };
      }
    }));

    showToast(editingSubId ? 'Đã cập nhật menu con!' : 'Đã thêm menu con mới!', 'success');
    setShowSubModal(false);
  };

  const handleDeleteSub = (navId: string, subId: string) => {
    const nav = navLinks.find(n => n.id === navId);
    const sub = nav?.submenu?.find(s => s.id === subId);
    setConfirmModal({
      show: true,
      title: 'Xóa Menu Con',
      message: `Xóa menu con "${sub?.name || 'menu con'}" khỏi danh sách?`,
      icon: 'sub',
      onConfirm: () => {
        setNavLinks(prev => prev.map(item => {
          if (item.id !== navId) return item;
          return {
            ...item,
            submenu: (item.submenu || []).filter(s => s.id !== subId)
          };
        }));
        showToast('Đã xóa menu con!', 'info');
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Sliders className="text-primary" size={26} />
            Quản Lý Header Hệ Thống
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Tùy chỉnh linh hoạt Topbar thông báo, số điện thoại Hotline, Logo, Menu điều hướng và Nút liên hệ CTA
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('navigation')}
          className={`pb-3 px-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'navigation'
              ? 'border-primary text-primary dark:text-sky-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Layers size={18} />
          Menu Điều Hướng Chính ({navLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('topbar')}
          className={`pb-3 px-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'topbar'
              ? 'border-primary text-primary dark:text-sky-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Phone size={18} />
          Topbar & Hotline
        </button>
        <button
          onClick={() => setActiveTab('logo_cta')}
          className={`pb-3 px-2 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'logo_cta'
              ? 'border-primary text-primary dark:text-sky-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Image size={18} />
          Logo & Nút Liên Hệ CTA
        </button>
      </div>

      {/* TAB 1: MENU NAVIGATION */}
      {activeTab === 'navigation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-blue-50 dark:bg-sky-950/40 p-4 rounded-xl border border-blue-200 dark:border-sky-900/50">
            <div className="flex items-center gap-3">
              <Info className="text-blue-600 dark:text-sky-400" size={20} />
              <span className="text-sm font-medium text-blue-900 dark:text-sky-200">
                Thêm, sửa, xóa hoặc thay đổi thứ tự hiển thị các danh mục menu chính và các danh mục menu con sổ xuống (dropdown).
              </span>
            </div>
            <button
              onClick={handleOpenAddNavModal}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-secondary transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={18} />
              Thêm Menu Mới
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 font-bold text-sm text-gray-700 dark:text-slate-200 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-center">Thứ tự</div>
              <div className="col-span-4">Tên Menu</div>
              <div className="col-span-4">Đường Dẫn (URL)</div>
              <div className="col-span-3 text-right">Thao Tác</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {navLinks.map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Move Up/Down Order */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMoveNav(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20"
                        title="Di chuyển lên"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span className="font-mono text-xs font-bold text-gray-500 dark:text-slate-400">{index + 1}</span>
                      <button
                        onClick={() => handleMoveNav(index, 'down')}
                        disabled={index === navLinks.length - 1}
                        className="p-1 text-gray-400 hover:text-primary disabled:opacity-20"
                        title="Di chuyển xuống"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    {/* Nav Name */}
                    <div className="col-span-4">
                      <span className="font-bold text-gray-800 dark:text-white text-base">{item.name}</span>
                      {item.submenu && item.submenu.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-sky-950 text-blue-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-sky-800">
                          {item.submenu.length} menu con
                        </span>
                      )}
                    </div>

                    {/* Nav Path */}
                    <div className="col-span-4">
                      <code className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-1 rounded font-mono border border-gray-200 dark:border-slate-700">
                        {item.path}
                      </code>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {item.key === 'products' ? (
                        // Products submenu is auto-synced from product categories - no manual sub add
                        <span className="text-xs bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-bold px-2.5 py-1.5 rounded-lg border border-violet-200 dark:border-violet-800/50 flex items-center gap-1.5">
                          <Zap size={13} />
                          Tự động sync
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenAddSubModal(item.id)}
                          className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus size={14} />
                          Thêm Menu Con
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditNavModal(item)}
                        className="p-1.5 text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Sửa menu chính"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNav(item.id)}
                        className="p-1.5 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Xóa menu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Render Submenus */}
                  {item.key === 'products' ? (
                    // Auto-synced from product categories
                    <div className="mt-3 ml-12 pl-4 border-l-2 border-violet-400/40 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={13} className="text-violet-500" />
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          Tự động lấy từ Quản lý Danh mục Sản phẩm
                        </span>
                        <span className="text-xs text-violet-500/70 dark:text-violet-500">({productCategories.length} danh mục)</span>
                      </div>
                      {productCategories.length === 0 ? (
                        <div className="text-xs text-gray-400 dark:text-slate-500 italic px-2 py-2">
                          Chưa có danh mục sản phẩm nào — Thêm tại trang Quản lý Danh mục
                        </div>
                      ) : (
                        productCategories.map(cat => (
                          <div key={cat.id} className="flex items-center justify-between bg-violet-50/60 dark:bg-violet-950/30 p-2.5 rounded-xl border border-violet-100 dark:border-violet-900/50 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                              <span className="font-semibold text-gray-800 dark:text-slate-200">{cat.name.toUpperCase()}</span>
                              <code className="text-xs text-gray-500 dark:text-slate-400 font-mono">(/products?cat={cat.name.toLowerCase()})</code>
                            </div>
                            <Lock size={13} className="text-violet-400 dark:text-violet-500 flex-shrink-0" title="Quản lý tại trang Danh mục Sản phẩm" />
                          </div>
                        ))
                      )}
                    </div>
                  ) : item.submenu && item.submenu.length > 0 ? (
                    // Manual submenus
                    <div className="mt-3 ml-12 pl-4 border-l-2 border-primary/30 space-y-2">
                      {item.submenu.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-700/60 text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="font-semibold text-gray-800 dark:text-slate-200">{sub.name}</span>
                            <code className="text-xs text-gray-500 dark:text-slate-400 font-mono">({sub.path})</code>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditSubModal(item.id, sub)}
                              className="p-1 text-blue-600 dark:text-sky-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Sửa menu con"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(item.id, sub.id)}
                              className="p-1 text-red-600 dark:text-rose-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Xóa menu con"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOPBAR & HOTLINE */}
      {activeTab === 'topbar' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
          {/* Toggle Topbar */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                {showTopbar ? <Eye className="text-emerald-500" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
                Hiển Thị Thanh Topbar Trên Cùng
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Bật/Tắt thanh thông báo mỏng nằm trên cùng của website
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showTopbar}
                onChange={(e) => setShowTopbar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Slogan Text */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 dark:text-white">
              Dòng Khẩu Hiệu / Slogan Thông Báo Topbar
            </label>
            <input
              type="text"
              value={topbarSlogan}
              onChange={(e) => setTopbarSlogan(e.target.value)}
              placeholder="VD: CTC – Nhà thầu EPC, Xây lắp điện và Giải pháp Năng lượng tái tạo tại Việt Nam"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Hotline Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-white">
                Nhãn Hotline (Hotline Label)
              </label>
              <input
                type="text"
                value={hotlineLabel}
                onChange={(e) => setHotlineLabel(e.target.value)}
                placeholder="Hotline"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-white">
                Số Điện Thoại Hotline Hiển Thị
              </label>
              <input
                type="text"
                value={hotlinePhone}
                onChange={(e) => setHotlinePhone(e.target.value)}
                placeholder="023 6374 5555"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGO & NÚT CTA */}
      {activeTab === 'logo_cta' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
          {/* Header Logo */}
          <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-slate-800">
            <label className="block text-sm font-bold text-gray-800 dark:text-white">
              Ảnh Logo Trang Header
            </label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-20 bg-slate-950/80 p-2 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                <img src={logoHeader} alt="Header Logo" className="max-h-full object-contain" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoHeader}
                    onChange={(e) => setLogoHeader(e.target.value)}
                    placeholder="/uploads/images/logo/logodo.png"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLogoPicker(true)}
                    className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Image size={16} />
                    Chọn Ảnh
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Khuyến nghị ảnh định dạng PNG nền trong suốt (Transparent) kích thước 180x60px.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-white">
                Tên Nút Hành Động CTA (Nút Xanh)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="LIÊN HỆ"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800 dark:text-white">
                Đường Dẫn Liên Kết (Link URL)
              </label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="https://zalo.me/0915059666 hoặc /contact"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Main Nav Item */}
      {showNavModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                {editingNavId ? 'Chỉnh Sửa Menu Chính' : 'Thêm Menu Chính Mới'}
              </h3>
              <button onClick={() => setShowNavModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNav} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Tên Menu</label>
                <input
                  type="text"
                  value={navName}
                  onChange={(e) => setNavName(e.target.value)}
                  placeholder="VD: Dịch vụ"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Đường Dẫn (URL)</label>
                <input
                  type="text"
                  value={navPath}
                  onChange={(e) => setNavPath(e.target.value)}
                  placeholder="VD: /services hoặc https://..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">
                  Thứ Tự Hiển Thị
                  <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-slate-500">
                    (1 = đầu tiên, {editingNavId ? navLinks.length : navLinks.length + 1} = cuối cùng)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={editingNavId ? navLinks.length : navLinks.length + 1}
                    value={navOrder}
                    onChange={(e) => setNavOrder(Number(e.target.value))}
                    required
                    className="w-24 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm text-center font-bold"
                  />
                  <div className="flex gap-1">
                    {Array.from({ length: editingNavId ? navLinks.length : navLinks.length + 1 }, (_, i) => i + 1).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setNavOrder(pos)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          navOrder === pos
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                  Menu sẽ được chèn vào vị trí thứ <strong className="text-primary">{navOrder}</strong> trong danh sách điều hướng.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNavModal(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl shadow-md"
                >
                  Lưu Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Submenu Item */}
      {showSubModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                {editingSubId ? 'Chỉnh Sửa Menu Con' : 'Thêm Menu Con Mới'}
              </h3>
              <button onClick={() => setShowSubModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Tên Menu Con</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="VD: ĐIỆN MẶT TRỜI MÁI NHÀ"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Đường Dẫn (URL)</label>
                <input
                  type="text"
                  value={subPath}
                  onChange={(e) => setSubPath(e.target.value)}
                  placeholder="VD: /solutions/rooftop"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-secondary rounded-xl shadow-md"
                >
                  Lưu Menu Con
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Delete Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            {/* Top danger stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />

            <div className="p-6 space-y-5">
              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
                  <Trash2 size={22} className="text-red-500 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                    {confirmModal.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              {/* Warning note */}
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl px-4 py-3">
                <Info size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-rose-400 font-medium">
                  Hành động này không thể hoàn tác sau khi xác nhận.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl shadow-md shadow-red-500/20 transition-all hover:shadow-red-500/30 hover:scale-[1.02] active:scale-95"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Picker Modal for Logo */}
      <FilePickerModal
        isOpen={showLogoPicker}
        onClose={() => setShowLogoPicker(false)}
        onSelect={(fileUrl) => {
          setLogoHeader(fileUrl);
          setShowLogoPicker(false);
        }}
      />
    </div>
  );
};

export default HeaderManagement;
