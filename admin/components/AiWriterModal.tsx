import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, AlertCircle, X, ArrowRight, Wand2, RefreshCw, FileText, Target, Tag } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề hoặc chủ đề bài viết', 'error');
      return;
    }

    setLoading(true);
    setStep(1);

    // Simulated progress steps for great UX
    const timer1 = setTimeout(() => setStep(2), 1200);
    const timer2 = setTimeout(() => setStep(3), 2800);

    try {
      const res = await api.ai.generateArticle({
        title: topicTitle.trim(),
        focusKeyword: focusKeyword.trim()
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res && res.success && res.data) {
        setResult(res.data);
        showToast('✨ Tạo bài viết AI thành công!', 'success');
      } else {
        throw new Error((res as any)?.message || 'Không thể tạo bài viết');
      }
    } catch (err: any) {
      console.error('AI Generator Error:', err);
      showToast(err.message || 'Lỗi khi tạo bài viết với AI', 'error');
    } finally {
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
      tags: result.tags || []
    });
    showToast('🚀 Đã áp dụng bài viết AI vào Form thành công!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-primary/90 to-slate-900 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Trợ Lý Viết Bài AI Tự Động
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">Yoast 100/100</span>
              </h2>
              <p className="text-xs text-slate-300">Tìm kiếm dữ liệu thực tế từ Google & viết lại nội dung chuẩn SEO tối ưu</p>
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
          {!result ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" /> Tiêu Đề Bài Viết / Chủ Đề Muốn Viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  placeholder="VD: Cho Thuê Mái Nhà Lắp Pin Mặt Trời Giúp Tiết Kiệm 80% Tiền Điện"
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-slate-50 shadow-xs transition-all disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={14} className="text-primary" /> Từ Khóa Focus (Tùy Chọn)
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={e => setFocusKeyword(e.target.value)}
                  placeholder="VD: pin mặt trời (Để trống AI sẽ tự trích xuất từ khóa chuẩn nhất)"
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-slate-50 shadow-xs transition-all disabled:opacity-60"
                />
              </div>

              {/* Status workflow info */}
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2 text-xs text-sky-900">
                <p className="font-extrabold flex items-center gap-1.5 text-sky-950">
                  <Wand2 size={14} className="text-sky-600" /> Quy trình AI tự động thực hiện:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
                  <li><strong>Bước 1:</strong> Tìm kiếm thông tin & dữ liệu thực tế liên quan tới tiêu đề từ Google & DuckDuckGo.</li>
                  <li><strong>Bước 2:</strong> Viết lại bài viết trên 900 từ với cấu trúc H2, H3, danh sách thẻ bullet point & thẻ liên hệ CTC.</li>
                  <li><strong>Bước 3:</strong> Tối ưu tiêu đề (50-65 ký tự), Meta (120-160 ký tự) & từ khóa Focus để đạt điểm Yoast 100/100.</li>
                </ul>
              </div>

              {/* Progress Loading UI */}
              {loading && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-black text-sm text-amber-300">AI Đang Tạo Bài Viết Tự Động...</span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Search size={14} /> 1. Tìm kiếm dữ liệu & bài viết gốc từ Google...
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Wand2 size={14} /> 2. Tổng hợp & biên tập bài viết chuẩn SEO Yoast 100/100...
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={14} /> 3. Tối ưu hóa từ khóa Focus, thẻ H2/H3 & thông tin liên hệ CTC...
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
                      <Sparkles size={16} /> 🚀 Tạo bài viết với AI
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Result Preview Card */
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
                  <RefreshCw size={12} /> Viết bài khác
                </button>
              </div>

              {/* Generated Title */}
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Tiêu Đề Bài Viết ({result.title.length} ký tự)</label>
                <h3 className="text-base font-black text-slate-900 mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">{result.title}</h3>
              </div>

              {/* Generated Excerpt */}
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Mô Tả Ngắn (Meta) ({result.excerpt.length} ký tự)</label>
                <p className="text-xs font-semibold text-slate-700 mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl">{result.excerpt}</p>
              </div>

              {/* Keyword & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Target size={11} /> Từ Khóa Focus
                  </label>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 text-sky-900 text-xs font-black rounded-lg border border-sky-200">
                    🔑 {result.focusKeyword}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={11} /> Thẻ Gắn (Tags)
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {result.tags?.map((t: string) => (
                      <span key={t} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* HTML Content Scroll Box */}
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Nội Dung Chi Tiết (Xem Trước)</label>
                <div 
                  className="mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-56 overflow-y-auto text-xs text-slate-800 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.content }}
                />
              </div>

              {/* Apply Button */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Tạo lại
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AiWriterModal;
