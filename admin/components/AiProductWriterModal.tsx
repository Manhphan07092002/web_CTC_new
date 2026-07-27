import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, X, ArrowRight, Wand2, RefreshCw, FileText, Target, Tag, Edit3, MessageSquare, BookOpen, Layers, Code, Copy, Link2, LayoutGrid, Package, ShieldCheck, Zap } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { formatSeoProductHtml } from '../utils/seoProductFormatter';

interface AiProductWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedData: {
    name: string;
    code?: string;
    focusKeyword: string;
    shortDescription: string;
    description: string;
    specifications: string;
    power?: number;
    efficiency?: number;
    warranty?: string;
    features?: string[];
    technicalSpecs?: { [key: string]: string };
    image?: string;
    images?: string[];
  }) => void;
  initialName?: string;
  initialCode?: string;
  initialCategory?: string;
}

const AiProductWriterModal: React.FC<AiProductWriterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialName = '',
  initialCode = '',
  initialCategory = ''
}) => {
  const { showToast } = useToast();
  const [productName, setProductName] = useState(initialName);
  const [productCode, setProductCode] = useState(initialCode);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [style, setStyle] = useState<'technical' | 'sales' | 'comparison'>('technical');
  const [targetLength, setTargetLength] = useState<'standard' | 'deep'>('deep');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = productName.trim();
    const urlToUse = referenceUrl.trim();

    if (!nameToUse && !urlToUse) {
      showToast('Vui lòng nhập Tên sản phẩm hoặc dán Đường dẫn Link sản phẩm', 'error');
      return;
    }

    setLoading(true);
    setStep(1);

    const timer1 = setTimeout(() => setStep(2), 1500);
    const timer2 = setTimeout(() => setStep(3), 3500);

    try {
      let parsed: any = null;

      // ── BƯỚC 1: Cào dữ liệu thực từ URL (title, ảnh, nội dung gốc) ──
      let scrapedTitle = nameToUse;
      let scrapedImages: string[] = [];
      let scrapedVideos: string[] = [];
      let scrapedRawText = '';

      if (urlToUse) {
        try {
          console.log('[AI Modal] Scraping URL via dedicated endpoint:', urlToUse);
          const scrapeRes = await api.ai.scrapeUrl(urlToUse);
          if (scrapeRes?.data) {
            if (scrapeRes.data.title && !nameToUse) scrapedTitle = scrapeRes.data.title;
            if (scrapeRes.data.images?.length > 0) scrapedImages = scrapeRes.data.images;
            if (scrapeRes.data.videos?.length > 0) scrapedVideos = scrapeRes.data.videos;
            if (scrapeRes.data.rawText) scrapedRawText = scrapeRes.data.rawText;
            console.log(`[AI Modal] Scraped: title="${scrapeRes.data.title}" images=${scrapedImages.length} videos=${scrapedVideos.length} text=${scrapedRawText.length}chars`);
          }
        } catch (scrapeErr) {
          console.warn('[AI Modal] Scrape failed, proceeding with Gemini only:', scrapeErr);
        }
      }

      // ── BƯỚC 2: Gemini viết MÔ TẢ SẢN PHẨM dựa trên nội dung đã cào ──
      const productCode2 = productCode || ('CTC-' + Math.floor(1000 + Math.random() * 9000));

      // Embed video YouTube nếu có
      const videoEmbeds = scrapedVideos.slice(0, 2).map(v => 
        `<div class="my-6 aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src="${v}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
      ).join('\n');

      const prompt = `Bạn là Chuyên gia Sản phẩm & SEO Yoast Top 1 Google của Công ty CTC.

NHIỆM VỤ: Viết TOÀN BỘ thông tin sản phẩm và bài mô tả kỹ thuật CHUẨN SEO 100/100 & DỄ ĐỌC 100/100 bằng tiếng Việt.

═══ THÔNG TIN ĐẦU VÀO ═══
- Tên/Model sản phẩm: "${scrapedTitle || nameToUse || 'Sản phẩm CTC'}"
- Mã sản phẩm: "${productCode2}"
- Danh mục: "${initialCategory || 'Thiết bị Công Nghệ'}"
- Phong cách: ${style === 'technical' ? 'Kỹ thuật chuyên sâu B2B' : style === 'sales' ? 'Thúc đẩy mua hàng B2C' : 'Phân tích so sánh ưu điểm'}
- Độ sâu: ${targetLength === 'deep' ? '900-1200 từ rất chi tiết' : '600-800 từ tiêu chuẩn'}
${urlToUse ? `- Link nguồn: ${urlToUse}` : ''}

═══ NỘI DUNG GỐC CÀO TỪ LINK (BẮT BUỘC BÁM SÁT) ═══
${scrapedRawText ? scrapedRawText.slice(0, 3000) : '(Không có nội dung cào được — hãy tự suy luận từ tên sản phẩm)'}

═══ HÌNH ẢNH ĐÃ CÀO ĐƯỢC TỪ LINK ═══
${scrapedImages.length > 0 ? scrapedImages.map((img, i) => `Ảnh ${i+1}: ${img}`).join('\n') : '(Không cào được ảnh)'}

═══ YÊU CẦU BẮT BUỘC ═══

🔴 TÊN SẢN PHẨM (name):
- PHẢI là tên thực tế bóc tách từ nội dung gốc bên trên
- KHÔNG thêm hậu tố marketing, KHÔNG thêm "– Tin Tức Cập Nhật 2026"
- Ví dụ đúng: "Laptop MSI Modern 14 F1MG-432VN", "Tấm pin Jinko Solar N-Type 580W"

🔴 HÌNH ẢNH (image, images):
${scrapedImages.length > 0 
  ? `- image: Dùng URL ảnh đầu tiên trong danh sách hình ảnh đã cào: "${scrapedImages[0]}"
- images: Dùng các URL ảnh còn lại: ${JSON.stringify(scrapedImages.slice(1, 4))}`
  : `- image: Chọn 1 ảnh Unsplash phù hợp nhất với sản phẩm
- images: Chọn 2-3 ảnh Unsplash phù hợp`}

🔴 MÔ TẢ NGẮN META (shortDescription): 120-160 ký tự, chứa từ khóa focus

🔴 MÔ TẢ CHI TIẾT (description - HTML):
- BẮT BUỘC bám sát và tóm tắt từ "NỘI DUNG GỐC CÀO TỪ LINK" ở trên
- KHÔNG bịa đặt thông số nếu không có trong nội dung gốc
- Cấu trúc: H2 + H3 cho từng phần (Tổng quan, Tính năng, Thông số, Ứng dụng, Mua hàng)
- Từ khóa Focus phải xuất hiện trong 150 từ đầu tiên
- Mật độ từ khóa: 1.2% - 2.0%
- Câu văn: tối đa 16 từ/câu
- Đoạn văn: mỗi <p> tối đa 60 từ
- BẮT BUỘC có ít nhất 2 <ul><li> danh sách (tính năng, ứng dụng)
- Dùng 4-6 từ nối: "Tuy nhiên", "Bên cạnh đó", "Do đó", "Vì vậy", "Đặc biệt", "Ngoài ra"
${videoEmbeds ? `- Chèn video embed này vào giữa bài: ${videoEmbeds}` : ''}
- Cuối bài: <p class="mt-4 pt-4 border-t">Quý khách tham khảo thêm tại <a href="/products" class="text-primary font-bold hover:underline">Danh mục Sản phẩm CTC</a> hoặc <a href="/contact" class="text-primary font-bold hover:underline">Liên Hệ Báo Giá</a>.</p>

Trả về JSON thuần (KHÔNG bọc markdown):
{
  "name": "Tên sản phẩm chính xác từ nội dung gốc",
  "code": "${productCode2}",
  "focusKeyword": "từ khóa SEO 2-4 từ",
  "shortDescription": "Mô tả meta 120-160 ký tự...",
  "image": "${scrapedImages[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'}",
  "images": ${JSON.stringify(scrapedImages.slice(1, 4).length > 0 ? scrapedImages.slice(1, 4) : ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800'])},
  "description": "<p>Đoạn mở đầu bám sát nội dung gốc, chứa từ khóa focus...</p><h2>Tổng Quan Sản Phẩm</h2>...",
  "specifications": "Thông số kỹ thuật rút gọn từ nội dung gốc...",
  "warranty": "Theo nhà sản xuất",
  "features": ["Tính năng 1 từ nội dung gốc", "Tính năng 2", "Tính năng 3"],
  "technicalSpecs": { "Thông số 1": "Giá trị từ nội dung gốc" }
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

      if (parsed && (parsed.name || parsed.description)) {
        const kwToUse = parsed.focusKeyword || focusKeyword || parsed.name || 'sản phẩm';

        // Merge scraped images với images từ Gemini (ưu tiên scraped)
        const finalMainImg = scrapedImages[0] || parsed.image || '';
        const finalExtraImgs = scrapedImages.length > 1
          ? scrapedImages.slice(1, 4)
          : (parsed.images || []);

        const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
          parsed.description || '',
          kwToUse,
          finalMainImg,
          finalExtraImgs
        );

        setResult({
          ...parsed,
          name: parsed.name || scrapedTitle || nameToUse,
          focusKeyword: kwToUse,
          description: cleanHtml,
          image: finalMainImage,
          images: finalExtraImages,
          _scrapedVideos: scrapedVideos // Store for reference
        });
        showToast('✨ AI đã cào dữ liệu thực từ link và viết mô tả sản phẩm thành công!', 'success');
      } else {
        throw new Error('Không thể đọc cấu trúc dữ liệu sản phẩm từ AI');
      }
    } catch (err: any) {
      console.error('AI Product Generator Error:', err);
      showToast(err.message || 'Lỗi khi kết nối AI Gemini', 'error');
    } finally {
      setLoading(false);
      setStep(0);
    }
  };



  const handleApplyResult = () => {
    if (!result) return;
    onApply({
      name: result.name || productName,
      code: result.code || productCode,
      focusKeyword: result.focusKeyword || focusKeyword || productName.toLowerCase(),
      shortDescription: result.shortDescription || '',
      description: result.description || '',
      specifications: result.specifications || '',
      power: typeof result.power === 'number' ? result.power : parseFloat(result.power) || 0,
      efficiency: typeof result.efficiency === 'number' ? result.efficiency : parseFloat(result.efficiency) || 0,
      warranty: result.warranty || '24 tháng',
      features: Array.isArray(result.features) ? result.features : [],
      technicalSpecs: typeof result.technicalSpecs === 'object' ? result.technicalSpecs : {},
      image: result.image || '',
      images: Array.isArray(result.images) ? result.images : []
    });
    showToast('🎉 Đã áp dụng Tên sản phẩm, Ảnh chính, 1-3 Ảnh phụ & Bài viết AI vào Form thành công!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
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
              <Package size={24} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                ✨ Gemini AI Product Generator
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
                Trợ Lý AI Tạo Sản Phẩm Chuẩn SEO Yoast (100/100)
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-200 ml-12 font-medium">
            Tự động viết tên, mã model, mô tả chuẩn SEO, từ khóa Focus, thông số kỹ thuật & tính năng sản phẩm chỉ trong vài giây.
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
                  Đang tạo sản phẩm AI...
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
                {step === 1 && '🔍 Đang phân tích mã model & tra cứu thông tin sản phẩm...'}
                {step === 2 && '🎯 Đang bóc tách từ khóa Focus & lập cấu trúc H2/H3 chuẩn Yoast...'}
                {step === 3 && '✍️ Đang viết bài mô tả chi tiết, bảng thông số kỹ thuật & tối ưu độ dễ đọc 90-100...'}
              </p>
            </div>
          )}

          {!result ? (
            /* Input Form */
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Tên hoặc Model sản phẩm <span className="text-emerald-600 font-bold lowercase">(tự động từ Link nếu để trống)</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="VD: Laptop ASUS Vivobook (hoặc để trống nếu đã dán Link)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Mã sản phẩm / SKU (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    placeholder="VD: S3407VA-LY146W"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Target size={13} className="text-primary" /> Từ khóa SEO Focus (Tự động nếu trống)
                  </label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    placeholder="VD: laptop asus vivobook"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Link2 size={13} className="text-primary" /> Link tham khảo / Mã Datasheet (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={e => setReferenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <span>🌐 AI sẽ tự động cào dữ liệu, trích xuất hình ảnh thực tế & nhúng video YouTube/Vimeo từ link này!</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Phong cách bài viết
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStyle('technical')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'technical' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ⚙️ Kỹ thuật B2B
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('sales')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'sales' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🔥 Bán hàng B2C
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('comparison')}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        style === 'comparison' ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📊 So sánh ưu điểm
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Độ sâu nội dung
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetLength('standard')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        targetLength === 'standard' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📝 Tiêu chuẩn (600-800 từ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLength('deep')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        targetLength === 'deep' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      🚀 Chuyên sâu (900-1200 từ)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} className="text-amber-200 animate-pulse" />
                  Bắt Đầu Tạo Sản Phẩm AI
                </button>
              </div>
            </form>
          ) : (
            /* Result Generated - Editable Preview */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-black">
                    🎉 AI tạo xong! Chỉnh sửa bên dưới nếu cần, rồi nhấn Áp dụng.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    ✨ AI Tạo Lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 size={12} /> Nhập lại yêu cầu
                  </button>
                </div>
              </div>

              {/* Editable summary fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={result.name || ''}
                    onChange={e => setResult({ ...result, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mã Model / SKU</label>
                  <input
                    type="text"
                    value={result.code || ''}
                    onChange={e => setResult({ ...result, code: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">🔑 Từ khóa Focus</label>
                  <input
                    type="text"
                    value={result.focusKeyword || ''}
                    onChange={e => setResult({ ...result, focusKeyword: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-primary/40 rounded-xl text-xs font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Editable Meta Description */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                  📝 Mô tả ngắn Meta ({result.shortDescription?.length || 0}/160 ký tự)
                </label>
                <textarea
                  value={result.shortDescription || ''}
                  onChange={e => setResult({ ...result, shortDescription: e.target.value })}
                  rows={2}
                  maxLength={160}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 italic focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>

              {/* Scraped Images - editable with delete & URL edit */}
              {(result.image || (Array.isArray(result.images) && result.images.length > 0)) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    📸 Hình ảnh sản phẩm (xóa ảnh sai, sửa URL nếu cần):
                  </span>
                  <div className="flex items-start gap-3 overflow-x-auto pb-1 flex-wrap">
                    {result.image && (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative">
                          <img
                            src={result.image}
                            alt="Main"
                            className="w-20 h-20 object-cover rounded-xl border-2 border-primary shadow-xs"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'; }}
                          />
                          <button
                            type="button"
                            onClick={() => setResult({ ...result, image: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                          ><X size={10} /></button>
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded">Ảnh chính</span>
                        </div>
                        <input
                          type="text"
                          value={result.image || ''}
                          onChange={e => setResult({ ...result, image: e.target.value })}
                          className="w-20 text-[9px] text-slate-500 border border-slate-200 rounded px-1 py-0.5 outline-none truncate bg-white"
                          placeholder="URL ảnh..."
                        />
                      </div>
                    )}
                    {Array.isArray(result.images) && result.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative">
                          <img
                            src={imgUrl}
                            alt={`Extra ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-xs"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800'; }}
                          />
                          <button
                            type="button"
                            onClick={() => { const ni = [...result.images]; ni.splice(idx,1); setResult({ ...result, images: ni }); }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer"
                          ><X size={10} /></button>
                          <span className="absolute bottom-1 left-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Ảnh phụ {idx+1}</span>
                        </div>
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={e => { const ni = [...result.images]; ni[idx] = e.target.value; setResult({ ...result, images: ni }); }}
                          className="w-20 text-[9px] text-slate-500 border border-slate-200 rounded px-1 py-0.5 outline-none truncate bg-white"
                          placeholder="URL ảnh..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs for preview vs editable HTML */}
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
                  ✏️ Chỉnh sửa HTML
                </button>
              </div>

              {!showCodeEditor ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-white max-h-80 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: result.description || '' }}
                  />
                </div>
              ) : (
                <textarea
                  value={result.description || ''}
                  onChange={e => setResult({ ...result, description: e.target.value })}
                  rows={12}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 outline-none resize-y"
                  placeholder="Chỉnh sửa mã HTML bài viết tại đây..."
                />
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  ✨ AI Tạo Lại Nội Dung Mới
                </button>
                <button
                  type="button"
                  onClick={handleApplyResult}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  ✅ Áp Dụng Tất Cả Vào Form Sản Phẩm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiProductWriterModal;
