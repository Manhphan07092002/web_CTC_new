import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, X, Image as ImageIcon, Plus, Trash2, Star, Sparkles, 
  Flame, FileText, Sliders, Box, ShieldCheck, Search, Tag, 
  Layers, Package, CheckCircle, Info, DollarSign, Upload, 
  ExternalLink, ArrowUp, ArrowDown, Copy, RotateCcw, AlertTriangle,
  FolderOpen, Globe, Cpu, Check, HelpCircle
} from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { chatService } from '../services/chatService';
import UnsavedChangesModal from './components/UnsavedChangesModal';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import { 
  Product, Brand, AttributeTemplate, AttributeField, 
  ProductSpecification, ProductDocument, ProductVariant, 
  ProductWarehouse, ProductWarrantyDetails 
} from '../types';

const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
import SeoAnalyzer from './components/SeoAnalyzer';
import AiProductWriterModal from './components/AiProductWriterModal';
import { formatSeoProductHtml } from './utils/seoProductFormatter';
import { safeParseJson } from './utils/jsonParser';
import { flattenCategoryTreeForSelect } from '../utils/categoryTreeHelper';
import SearchableCategorySelect from './components/SearchableCategorySelect';
import SearchableBrandSelect from './components/SearchableBrandSelect';

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

type FormTab = 
  | 'basic'
  | 'pricing'
  | 'media'
  | 'description'
  | 'specs'
  | 'variants'
  | 'inventory'
  | 'warranty'
  | 'seo';

const TABS: { id: FormTab; label: string; icon: any; badge?: string }[] = [
  { id: 'basic', label: '1. Thông tin cơ bản', icon: Info },
  { id: 'pricing', label: '2. Giá & Bán hàng', icon: DollarSign },
  { id: 'media', label: '3. Hình ảnh & Tài liệu', icon: ImageIcon },
  { id: 'description', label: '4. Mô tả & Trợ lý AI', icon: FileText },
  { id: 'specs', label: '5. Thông số kỹ thuật', icon: Sliders },
  { id: 'variants', label: '6. Phiên bản / Biến thể', icon: Layers },
  { id: 'inventory', label: '7. Kho hàng', icon: Box },
  { id: 'warranty', label: '8. Bảo hành & Huy hiệu', icon: ShieldCheck },
  { id: 'seo', label: '9. SEO & Google Preview', icon: Search },
];

