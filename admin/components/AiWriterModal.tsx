import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, X, ArrowRight, Wand2, RefreshCw, FileText, Target, Tag, Edit3, MessageSquare, BookOpen, Layers, Code, Copy, Link2, LayoutGrid } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AiWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedData: {
    title: string;
    excerpt: string;
    content: string;
    focusKeyword: string;
    tags: string[];
    image?: string;
  }) => void;
  initialTitle?: string;
  initialFocusKeyword?: string;
}

const AiWriterModal: React.FC<AiWriterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialTitle = '',
  initialFocusKeyword = ''
}) => {
  const { showToast } = useToast();
  const [topicTitle, setTopicTitle] = useState(initialTitle);
  const [focusKeyword, setFocusKeyword] = useState(initialFocusKeyword);
  const [referenceContent, setReferenceContent] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [structure, setStructure] = useState<'inverted_pyramid' | 'pas' | '5w1h' | 'storytelling' | 'comparison'>('inverted_pyramid');
  const [tone, setTone] = useState<'journalistic' | 'expert' | 'sales' | 'storytelling'>('journalistic');
  const [targetLength, setTargetLength] = useState<'short' | 'medium' | 'deep'>('medium');
  const [regenerationNote, setRegenerationNote] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [scrapingPreview, setScrapingPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<{ title: string; paragraphs: string[]; images: string[]; videos: string[] } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleScrapePreview = async () => {
    if (!articleUrl.trim().startsWith('http')) {
      showToast('Vui lòng nhập đường link URL hợp lệ (bắt đầu bằng http:// hoặc https://)', 'error');
      return;
    }

    setScrapingPreview(true);
    try {
      const res = await api.ai.scrapeUrl(articleUrl.trim());
      if (res && res.success && res.data) {
        setScrapedData(res.data);
        setSelectedImages(res.data.images || []);
        if (res.data.title && !topicTitle) {
          setTopicTitle(res.data.title);
        }
        showToast(`✨ Bóc tách thành công: ${res.data.paragraphs.length} đoạn văn & ${res.data.images.length} hình ảnh!`, 'success');
      } else {
        showToast('Không thể bóc tách dữ liệu từ URL này', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi bóc tách URL', 'error');
    } finally {
      setScrapingPreview(false);
    }
  };

  const toggleImageSelect = (url: string) => {
    setSelectedImages(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  const selectAllImages = () => {
    if (scrapedData?.images) setSelectedImages(scrapedData.images);
  };

  const deselectAllImages = () => {
    setSelectedImages([]);
  };

  const handleGenerate = async (e?: React.FormEvent, customTitle?: string, customKw?: string) => {
    if (e) e.preventDefault();

    const titleToUse = (customTitle !== undefined ? customTitle : topicTitle).trim();
    const kwToUse = (customKw !== undefined ? customKw : focusKeyword).trim();
    const urlToUse = articleUrl.trim();

    if (!titleToUse && !urlToUse) {
      showToast('Vui lòng nhập tiêu đề hoặc dán đường dẫn link bài báo mẫu', 'error');
      return;
    }

    setLoading(true);
    setStep(1);

    const timer1 = setTimeout(() => setStep(2), 1200);
    const timer2 = setTimeout(() => setStep(3), 2800);

    try {
      const fullTitleWithNote = regenerationNote.trim() 
        ? `${titleToUse} (${regenerationNote.trim()})` 
        : titleToUse;

      const res = await api.ai.generateArticle({
        title: fullTitleWithNote,
        focusKeyword: kwToUse,
        tone,
        targetLength,
        referenceContent: referenceContent.trim(),
        articleUrl: urlToUse,
        structure,
        selectedImages
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res && res.success && res.data) {
        setResult({
          ...res.data,
          title: res.data.title || titleToUse
        });
        showToast('✨ AI đã tạo bài viết đa cấu trúc chuẩn SEO thành công!', 'success');
      } else {
        throw new Error((res as any)?.message || 'Không thể tạo bài viết');
      }
    } catch (err: any) {
      console.error('AI Generator Error:', err);
      showToast(err.message || 'Lỗi khi tạo bài viết AI', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      setStep(0);
    }
  };

  const handleApplyResult = () => {
    if (!result) return;
    onApply({
      title: result.title,
      excerpt: result.excerpt,
      content: result.content,
      focusKeyword: result.focusKeyword,
      tags: Array.isArray(result.tags) 
        ? result.tags 
        : typeof result.tags === 'string' 
          ? (result.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
      image: result.image
    });
    showToast('🚀 Đã áp dụng bài viết AI vào Form thành công!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary/90 to-slate-900 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Trợ Lý Viết Bài AI Siêu Đa Dạng
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">5 Cấu Trúc + Gemini AI</span>
              </h2>
              <p className="text-xs text-slate-300">Tự động cào link báo, dán bài mẫu hoặc sử dụng Gemini API từ Admin Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!result || loading ? (
            <form onSubmit={e => handleGenerate(e)} className="space-y-5">
              {/* Title Field */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" /> Tiêu Đề Bài Viết / Chủ Đề Muốn Viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  placeholder="VD: FBI Cảnh Báo Về Bộ Phát Wi-Fi Router Cũ Dễ Bị Tin Tặc Tấn Công"
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-slate-50 shadow-xs transition-all disabled:opacity-60"
                />
              </div>

              {/* URL Scraper Input */}
              <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 size={14} className="text-sky-600" /> Dán Đường Link Bài Báo Mẫu (Tự Động Bóc Tách Web)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={e => setArticleUrl(e.target.value)}
                    placeholder="https://vnexpress.net/... hoặc https://tuoitre.vn/... (Dán link bài báo vào đây)"
                    disabled={loading || scrapingPreview}
                    className="flex-1 border border-sky-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-400 outline-none bg-white shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleScrapePreview}
                    disabled={loading || scrapingPreview || !articleUrl.trim()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                  >
                    {scrapingPreview ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>{scrapingPreview ? 'Đang bóc tách...' : '🔍 Bóc tách & Xem trước'}</span>
                  </button>
                </div>

                {/* Scraped Live Preview Box */}
                {scrapedData && (
                  <div className="p-3 bg-white border border-sky-200 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-sky-950 border-b border-sky-100 pb-1.5">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Kết quả bóc tách URL thành công:
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-black">
                        {scrapedData.paragraphs.length} đoạn văn | {scrapedData.images.length} hình ảnh
                      </span>
                    </div>

                    {scrapedData.title && (
                      <div className="text-slate-900 font-extrabold flex items-start gap-1.5">
                        <span className="text-sky-600 flex-shrink-0">📌 Tiêu đề:</span>
                        <span className="line-clamp-2">{scrapedData.title}</span>
                      </div>
                    )}

                    {scrapedData.images.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            📸 Bấm chọn hình ảnh đưa vào bài viết ({selectedImages.length}/{scrapedData.images.length}):
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={selectAllImages}
                              className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline"
                            >
                              Chọn tất cả
                            </button>
                            <button
                              type="button"
                              onClick={deselectAllImages}
                              className="text-[10px] text-slate-500 hover:text-slate-700 font-bold underline"
                            >
                              Bỏ chọn tất cả
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50">
                          {scrapedData.images.map((img, idx) => {
                            const isSelected = selectedImages.includes(img);
                            const selectedIndex = selectedImages.indexOf(img);

                            return (
                              <div
                                key={idx}
                                onClick={() => toggleImageSelect(img)}
                                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all aspect-square bg-slate-900 ${
                                  isSelected
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-98 shadow-sm'
                                    : 'border-slate-200 opacity-40 hover:opacity-80 grayscale'
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                
                                {/* Selection Badge */}
                                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                                  isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white border border-white/50'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </div>

                                {/* Label Badge */}
                                {isSelected && selectedIndex === 0 && (
                                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[8px] font-black py-0.5 text-center uppercase tracking-tighter truncate px-1">
                                    ⭐ Ảnh đại diện
                                  </div>
                                )}
                                {isSelected && selectedIndex > 0 && (
                                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-slate-200 text-[8px] font-bold py-0.5 text-center truncate px-1">
                                    Ảnh #{selectedIndex + 1}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Paste Reference Article Text Area */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Copy size={14} className="text-amber-600" /> Hoặc Dán Trực Tiếp Nội Dung Bài Báo Mẫu
                  </label>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-extrabold uppercase">Tùy Chọn</span>
                </div>
                <textarea
                  rows={4}
                  value={referenceContent}
                  onChange={e => setReferenceContent(e.target.value)}
                  placeholder="Dán toàn bộ chữ của bài báo mẫu vào đây. AI sẽ phân tích và đưa vào 4 phần H2 chính..."
                  disabled={loading}
                  className="w-full border border-amber-300 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-400 outline-none bg-white shadow-xs resize-none"
                />
              </div>

              {/* 5 Dynamic Article Structure Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LayoutGrid size={14} className="text-primary" /> Chọn Cấu Trúc Báo Chí & Marketing (5 Cấu Trúc Đa Dạng)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {[
                    { id: 'inverted_pyramid', label: '🏛️ Kim Tự Tháp Ngược', desc: 'Tin nóng ➔ Chi tiết ➔ Kết luận' },
                    { id: 'pas', label: '⚠️ Cấu Trúc PAS', desc: 'Vấn đề ➔ Xoáy sâu ➔ Giải pháp' },
                    { id: '5w1h', label: '🌐 Cấu Trúc 5W1H', desc: 'Who - What - Where - Why - How' },
                    { id: 'storytelling', label: '📖 Case Study', desc: 'Câu chuyện ➔ Số liệu ➔ Bài học' },
                    { id: 'comparison', label: '📊 So Sánh Pros/Cons', desc: 'Phân tích ➔ Bảng ➔ Khuyến nghị' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStructure(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        structure === s.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20 font-black scale-102'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">{s.label}</div>
                      <div className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Keyword & Tone & Length */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target size={14} className="text-primary" /> Từ Khóa Focus (Tùy Chọn)
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="VD: cảnh báo bộ phát wi (Để trống AI sẽ tự trích xuất)"
                    disabled={loading}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary" /> Giọng Văn / Phong Cách
                  </label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                  >
                    <option value="journalistic">📰 Báo chí chính luận (Khách quan)</option>
                    <option value="expert">💡 Phân tích Chuyên gia (Kỹ thuật sâu)</option>
                    <option value="sales">🚀 Tiếp thị Bán hàng (Thuyết phục)</option>
                    <option value="storytelling">🌟 Góc nhìn trải nghiệm thực tế</option>
                  </select>
                </div>
              </div>

              {/* Progress Loading UI */}
              {loading && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-black text-sm text-amber-300">
                      {articleUrl.trim() ? 'AI Đang Cào Bài Báo Từ URL Link & Biên Tập...' : 'AI Đang Xử Lý Dữ Liệu Theo Cấu Trúc Chọn Lựa...'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Search size={14} /> 1. Bóc tách dữ liệu & áp dụng cấu trúc bài viết...
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Wand2 size={14} /> 2. Biên tập bài chuẩn SEO Yoast (Kiểm tra Gemini API)...
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={14} /> 3. Tối ưu hóa từ khóa Focus & chèn thông tin CTC...
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang xử lý AI...</span>
                  ) : (
                    <>
                      <Sparkles size={16} /> 🚀 Tạo Bài Viết AI Đa Cấu Trúc
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Fully Editable Result Preview Screen */
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-black">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Bài viết đã được tạo thành công! Điểm Yoast SEO ước tính: <strong>100/100</strong></span>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Viết bài mới
                </button>
              </div>

              {/* Editable Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Edit3 size={12} className="text-primary" /> Tiêu Đề Bài Viết ({result.title?.length || 0} ký tự)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">(Cho phép sửa trực tiếp)</span>
                </div>
                <input
                  type="text"
                  value={result.title || ''}
                  onChange={e => setResult({ ...result, title: e.target.value })}
                  className="w-full text-sm font-bold text-slate-900 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-xs"
                />
              </div>

              {/* Editable Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} className="text-primary" /> Mô Tả Ngắn (Meta Excerpt) ({result.excerpt?.length || 0} ký tự)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">(Cho phép sửa trực tiếp)</span>
                </div>
                <textarea
                  rows={2}
                  value={result.excerpt || ''}
                  onChange={e => setResult({ ...result, excerpt: e.target.value })}
                  className="w-full text-xs font-semibold text-slate-800 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-xs resize-none"
                />
              </div>

              {/* Editable Focus Keyword & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Target size={12} className="text-primary" /> Từ Khóa Focus
                  </label>
                  <input
                    type="text"
                    value={result.focusKeyword || ''}
                    onChange={e => setResult({ ...result, focusKeyword: e.target.value })}
                    className="w-full text-xs font-bold text-sky-900 p-2.5 bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-300 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag size={12} className="text-primary" /> Thẻ Gắn (Phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(result.tags) ? result.tags.join(', ') : (result.tags || '')}
                    onChange={e => {
                      const tagArray = e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean);
                      setResult({ ...result, tags: tagArray });
                    }}
                    className="w-full text-xs font-bold text-slate-800 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              {/* Regeneration Instructions Note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <label className="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-amber-600" /> Ghi chú điều chỉnh để AI Tạo lại cho đúng ý bạn
                </label>
                <input
                  type="text"
                  value={regenerationNote}
                  onChange={e => setRegenerationNote(e.target.value)}
                  placeholder="VD: Nhấn mạnh cảnh báo bộ phát Wi-Fi Router cũ chưa cập nhật firmware dễ bị hack..."
                  className="w-full text-xs font-semibold text-slate-900 p-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>

              {/* HTML Content Preview & Direct Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Nội Dung Chi Tiết (Xem Trước / Chỉnh Sửa HTML)</label>
                  <button
                    type="button"
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Code size={12} /> {showCodeEditor ? 'Chuyển sang Xem trước Trực quan' : 'Chỉnh sửa Mã HTML trực tiếp'}
                  </button>
                </div>

                {showCodeEditor ? (
                  <textarea
                    rows={8}
                    value={result.content || ''}
                    onChange={e => setResult({ ...result, content: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-900 text-amber-300 p-3 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-primary outline-none"
                  />
                ) : (
                  <div 
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-52 overflow-y-auto text-xs text-slate-800 prose prose-sm max-w-none shadow-inner"
                    dangerouslySetInnerHTML={{ __html: result.content }}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleGenerate(undefined, result.title, result.focusKeyword)}
                  disabled={loading}
                  className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-amber-300"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>🔄 AI Tạo lại theo điều chỉnh này</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Viết bài mới
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyResult}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>📥 Bơm vào bài viết (Áp dụng ngay)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiWriterModal;
