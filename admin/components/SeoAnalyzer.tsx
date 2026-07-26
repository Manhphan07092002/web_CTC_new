import React, { useMemo, useState } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Target, BookOpen, TrendingUp, Search
} from 'lucide-react';

interface SeoAnalyzerProps {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  focusKeyword: string;
  onFocusKeywordChange: (kw: string) => void;
}

interface SeoCheck {
  id: string;
  label: string;
  status: 'good' | 'ok' | 'bad';
  message: string;
  score: number;
  maxScore: number;
}

// Strip HTML tags and return plain text
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Count words
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Count sentences
function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

// Keyword density (%)
function keywordDensity(text: string, keyword: string): number {
  if (!keyword || !text) return 0;
  const kw = keyword.toLowerCase();
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const kwWords = kw.split(/\s+/).length;
  let count = 0;
  for (let i = 0; i <= words.length - kwWords; i++) {
    if (words.slice(i, i + kwWords).join(' ') === kw) count++;
  }
  return words.length > 0 ? (count / words.length) * 100 : 0;
}

// Flesch Reading Ease (tiếng Việt simplified)
function readingEase(text: string): number {
  const sentences = sentenceCount(text) || 1;
  const words = wordCount(text) || 1;
  const avgSentenceLen = words / sentences;
  // Simplified scoring for Vietnamese
  if (avgSentenceLen <= 12) return 90;
  if (avgSentenceLen <= 17) return 75;
  if (avgSentenceLen <= 22) return 60;
  if (avgSentenceLen <= 27) return 45;
  return 30;
}

