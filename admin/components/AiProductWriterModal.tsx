import React, { useState } from 'react';
import { Sparkles, CheckCircle2, X, Wand2, RefreshCw, Target, Edit3, Link2, Code, Package, ShieldCheck, FileText, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

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
  const [sampleText, setSampleText] = useState('');
  const [style, setStyle] = useState<'technical' | 'sales' | 'comparison'>('technical');
  const [targetLength, setTargetLength] = useState<'standard' | 'deep'>('deep');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [stepLabel, setStepLabel] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const [scrapingPreview, setScrapingPreview] = useState(false);
  const [scrapedData, setScrapedData] = useState<{
    scrapedTitle: string;
    scrapedParagraphs: string[];
    scrapedImages: string[];
    scrapedVideos: string[];
    specifications: { [key: string]: string };
    rawText: string;
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleScrapePreview = async () => {
    if (!referenceUrl.trim().startsWith('http')) {
      showToast('Vui lòng nhập đường link URL sản phẩm hợp lệ (bắt đầu bằng http:// hoặc https://)', 'error');
      return;
    }

    setScrapingPreview(true);
    try {
      const res = await api.ai.scrapeProductUrl(referenceUrl.trim());
      if (res && res.success && res.data) {
        setScrapedData(res.data);
        setSelectedImages(res.data.scrapedImages || []);
        if (res.data.scrapedTitle && !productName) {
          setProductName(res.data.scrapedTitle);
        }
        showToast(`✨ Bóc tách thành công: ${Object.keys(res.data.specifications || {}).length} thông số & ${res.data.scrapedImages?.length || 0} hình ảnh!`, 'success');
      } else {
        showToast('Không thể bóc tách dữ liệu từ URL sản phẩm này', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi bóc tách URL sản phẩm', 'error');
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
    if (scrapedData?.scrapedImages) setSelectedImages(scrapedData.scrapedImages);
  };

  const deselectAllImages = () => {
    setSelectedImages([]);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = productName.trim();
    const urlToUse = referenceUrl.trim();
    const sampleTextToUse = sampleText.trim();

    if (!nameToUse && !urlToUse && !sampleTextToUse) {
      showToast('Vui lòng nhập Tên sản phẩm, dán Link hoặc dán Văn bản sản phẩm mẫu', 'error');
      return;
    }

    setLoading(true);
    setStep(1);
    setStepLabel('🔍 Đang cào dữ liệu & phân tích thông số sản phẩm...');
    const timer1 = setTimeout(() => { setStep(2); setStepLabel('🎯 Đang tối ưu câu văn chuẩn 100/100 Dễ Đọc...'); }, 2000);
    const timer2 = setTimeout(() => { setStep(3); setStepLabel('✍️ AI đang tổng hợp bài mô tả sản phẩm chuẩn SEO...'); }, 4500);

    try {
      const res = await api.ai.generateProduct({
        name: nameToUse,
        code: productCode,
        focusKeyword: focusKeyword.trim(),
        style,
        targetLength,
        sampleText: sampleTextToUse,
        productUrl: urlToUse,
        selectedImages
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res && res.success && res.data) {
        setResult(res.data);
        if (res.data.name && !productName) setProductName(res.data.name);
        if (res.data.code && !productCode) setProductCode(res.data.code);
        if (res.data.focusKeyword && !focusKeyword) setFocusKeyword(res.data.focusKeyword);
        showToast('✨ AI đã tạo bài viết sản phẩm chuẩn SEO 100/100 thành công!', 'success');
      } else {
        throw new Error((res as any)?.message || 'Không thể tạo bài viết sản phẩm');
      }
    } catch (err: any) {
      console.error('Product AI Generator Error:', err);
      showToast(err.message || 'Lỗi khi tạo bài viết sản phẩm AI', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      setStep(0);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply({
      name: result.name || productName,
      code: result.code || productCode,
      focusKeyword: result.focusKeyword || focusKeyword,
      shortDescription: result.shortDescription || '',
      description: result.description || '',
      specifications: result.specifications || '',
      power: result.power,
      efficiency: result.efficiency,
      warranty: result.warranty,
      features: result.features || [],
      technicalSpecs: result.technicalSpecs || {},
      image: result.image || '',
      images: result.images || []
    });
    showToast('✨ Đã áp dụng toàn bộ thông tin sản phẩm và thông số kỹ thuật từ AI!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
              <Package size={22} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                ✨ Product AI Assistant 2026
              </span>
              <h2 className="text-lg md:text-xl font-black text-white">
                Trợ Lý AI Viết Bài Sản Phẩm Chuẩn SEO 100/100
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step animation bar */}
          {loading && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Wand2 size={16} className="animate-spin text-emerald-300" />
                  Đang xử lý... Bước {step}/3
                </span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 h-full transition-all duration-700 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-200">{stepLabel}</p>
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
                    placeholder="VD: Inverter Hòa Lưới Deye 12kW 3 Pha (SUN-12K-SG04LP3)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
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
                    placeholder="VD: SUN-12K-SG04LP3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                  />
                </div>
              </div>

              {/* URL Scraper Input with Live Preview */}
              <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-2">
                <label className="block text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 size={14} className="text-sky-600" /> Dán Link Sản Phẩm Mẫu (Tự Động Bóc Tách Web)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={e => setReferenceUrl(e.target.value)}
                    placeholder="https://... (Dán link sản phẩm từ shopee, tiki, dienmayxanh hoặc web đối thủ)"
                    disabled={loading || scrapingPreview}
                    className="flex-1 border border-sky-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-400 outline-none bg-white shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleScrapePreview}
                    disabled={loading || scrapingPreview || !referenceUrl.trim()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                  >
                    {scrapingPreview ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>{scrapingPreview ? 'Đang bóc tách...' : '🔍 Bóc tách & Xem trước'}</span>
                  </button>
                </div>

                {/* Scraped Live Preview Box */}
                {scrapedData && (
                  <div className="p-3.5 bg-white border border-sky-200 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-sky-950 border-b border-sky-100 pb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Kết quả bóc tách sản phẩm thành công:
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-black">
                        {Object.keys(scrapedData.specifications || {}).length} thông số | {scrapedData.scrapedImages.length} hình ảnh
                      </span>
                    </div>

                    {scrapedData.scrapedTitle && (
                      <div className="text-slate-900 font-extrabold flex items-start gap-1.5">
                        <span className="text-sky-600 flex-shrink-0">📌 Tên sản phẩm:</span>
                        <span className="line-clamp-2">{scrapedData.scrapedTitle}</span>
                      </div>
                    )}

                    {/* Interactive Image Picker Grid */}
                    {scrapedData.scrapedImages.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            📸 Bấm chọn hình ảnh đưa vào sản phẩm ({selectedImages.length}/{scrapedData.scrapedImages.length}):
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

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50">
                          {scrapedData.scrapedImages.map((img, idx) => {
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
                                
                                <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                                  isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white border border-white/50'
                                }`}>
                                  {isSelected ? '✓' : ''}
                                </div>

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

              {/* Paste Sample Text Area */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText size={14} className="text-amber-500" /> Hoặc Dán Văn bản / Thông số kỹ thuật sản phẩm mẫu
                </label>
                <textarea
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  rows={3}
                  placeholder="Dán bài giới thiệu sản phẩm mẫu, catalog PDF hoặc tài liệu kỹ thuật vào đây..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Phong cách bài viết sản phẩm
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([['technical', '⚙️ Kỹ thuật B2B'], ['sales', '🔥 Bán hàng B2C'], ['comparison', '📊 So sánh']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStyle(val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          style === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Độ sâu bài viết
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([['standard', '📝 Tiêu chuẩn (600-800 từ)'], ['deep', '📚 Chuyên sâu (1.000-1.200 từ)']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetLength(val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          targetLength === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Đang tạo bài...' : '✨ Tạo Bài Viết Sản Phẩm AI'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Result Review & Apply Screen */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Bài Viết & Thông Số Kỹ Thuật Đã Được Bóc Tách Tự Động (SEO 100/100)
                </div>
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs hover:bg-emerald-100"
                >
                  <Code size={13} /> {showCodeEditor ? 'Xem Giao Diện' : 'Xem Mã HTML'}
                </button>
              </div>

              {/* Structured Specs Extracted Badge Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">⚡ Công suất (kW)</span>
                  <span className="font-extrabold text-slate-900 text-sm">{result.power ? `${result.power} kW` : 'Chưa có'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">📈 Hiệu suất (%)</span>
                  <span className="font-extrabold text-slate-900 text-sm">{result.efficiency ? `${result.efficiency}%` : 'Chưa có'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">🛡️ Bảo hành</span>
                  <span className="font-extrabold text-slate-900 text-sm">{result.warranty || 'Chính hãng'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">📋 Số chỉ số cào được</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{Object.keys(result.technicalSpecs || {}).length} chỉ số</span>
                </div>
              </div>

              {showCodeEditor ? (
                <textarea
                  value={result.description}
                  onChange={e => setResult({ ...result, description: e.target.value })}
                  rows={15}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl outline-none"
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none p-6 border border-slate-200 rounded-2xl bg-white shadow-xs"
                  dangerouslySetInnerHTML={{ __html: result.description }}
                />
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <RefreshCw size={14} /> Tạo Lại Bài Khác
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <CheckCircle2 size={16} /> Áp Dụng Vào Sản Phẩm
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

export default AiProductWriterModal;