const POPULAR_UNITS = ['Cái', 'Bộ', 'Chiếc', 'Tấm', 'Mét', 'Cuộn', 'Hộp', 'Thùng', 'Gói', 'Kwh'];
const POPULAR_ORIGINS = ['Việt Nam', 'Trung Quốc', 'Đức', 'Nhật Bản', 'Đài Loan', 'Mỹ', 'Hàn Quốc', 'Ý', 'Thụy Sĩ', 'Áo', 'Israel'];

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);

  // File Picker State
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState<'main' | 'document' | number>('main');
  const [docPickerIndex, setDocPickerIndex] = useState<number | null>(null);

  // AI Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Focus keyword for SEO
  const [focusKeyword, setFocusKeyword] = useState('');

  // Main Form Data State
  const initialFormState = {
    // 1. Basic Info
    name: '',
    slug: '',
    categoryId: '',
    category: '',
    categoryLabel: '',
    brandId: '',
    brand: '',
    model: '',
    code: '', // sku
    partNumber: '',
    origin: '',
    unit: 'Cái',
    status: 'published' as 'published' | 'draft' | 'archived',

    // 2. Pricing
    price: '',
    originalPrice: '',
    vat: 0 as number | string,
    contactPrice: false,
    
    // 3. Media & Documents
    image: '',
    images: [] as string[],
    videos: [] as string[],
    documents: [] as ProductDocument[],

    // 4. Description
    shortDescription: '',
    description: '',
    specifications: '',
    features: [''] as string[],

    // 5. Dynamic Specifications
    specificationsList: [] as ProductSpecification[],
    technicalSpecs: {} as { [key: string]: string },

    // 6. Variants
    variants: [] as ProductVariant[],

    // 7. Inventory
    stock: 0,
    stockStatus: 'in_stock' as 'in_stock' | 'out_of_stock' | 'pre_order' | 'contact',
    warehouses: [] as ProductWarehouse[],

    // 8. Warranty & Badges
    warranty: '24 tháng chính hãng',
    warrantyDetails: {
      hasWarranty: true,
      period: '24 tháng',
      unit: 'month',
      type: 'hang' as 'hang' | 'ctc' | 'online',
      coverage: 'Bảo hành phần cứng và đổi mới trong 30 ngày nếu lỗi do NSX'
    } as ProductWarrantyDetails,
    isFeatured: false,
    featuredOrder: 0,
    isNew: false,
    isHot: false,
    badge: '',

    // 9. SEO
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',

    // Legacy fields (kept for backward compatibility)
    power: 0,
    efficiency: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const { showUnsavedModal, setShowUnsavedModal, setBaseline, confirmNavigation } = useUnsavedChanges(formData, loading);

  // Load initial data: Categories, Brands, Templates
  useEffect(() => {
    loadMeta();
    if (isEdit && id) {
      loadProduct(id);
    } else {
      setBaseline(initialFormState);
    }
  }, [id]);

  const loadMeta = async () => {
    try {
      const [catsData, brandsData, tplsData] = await Promise.all([
        api.productCategories.getAll().catch(() => []),
        api.brands.getAll(true).catch(() => []),
        api.attributeTemplates.getAll(true).catch(() => [])
      ]);

      if (Array.isArray(catsData)) setCategories(catsData);
      if (Array.isArray(brandsData)) setBrands(brandsData);
      if (Array.isArray(tplsData)) setTemplates(tplsData);
    } catch (error) {
      console.error('Error loading meta:', error);
    }
  };

  const formatPriceInput = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val).trim();
    if (!str) return '';
    const digits = str.replace(/\D/g, '');
    if (!digits) return str;
    return Number(digits).toLocaleString('en-US');
  };

  const handlePriceChange = (field: 'price' | 'originalPrice', value: string) => {
    const formatted = formatPriceInput(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !isEdit || prev.slug === generateSlug(prev.name || '') 
        ? generateSlug(name) 
        : prev.slug,
      focusKeyword: !prev.focusKeyword ? name.toLowerCase().trim() : prev.focusKeyword
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const selected = categories.find(c => c.id === categoryId);
    const categorySlug = selected?.slug || '';
    const categoryLabel = selected?.name || '';

    setFormData(prev => ({
      ...prev,
      categoryId,
      category: categorySlug,
      categoryLabel
    }));

    // Auto-suggest attribute template if current specs list is empty
    if (formData.specificationsList.length === 0) {
      applyTemplateForCategory(categorySlug);
    }
  };

  const handleBrandChange = (brandId: string) => {
    const selected = brands.find(b => (b.id || (b as any)._id) === brandId);
    setFormData(prev => ({
      ...prev,
      brandId,
      brand: selected?.name || prev.brand,
      origin: selected?.country || selected?.origin || prev.origin
    }));
  };

  // Apply Attribute Template to Specs List
  const applyTemplateForCategory = (catSlug: string) => {
    if (!catSlug) return;
    const match = templates.find(t => 
      (t.category && t.category.toLowerCase() === catSlug.toLowerCase()) || 
      (t.categoryId && t.categoryId.toLowerCase() === catSlug.toLowerCase()) ||
      (t.category && catSlug.toLowerCase().includes(t.category.toLowerCase()))
    );

    if (match && Array.isArray(match.fields) && match.fields.length > 0) {
      const newSpecs: ProductSpecification[] = match.fields.map(f => ({
        name: f.name,
        key: f.key,
        value: (formData.technicalSpecs && formData.technicalSpecs[f.name]) || (formData.technicalSpecs && formData.technicalSpecs[f.key]) || '',
        unit: f.unit || '',
        type: f.type || 'text',
        isHighlight: f.isHighlight || false
      }));

      setFormData(prev => ({
        ...prev,
        specificationsList: newSpecs
      }));
      showToast(`Đã tự động áp dụng mẫu thông số "${match.name}"!`, 'info');
    }
  };

  const handleApplyTemplate = (tpl: AttributeTemplate) => {
    if (!tpl.fields || tpl.fields.length === 0) return;

    const existingMap = new Map<string, ProductSpecification>();
    formData.specificationsList.forEach(s => existingMap.set(s.key || s.name, s));

    const newSpecs: ProductSpecification[] = tpl.fields.map(f => {
      const existing = existingMap.get(f.key) || existingMap.get(f.name);
      return {
        name: f.name,
        key: f.key,
        value: existing?.value || '',
        unit: f.unit || existing?.unit || '',
        type: f.type || 'text',
        isHighlight: f.isHighlight || false
      };
    });

    setFormData(prev => ({
      ...prev,
      specificationsList: newSpecs
    }));
    showToast(`Đã áp dụng mẫu thông số "${tpl.name}"!`, 'success');
  };

  // Load Existing Product
  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const p = await api.products.getById(productId);
      const loadedKw = p.focusKeyword || '';
      setFocusKeyword(loadedKw);

      // Reconstruct specificationsList from technicalSpecs if empty
      let specsList: ProductSpecification[] = Array.isArray(p.specificationsList) && p.specificationsList.length > 0
        ? p.specificationsList
        : [];

      if (specsList.length === 0 && p.technicalSpecs && typeof p.technicalSpecs === 'object') {
        specsList = Object.entries(p.technicalSpecs).map(([name, val]) => ({
          name,
          key: generateSlug(name).replace(/-/g, '_'),
          value: String(val),
          unit: '',
          type: 'text',
          isHighlight: false
        }));
      }

      const loadedData = {
        name: p.name || '',
        slug: p.slug || generateSlug(p.name || ''),
        categoryId: p.categoryId || '',
        category: p.category || '',
        categoryLabel: p.categoryLabel || '',
        brandId: p.brandId || '',
        brand: p.brand || '',
        model: p.model || '',
        code: p.code || (p as any).sku || '',
        partNumber: p.partNumber || '',
        origin: p.origin || '',
        unit: p.unit || 'Cái',
        status: p.status || 'published',

        price: formatPriceInput(p.price),
        originalPrice: formatPriceInput(p.originalPrice),
        vat: p.vat !== undefined ? p.vat : 0,
        contactPrice: p.contactPrice || false,

        image: p.image || '',
        images: Array.isArray(p.images) ? p.images : [],
        videos: Array.isArray(p.videos) ? p.videos.map((v: any) => typeof v === 'string' ? v : v.url) : [],
        documents: Array.isArray(p.documents) ? p.documents : [],

        shortDescription: p.shortDescription || '',
        description: p.description || '',
        specifications: p.specifications || '',
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [''],

        specificationsList: specsList,
        technicalSpecs: p.technicalSpecs || {},

        variants: Array.isArray(p.variants) ? p.variants : [],

        stock: p.stock || 0,
        stockStatus: p.stockStatus || 'in_stock',
        warehouses: Array.isArray(p.warehouses) ? p.warehouses : [],

        warranty: p.warranty || '24 tháng chính hãng',
        warrantyDetails: p.warrantyDetails || {
          hasWarranty: true,
          period: p.warranty || '24 tháng',
          unit: 'month',
          type: 'hang',
          coverage: 'Bảo hành theo tiêu chuẩn nhà sản xuất'
        },
        isFeatured: Boolean(p.isFeatured || (p as any).featured),
        featuredOrder: p.featuredOrder || 0,
        isNew: Boolean(p.isNew || (p as any).badge === 'NEW'),
        isHot: Boolean(p.isHot || (p as any).badge === 'HOT'),
        badge: (p as any).badge || '',

        focusKeyword: loadedKw,
        metaTitle: p.metaTitle || p.name || '',
        metaDescription: p.metaDescription || p.shortDescription || '',

        power: p.power || 0,
        efficiency: p.efficiency || 0,
      };

      setFormData(loadedData);
      setBaseline(loadedData);
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Lỗi khi tải thông tin sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Image Selection Handler
  const handleImageSelect = (url: string) => {
    if (imagePickerTarget === 'main') {
      setFormData(prev => ({ ...prev, image: url }));
    } else if (imagePickerTarget === 'document' && docPickerIndex !== null) {
      const docs = [...formData.documents];
      if (docs[docPickerIndex]) {
        docs[docPickerIndex].url = url;
        docs[docPickerIndex].fileUrl = url;
        setFormData(prev => ({ ...prev, documents: docs }));
      }
    } else if (typeof imagePickerTarget === 'number') {
      const newImages = [...formData.images];
      newImages[imagePickerTarget] = url;
      setFormData(prev => ({ ...prev, images: newImages }));
    }
    setShowImagePicker(false);
  };

  // AI Product Handler
  const handleApplyAiProduct = (data: any) => {
    const kw = data.focusKeyword || formData.name.toLowerCase().trim();
    const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
      data.description || '',
      kw,
      data.image || formData.image,
      data.images || formData.images || []
    );

    setFocusKeyword(kw);
    setFormData(prev => {
      let newSpecsList = prev.specificationsList;
      if (data.technicalSpecs && typeof data.technicalSpecs === 'object') {
        newSpecsList = Object.entries(data.technicalSpecs).map(([name, val]) => ({
          name,
          key: generateSlug(name).replace(/-/g, '_'),
          value: String(val),
          unit: '',
          type: 'text',
          isHighlight: false
        }));
      }

      return {
        ...prev,
        name: data.name || prev.name,
        code: data.code || prev.code,
        focusKeyword: kw,
        shortDescription: data.shortDescription || prev.shortDescription,
        description: cleanHtml || prev.description,
        specifications: data.specifications || prev.specifications,
        warranty: data.warranty || prev.warranty,
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features,
        technicalSpecs: data.technicalSpecs || prev.technicalSpecs,
        specificationsList: newSpecsList,
        image: finalMainImage || prev.image || '',
        images: finalExtraImages && finalExtraImages.length > 0 ? finalExtraImages : prev.images
      };
    });
    showToast('✨ Đã áp dụng toàn bộ nội dung & thông số AI chuẩn SEO Yoast!', 'success');
  };

  // Specs List Handlers
  const handleAddSpecRow = () => {
    setFormData(prev => ({
      ...prev,
      specificationsList: [
        ...prev.specificationsList,
        { name: '', key: '', value: '', unit: '', type: 'text', isHighlight: false }
      ]
    }));
  };

  const handleRemoveSpecRow = (idx: number) => {
    const list = [...formData.specificationsList];
    list.splice(idx, 1);
    setFormData(prev => ({ ...prev, specificationsList: list }));
  };

  const handleSpecRowChange = (idx: number, field: keyof ProductSpecification, val: any) => {
    const list = [...formData.specificationsList];
    list[idx] = { ...list[idx], [field]: val };
    if (field === 'name' && !list[idx].key) {
      list[idx].key = generateSlug(val).replace(/-/g, '_');
    }
    setFormData(prev => ({ ...prev, specificationsList: list }));
  };

  // Documents Handlers
  const handleAddDocument = () => {
    const newDoc: ProductDocument = {
      title: 'Tài liệu kỹ thuật / Datasheet PDF',
      url: '',
      fileUrl: '',
      fileType: 'pdf',
      fileSize: 0
    };
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const handleRemoveDocument = (idx: number) => {
    const docs = [...formData.documents];
    docs.splice(idx, 1);
    setFormData(prev => ({ ...prev, documents: docs }));
  };

  // Variants Handlers
  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      name: '',
      sku: '',
      price: '',
      stock: 0
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVar]
    }));
  };

  const handleRemoveVariant = (idx: number) => {
    const vars = [...formData.variants];
    vars.splice(idx, 1);
    setFormData(prev => ({ ...prev, variants: vars }));
  };

  // Features Handlers
  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Save Product
  const saveProductInternal = async (): Promise<boolean> => {
    if (!formData.name?.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error');
      setActiveTab('basic');
      return false;
    }
    if (!formData.category && !formData.categoryId) {
      showToast('Vui lòng chọn danh mục sản phẩm', 'error');
      setActiveTab('basic');
      return false;
    }
    if (!formData.image?.trim()) {
      showToast('Vui lòng chọn ảnh đại diện sản phẩm', 'error');
      setActiveTab('media');
      return false;
    }

    setLoading(true);
    try {
      const parsedVat = typeof formData.vat === 'number'
        ? formData.vat
        : (parseFloat(String(formData.vat).replace(',', '.')) || 0);
      const finalVat = Math.max(0, Math.min(100, isNaN(parsedVat) ? 0 : parsedVat));

      // Build backward-compatible technicalSpecs object from specificationsList
      const techSpecsObj: { [key: string]: string } = {};
      formData.specificationsList.forEach(s => {
        if (s.name?.trim() && s.value !== undefined && s.value !== '') {
          const valStr = String(s.value).trim();
          const valWithUnit = s.unit ? `${valStr} ${s.unit.trim()}` : valStr;
          techSpecsObj[s.name.trim()] = valWithUnit;
        }
      });

      const cleanedData: any = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        name: formData.name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.name),
        vat: finalVat,
        badge: formData.isHot ? 'HOT' : formData.isNew ? 'NEW' : formData.badge || '',
        features: formData.features.filter(f => f.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
        videos: formData.videos.filter(v => v.trim() !== ''),
        documents: formData.documents.filter(d => (d.url && d.url.trim() !== '') || (d.fileUrl && d.fileUrl.trim() !== '')),
        specificationsList: formData.specificationsList.filter(s => s.name?.trim() !== ''),
        technicalSpecs: Object.keys(techSpecsObj).length > 0 ? techSpecsObj : formData.technicalSpecs,
      };

      if (!cleanedData.categoryId) delete cleanedData.categoryId;
      if (!cleanedData.brandId) delete cleanedData.brandId;

      if (isEdit && id) {
        await api.products.update(id, cleanedData);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await api.products.create(cleanedData);
        showToast('Thêm sản phẩm mới thành công!', 'success');
      }

      setBaseline(cleanedData);
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast(error.message || 'Lỗi khi lưu sản phẩm', 'error');
      setLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProductInternal();
    if (success) {
      navigate('/admin/content?tab=products');
    }
  };

  const handleExit = () => {
    confirmNavigation(() => navigate('/admin/content?tab=products'));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Hệ thống Quản lý Sản phẩm Đa ngành nghề & Thông số kỹ thuật động (Universal Product CMS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 hover:scale-105 cursor-pointer"
            title="Trợ lý AI Gemini tạo toàn bộ nội dung, thông số & bài viết chuẩn SEO Yoast 100/100"
          >
            <Sparkles size={15} className="text-amber-200 animate-pulse" />
            <span>✨ AI Viết Sản Phẩm</span>
          </button>

          <button
            type="button"
            onClick={saveProductInternal}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-60"
          >
            <Save size={15} />
            <span>{loading ? 'Đang lưu...' : 'Lưu lại'}</span>
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng & Thoát"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation 9 Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">

          {/* ================= TAB 1: BASIC INFO ================= */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Info size={18} className="text-sky-500" />
                  <span>1. Thông tin sản phẩm cơ bản</span>
                </h3>
                <p className="text-xs text-gray-500">Tên sản phẩm, danh mục ngành hàng, thương hiệu, xuất xứ, mã model</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tên sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Router DrayTek Vigor2927, Tấm Pin Canadian Solar 550W, Camera Hikvision 4MP..."
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Đường dẫn tĩnh (Slug)
                  </label>
                  <input
                    type="text"
                    placeholder="router-draytek-vigor2927"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-gray-700 dark:text-gray-300">
                      Danh mục sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <Link 
                      to="/admin/categories" 
                      target="_blank" 
                      className="text-[11px] text-primary-600 hover:underline flex items-center gap-1"
                    >
                      <span>+ Quản lý danh mục</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                  <SearchableCategorySelect
                    categories={categories}
                    value={formData.categoryId}
                    onChange={(catId) => handleCategoryChange(catId)}
                    placeholder="-- Chọn hoặc tìm kiếm danh mục sản phẩm --"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-gray-700 dark:text-gray-300">
                      Hãng sản xuất / Thương hiệu
                    </label>
                    <Link 
                      to="/admin/brands" 
                      target="_blank" 
                      className="text-[11px] text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <span>+ Quản lý hãng</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SearchableBrandSelect
                        brands={brands}
                        value={formData.brandId}
                        brandName={formData.brand}
                        onChange={(bId, bName, bOrigin) => {
                          setFormData(prev => ({
                            ...prev,
                            brandId: bId,
                            brand: bName || prev.brand,
                            origin: bOrigin || prev.origin
                          }));
                        }}
                        onCustomBrandChange={(customName) => {
                          setFormData(prev => ({ ...prev, brand: customName, brandId: '' }));
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Hoặc nhập tên hãng khác"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-1/3 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Model / Ký hiệu model
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Vigor2927, DS-2CD2143G2-I, CS6W-550MS..."
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                {/* SKU / Code */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Mã sản phẩm / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="VD: CTC-DRT-2927"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white"
                  />
                </div>

                {/* Part Number / P/N */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Part Number (P/N)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 2927-VN-K1"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white"
                  />
                </div>

                {/* Origin */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Xuất xứ / Nơi sản xuất
                  </label>
                  <input
                    type="text"
                    placeholder="Đài Loan, Đức, Trung Quốc, Việt Nam..."
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                    list="origins-list"
                  />
                  <datalist id="origins-list">
                    {POPULAR_ORIGINS.map(o => <option key={o} value={o} />)}
                  </datalist>
                </div>

                {/* Unit & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Đơn vị tính
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-xs"
                      list="units-list"
                    />
                    <datalist id="units-list">
                      {POPULAR_UNITS.map(u => <option key={u} value={u} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Trạng thái phát hành
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="published">🟢 Đang mở bán</option>
                      <option value="draft">🟡 Bản nháp</option>
                      <option value="archived">🔴 Ngừng kinh doanh</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PRICING ================= */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign size={18} className="text-emerald-500" />
                  <span>2. Giá bán & Chính sách bán hàng</span>
                </h3>
                <p className="text-xs text-gray-500">Cấu hình giá bán, giá niêm yết, thuế VAT và tùy chọn Giá liên hệ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Giá bán chính thức (VNĐ)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 3,500,000"
                    value={formData.price}
                    onChange={(e) => handlePriceChange('price', e.target.value)}
                    disabled={formData.contactPrice}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-mono font-bold text-base disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Giá niêm yết / Giá gốc (VNĐ)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 4,200,000"
                    value={formData.originalPrice}
                    onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                    disabled={formData.contactPrice}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-mono text-sm disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Thuế VAT (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.vat}
                    onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.contactPrice}
                    onChange={(e) => setFormData({ ...formData, contactPrice: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                      Hiện nhãn "Giá: Liên hệ" thay vì con số giá cụ thể
                    </span>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Thích hợp cho các thiết bị công trình lớn, giải pháp EPC Solar hoặc thiết bị cần báo giá theo số lượng dự án
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ================= TAB 3: MEDIA & DOCUMENTS ================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon size={18} className="text-sky-500" />
                  <span>3. Hình ảnh, Video & Tài liệu kỹ thuật PDF</span>
                </h3>
                <p className="text-xs text-gray-500">Ảnh đại diện chính, album ảnh góc cạnh, video review & Catalogue / Datasheet PDF tải về</p>
              </div>

              {/* Main Image */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Ảnh đại diện chính <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... hoặc chọn file từ thư viện"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePickerTarget('main');
                      setShowImagePicker(true);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-gray-300 dark:border-slate-700 cursor-pointer"
                  >
                    <FolderOpen size={15} />
                    <span>Chọn thư viện</span>
                  </button>
                </div>
                {formData.image && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-200 dark:border-slate-700 inline-flex items-center gap-3">
                    <img 
                      src={formData.image} 
                      alt="Main Preview" 
                      className="h-20 w-20 object-contain rounded-lg bg-white dark:bg-slate-900 p-1 border"
                      onError={(e) => (e.target as any).style.display = 'none'}
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Ảnh đại diện xem trước</span>
                      <span className="text-[11px] text-gray-400 font-mono line-clamp-1 max-w-xs">{formData.image}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Images Gallery */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300">
                      Album ảnh chi tiết & góc chụp ({formData.images.length})
                    </label>
                    <span className="text-xs text-gray-400">Thêm nhiều ảnh để khách hàng xem chi tiết các cổng, phụ kiện, mặt sau</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                    className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer border border-sky-200 dark:border-sky-800"
                  >
                    <Plus size={14} />
                    <span>Thêm ảnh</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="URL ảnh chi tiết..."
                        value={imgUrl}
                        onChange={(e) => {
                          const list = [...formData.images];
                          list[idx] = e.target.value;
                          setFormData({ ...formData, images: list });
                        }}
                        className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePickerTarget(idx);
                          setShowImagePicker(true);
                        }}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-gray-600 rounded-xl text-xs border border-gray-300 dark:border-slate-700 cursor-pointer"
                        title="Chọn file"
                      >
                        <ImageIcon size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const list = formData.images.filter((_, i) => i !== idx);
                          setFormData({ ...formData, images: list });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Documents / PDF Datasheets */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span>Tài liệu kỹ thuật / Datasheet / Catalogue PDF</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 font-mono">
                        {formData.documents.length}
                      </span>
                    </label>
                    <span className="text-xs text-gray-400">File Catalogue, hướng dẫn sử dụng, bản vẽ kỹ thuật để khách tải về</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-800"
                  >
                    <Plus size={14} />
                    <span>Thêm tài liệu PDF</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="Tiêu đề tài liệu (VD: Datasheet Vigor2927 Series PDF)..."
                        value={doc.title}
                        onChange={(e) => {
                          const docs = [...formData.documents];
                          docs[idx].title = e.target.value;
                          setFormData({ ...formData, documents: docs });
                        }}
                        className="w-full sm:w-1/3 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="URL file PDF (https://... hoặc chọn file)..."
                        value={doc.url || doc.fileUrl || ''}
                        onChange={(e) => {
                          const docs = [...formData.documents];
                          docs[idx].url = e.target.value;
                          docs[idx].fileUrl = e.target.value;
                          setFormData({ ...formData, documents: docs });
                        }}
                        className="w-full sm:flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDocPickerIndex(idx);
                            setImagePickerTarget('document');
                            setShowImagePicker(true);
                          }}
                          className="p-2 bg-white dark:bg-slate-900 border rounded-lg text-xs text-gray-600 hover:text-sky-600 cursor-pointer"
                          title="Chọn file từ thư viện"
                        >
                          <FolderOpen size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: DESCRIPTION & AI ================= */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText size={18} className="text-sky-500" />
                    <span>4. Bài viết mô tả chi tiết & Đặc điểm nổi bật</span>
                  </h3>
                  <p className="text-xs text-gray-500">Mô tả ngắn, danh sách tính năng chính và bài viết chuyên sâu chuẩn SEO</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:scale-105 transition-all"
                >
                  <Sparkles size={14} />
                  <span>Trợ lý AI viết bài</span>
                </button>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mô tả ngắn gọn (Hiển thị đầu trang & thẻ tóm tắt)
                </label>
                <textarea
                  rows={2}
                  placeholder="Đoạn văn ngắn 2-3 câu tóm tắt điểm mạnh nhất của sản phẩm..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Bullet Key Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 text-sm">
                    Đặc điểm & Tính năng nổi bật ({formData.features.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950 text-sky-600 text-xs font-bold rounded-lg border border-sky-200 cursor-pointer"
                  >
                    + Thêm đặc điểm
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-bold text-sky-500">✓</span>
                      <input
                        type="text"
                        placeholder="VD: Hỗ trợ 2 cổng WAN Gigabit, thông lượng NAT lên đến 950 Mbps..."
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-xs text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Description Rich Text Editor */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung bài viết chi tiết sản phẩm
                </label>
                <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-gray-400">Đang tải trình soạn thảo...</div>}>
                  <RichTextEditor
                    content={formData.description}
                    onChange={(val: string) => setFormData({ ...formData, description: val })}
                    placeholder="Viết nội dung giới thiệu, hình ảnh thực tế, bảng thông số kỹ thuật chi tiết..."
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* ================= TAB 5: DYNAMIC SPECIFICATIONS ================= */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sliders size={18} className="text-indigo-500" />
                    <span>5. Bảng thông số kỹ thuật động (Dynamic Specifications)</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Linh hoạt cho mọi ngành nghề (Camera, Switch mạng, Máy tính, Solar, Inverter...). Tự động khớp theo mẫu danh mục.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs">
                    <span className="px-2 text-gray-500 font-medium">Nạp mẫu:</span>
                    {templates.slice(0, 3).map(tpl => (
                      <button
                        key={tpl.id || tpl.category || (tpl as any)._id}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:text-indigo-600 rounded-lg font-semibold shadow-2xs cursor-pointer text-[11px]"
                      >
                        {tpl.name.replace(/Mẫu thông số /i, '')}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    <Plus size={14} />
                    <span>Thêm dòng thông số</span>
                  </button>
                </div>
              </div>

              {/* Specs Table */}
              {formData.specificationsList.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-6">
                  <Sliders size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Chưa có thông số kỹ thuật nào</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-3">Bấm "Nạp mẫu" ở trên hoặc tự thêm các dòng thông số</p>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
                  >
                    + Thêm thông số đầu tiên
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-3 w-12 text-center">#</th>
                        <th className="py-3 px-3 w-1/3">Tên thông số (Tiếng Việt)</th>
                        <th className="py-3 px-3 w-1/3">Giá trị thông số</th>
                        <th className="py-3 px-3 w-28">Đơn vị (Unit)</th>
                        <th className="py-3 px-3 w-24 text-center">Nổi bật</th>
                        <th className="py-3 px-3 w-16 text-right">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {formData.specificationsList.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3 text-center font-mono text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              placeholder="VD: Cổng mạng, Độ phân giải, Công suất..."
                              value={spec.name}
                              onChange={(e) => handleSpecRowChange(idx, 'name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              placeholder="VD: 24 cổng Gigabit, 4MP 2K, 550W..."
                              value={spec.value || ''}
                              onChange={(e) => handleSpecRowChange(idx, 'value', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="W, GB, port..."
                              value={spec.unit || ''}
                              onChange={(e) => handleSpecRowChange(idx, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleSpecRowChange(idx, 'isHighlight', !spec.isHighlight)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                spec.isHighlight
                                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                                  : 'text-gray-300 hover:text-amber-400'
                              }`}
                              title={spec.isHighlight ? 'Đang hiện nổi bật' : 'Bấm để ghim nổi bật'}
                            >
                              <Star size={15} className={spec.isHighlight ? 'fill-amber-400' : ''} />
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecRow(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Xóa dòng"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: VARIANTS ================= */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers size={18} className="text-sky-500" />
                    <span>6. Phiên bản & Biến thể sản phẩm ({formData.variants.length})</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Áp dụng khi sản phẩm có nhiều tùy chọn (VD: 8 Port / 16 Port / 24 Port PoE; Ống kính 2.8mm / 4mm; Dung lượng 8GB / 16GB)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Thêm phiên bản</span>
                </button>
              </div>

              {formData.variants.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-6">
                  <Layers size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Sản phẩm này là phiên bản tiêu chuẩn duy nhất</p>
                  <p className="text-xs text-gray-400 mt-0.5 mb-3">Nếu sản phẩm có nhiều cấu hình hoặc màu sắc, bấm "Thêm phiên bản" để thiết lập</p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl"
                  >
                    + Tạo phiên bản tùy chọn
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center">
                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Tên phiên bản</label>
                        <input
                          type="text"
                          placeholder="VD: Bản 24 Port PoE 370W"
                          value={v.name}
                          onChange={(e) => {
                            const vars = [...formData.variants];
                            vars[idx].name = e.target.value;
                            setFormData({ ...formData, variants: vars });
                          }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Mã SKU phiên bản</label>
                        <input
                          type="text"
                          placeholder="VD: CTC-SW24-POE"
                          value={v.sku || ''}
                          onChange={(e) => {
                            const vars = [...formData.variants];
                            vars[idx].sku = e.target.value;
                            setFormData({ ...formData, variants: vars });
                          }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-600 dark:text-gray-400 mb-1">Giá bán riêng (VNĐ)</label>
                        <input
                          type="text"
                          placeholder="VD: 5,200,000"
                          value={formatPriceInput(v.price)}
                          onChange={(e) => {
                            const vars = [...formData.variants];
                            vars[idx].price = formatPriceInput(e.target.value);
                            setFormData({ ...formData, variants: vars });
                          }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="px-3 py-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                        >
                          Xóa phiên bản
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 7: INVENTORY ================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Box size={18} className="text-amber-500" />
                  <span>7. Quản lý Tồn kho & Chi nhánh</span>
                </h3>
                <p className="text-xs text-gray-500">Số lượng hàng sẵn có, tình trạng còn hàng / hết hàng / đặt trước</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tổng số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-mono text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Trạng thái kho hàng
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-semibold text-sm"
                  >
                    <option value="in_stock">🟢 Còn hàng sẵn kho</option>
                    <option value="out_of_stock">🔴 Tạm hết hàng</option>
                    <option value="pre_order">🟡 Đặt hàng trước (Pre-order)</option>
                    <option value="contact">🔵 Liên hệ xác nhận số lượng</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: WARRANTY & BADGES ================= */}
          {activeTab === 'warranty' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span>8. Chính sách bảo hành & Huy hiệu nổi bật</span>
                </h3>
                <p className="text-xs text-gray-500">Thời hạn bảo hành chính hãng, chính sách hỗ trợ kỹ thuật và các nhãn HOT / NEW</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Thời hạn bảo hành
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 24 tháng chính hãng, 10 năm hiệu suất pin..."
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Hình thức bảo hành
                  </label>
                  <select
                    value={formData.warrantyDetails?.type || 'hang'}
                    onChange={(e) => setFormData({
                      ...formData,
                      warrantyDetails: { ...formData.warrantyDetails, type: e.target.value as any }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-medium"
                  >
                    <option value="hang">Bảo hành chính hãng (Tại TTBH Hãng)</option>
                    <option value="ctc">Bảo hành trực tiếp tại Công ty CTC</option>
                    <option value="online">Bảo hành điện tử qua Serial / QR Code</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phạm vi & Cam kết bảo hành
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đổi mới 1:1 trong 30 ngày nếu lỗi do NSX, hỗ trợ kỹ thuật 24/7..."
                    value={formData.warrantyDetails?.coverage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      warrantyDetails: { ...formData.warrantyDetails, coverage: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Badges and Featured Options */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm">
                  Huy hiệu & Đánh dấu hiển thị
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200 text-xs">★ Sản phẩm Tiêu biểu</span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Hiển thị ở trang chủ</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-rose-900 dark:text-rose-200 text-xs">🔥 Nhãn HOT (Bán chạy)</span>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400">Gắn huy hiệu HOT đỏ</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-sky-50/60 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-800/60 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-sky-900 dark:text-sky-200 text-xs">✨ Nhãn NEW (Mới về)</span>
                      <p className="text-[11px] text-sky-700 dark:text-sky-400">Gắn huy hiệu NEW xanh</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 9: SEO & PREVIEW ================= */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Search size={18} className="text-emerald-500" />
                  <span>9. Tối ưu hóa SEO & Trực quan Google SERP</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Phân tích chuẩn SEO Yoast (mật độ từ khóa, thẻ H2, độ dài mô tả, slug) và xem trước trên Google
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Từ khóa SEO chính (Focus Keyword) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: router draytek vigor2927"
                    value={formData.focusKeyword || focusKeyword}
                    onChange={(e) => {
                      setFocusKeyword(e.target.value);
                      setFormData({ ...formData, focusKeyword: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Thẻ tiêu đề SEO (Meta Title)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Router DrayTek Vigor2927 Chính Hãng | Giá Tốt CTC"
                    value={formData.metaTitle || formData.name}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Thẻ mô tả SEO (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Đoạn văn tóm tắt 120-160 ký tự chứa từ khóa focus để hiển thị trên kết quả tìm kiếm Google..."
                    value={formData.metaDescription || formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Google SERP Preview Box */}
              <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xs">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Xem trước kết quả tìm kiếm Google</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mb-1 truncate">
                  https://ctcdn.vn/products/{formData.slug || 'san-pham'}
                </div>
                <div className="text-base text-blue-700 dark:text-sky-400 font-semibold hover:underline cursor-pointer line-clamp-1">
                  {formData.metaTitle || formData.name || 'Tiêu đề sản phẩm | CTC'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                  {formData.metaDescription || formData.shortDescription || 'Mô tả tóm tắt sản phẩm chất lượng cao chính hãng phân phối bởi CTC...'}
                </div>
              </div>

              {/* Yoast SEO Analyzer */}
              <div className="pt-2">
                <SeoAnalyzer
                  title={formData.name}
                  excerpt={formData.shortDescription || formData.metaDescription}
                  content={formData.description}
                  image={formData.image}
                  focusKeyword={formData.focusKeyword || focusKeyword}
                  onFocusKeywordChange={(kw: string) => {
                    setFocusKeyword(kw);
                    setFormData(prev => ({ ...prev, focusKeyword: kw }));
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Bottom Action Bar */}
          <div className="pt-6 mt-8 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {TABS.findIndex(t => t.id === activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const curIdx = TABS.findIndex(t => t.id === activeTab);
                    if (curIdx > 0) setActiveTab(TABS[curIdx - 1].id);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ← Mục trước
                </button>
              )}

              {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const curIdx = TABS.findIndex(t => t.id === activeTab);
                    if (curIdx < TABS.length - 1) setActiveTab(TABS[curIdx + 1].id);
                  }}
                  className="px-4 py-2 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl text-xs font-semibold cursor-pointer border border-sky-200"
                >
                  Mục tiếp theo →
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExit}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isEdit ? 'Lưu cập nhật sản phẩm' : 'Đăng sản phẩm mới'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* File Picker Modal */}
      {showImagePicker && (
        <FilePickerModal
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleImageSelect}
          title="Chọn tệp tin từ thư viện Media"
        />
      )}

      {/* AI Product Writer Modal */}
      {showAiModal && (
        <AiProductWriterModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApply={handleApplyAiProduct}
          initialName={formData.name}
          initialCode={formData.code}
          initialCategory={formData.categoryLabel || formData.category}
        />
      )}

      {/* Unsaved Changes Warning Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={() => confirmNavigation(() => navigate('/admin/content?tab=products'))}
      />
    </div>
  );
};

export default ProductForm;