function runSeoChecks(
  title: string,
  excerpt: string,
  content: string,
  image: string,
  focusKeyword: string
): SeoCheck[] {
  const plainContent = stripHtml(content);
  const kw = focusKeyword.toLowerCase().trim();
  const titleLower = title.toLowerCase();
  const excerptLower = excerpt.toLowerCase();
  const contentLower = plainContent.toLowerCase();
  const words = wordCount(plainContent);
  const density = keywordDensity(plainContent, kw);

  const checks: SeoCheck[] = [];

  // 1. Focus keyword in title
  if (kw) {
    const inTitle = titleLower.includes(kw);
    checks.push({
      id: 'kw-title',
      label: 'Từ khóa trong tiêu đề',
      status: inTitle ? 'good' : 'bad',
      message: inTitle
        ? `Từ khóa "${focusKeyword}" xuất hiện trong tiêu đề ✓`
        : `Chưa có từ khóa "${focusKeyword}" trong tiêu đề`,
      score: inTitle ? 15 : 0,
      maxScore: 15,
    });
  } else {
    checks.push({
      id: 'kw-title',
      label: 'Từ khóa trong tiêu đề',
      status: 'bad',
      message: 'Hãy nhập từ khóa focus để phân tích',
      score: 0,
      maxScore: 15,
    });
  }

  // 2. Title length
  const tLen = title.length;
  const titleStatus = tLen >= 50 && tLen <= 65 ? 'good' : tLen >= 40 && tLen <= 75 ? 'ok' : 'bad';
  checks.push({
    id: 'title-len',
    label: 'Độ dài tiêu đề',
    status: titleStatus,
    message: tLen === 0
      ? 'Chưa có tiêu đề'
      : tLen < 40
      ? `Tiêu đề quá ngắn (${tLen} ký tự). Nên 50-65 ký tự`
      : tLen > 75
      ? `Tiêu đề quá dài (${tLen} ký tự). Google cắt ngắn sau 65 ký tự`
      : `Tốt! ${tLen} ký tự (tối ưu: 50-65)`,
    score: titleStatus === 'good' ? 10 : titleStatus === 'ok' ? 5 : 0,
    maxScore: 10,
  });

  // 3. Keyword in excerpt/meta
  if (kw) {
    const inExcerpt = excerptLower.includes(kw);
    checks.push({
      id: 'kw-excerpt',
      label: 'Từ khóa trong mô tả ngắn',
      status: inExcerpt ? 'good' : 'bad',
      message: inExcerpt
        ? 'Từ khóa xuất hiện trong mô tả ngắn ✓'
        : `Thêm từ khóa "${focusKeyword}" vào mô tả ngắn`,
      score: inExcerpt ? 10 : 0,
      maxScore: 10,
    });
  }

  // 4. Excerpt length (meta description)
  const eLen = excerpt.length;
  const excStatus = eLen >= 120 && eLen <= 160 ? 'good' : eLen >= 80 && eLen <= 200 ? 'ok' : 'bad';
  checks.push({
    id: 'excerpt-len',
    label: 'Độ dài mô tả ngắn (Meta)',
    status: excStatus,
    message: eLen === 0
      ? 'Chưa có mô tả ngắn'
      : eLen < 80
      ? `Quá ngắn (${eLen} ký tự). Nên 120-160 ký tự`
      : eLen > 200
      ? `Quá dài (${eLen} ký tự). Google cắt ngắn sau 160 ký tự`
      : `Tốt! ${eLen} ký tự (tối ưu: 120-160)`,
    score: excStatus === 'good' ? 8 : excStatus === 'ok' ? 4 : 0,
    maxScore: 8,
  });

  // 5. Keyword in content
  if (kw) {
    const inContent = contentLower.includes(kw);
    checks.push({
      id: 'kw-content',
      label: 'Từ khóa trong nội dung',
      status: inContent ? 'good' : 'bad',
      message: inContent
        ? 'Từ khóa xuất hiện trong nội dung bài viết ✓'
        : `Thêm từ khóa "${focusKeyword}" vào nội dung`,
      score: inContent ? 12 : 0,
      maxScore: 12,
    });

    // 6. Keyword density
    const densityStatus = density >= 1 && density <= 2.5 ? 'good' : density > 0 && density < 4 ? 'ok' : 'bad';
    checks.push({
      id: 'kw-density',
      label: 'Mật độ từ khóa',
      status: densityStatus,
      message: density === 0
        ? 'Từ khóa chưa xuất hiện trong nội dung'
        : density > 4
        ? `Mật độ ${density.toFixed(1)}% - Quá cao, có thể bị phạt (nên 1-2.5%)`
        : density < 1
        ? `Mật độ ${density.toFixed(1)}% - Quá thấp (nên 1-2.5%)`
        : `Mật độ ${density.toFixed(1)}% - Tối ưu! ✓`,
      score: densityStatus === 'good' ? 10 : densityStatus === 'ok' ? 5 : 0,
      maxScore: 10,
    });

    // 7. Keyword in first 150 words
    const first150 = plainContent.split(/\s+/).slice(0, 150).join(' ').toLowerCase();
    const kwInIntro = first150.includes(kw);
    checks.push({
      id: 'kw-intro',
      label: 'Từ khóa ở đầu bài',
      status: kwInIntro ? 'good' : 'ok',
      message: kwInIntro
        ? 'Từ khóa xuất hiện trong 150 từ đầu ✓'
        : 'Nên đưa từ khóa vào đoạn mở bài (150 từ đầu)',
      score: kwInIntro ? 5 : 0,
      maxScore: 5,
    });
  }

  // 8. Content length
  const lenStatus = words >= 800 ? 'good' : words >= 300 ? 'ok' : 'bad';
  checks.push({
    id: 'content-len',
    label: 'Độ dài nội dung',
    status: lenStatus,
    message: words === 0
      ? 'Chưa có nội dung'
      : words < 300
      ? `${words} từ - Quá ngắn. Google ưu tiên bài 800+ từ`
      : words < 800
      ? `${words} từ - Trung bình. Nên viết thêm để đạt 800+ từ`
      : `${words} từ - Xuất sắc! ✓`,
    score: lenStatus === 'good' ? 10 : lenStatus === 'ok' ? 5 : 0,
    maxScore: 10,
  });

  // 9. Headings (H2/H3)
  const hasH2 = content.includes('<h2') || content.includes('<h3');
  checks.push({
    id: 'headings',
    label: 'Cấu trúc tiêu đề (H2/H3)',
    status: hasH2 ? 'good' : 'bad',
    message: hasH2
      ? 'Có tiêu đề H2/H3 phân chia nội dung ✓'
      : 'Dùng tiêu đề H2/H3 để phân chia các phần nội dung',
    score: hasH2 ? 8 : 0,
    maxScore: 8,
  });

  // 10. Images in content
  const hasImg = content.includes('<img');
  checks.push({
    id: 'content-img',
    label: 'Hình ảnh trong bài viết',
    status: hasImg ? 'good' : 'ok',
    message: hasImg
      ? 'Có hình ảnh minh họa trong nội dung ✓'
      : 'Thêm hình ảnh minh họa vào nội dung bài viết',
    score: hasImg ? 7 : 0,
    maxScore: 7,
  });

  // 11. Thumbnail image
  checks.push({
    id: 'thumbnail',
    label: 'Hình ảnh đại diện',
    status: image ? 'good' : 'bad',
    message: image ? 'Có hình ảnh đại diện ✓' : 'Chưa có hình ảnh đại diện (thumbnail)',
    score: image ? 5 : 0,
    maxScore: 5,
  });

  // 12. Internal links
  const hasLink = content.includes('<a ');
  checks.push({
    id: 'links',
    label: 'Liên kết nội bộ',
    status: hasLink ? 'good' : 'ok',
    message: hasLink
      ? 'Có liên kết trong bài viết ✓'
      : 'Thêm liên kết đến các bài viết/sản phẩm liên quan',
    score: hasLink ? 5 : 0,
    maxScore: 5,
  });

  return checks;
}

