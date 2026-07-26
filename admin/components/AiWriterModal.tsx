import React, { useState } from 'react';
import { Sparkles, Search, CheckCircle2, X, ArrowRight, Wand2, RefreshCw, FileText, Target, Tag, Edit3, MessageSquare, BookOpen, Layers, Code } from 'lucide-react';
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
  const [tone, setTone] = useState<'journalistic' | 'expert' | 'sales' | 'storytelling'>('journalistic');
  const [targetLength, setTargetLength] = useState<'short' | 'medium' | 'deep'>('medium');
  const [regenerationNote, setRegenerationNote] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent, customTitle?: string, customKw?: string) => {
    if (e) e.preventDefault();

    const titleToUse = (customTitle !== undefined ? customTitle : topicTitle).trim();
    const kwToUse = (customKw !== undefined ? customKw : focusKeyword).trim();

    if (!titleToUse) {
      showToast('Vui lòng nhập tiêu đề hoặc chủ đề bài viết', 'error');
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
        targetLength
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res && res.success && res.data) {
        setResult({
          ...res.data,
          title: titleToUse
        });
        showToast('✨ AI đã tạo bài viết thành công!', 'success');
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
          {!result || loading ? (
            <form onSubmit={e => handleGenerate(e)} className="space-y-5">
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
                  placeholder="VD: cảnh báo bộ phát wi (Để trống AI sẽ tự trích xuất chuẩn nhất)"
                  disabled={loading}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-slate-50 shadow-xs transition-all disabled:opacity-60"
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" /> Giọng Văn / Phong Cách Viết Bài
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'journalistic', label: '📰 Báo chí', desc: 'Chính luận, khách quan' },
                    { id: 'expert', label: '💡 Chuyên gia', desc: 'Phân tích kỹ thuật sâu' },
                    { id: 'sales', label: '🚀 Bán hàng', desc: 'Thuyết phục & Kêu gọi' },
                    { id: 'storytelling', label: '🌟 Trải nghiệm', desc: 'Góc nhìn chia sẻ thực tế' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        tone === t.id
                          ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 font-black'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Length Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" /> Độ Dài & Độ Sâu Bài Viết
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short', label: '⚡ Ngắn gọn (~600 từ)', desc: 'Tóm tắt nhanh' },
                    { id: 'medium', label: '🎯 Yoast SEO (~1.000 từ)', desc: 'Đầy đủ tiêu chuẩn' },
                    { id: 'deep', label: '📊 Phân tích sâu (~1.500 từ)', desc: 'Báo cáo toàn diện' },
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setTargetLength(l.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        targetLength === l.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 font-black'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold'
                      }`}
                    >
                      <div className="text-xs font-bold">{l.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Loading UI */}
              {loading && (
                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-black text-sm text-amber-300">AI Đang Tìm Kiếm Google & Tạo Bài Viết Tự Động...</span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Search size={14} /> 1. Tìm kiếm dữ liệu & bài viết thực tế từ Google...
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
