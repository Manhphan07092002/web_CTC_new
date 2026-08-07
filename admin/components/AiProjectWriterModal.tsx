import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, X, ArrowRight, Wand2, RefreshCw, FileText, Target, Tag, Edit3, MessageSquare, BookOpen, Layers, Code, Copy, Link2, LayoutGrid, Building2, MapPin, Zap, Calendar } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { formatSeoProductHtml } from '../utils/seoProductFormatter';

interface AiProjectWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedData: {
    title: string;
    location: string;
    capacity: string;
    completionDate: string;
    focusKeyword: string;
    excerpt: string;
    content: string;
    image: string;
    images?: string[];
  }) => void;
  initialTitle?: string;
  initialLocation?: string;
  initialCategory?: string;
}

const AiProjectWriterModal: React.FC<AiProjectWriterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialTitle = '',
  initialLocation = '',
  initialCategory = ''
}) => {
  const { showToast } = useToast();
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [style, setStyle] = useState<'technical' | 'storytelling' | 'roi'>('technical');
  const [targetLength, setTargetLength] = useState<'standard' | 'deep'>('deep');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const titleToUse = projectTitle.trim();
    const urlToUse = referenceUrl.trim();

    if (!titleToUse && !urlToUse) {
      showToast('Vui lòng nhập Tên dự án hoặc dán Link bài viết dự án mẫu', 'error');
      return;
    }

    setLoading(true);
    setStep(1);

    const timer1 = setTimeout(() => setStep(2), 1500);
    const timer2 = setTimeout(() => setStep(3), 3500);

    try {
      let parsed: any = null;

      // ── BƯỚC 1: Cào dữ liệu thực từ URL ──
      let scrapedTitle = titleToUse;
      let scrapedImages: string[] = [];
      let scrapedVideos: string[] = [];
      let scrapedRawText = '';

      if (urlToUse) {
        try {
          console.log('[AI Project Modal] Scraping URL:', urlToUse);
          const scrapeRes = await api.ai.scrapeUrl(urlToUse);
          if (scrapeRes?.data) {
            if (scrapeRes.data.title && !titleToUse) scrapedTitle = scrapeRes.data.title;
            if (scrapeRes.data.images?.length > 0) scrapedImages = scrapeRes.data.images;
            if (scrapeRes.data.videos?.length > 0) scrapedVideos = scrapeRes.data.videos;
            if (scrapeRes.data.rawText) scrapedRawText = scrapeRes.data.rawText;
          }
        } catch (scrapeErr) {
          console.warn('[AI Project Modal] Scrape failed:', scrapeErr);
        }
      }

      // ── BƯỚC 2: Gemini viết Case Study Dự án dựa trên nội dung đã cào ──
      const videoEmbeds = scrapedVideos.slice(0, 2).map(v => 
        `<div class="my-6 aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src="${v}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
      ).join('\n');

      const prompt = `Bạn là Giám đốc Dự án & Chuyên gia Kỹ thuật CTC (Công ty Cổ phần Xây lắp Bưu Điện Miền Trung), đồng thời là chuyên gia SEO Yoast Top 1 Google.

NHIỆM VỤ: Viết TOÀN BỘ hồ sơ năng lực / bài viết Case Study dự án CHUẨN SEO 100/100 & DỄ ĐỌC 100/100 bằng tiếng Việt.

═══ THÔNG TIN ĐẦU VÀO ═══
- Tên/Quy mô dự án: "${scrapedTitle || titleToUse || 'Dự án CTC'}"
- Địa điểm: "${location || 'Miền Trung & Toàn Quốc'}"
- Danh mục công trình: "${initialCategory || 'Hạ Tầng Số & Năng Lượng'}"
- Phong cách: ${style === 'technical' ? 'Báo cáo kỹ thuật B2B' : style === 'storytelling' ? 'Câu chuyện thực tế & Review' : 'Phân tích hiệu quả đầu tư'}
- Độ sâu: ${targetLength === 'deep' ? '900-1200 từ chi tiết' : '600-800 từ tiêu chuẩn'}
${urlToUse ? `- Link tham khảo: ${urlToUse}` : ''}

═══ NỘI DUNG GỐC CÀO TỪ LINK (BẮT BUỘC BÁM SÁT) ═══
${scrapedRawText ? scrapedRawText.slice(0, 3000) : '(Không có nội dung cào được — hãy tự suy luận từ tên dự án)'}

═══ HÌNH ẢNH CÀO ĐƯỢC ═══
${scrapedImages.length > 0 ? scrapedImages.map((img, i) => `Ảnh ${i+1}: ${img}`).join('\n') : '(Không cào được ảnh)'}

═══ YÊU CẦU BẮT BUỘC ═══

🔴 TÊN DỰ ÁN (title):
- Tên dự án thực tế bóc tách từ nội dung gốc
- KHÔNG thêm hậu tố marketing, KHÔNG thêm "– Tin Tức Cập Nhật 2026"

🔴 ĐỊA ĐIỂM & QUY MÔ (location, capacity, completionDate):
- Tự động bóc tách từ nội dung gốc (Ví dụ location: "Quảng Nam", capacity: "2.5 MWp", completionDate: "2026")

🔴 NỘI DUNG CHI TIẾT (content - HTML):
- BẮT BUỘC bám sát từ "NỘI DUNG GỐC CÀO TỪ LINK"
- Cấu trúc H2/H3 (Tổng quan, Hạng mục thi công, Giải pháp kỹ thuật, Kết quả nghiệm thu)
- Từ khóa Focus trong 150 từ đầu
- Câu văn ngắn (<16 từ), đoạn văn ngắn (<60 từ)
- Có ít nhất 2 danh sách <ul><li>...</li></ul>
${videoEmbeds ? `- Chèn video embed này vào bài: ${videoEmbeds}` : ''}
- Cuối bài chèn liên kết nội bộ trang /projects và /contact

Trả về JSON thuần (KHÔNG bọc markdown):
{
  "title": "Tên dự án chính xác từ nội dung gốc",
  "location": "Địa điểm thi công",
  "capacity": "Quy mô / Công suất",
  "completionDate": "2026",
  "focusKeyword": "từ khóa SEO dự án",
  "excerpt": "Mô tả meta 120-160 ký tự...",
  "image": "${scrapedImages[0] || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800'}",
  "images": ${JSON.stringify(scrapedImages.slice(1, 4).length > 0 ? scrapedImages.slice(1, 4) : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'])},
  "content": "<p>Đoạn mở đầu bám sát nội dung gốc...</p><h2>...</h2>..."
}`;

      const response = await chatService.sendMessage(prompt);
      clearTimeout(timer1);
      clearTimeout(timer2);

      try {
        const cleanResponse = response.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleanResponse.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (jsonErr) {
            const fixedJson = match[0].replace(/\n/g, '\\n').replace(/\r/g, '\\r');
            parsed = JSON.parse(fixedJson);
          }
        }
      } catch (e) {
        console.warn('JSON parse error, fallback to raw:', e);
      }

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (parsed && (parsed.title || parsed.content)) {
        const kwToUse = parsed.focusKeyword || focusKeyword || parsed.title || 'dự án ctc';

        const finalMainImg = scrapedImages[0] || parsed.image || '';
        const finalExtraImgs = scrapedImages.length > 1 ? scrapedImages.slice(1, 4) : (parsed.images || []);

        const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
          parsed.content || '',
          kwToUse,
          finalMainImg,
          finalExtraImgs
        );

        setResult({
          ...parsed,
          title: parsed.title || scrapedTitle || titleToUse,
          focusKeyword: kwToUse,
          content: cleanHtml,
          image: finalMainImage,
          images: finalExtraImages
        });
        showToast('✨ AI đã cào dữ liệu & viết hồ sơ Dự án chuẩn SEO thành công!', 'success');
      } else {
        throw new Error('Không thể đọc cấu trúc dữ liệu dự án từ AI');
      }
    } catch (err: any) {
      console.error('AI Project Generator Error:', err);
      showToast(err.message || 'Lỗi khi kết nối AI Gemini', 'error');
    } finally {
      setLoading(false);
      setStep(0);
    }
  };

  const handleApplyResult = () => {
    if (!result) return;
    onApply({
      title: result.title || projectTitle,
      location: result.location || location || 'Việt Nam',
      capacity: result.capacity || 'Tiêu chuẩn',
      completionDate: result.completionDate || '2026',
      focusKeyword: result.focusKeyword || focusKeyword || 'du an ctc',
      excerpt: result.excerpt || '',
      content: result.content || '',
      image: result.image || '',
      images: Array.isArray(result.images) ? result.images : []
    });
    showToast('🎉 Đã áp dụng Tên dự án, Địa điểm, Ảnh công trình & Nội dung AI vào Form thành công!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary to-secondary p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Building2 size={24} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                ✨ Gemini AI Project Generator
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
                Trợ Lý AI Tạo Dự Án Chuẩn SEO Yoast (100/100)
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-200 ml-12 font-medium">
            Tự động cào dữ liệu, sinh tên dự án, địa điểm, công suất, ảnh công trình & viết bài Case Study chuẩn SEO 100/100.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Step animation bar */}
          {loading && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Wand2 size={16} className="animate-spin text-amber-300" />
                  Đang tạo bài viết dự án AI...
                </span>
                <span className="text-xs text-slate-400 font-bold">Bước {step}/3</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 via-primary to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              <p className="text-sm font-semibold text-slate-200">
                {step === 1 && '🔍 Đang cào thông tin công trình & địa điểm dự án...'}
                {step === 2 && '🎯 Đang bóc tách từ khóa Focus & lập cấu trúc Case Study H2/H3 chuẩn Yoast...'}
                {step === 3 && '✍️ Đang viết bài phân tích kỹ thuật, chèn ảnh công trình & tối ưu độ dễ đọc 90-100...'}
              </p>
            </div>
          )}

          {!result ? (
            /* Input Form */
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Tên hoặc Quy mô Dự án <span className="text-emerald-600 dark:text-emerald-400 font-bold lowercase">(tự động từ Link nếu để trống)</span>
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="VD: Điện mặt trời áp mái 1.2MWp KCN Quảng Ngãi"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin size={13} className="text-primary" /> Địa điểm thi công (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="VD: Đà Nẵng, Quảng Ngãi"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Target size={13} className="text-primary" /> Từ khóa SEO Focus (Tự động nếu trống)
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="VD: điện mặt trời áp mái"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Link2 size={13} className="text-primary" /> Link tham khảo Case Study dự án (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={e => setReferenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    🌐 AI sẽ tự động cào dữ liệu, trích xuất hình ảnh thực tế & nhúng video từ link này!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Phong cách bài viết
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStyle('technical')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'technical' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      ⚙️ Kỹ thuật B2B
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('storytelling')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'storytelling' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      📖 Case Study
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('roi')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'roi' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      💰 Hiệu quả ROI
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Độ sâu nội dung
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetLength('standard')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        targetLength === 'standard' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      📝 Tiêu chuẩn (600-800 từ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLength('deep')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        targetLength === 'deep' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      🚀 Chuyên sâu (900-1200 từ)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} className="text-amber-200 animate-pulse" />
                  Bắt Đầu Tạo Dự Án AI
                </button>
              </div>
            </form>
          ) : (
            /* Result Generated Preview */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-black">
                    🎉 Đã tự động tạo hồ sơ Dự án & bài viết chuẩn SEO 100/100 thành công!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs font-bold text-slate-600 hover:text-primary flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Tạo lại
                </button>
              </div>

              {/* Generated summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Tên Dự án</span>
                  <p className="text-xs font-black text-slate-800 truncate">{result.title}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Địa điểm</span>
                  <p className="text-xs font-bold text-slate-800 truncate">📍 {result.location}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Quy mô/Công suất</span>
                  <p className="text-xs font-bold text-slate-800 truncate">⚡ {result.capacity}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Từ khóa Focus</span>
                  <p className="text-xs font-black text-primary truncate">🔑 "{result.focusKeyword}"</p>
                </div>
              </div>

              {/* Scraped Images Preview Cards */}
              {(result.image || (Array.isArray(result.images) && result.images.length > 0)) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    📸 Hình ảnh công trình AI cào & tự động điền vào Form:
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {result.image && (
                      <div className="relative group flex-shrink-0">
                        <img
                          src={result.image}
                          alt="Main Project"
                          className="w-20 h-20 object-cover rounded-xl border-2 border-primary shadow-xs"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800';
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded">Ảnh chính</span>
                      </div>
                    )}
                    {Array.isArray(result.images) && result.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <img
                          src={imgUrl}
                          alt={`Extra ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-xs"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            const fallbacks = [
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
                              'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'
                            ];
                            e.currentTarget.src = fallbacks[idx % fallbacks.length];
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Ảnh phụ {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs for preview vs HTML code */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(false)}
                  className={`py-2 px-4 text-xs font-black border-b-2 cursor-pointer ${
                    !showCodeEditor ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👁️ Xem trước hiển thị
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(true)}
                  className={`py-2 px-4 text-xs font-black border-b-2 cursor-pointer ${
                    showCodeEditor ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💻 Mã HTML bài viết
                </button>
              </div>

              {!showCodeEditor ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-white max-h-96 overflow-y-auto space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs font-bold text-slate-400">Mô tả tóm tắt Meta ({result.excerpt?.length || 0} ký tự):</span>
                    <p className="text-sm font-medium text-slate-700 italic border-l-2 border-primary pl-3 mt-1">
                      {result.excerpt}
                    </p>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: result.content || '' }}
                  />
                </div>
              ) : (
                <textarea
                  readOnly
                  value={result.content || ''}
                  rows={10}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 outline-none"
                />
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tạo Lại Bài Khác
                </button>
                <button
                  type="button"
                  onClick={handleApplyResult}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  ✅ Áp Dụng Tất Cả Vào Form Dự Án
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiProjectWriterModal;