function runReadabilityChecks(content: string): SeoCheck[] {
  const plain = stripHtml(content);
  const checks: SeoCheck[] = [];

  // Sentence length
  const sentences = plain.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const longSentences = sentences.filter(s => wordCount(s) > 20).length;
  const longRatio = sentences.length > 0 ? (longSentences / sentences.length) * 100 : 0;
  const sentStatus = longRatio <= 25 ? 'good' : longRatio <= 50 ? 'ok' : 'bad';
  checks.push({
    id: 'sentence-len',
    label: 'Độ dài câu văn',
    status: sentStatus,
    message: sentences.length === 0
      ? 'Chưa có nội dung để phân tích'
      : sentStatus === 'good'
      ? `${Math.round(longRatio)}% câu dưới 20 từ - Dễ đọc ✓`
      : sentStatus === 'ok'
      ? `${Math.round(longRatio)}% câu trên 20 từ - Nên rút ngắn một số câu`
      : `${Math.round(longRatio)}% câu quá dài - Chia nhỏ các câu phức tạp`,
    score: sentStatus === 'good' ? 25 : sentStatus === 'ok' ? 15 : 5,
    maxScore: 25,
  });

  // Paragraphs
  const paragraphs = content.split(/<\/p>|<\/h[1-6]>/).filter(p => stripHtml(p).trim().length > 0);
  const longParas = paragraphs.filter(p => wordCount(stripHtml(p)) > 100).length;
  const paraStatus = longParas === 0 ? 'good' : longParas <= 2 ? 'ok' : 'bad';
  checks.push({
    id: 'paragraphs',
    label: 'Độ dài đoạn văn',
    status: paraStatus,
    message: paragraphs.length === 0
      ? 'Chưa có nội dung'
      : paraStatus === 'good'
      ? 'Các đoạn văn ngắn gọn, dễ đọc ✓'
      : paraStatus === 'ok'
      ? `${longParas} đoạn quá dài (>100 từ) - Nên chia nhỏ`
      : `${longParas} đoạn quá dài - Chia thành đoạn ngắn 3-5 câu`,
    score: paraStatus === 'good' ? 20 : paraStatus === 'ok' ? 10 : 5,
    maxScore: 20,
  });

  // Lists
  const hasList = content.includes('<ul') || content.includes('<ol');
  checks.push({
    id: 'lists',
    label: 'Danh sách (bullet/numbered)',
    status: hasList ? 'good' : 'ok',
    message: hasList
      ? 'Có danh sách giúp nội dung dễ quét ✓'
      : 'Thêm danh sách bullet/số để làm nổi bật thông tin',
    score: hasList ? 20 : 5,
    maxScore: 20,
  });

  // Subheadings
  const headingCount = (content.match(/<h[23]/g) || []).length;
  const paraCount = paragraphs.length;
  const headingStatus = headingCount >= 2 ? 'good' : headingCount === 1 ? 'ok' : 'bad';
  checks.push({
    id: 'subheadings',
    label: 'Phân đoạn bằng tiêu đề',
    status: headingStatus,
    message: headingCount === 0
      ? 'Dùng tiêu đề H2/H3 để phân chia nội dung thành phần'
      : headingCount === 1
      ? `${headingCount} tiêu đề H2/H3 - Nên thêm vài tiêu đề nữa`
      : `${headingCount} tiêu đề H2/H3 - Cấu trúc rõ ràng ✓`,
    score: headingStatus === 'good' ? 20 : headingStatus === 'ok' ? 10 : 0,
    maxScore: 20,
  });

  // Transition words (Vietnamese)
  const transitionWords = ['tuy nhiên', 'bên cạnh đó', 'ngoài ra', 'hơn nữa', 'do đó', 'vì vậy',
    'thứ nhất', 'thứ hai', 'cuối cùng', 'ví dụ', 'nói chung', 'tóm lại', 'đặc biệt', 'thậm chí',
    'mặt khác', 'trong khi đó', 'để kết luận'];
  const plainLower = plain.toLowerCase();
  const usedTransitions = transitionWords.filter(w => plainLower.includes(w)).length;
  const transStatus = usedTransitions >= 3 ? 'good' : usedTransitions >= 1 ? 'ok' : 'bad';
  checks.push({
    id: 'transitions',
    label: 'Từ nối / chuyển tiếp',
    status: transStatus,
    message: usedTransitions === 0
      ? 'Chưa dùng từ nối. Thêm: "tuy nhiên", "bên cạnh đó", "do đó"...'
      : usedTransitions < 3
      ? `Đã dùng ${usedTransitions} từ nối - Nên thêm một vài từ nữa`
      : `Dùng ${usedTransitions} từ nối - Luồng đọc tốt ✓`,
    score: transStatus === 'good' ? 15 : transStatus === 'ok' ? 8 : 0,
    maxScore: 15,
  });

  return checks;
}

