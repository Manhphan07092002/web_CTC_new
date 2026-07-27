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

    const timer1 = setTimeout(() => setStep(2), 1200);
    const timer2 = setTimeout(() => setStep(3), 2800);

    try {
      let parsed: any = null;

      // 1. Try server-side scraping if URL is provided
      if (urlToUse) {
        try {
          const res = await api.ai.generateArticle({
            title: nameToUse || 'Sản phẩm mới từ link',
            focusKeyword: focusKeyword.trim(),
            tone: style,
            targetLength,
            articleUrl: urlToUse
          });

          if (res && res.data) {
            parsed = {
              name: res.data.title || nameToUse || 'Sản phẩm CTC',
              code: productCode || ('CTC-' + Math.floor(1000 + Math.random() * 9000)),
              focusKeyword: res.data.focusKeyword || focusKeyword || 'san pham ctc',
              shortDescription: res.data.excerpt || '',
              description: res.data.content || '',
              specifications: 'Sản phẩm chính hãng CTC đầy đủ chứng nhận CO/CQ',
              image: res.data.image,
              images: res.data.images || [],
              warranty: '24 tháng chính hãng'
            };
          }
        } catch (serverErr) {
          console.warn('[AI Scraper API Fallback to Gemini LLM]:', serverErr);
        }
      }

      // 2. Client-side Gemini fallback prompt if server scraper didn't return complete JSON
      if (!parsed) {
        const prompt = `Bạn là chuyên gia kỹ thuật & Giám đốc Sản phẩm CTC, đồng thời là chuyên gia SEO Yoast Top 1 Google.
Hãy tự động tạo TOÀN BỘ thông tin sản phẩm và bài viết mô tả kỹ thuật CHUẨN SEO 100/100 & DỄ ĐỌC 100/100 bằng tiếng Việt cho website Công ty CTC.

Thông tin đầu vào:
- Tên/Model sản phẩm: "${nameToUse || 'TỰ ĐỘNG BÓC TÁCH TỪ LINK'}"
- Mã sản phẩm: "${productCode || 'Auto'}"
- Danh mục: "${initialCategory || 'Thiết bị Công Nghệ & Điện Tử'}"
- Link sản phẩm/bài viết tham khảo: "${urlToUse || 'None'}"
- Phong cách: ${style === 'technical' ? 'Kỹ thuật chuyên sâu B2B' : style === 'sales' ? 'Thúc đẩy mua hàng B2C' : 'Phân tích so sánh ưu điểm'}
- Độ sâu bài viết: ${targetLength === 'deep' ? 'Viết rất chi tiết 900-1200 từ' : 'Tiêu chuẩn 600-800 từ'}

YÊU CẦU SEO YOAST & READABILITY BẮT BUỘC:
1. name: Nếu tên sản phẩm trống, BẮT BUỘC tự động sinh Tên sản phẩm chuẩn SEO hấp dẫn nhất dựa theo link sản phẩm (${urlToUse}).
2. focusKeyword: Rút ra 1 từ khóa SEO chính 2-4 từ đại diện tốt nhất cho sản phẩm.
3. shortDescription: Mô tả ngắn Meta CHÍNH XÁC từ 120 đến 160 ký tự, BẮT BUỘC CHỨA TỪ KHÓA FOCUS.
4. image: BẮT BUỘC trả về URL Ảnh chính sắc nét nhất cào được từ link (${urlToUse}).
5. images: BẮT BUỘC trả về MẢNG CHỨA 1 ĐẾN 3 URL Hình ảnh bổ sung (ảnh thực tế, ảnh các góc nghiêng) cào được từ link (${urlToUse}).
6. description (HTML): 
   - Bài viết mô tả sản phẩm hấp dẫn, đầy đủ cấu trúc H2 và H3.
   - Từ khóa Focus xuất hiện ngay 150 từ đầu tiên.
   - Mật độ từ khóa Focus 1.2% - 2.0%.
   - CÂU VĂN NGẮN: Tất cả câu văn dưới 16 từ/câu, ngắt chấm thường xuyên.
   - ĐOẠN VĂN NGẮN: Mỗi thẻ <p> chỉ 2-3 câu ngắn (dưới 60 từ).
   - CHÈN DANH SÁCH: BẮT BUỘC có ít nhất 2 danh sách <ul><li>...</li></ul> cho Tính năng nổi bật & Ứng dụng.
   - TỪ NỐI CHUYỂN TIẾP: Dùng ít nhất 4-6 từ nối ("Tuy nhiên", "Bên cạnh đó", "Do đó", "Vì vậy", "Đặc biệt", "Ngoài ra").
   - LIÊN KẾT NỘI BỘ: Ở cuối bài viết BẮT BUỘC có: <p class="mt-4 pt-4 border-t">Quý khách có thể tham khảo thêm các thiết bị tại <a href="/products" class="text-primary font-bold hover:underline">Danh mục Sản phẩm CTC</a> hoặc liên hệ báo giá tại <a href="/contact" class="text-primary font-bold hover:underline">Trang Liên Hệ CTC</a>.</p>.

Trả về KẾT QUẢ DUY NHẤT dưới dạng JSON chuẩn (không bọc trong markdown codeblock):

{
  "name": "Tên sản phẩm tự động sinh...",
  "code": "${productCode || 'CTC-' + Math.floor(1000 + Math.random() * 9000)}",
  "focusKeyword": "${focusKeyword || 'san pham'}",
  "shortDescription": "Đoạn mô tả ngắn Meta 120-160 ký tự...",
  "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
  "images": [
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800"
  ],
  "description": "<p>Đoạn mở đầu chứa từ khóa focus...</p><h2>...</h2>...",
  "specifications": "Tóm tắt tổng quan thông số kỹ thuật...",
  "power": 0.55,
  "efficiency": 21.5,
  "warranty": "24 tháng chính hãng",
  "features": [
    "Tính năng nổi bật 1",
    "Tính năng nổi bật 2",
    "Tính năng nổi bật 3"
  ],
  "technicalSpecs": {
    "Kích thước": "Tiêu chuẩn nhà sản xuất",
    "Bảo hành": "Chính hãng 24 tháng"
  }
}
`;

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
      }

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (parsed && (parsed.name || parsed.description)) {
        const kwToUse = parsed.focusKeyword || focusKeyword || parsed.name || 'sản phẩm';
        const { cleanHtml, finalMainImage, finalExtraImages } = formatSeoProductHtml(
          parsed.description || '',
          kwToUse,
          parsed.image,
          parsed.images || []
        );

        setResult({
          ...parsed,
          focusKeyword: kwToUse,
          description: cleanHtml,
          image: finalMainImage,
          images: finalExtraImages
        });
        showToast('✨ AI đã tự động cào thông tin, sinh tên sản phẩm & trích xuất hình ảnh thành công!', 'success');
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
            /* Result Generated Preview */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-black">
                    🎉 Đã tự động tạo sản phẩm & bài viết chuẩn SEO 100/100 thành công!
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Tên sản phẩm</span>
                  <p className="text-xs font-black text-slate-800 truncate">{result.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Mã Model / SKU</span>
                  <p className="text-xs font-bold text-slate-800">{result.code || 'N/A'}</p>
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
                    📸 Hình ảnh sản phẩm AI cào & tự động điền vào Form:
                  </span>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {result.image && (
                      <div className="relative group flex-shrink-0">
                        <img src={result.image} alt="Main Product" className="w-20 h-20 object-cover rounded-xl border-2 border-primary shadow-xs" />
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded">Ảnh chính</span>
                      </div>
                    )}
                    {Array.isArray(result.images) && result.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <img src={imgUrl} alt={`Extra ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-xs" />
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
                    <span className="text-xs font-bold text-slate-400">Mô tả ngắn Meta ({result.shortDescription?.length || 0} ký tự):</span>
                    <p className="text-sm font-medium text-slate-700 italic border-l-2 border-primary pl-3 mt-1">
                      {result.shortDescription}
                    </p>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: result.description || '' }}
                  />
                </div>
              ) : (
                <textarea
                  readOnly
                  value={result.description || ''}
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
