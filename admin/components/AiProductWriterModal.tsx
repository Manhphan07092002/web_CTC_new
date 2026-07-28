import React, { useState } from 'react';
import { Sparkles, CheckCircle2, X, Wand2, RefreshCw, Target, Edit3, Link2, Code, Package, ShieldCheck, Download, DollarSign } from 'lucide-react';
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
    price?: number;
    priceOld?: number;
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
  const [stepLabel, setStepLabel] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [scrapedPrice, setScrapedPrice] = useState<number>(0);
  const [scrapedPriceOld, setScrapedPriceOld] = useState<number>(0);
  const [downloadingImages, setDownloadingImages] = useState(false);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // Client-side CORS proxy scraper (fallback khi server bị block)
  // ─────────────────────────────────────────────────────────────
  const clientSideScrape = async (url: string): Promise<{
    title: string; images: string[]; videos: string[]; rawText: string;
  }> => {
    const result = { title: '', images: [] as string[], videos: [] as string[], rawText: '' };

    let html = '';
    // Thử Proxy 1: allorigins.win
    try {
      const corsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const corsRes = await fetch(corsUrl, { signal: AbortSignal.timeout(10000) });
      const corsJson = await corsRes.json();
      if (corsJson.contents && corsJson.contents.length > 200) {
        html = corsJson.contents;
      }
    } catch {}

    // Thử Proxy 2 nếu proxy 1 rỗng: codetabs.com
    if (!html) {
      try {
        const corsUrl2 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        const corsRes2 = await fetch(corsUrl2, { signal: AbortSignal.timeout(10000) });
        const text2 = await corsRes2.text();
        if (text2 && text2.length > 200) {
          html = text2;
        }
      } catch {}
    }

    if (!html || html.length < 200) return result;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Clean scripts, styles, svg
    doc.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());

    // Title: og:title > twitter:title > <title> > h1
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      || doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')
      || doc.title
      || doc.querySelector('h1')?.textContent || '';
    result.title = ogTitle.replace(/\s*[|–—-]\s*.{0,60}$/, '').trim();

    const addImage = (src: string | null | undefined) => {
      if (!src || src.startsWith('data:') || src.length < 10) return;
      if (/logo|icon|avatar|spinner|pixel|1x1|blank|placeholder|\.gif$|\.svg$/i.test(src)) return;
      try {
        const abs = new URL(src, url).href;
        if (!result.images.includes(abs) && result.images.length < 12) result.images.push(abs);
      } catch {}
    };

    // JSON-LD Schema.org images
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const schema = JSON.parse(s.textContent || '');
        const extractImgs = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (Array.isArray(obj)) { obj.forEach(extractImgs); return; }
          const imgs = obj.image ? (Array.isArray(obj.image) ? obj.image : [obj.image]) : [];
          imgs.forEach((img: any) => {
            const u = typeof img === 'string' ? img : (img?.url || img?.contentUrl);
            addImage(u);
          });
          Object.values(obj).forEach(v => typeof v === 'object' && extractImgs(v));
        };
        extractImgs(schema);
      } catch {}
    });

    // og:image / twitter:image
    addImage(doc.querySelector('meta[property="og:image"]')?.getAttribute('content'));
    addImage(doc.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content'));
    addImage(doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content'));

    // <img> tags
    doc.querySelectorAll('img').forEach(img => {
      addImage(
        img.getAttribute('data-zoom-image') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('data-src') ||
        img.getAttribute('src')
      );
    });

    // Background-image CSS in style attributes
    doc.querySelectorAll('[style*="background-image"]').forEach(el => {
      const m = (el as HTMLElement).style.backgroundImage?.match(/url\(["']?([^"')]+)["']?\)/);
      addImage(m?.[1]);
    });

    // Extract text content from all blocks: p, div, span, li, td, th, h1-h4, section, article
    const texts: string[] = [];
    doc.querySelectorAll('p, div, span, li, td, th, h1, h2, h3, h4, section, article').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length > 25 &&
          !/(?:copyright|cookie|đăng ký|quảng cáo|theo dõi|bảo lưu mọi quyền|bản quyền)/i.test(text) &&
          !texts.includes(text)) {
        texts.push(text);
      }
    });
    result.rawText = texts.slice(0, 50).join('\n');

    // YouTube / Vimeo video iframes
    doc.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
      if (/youtube|youtu\.be|vimeo/i.test(src)) {
        let v = src.startsWith('//') ? 'https:' + src : src;
        v = v.replace(/youtu\.be\/([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1');
        v = v.replace(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1');
        if (!result.videos.includes(v)) result.videos.push(v);
      }
    });

    return result;
  };

  // ─────────────────────────────────────────────────────────────
  // Main Generate Handler
  // ─────────────────────────────────────────────────────────────
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const nameToUse = productName.trim();
    const urlToUse = referenceUrl.trim();

    if (!nameToUse && !urlToUse) {
      showToast('Vui lòng nhập Tên sản phẩm hoặc dán Link sản phẩm mẫu', 'error');
      return;
    }

    setLoading(true);
    setStep(1);
    setStepLabel('🔍 Đang cào dữ liệu từ link sản phẩm...');
    const timer1 = setTimeout(() => { setStep(2); setStepLabel('🎯 Đang phân tích hình ảnh & nội dung gốc...'); }, 2000);
    const timer2 = setTimeout(() => { setStep(3); setStepLabel('✍️ Gemini đang viết mô tả sản phẩm chuẩn SEO...'); }, 5000);

    try {
      let parsed: any = null;

      // ══ TẦNG 1: Thu thập dữ liệu thực từ URL ══════════════════
      let scrapedTitle = nameToUse;
      let scrapedImages: string[] = [];
      let scrapedVideos: string[] = [];
      let scrapedRawText = '';
      let scrapedSource = 'none';

      if (urlToUse) {
        // 1a: Server-side scrape (Node.js server — nhanh nhưng có thể bị block IP datacenter)
        try {
          console.log('[AI Modal] 1a: Server scrape ->', urlToUse);
          const scrapeRes = await api.ai.scrapeUrl(urlToUse);
          const d = scrapeRes?.data;
          if (d && (d.rawText?.length > 80 || d.images?.length > 0)) {
            if (d.title && !nameToUse) scrapedTitle = d.title;
            scrapedImages = d.images || [];
            scrapedVideos = d.videos || [];
            scrapedRawText = d.rawText || '';
            scrapedSource = 'server';
            if (d.price && d.price > 0) setScrapedPrice(d.price);
            if (d.priceOld && d.priceOld > 0) setScrapedPriceOld(d.priceOld);
            console.log(`[AI Modal] Server OK: text=${scrapedRawText.length}ch, img=${scrapedImages.length}, vid=${scrapedVideos.length}, price=${d.price}`);
          } else {
            console.warn('[AI Modal] Server returned empty → trying client CORS proxy...');
          }
        } catch (e) {
          console.warn('[AI Modal] Server scrape error:', e);
        }

        // 1b: Client-side CORS proxy (trình duyệt dùng IP dân dụng → qua được firewall trang TMĐT)
        if (!scrapedRawText && scrapedImages.length === 0) {
          try {
            console.log('[AI Modal] 1b: Client CORS proxy ->', urlToUse);
            setStepLabel('🌐 Server bị block, đang dùng trình duyệt cào trực tiếp...');
            const clientData = await clientSideScrape(urlToUse);
            if (clientData.rawText.length > 80 || clientData.images.length > 0) {
              if (clientData.title && !nameToUse) scrapedTitle = clientData.title;
              scrapedImages = clientData.images;
              scrapedVideos = clientData.videos;
              scrapedRawText = clientData.rawText;
              scrapedSource = 'client-cors';
              console.log(`[AI Modal] CORS proxy OK: text=${scrapedRawText.length}ch, img=${scrapedImages.length}`);
            }
          } catch (e) {
            console.warn('[AI Modal] CORS proxy failed:', e);
          }
        }

        // Kiểm tra: nếu vẫn không cào được gì VÀ không có tên sản phẩm → dừng, không đoán mò
        if (!scrapedRawText && scrapedImages.length === 0 && !nameToUse) {
          clearTimeout(timer1); clearTimeout(timer2);
          setLoading(false); setStep(0);
          showToast(
            '⚠️ Không thể cào nội dung từ link này (trang chặn robot). Hãy nhập Tên sản phẩm hoặc copy nội dung vào ô tên sản phẩm.',
            'error'
          );
          return;
        }
      }

      // ══ TẦNG 2: Gemini viết dựa 100% trên dữ liệu cào được ═══
      setStepLabel('✍️ Gemini đang viết bài mô tả sản phẩm chuẩn SEO 100/100...');
      const productCode2 = productCode || ('CTC-' + Math.floor(1000 + Math.random() * 9000));
      const hasRealContent = scrapedRawText.length > 80;
      const hasImages = scrapedImages.length > 0;

      const videoEmbeds = scrapedVideos.slice(0, 2).map(v =>
        `<div class="my-6 aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src="${v}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`
      ).join('\n');

      const prompt = `Bạn là Chuyên gia Sản phẩm & SEO Yoast của Công ty CTC.

NHIỆM VỤ: Viết bài mô tả sản phẩm CHUẨN SEO 100/100 & DỄ ĐỌC 100/100 bằng tiếng Việt.
NGUỒN: Dữ liệu cào từ "${urlToUse || 'tên sản phẩm'}" qua ${scrapedSource === 'server' ? 'server' : scrapedSource === 'client-cors' ? 'trình duyệt (CORS proxy)' : 'tên sản phẩm'}.

━━━ THÔNG TIN SẢN PHẨM ĐÃ CÀO ĐƯỢC ━━━
Tên/Model: "${scrapedTitle || nameToUse}"
Danh mục: "${initialCategory || 'Thiết bị Công Nghệ'}"
Phong cách: ${style === 'technical' ? 'Kỹ thuật chuyên sâu B2B' : style === 'sales' ? 'Thúc đẩy mua hàng B2C' : 'So sánh ưu điểm'}
Độ sâu: ${targetLength === 'deep' ? '900-1200 từ' : '600-800 từ'}

━━━ NỘI DUNG GỐC & THÔNG SỐ CÀO ĐƯỢC ━━━
${hasRealContent
  ? scrapedRawText.slice(0, 5000)
  : '⚠️ Không có nội dung cào được. Chỉ được viết dựa trên tên sản phẩm. TUYỆT ĐỐI KHÔNG bịa thông số kỹ thuật cụ thể như số GHz, GB, W... nếu không chắc chắn.'}

━━━ HÌNH ẢNH CÀO ĐƯỢC ━━━
${hasImages
  ? scrapedImages.map((img, i) => `Ảnh ${i + 1}: ${img}`).join('\n')
  : '(Không cào được ảnh từ link)'}

━━━ LUẬT BẮT BUỘC ━━━

🔴 LUẬT 1 - TÊN SẢN PHẨM (name):
- Bóc tách CHÍNH XÁC từ nội dung gốc, KHÔNG thêm từ marketing

🔴 LUẬT 2 - HÌNH ẢNH:
${hasImages
  ? `- image: PHẢI dùng đúng URL này: "${scrapedImages[0]}"
- images: PHẢI dùng đúng các URL này: ${JSON.stringify(scrapedImages.slice(1, 4))}`
  : `- image: Dùng ảnh Unsplash liên quan đến "${scrapedTitle || nameToUse}"
- images: Dùng 2 ảnh Unsplash liên quan`}

🔴 LUẬT 3 - BẢNG THÔNG SỐ KỸ THUẬT HTML TRONG BÀI VIẾT (description):
- BẮT BUỘC có 1 phần <h2>Bảng Thông Số Kỹ Thuật Chi Tiết</h2> chứa bảng HTML định dạng đẹp:
  <div class="overflow-x-auto my-6">
    <table class="w-full text-sm border-collapse border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <thead>
        <tr class="bg-slate-800 text-white font-bold"><th class="p-3 border border-slate-700 text-left">Thông số</th><th class="p-3 border border-slate-700 text-left">Chi tiết kỹ thuật</th></tr>
      </thead>
      <tbody>
        <tr class="border-b border-slate-200 hover:bg-slate-50"><td class="p-3 font-semibold bg-slate-50">...</td><td class="p-3">...</td></tr>
      </tbody>
    </table>
  </div>
- Liệt kê ĐẦY ĐỦ 8-15 thông số (Vi xử lý CPU, RAM, Ổ cứng SSD, Màn hình, Card đồ họa GPU, Pin, Trọng lượng, Kích thước, Cổng kết nối, Hệ điều hành, Công nghệ làm mát, Chuẩn kết nối WiFi/Bluetooth, Bảo hành...).

🔴 LUẬT 4 - NỘI DUNG BÀI VIẾT CHI TIẾT:
- Cấu trúc:
  1. <p>Đoạn mở đầu ấn tượng chứa từ khóa Focus trong 150 từ đầu</p>
  2. <h2>Tổng Quan & Thiết Kế Nổi Bật</h2>
  3. <h2>Hiệu Năng & Trải Nghiệm Thực Tế</h2>
  4. <h2>Bảng Thông Số Kỹ Thuật Chi Tiết</h2> (Bảng HTML trên)
  5. <h2>Đặc Điểm & Tính Năng Nổi Bật</h2> (Liệt kê danh sách <ul><li>...</li></ul>)
  6. <h2>Tổng Kết & Lý Do Nên Chọn Mua</h2>
- Câu tối đa 16 từ, đoạn tối đa 60 từ.
- BẮT BUỘC ≥ 2 danh sách <ul><li>...</li></ul>.
- Mật độ từ khóa Focus: 1.2-2.0%.
- Từ nối bắt buộc: Tuy nhiên, Bên cạnh đó, Ngoài ra, Do đó, Đặc biệt.${videoEmbeds ? '\n- Chèn video này vào giữa bài:\n' + videoEmbeds : ''}
- Cuối bài: <p class="mt-4 pt-4 border-t">Xem thêm <a href="/products" class="text-primary font-bold hover:underline">Danh mục Sản phẩm CTC</a> hoặc <a href="/contact" class="text-primary font-bold hover:underline">Liên Hệ Báo Giá</a>.</p>

🔴 LUẬT 5 - ĐỊNH DẠNG JSON TRẢ VỀ:
- technicalSpecs: Object chứa ĐẦY ĐỦ 8-15 cặp Key-Value thông số kỹ thuật (vd: {"CPU": "Intel Core Ultra 7 155H", "RAM": "16GB LPDDR5X", ...})
- features: Array chứa 5-8 dòng đặc điểm nổi bật nhất (vd: ["Vi xử lý Intel Core Ultra 7 với NPU AI tích hợp", "Màn hình OLED 2.8K 120Hz chuẩn màu 100% DCI-P3", ...])

Trả về JSON thuần không bọc markdown:
{
  "name": "Tên chính xác từ nội dung gốc",
  "code": "${productCode2}",
  "focusKeyword": "từ khóa SEO 2-4 từ",
  "shortDescription": "Mô tả meta 120-160 ký tự, chứa từ khóa focus",
  "image": "${scrapedImages[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'}",
  "images": ${JSON.stringify(scrapedImages.slice(1, 4).length > 0 ? scrapedImages.slice(1, 4) : ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800'])},
  "description": "<p>Mở đầu bám sát nội dung gốc, chứa từ khóa...</p><h2>...</h2>...",
  "specifications": "Tóm tắt thông số kỹ thuật chính từ nội dung gốc",
  "warranty": "24 tháng chính hãng",
  "features": [
    "Đặc điểm nổi bật 1 từ nội dung gốc",
    "Đặc điểm nổi bật 2",
    "Đặc điểm nổi bật 3",
    "Đặc điểm nổi bật 4",
    "Đặc điểm nổi bật 5"
  ],
  "technicalSpecs": {
    "Vi xử lý (CPU)": "Giá trị từ nội dung gốc",
    "Bộ nhớ RAM": "Giá trị",
    "Ổ cứng": "Giá trị",
    "Màn hình": "Giá trị",
    "Card đồ họa (GPU)": "Giá trị",
    "Pin & Sạc": "Giá trị",
    "Trọng lượng": "Giá trị",
    "Hệ điều hành": "Giá trị"
  }
}`;

      const response = await chatService.sendMessage(prompt);
      clearTimeout(timer1); clearTimeout(timer2);

      try {
        const cleanResponse = response.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleanResponse.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { parsed = JSON.parse(match[0].replace(/\n/g, '\\n').replace(/\r/g, '\\r')); }
        }
      } catch (e) {
        console.warn('JSON parse error:', e);
      }

      clearTimeout(timer1); clearTimeout(timer2);

      if (parsed && (parsed.name || parsed.description)) {
        const kwToUse = parsed.focusKeyword || focusKeyword || parsed.name || 'sản phẩm';
        // Ưu tiên tuyệt đối ảnh cào được thực tế — không dùng ảnh Gemini bịa
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
          _scrapedVideos: scrapedVideos,
          _scrapedSource: scrapedSource
        });

        const sourceLabel = scrapedSource === 'server' ? 'server' : scrapedSource === 'client-cors' ? 'trình duyệt CORS proxy' : 'tên sản phẩm';
        const imgCount = finalExtraImages.length + (finalMainImage ? 1 : 0);
        showToast(`✨ Cào được ${imgCount} ảnh, ${scrapedVideos.length} video từ ${sourceLabel}. Gemini đã viết mô tả chuẩn SEO!`, 'success');
      } else {
        throw new Error('Không thể đọc JSON từ Gemini. Vui lòng thử lại.');
      }
    } catch (err: any) {
      clearTimeout(timer1); clearTimeout(timer2);
      console.error('AI Product Generator Error:', err);
      showToast(err.message || 'Lỗi khi kết nối AI Gemini', 'error');
    } finally {
      setLoading(false);
      setStep(0);
      setStepLabel('');
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
      images: Array.isArray(result.images) ? result.images : [],
      price: scrapedPrice || 0,
      priceOld: scrapedPriceOld || 0,
    });
    showToast('🎉 Đã áp dụng Tên, Ảnh, Bài viết AI & Giá vào Form sản phẩm!', 'success');
    onClose();
  };

  // Tải ảnh cào được về máy chủ CTC
  const handleDownloadImages = async () => {
    if (!result) return;
    const allImages = [result.image, ...(result.images || [])].filter(Boolean);
    if (allImages.length === 0) { showToast('Không có ảnh nào để tải về', 'error'); return; }
    setDownloadingImages(true);
    const localUrls: string[] = [];
    let successCount = 0;
    for (const imgUrl of allImages.slice(0, 8)) {
      try {
        const res = await api.ai.downloadImage(imgUrl);
        if (res?.success && res.localUrl) {
          localUrls.push(res.localUrl);
          successCount++;
        }
      } catch {}
    }
    setDownloadingImages(false);
    if (successCount > 0) {
      // Update result với URL local
      const updatedResult = { ...result };
      if (localUrls[0]) updatedResult.image = localUrls[0];
      if (localUrls.length > 1) updatedResult.images = localUrls.slice(1);
      setResult(updatedResult);
      showToast(`✅ Đã tải ${successCount} ảnh về máy chủ CTC thành công!`, 'success');
    } else {
      showToast('⚠️ Không thể tải ảnh về máy chủ (trang nguồn chặn download)', 'error');
    }
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
            Tự động cào nội dung thực từ link → Gemini viết mô tả chuẩn SEO, không đoán mò.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Step animation bar */}
          {loading && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Wand2 size={16} className="animate-spin text-amber-300" />
                  Đang xử lý... Bước {step}/3
                </span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 via-primary to-emerald-400 h-full transition-all duration-700 rounded-full"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-200">{stepLabel}</p>
            </div>
          )}

          {!result ? (
            /* ── Input Form ── */
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
                    placeholder="VD: Laptop OMEN 14-fb0135TX (hoặc để trống)"
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
                    placeholder="VD: AY8V1PA"
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
                    placeholder="VD: laptop gaming omen"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Link2 size={13} className="text-primary" /> Link sản phẩm mẫu cần cào
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={e => setReferenceUrl(e.target.value)}
                    placeholder="https://www.thegioididong.com/tin-tuc/..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    🌐 AI cào hình ảnh, video, nội dung thực từ link → Gemini viết bài (không đoán mò)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Phong cách bài viết
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([['technical', '⚙️ Kỹ thuật B2B'], ['sales', '🔥 Bán hàng B2C'], ['comparison', '📊 So sánh']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStyle(val)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${style === val ? 'bg-primary text-white border-primary shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Độ sâu nội dung
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([['standard', '📝 Tiêu chuẩn (600-800 từ)'], ['deep', '🚀 Chuyên sâu (900-1200 từ)']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetLength(val)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${targetLength === val ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-primary to-secondary text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} className="text-amber-200 animate-pulse" />
                  Bắt Đầu Cào & Tạo Sản Phẩm AI
                </button>
              </div>
            </form>
          ) : (
            /* ── Result Editable Preview ── */
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-black">
                    🎉 AI tạo xong! Chỉnh sửa bên dưới nếu cần, rồi nhấn Áp dụng.
                    {result._scrapedSource && result._scrapedSource !== 'none' && (
                      <span className="ml-2 text-emerald-600 font-bold">
                        (Nguồn: {result._scrapedSource === 'server' ? 'Server scraper' : 'CORS proxy'})
                      </span>
                    )}
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
                    <Edit3 size={12} /> Nhập lại
                  </button>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tên sản phẩm</label>
                  <input type="text" value={result.name || ''} onChange={e => setResult({ ...result, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mã Model / SKU</label>
                  <input type="text" value={result.code || ''} onChange={e => setResult({ ...result, code: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">🔑 Từ khóa Focus</label>
                  <input type="text" value={result.focusKeyword || ''} onChange={e => setResult({ ...result, focusKeyword: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-primary/40 rounded-xl text-xs font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">
                  📝 Mô tả ngắn Meta ({result.shortDescription?.length || 0}/160 ký tự)
                </label>
                <textarea value={result.shortDescription || ''} onChange={e => setResult({ ...result, shortDescription: e.target.value })}
                  rows={2} maxLength={160}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 italic focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
              </div>

              {/* Scraped Images - editable */}
              {(result.image || (Array.isArray(result.images) && result.images.length > 0)) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    📸 Hình ảnh sản phẩm (xóa ảnh sai, sửa URL nếu cần):
                  </span>
                  <div className="flex items-start gap-3 overflow-x-auto pb-1 flex-wrap">
                    {result.image && (
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative">
                          <img src={result.image} alt="Main" className="w-20 h-20 object-cover rounded-xl border-2 border-primary shadow-xs"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'; }} />
                          <button type="button" onClick={() => setResult({ ...result, image: '' })}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer">
                            <X size={10} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded">Ảnh chính</span>
                        </div>
                        <input type="text" value={result.image || ''} onChange={e => setResult({ ...result, image: e.target.value })}
                          className="w-20 text-[9px] text-slate-500 border border-slate-200 rounded px-1 py-0.5 outline-none truncate bg-white" placeholder="URL ảnh..." />
                      </div>
                    )}
                    {Array.isArray(result.images) && result.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="relative">
                          <img src={imgUrl} alt={`Extra ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-xs"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800'; }} />
                          <button type="button" onClick={() => { const ni = [...result.images]; ni.splice(idx, 1); setResult({ ...result, images: ni }); }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 cursor-pointer">
                            <X size={10} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Ảnh phụ {idx + 1}</span>
                        </div>
                        <input type="text" value={imgUrl} onChange={e => { const ni = [...result.images]; ni[idx] = e.target.value; setResult({ ...result, images: ni }); }}
                          className="w-20 text-[9px] text-slate-500 border border-slate-200 rounded px-1 py-0.5 outline-none truncate bg-white" placeholder="URL ảnh..." />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs: Preview / HTML Editor */}
              <div className="flex border-b border-slate-200">
                <button type="button" onClick={() => setShowCodeEditor(false)}
                  className={`py-2 px-4 text-xs font-black border-b-2 cursor-pointer ${!showCodeEditor ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  👁️ Xem trước hiển thị
                </button>
                <button type="button" onClick={() => setShowCodeEditor(true)}
                  className={`py-2 px-4 text-xs font-black border-b-2 cursor-pointer ${showCodeEditor ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <Code size={12} className="inline mr-1" />✏️ Chỉnh sửa HTML
                </button>
              </div>

              {!showCodeEditor ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-white max-h-80 overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: result.description || '' }} />
                </div>
              ) : (
                <textarea value={result.description || ''} onChange={e => setResult({ ...result, description: e.target.value })}
                  rows={12}
                  className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl border border-slate-800 outline-none resize-y"
                  placeholder="Chỉnh sửa mã HTML tại đây..." />
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={handleGenerate} disabled={loading}
                    className="px-5 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    ✨ AI Tạo Lại
                  </button>
                  <button type="button" onClick={handleDownloadImages} disabled={downloadingImages}
                    className="px-5 py-2.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    {downloadingImages ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    {downloadingImages ? 'Đang tải ảnh...' : '⬇️ Tải Ảnh Về Máy Chủ CTC'}
                  </button>
                  {scrapedPrice > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
                      <DollarSign size={13} />
                      Giá cào được: {scrapedPrice.toLocaleString('vi-VN')}₫
                      {scrapedPriceOld > scrapedPrice && (
                        <span className="line-through text-slate-400 font-normal ml-1">{scrapedPriceOld.toLocaleString('vi-VN')}₫</span>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleApplyResult}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 size={16} />
                  ✅ Áp Dụng Vào Form Sản Phẩm
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