const StatusIcon: React.FC<{ status: 'good' | 'ok' | 'bad' }> = ({ status }) => {
  if (status === 'good') return <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />;
  if (status === 'ok') return <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />;
  return <XCircle size={15} className="text-red-500 flex-shrink-0" />;
};

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label2 = score >= 75 ? 'Tốt' : score >= 50 ? 'Trung bình' : 'Cần cải thiện';
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white drop-shadow-md">{score}</span>
        </div>
      </div>
      <span className="text-xs font-black mt-1.5" style={{ color }}>{label2}</span>
      <span className="text-xs font-semibold text-slate-300">{label}</span>
    </div>
  );
};

const SeoAnalyzer: React.FC<SeoAnalyzerProps> = ({
  title, excerpt, content, image, focusKeyword, onFocusKeywordChange
}) => {
  const [activeTab, setActiveTab] = useState<'seo' | 'readability'>('seo');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tempKeyword, setTempKeyword] = useState(focusKeyword || '');

  // Sync tempKeyword when focusKeyword prop changes
  React.useEffect(() => {
    setTempKeyword(focusKeyword || '');
  }, [focusKeyword]);

  const handleApplyKeyword = () => {
    onFocusKeywordChange(tempKeyword.trim());
  };

  const seoChecks = useMemo(
    () => runSeoChecks(title, excerpt, content, image, focusKeyword),
    [title, excerpt, content, image, focusKeyword]
  );

  const readabilityChecks = useMemo(
    () => runReadabilityChecks(content),
    [content]
  );

  const seoScore = useMemo(() => {
    const total = seoChecks.reduce((sum, c) => sum + c.maxScore, 0);
    const earned = seoChecks.reduce((sum, c) => sum + c.score, 0);
    return total > 0 ? Math.round((earned / total) * 100) : 0;
  }, [seoChecks]);

  const readScore = useMemo(() => {
    const total = readabilityChecks.reduce((sum, c) => sum + c.maxScore, 0);
    const earned = readabilityChecks.reduce((sum, c) => sum + c.score, 0);
    return total > 0 ? Math.round((earned / total) * 100) : 0;
  }, [readabilityChecks]);

  const checks = activeTab === 'seo' ? seoChecks : readabilityChecks;
  const goodCount = checks.filter(c => c.status === 'good').length;
  const okCount = checks.filter(c => c.status === 'ok').length;
  const badCount = checks.filter(c => c.status === 'bad').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-green-400" />
          <span className="text-white font-black text-sm uppercase tracking-wide">SEO Analyzer</span>
          <span className="ml-auto text-xs text-slate-400">Yoast-style</span>
        </div>

        {/* Score circles */}
        <div className="flex justify-around">
          <ScoreCircle score={seoScore} label="SEO" />
          <ScoreCircle score={readScore} label="Dễ đọc" />
        </div>
      </div>

      {/* Focus keyword */}
      <div className="p-4 border-b border-gray-100 bg-slate-50 space-y-2">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1">
          <Target size={12} className="text-primary" /> Từ khóa Focus
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={tempKeyword}
            onChange={e => {
              setTempKeyword(e.target.value);
              onFocusKeywordChange(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyKeyword();
              }
            }}
            placeholder="VD: điện mặt trời CTC"
            className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white shadow-sm"
          />
          <button
            type="button"
            onClick={handleApplyKeyword}
            className="w-10 h-10 bg-primary hover:bg-secondary text-white rounded-xl font-black text-lg shadow-sm transition-all flex items-center justify-center flex-shrink-0"
            title="Thêm/Áp dụng từ khóa Focus"
          >
            +
          </button>
        </div>

        {focusKeyword && (
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 text-xs font-extrabold rounded-lg border border-sky-200 shadow-sm">
              🔑 {focusKeyword}
              <button
                type="button"
                onClick={() => {
                  setTempKeyword('');
                  onFocusKeywordChange('');
                }}
                className="hover:text-red-500 font-bold ml-1 text-sm"
                title="Xóa từ khóa Focus"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'seo'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search size={13} />
          SEO ({seoScore}/100)
        </button>
        <button
          onClick={() => setActiveTab('readability')}
          className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'readability'
              ? 'text-primary border-b-2 border-primary bg-primary/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={13} />
          Dễ đọc ({readScore}/100)
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs">
        <span className="flex items-center gap-1 text-green-600 font-semibold">
          <CheckCircle2 size={12} /> {goodCount} tốt
        </span>
        <span className="flex items-center gap-1 text-amber-500 font-semibold">
          <AlertCircle size={12} /> {okCount} trung bình
        </span>
        <span className="flex items-center gap-1 text-red-500 font-semibold">
          <XCircle size={12} /> {badCount} cần sửa
        </span>
      </div>

      {/* Checks list */}
      <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
        {checks.map((check) => (
          <div key={check.id}>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === check.id ? null : check.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                check.status === 'bad' ? 'bg-red-50/40' : ''
              }`}
            >
              <StatusIcon status={check.status} />
              <span className="flex-1 text-xs font-semibold text-gray-700 leading-tight">
                {check.label}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  check.status === 'good' ? 'bg-green-100 text-green-700' :
                  check.status === 'ok' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {check.score}/{check.maxScore}
                </span>
                {expandedId === check.id
                  ? <ChevronUp size={13} className="text-gray-400" />
                  : <ChevronDown size={13} className="text-gray-400" />
                }
              </div>
            </button>
            {expandedId === check.id && (
              <div className={`px-4 pb-3 pt-1 text-xs leading-relaxed ml-8 ${
                check.status === 'good' ? 'text-green-700' :
                check.status === 'ok' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {check.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="p-3 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-600 font-medium text-center">
          💡 Điểm ≥75 = tốt · ≥50 = trung bình · &lt;50 = cần cải thiện
        </p>
      </div>
    </div>
  );
};

export default SeoAnalyzer;
