import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, X, Image as ImageIcon, Eye, EyeOff,
  FileText, Hash, Calendar, User, Tag, Star, StarOff,
  ChevronRight, Sparkles
} from 'lucide-react';
import FilePickerModal from './FilePickerModal';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Lazy load để tránh SSR issues
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
import { getNewsUrl } from '../utils/news-url-helper';
import SeoAnalyzer from './components/SeoAnalyzer';
import AiWriterModal from './components/AiWriterModal';

interface NewsCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
}

const NewsForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [preview, setPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'seo'>('write');
  const [indexing, setIndexing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const [focusKeyword, setFocusKeyword] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    categoryId: '',
    category: '',
    author: 'Nguyễn Văn Duy',
    isFeatured: false,
    tags: [] as string[],
    focusKeyword: '',
    status: 'published' as 'published' | 'pending' | 'draft',
  });

  const [tagInput, setTagInput] = useState('');

  const handleManualIndex = async () => {
    if (!id) return;
    setIndexing(true);
    try {
      const cleanUrl = getNewsUrl({ id, title: formData.title, slug: (formData as any).slug });
      await api.indexing.triggerPing([cleanUrl]);
      showToast('🚀 Đã gửi thông báo Indexing đến Google & Bing thành công!', 'success');
    } catch (err) {
      console.error('Error triggering indexing:', err);
      showToast('Lỗi khi gửi thông báo Indexing', 'error');
    }
    setIndexing(false);
  };

  useEffect(() => {
    loadCategories();
    if (isEdit && id) loadNews(id);
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.newsCategories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNews = async (newsId: string) => {
    setLoading(true);
    try {
      const news = await api.news.getById(newsId);
      const loadedKw = news.focusKeyword || news.focus_keyword || (news.tags && news.tags.length > 0 ? news.tags[0] : '');
      setFocusKeyword(loadedKw);
      setFormData({
        title: news.title || '',
        excerpt: news.excerpt || '',
        content: news.content || '',
        date: news.date || new Date().toISOString().split('T')[0],
        image: news.image || '',
        categoryId: news.categoryId || '',
        category: news.category || '',
        author: news.author || 'Nguyễn Văn Duy',
        isFeatured: news.isFeatured || false,
        tags: news.tags || [],
        focusKeyword: loadedKw,
        status: (news.status as any) || 'published',
      });
    } catch (error) {
      console.error('Error loading news:', error);
      showToast('Lỗi khi tải tin tức', 'error');
    }
    setLoading(false);
  };

  const handleImageSelect = (url: string) => {
    setFormData({ ...formData, image: url });
    setShowImagePicker(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    const selected = categories.find(c => (c.id || c._id) === categoryId);
    setFormData({ ...formData, categoryId, category: selected?.name || '' });
  };

  const handleFocusKeywordChange = (kw: string) => {
    setFocusKeyword(kw);
    setFormData(prev => ({ ...prev, focusKeyword: kw }));
  };

  const handleApplyAiArticle = (generated: {
    title: string;
    excerpt: string;
    content: string;
    focusKeyword: string;
    tags: string[];
    image?: string;
  }) => {
    setFocusKeyword(generated.focusKeyword);
    setFormData(prev => ({
      ...prev,
      title: generated.title,
      excerpt: generated.excerpt,
      content: generated.content,
      focusKeyword: generated.focusKeyword,
      image: prev.image || generated.image || '',
      status: 'pending', // Đưa vào chế độ Chờ duyệt (Pending) cho Editor/Admin
      tags: Array.from(new Set([...prev.tags, ...(generated.tags || [])]))
    }));
    showToast('📝 Bài viết AI được đưa vào chế độ CHỜ DUYỆT (Pending)!', 'info');
  };

  const handlePublishAndIndex = async () => {
    if (!formData.title.trim()) { showToast('Vui lòng nhập tiêu đề bài viết', 'error'); return; }
    if (!formData.excerpt.trim()) { showToast('Vui lòng nhập mô tả ngắn', 'error'); return; }
    if (!formData.image) { showToast('Vui lòng chọn hình ảnh đại diện', 'error'); return; }

    setSaving(true);
    try {
      const payload = { ...formData, focusKeyword, status: 'published' };
      let savedItem: any;
      if (isEdit && id) {
        savedItem = await api.news.update(id, payload);
        showToast('🎉 Đã duyệt và xuất bản bài viết thành công!', 'success');
      } else {
        savedItem = await api.news.create(payload);
        showToast('🎉 Đã xuất bản bài viết thành công!', 'success');
      }
      setFormData(prev => ({ ...prev, status: 'published' }));

      // Kích hoạt Indexing sau khi đã duyệt xuất bản
      const targetId = savedItem?._id || savedItem?.id || id;
      if (targetId) {
        const cleanUrl = getNewsUrl({ id: targetId, title: formData.title, slug: (savedItem || formData as any).slug });
        api.indexing.triggerPing([cleanUrl]).catch(() => {});
      }

      navigate('/admin/content?tab=news');
    } catch (error) {
      console.error('Error publishing news:', error);
      showToast('Lỗi khi duyệt bài viết', 'error');
    }
    setSaving(false);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      const updatedTags = [...formData.tags, tag];
      const kwToSet = focusKeyword.trim() ? focusKeyword : tag;
      setFocusKeyword(kwToSet);
      setFormData(prev => ({
        ...prev,
        tags: updatedTags,
        focusKeyword: kwToSet
      }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { showToast('Vui lòng nhập tiêu đề bài viết', 'error'); return; }
    if (!formData.excerpt.trim()) { showToast('Vui lòng nhập mô tả ngắn', 'error'); return; }
    if (!formData.image) { showToast('Vui lòng chọn hình ảnh đại diện', 'error'); return; }

    setSaving(true);
    try {
      const payload = { ...formData, focusKeyword };
      if (isEdit && id) {
        await api.news.update(id, payload);
        showToast('✅ Cập nhật tin tức thành công!', 'success');
      } else {
        await api.news.create(payload);
        showToast('✅ Đăng bài viết thành công!', 'success');
      }
      navigate('/admin/content?tab=news');
    } catch (error) {
      console.error('Error saving news:', error);
      showToast('Lỗi khi lưu tin tức', 'error');
    }
    setSaving(false);
  };

  const estimatedReadTime = Math.max(1, Math.ceil(formData.content.replace(/<[^>]*>/g, '').length / 1200));
  const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* === HEADER === */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-30 bg-gray-50 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/content?tab=news')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span>Quản lý nội dung</span>
              <ChevronRight size={12} />
              <span className="text-primary font-semibold">{isEdit ? 'Chỉnh sửa' : 'Thêm mới'}</span>
            </div>
            <h1 className="text-xl font-black text-gray-800">
              {isEdit ? '✏️ Chỉnh sửa Tin tức' : '📝 Viết Tin tức mới'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Trạng thái:</span>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className={`text-xs font-black outline-none bg-transparent cursor-pointer ${
                formData.status === 'published' ? 'text-emerald-600' :
                formData.status === 'pending' ? 'text-amber-600 font-extrabold' : 'text-slate-600'
              }`}
            >
              <option value="published">🟢 Đã xuất bản (Published)</option>
              <option value="pending">🟡 Chờ duyệt (Pending)</option>
              <option value="draft">📝 Bản nháp (Draft)</option>
            </select>
          </div>

          {/* AI Writer button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white rounded-xl text-sm font-black transition-all shadow-sm hover:shadow-md hover:scale-105 cursor-pointer"
            title="Mở Trợ lý AI tự động tìm kiếm Google & viết bài chuẩn SEO Yoast 100/100"
          >
            <Sparkles size={16} className="text-amber-200 animate-pulse" />
            <span className="hidden md:inline">✨ AI Viết Bài</span>
          </button>

          {/* Approve & Publish button for Pending/Draft articles */}
          {formData.status !== 'published' ? (
            <button
              type="button"
              onClick={handlePublishAndIndex}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black transition-all shadow-md hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Duyệt bài viết này và kích hoạt ép lập chỉ mục Google & Bing"
            >
              <span>✅ Duyệt & Xuất Bản</span>
            </button>
          ) : (
            isEdit && id && (
              <button
                type="button"
                onClick={handleManualIndex}
                disabled={indexing}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm"
                title="Gửi thông báo ép Google & Bing lập chỉ mục URL này ngay lập tức"
              >
                {indexing ? (
                  <span className="animate-spin text-xs">🌀</span>
                ) : (
                  <span>🚀 Index ngay</span>
                )}
              </button>
            )
          )}

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
              preview ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className="hidden sm:inline">{preview ? 'Tắt xem' : 'Xem trước'}</span>
          </button>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Đang lưu...</>
            ) : (
              <><Save size={16} /> {isEdit ? 'Lưu bài' : 'Lưu nháp'}</>
            )}
          </button>
        </div>
      </div>

      {preview ? (
        /* === PREVIEW MODE === */
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            {formData.category && (
              <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded-md mb-4">
                {formData.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              {formData.title || 'Tiêu đề bài viết...'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span>📅 {formData.date}</span>
              {formData.author && <span>✍️ {formData.author}</span>}
              <span>⏱ {estimatedReadTime} phút đọc</span>
            </div>
            {formData.image && (
              <img src={formData.image} alt={formData.title} className="w-full h-72 object-cover rounded-2xl mb-8 shadow-lg" />
            )}
            {formData.excerpt && (
              <p className="text-lg text-gray-600 italic border-l-4 border-primary pl-4 mb-8 leading-relaxed">{formData.excerpt}</p>
            )}
            <div
              className="prose prose-lg max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">Chưa có nội dung...</p>' }}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* === MAIN COLUMN (2/3) === */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  <FileText size={12} className="inline mr-1" /> TIÊU ĐỀ BÀI VIẾT *
                </label>
                <textarea
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  rows={2}
                  className="w-full text-2xl font-black text-gray-900 border-0 outline-none resize-none placeholder-gray-300 bg-transparent leading-tight"
                  placeholder="Nhập tiêu đề bài viết ấn tượng..."
                />
                <div className="text-xs text-gray-400 mt-1">{formData.title.length}/200 ký tự</div>
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  <Sparkles size={12} className="inline mr-1" /> MÔ TẢ NGẮN *
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full border-0 outline-none resize-none text-gray-600 leading-relaxed placeholder-gray-300 bg-transparent text-sm"
                  placeholder="Tóm tắt nội dung chính, hiển thị trên trang danh sách tin tức (1-2 câu)..."
                />
                <div className="text-xs text-gray-400 mt-1">{formData.excerpt.length}/500 ký tự</div>
              </div>

              {/* Rich Text Editor */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">
                    📄 NỘI DUNG CHI TIẾT
                  </label>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{wordCount} từ</span>
                    <span>·</span>
                    <span>~{estimatedReadTime} phút đọc</span>
                  </div>
                </div>

                <Suspense fallback={
                  <div className="border border-gray-200 rounded-xl h-80 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Đang tải editor...</p>
                    </div>
                  </div>
                }>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="Bắt đầu viết nội dung bài viết... Dùng thanh công cụ phía trên để định dạng văn bản."
                  />
                </Suspense>

                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  💡 Chọn văn bản để hiện menu định dạng nhanh · Dùng / để chèn block
                </p>
              </div>
            </div>

            {/* === SIDEBAR COLUMN (1/3) === */}
            <div className="space-y-5">

              {/* Image */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                  <ImageIcon size={12} className="inline mr-1" /> ẢNH ĐẠI DIỆN *
                </label>
                <div className="space-y-3">
                  {formData.image ? (
                    <div className="relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-44 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setShowImagePicker(true)}
                          className="bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-lg"
                        >
                          Đổi ảnh
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className={`w-full border-2 border-dashed rounded-xl flex items-center justify-center transition-colors ${
                      formData.image
                        ? 'h-10 border-gray-200 text-xs text-gray-400 hover:border-primary hover:text-primary'
                        : 'h-44 border-gray-300 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {formData.image ? (
                      '+ Thay ảnh khác'
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={32} className="text-gray-300 mx-auto mb-2" />
                        <span className="text-sm text-gray-400 font-medium">Chọn ảnh đại diện</span>
                        <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                  ⚙️ THÔNG TIN BÀI VIẾT
                </label>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                    <Hash size={11} /> Danh mục
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                  >
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                    <Calendar size={11} /> Ngày đăng
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                    <User size={11} /> Tác giả
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                    placeholder="Tên tác giả"
                  />
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 cursor-pointer">
                    <Star size={11} className="text-yellow-500" /> Bài viết nổi bật
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      formData.isFeatured ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      formData.isFeatured ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                  <Tag size={12} className="inline mr-1" /> THẺ GẮN (TAGS)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                    placeholder="Nhập tag, nhấn Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag) => {
                      const isCurrentFocus = focusKeyword.toLowerCase().trim() === tag.toLowerCase().trim();
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                            isCurrentFocus
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold shadow-sm'
                              : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          }`}
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleFocusKeywordChange(tag)}
                            className="text-[10px] bg-white/70 px-1 py-0.5 rounded text-slate-600 hover:text-primary font-bold ml-0.5"
                            title="Đặt tag này làm từ khóa Focus"
                          >
                            {isCurrentFocus ? '★ Focus' : '🎯 Focus'}
                          </button>
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 font-bold leading-none ml-0.5">×</button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEO Analyzer - Yoast-style */}
              <SeoAnalyzer
                title={formData.title}
                excerpt={formData.excerpt}
                content={formData.content}
                image={formData.image}
                focusKeyword={focusKeyword}
                onFocusKeywordChange={handleFocusKeywordChange}
              />
            </div>
          </div>
        </form>
      )}

      {/* Image Picker Modal */}
      <FilePickerModal
        isOpen={showImagePicker}
        onSelect={handleImageSelect}
        onClose={() => setShowImagePicker(false)}
      />

      {/* AI Writer Assistant Modal */}
      <AiWriterModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleApplyAiArticle}
        initialTitle={formData.title}
        initialFocusKeyword={focusKeyword}
      />
    </div>
  );
};

export default NewsForm;
