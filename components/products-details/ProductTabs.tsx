import React, { useMemo } from 'react';
import { 
  Star, Sparkles, CheckCircle, MessageSquare, FileText, 
  Download, Video, ShieldCheck, Tag, ExternalLink, Cpu
} from 'lucide-react';
import { Product, Review, ProductSpecification } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  activeTab: 'desc' | 'specs' | 'documents' | 'reviews';
  setActiveTab: (tab: 'desc' | 'specs' | 'documents' | 'reviews') => void;
  onWriteReviewClick: () => void;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  reviews,
  activeTab,
  setActiveTab,
  onWriteReviewClick
}) => {
  const { t } = useLanguage();

  const documents = Array.isArray(product.documents) ? product.documents : [];
  const videos = Array.isArray(product.videos) ? product.videos : [];
  const specsList = Array.isArray(product.specificationsList) ? product.specificationsList : [];

  // Group dynamic specifications by group
  const groupedSpecs = useMemo(() => {
    if (specsList.length === 0) return null;
    const groups: { [key: string]: ProductSpecification[] } = {};
    specsList.forEach(s => {
      const g = (s.group && s.group.trim()) || 'Thông số chung';
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    });
    return groups;
  }, [specsList]);

  const hasDocs = documents.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-12">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-100 dark:border-slate-700 overflow-x-auto scrollbar-hide bg-gray-50/50 dark:bg-slate-900/30">
        <button 
          onClick={() => setActiveTab('desc')}
          className={`px-6 md:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'desc' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 shadow-2xs' 
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          {t('products.detail_tab_desc') || 'Mô tả & Tính năng'}
        </button>

        <button 
          onClick={() => setActiveTab('specs')}
          className={`px-6 md:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'specs' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 shadow-2xs' 
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Cpu size={15} />
          <span>{t('products.detail_tab_specs') || 'Thông số kỹ thuật'}</span>
          {specsList.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
              {specsList.length}
            </span>
          )}
        </button>

        {hasDocs && (
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-6 md:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'documents' 
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 shadow-2xs' 
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileText size={15} />
            <span>Tài liệu & Datasheet</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
              {documents.length}
            </span>
          </button>
        )}

        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-6 md:px-8 py-4 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reviews' 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 shadow-2xs' 
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare size={15} />
          <span>{t('products.detail_tab_reviews') || 'Đánh giá'}</span>
          <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
            {reviews.length}
          </span>
        </button>
      </div>
      
      {/* Tabs Content */}
      <div className="p-6 md:p-10">
        {/* ── Tab 1: Description ── */}
        {activeTab === 'desc' && (
          <div className="space-y-8">
            {/* Key Features Bullet List */}
            {product.features && product.features.length > 0 && (
              <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{t('products.key_features') || 'Đặc điểm & Tính năng nổi bật:'}</span>
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      <CheckCircle size={17} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main TipTap HTML Description */}
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-6 [&_img]:max-h-[550px] [&_img]:mx-auto [&_img]:object-cover [&_a]:text-primary-600 [&_a]:underline [&_a]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-gray-200 [&_th]:dark:border-slate-700 [&_th]:p-3 [&_th]:bg-gray-100 [&_th]:dark:bg-slate-800 [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-slate-700 [&_td]:p-3">
              {product.description && (product.description.includes('<') || product.description.includes('&lt;')) ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="whitespace-pre-line text-justify leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Video Section if available */}
            {videos.length > 0 && (
              <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Video size={20} className="text-rose-500" />
                  <span>Video giới thiệu & Hướng dẫn kỹ thuật:</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((vid: any, vi: number) => {
                    const vidUrl = typeof vid === 'string' ? vid : vid.url;
                    const vidTitle = typeof vid === 'string' ? 'Video giới thiệu' : (vid.title || 'Video giới thiệu');
                    // Check if youtube embed
                    const isYoutube = vidUrl?.includes('youtube.com') || vidUrl?.includes('youtu.be');
                    let embedUrl = vidUrl;
                    if (isYoutube) {
                      const match = vidUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                      if (match && match[1]) {
                        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                      }
                    }

                    return (
                      <div key={vi} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-black aspect-video shadow-md">
                        {isYoutube ? (
                          <iframe
                            src={embedUrl}
                            title={vidTitle}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={vidUrl} controls className="w-full h-full object-cover">
                            Trình duyệt không hỗ trợ thẻ video.
                          </video>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Specifications ── */}
        {activeTab === 'specs' && (
          <div className="space-y-8 max-w-4xl">
            {/* Grouped Dynamic Specifications */}
            {groupedSpecs ? (
              Object.entries(groupedSpecs).map(([groupName, groupItems], gi) => (
                <div key={gi} className="rounded-2xl border border-gray-200/80 dark:border-slate-700 overflow-hidden shadow-2xs">
                  <div className="px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-850 border-b border-gray-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <span>{groupName}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{groupItems.length} thông số</span>
                  </div>
                  <table className="w-full text-xs sm:text-sm text-left border-collapse">
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                      {groupItems.map((spec, si) => (
                        <tr 
                          key={si}
                          className={si % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/60 dark:bg-slate-850/40'}
                        >
                          <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300 w-1/3 sm:w-2/5">
                            <div className="flex items-center gap-1.5">
                              <span>{spec.name}</span>
                              {spec.isHighlight && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                  Nổi bật
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-gray-900 dark:text-white font-medium">
                            <span>{String(spec.value)}</span>
                            {spec.unit && (
                              <span className="ml-1 text-gray-400 font-mono text-xs font-normal">
                                {spec.unit}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              /* Fallback for legacy specs */
              <div className="rounded-2xl border border-gray-200/80 dark:border-slate-700 overflow-hidden shadow-2xs">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                    {product.brand && (
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300 w-1/3">Thương hiệu</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white font-bold">{product.brand}</td>
                      </tr>
                    )}
                    {product.model && (
                      <tr className="bg-gray-50/60 dark:bg-slate-850/40">
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">Model / Ký hiệu</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white font-mono">{product.model}</td>
                      </tr>
                    )}
                    {product.origin && (
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">Xuất xứ</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white">{product.origin}</td>
                      </tr>
                    )}
                    {product.power && (
                      <tr className="bg-gray-50/60 dark:bg-slate-850/40">
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">Công suất định mức</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white font-mono">{product.power} kW</td>
                      </tr>
                    )}
                    {product.efficiency && (
                      <tr className="bg-white dark:bg-slate-800">
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">Hiệu suất</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white font-mono">{product.efficiency}%</td>
                      </tr>
                    )}
                    {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/60 dark:bg-slate-850/40'}>
                        <td className="py-3 px-5 font-semibold text-gray-600 dark:text-gray-300">{key}</td>
                        <td className="py-3 px-5 text-gray-900 dark:text-white">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Warranty & Certificates Box */}
            <div className="p-5 bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-indigo-950/20 rounded-2xl border border-sky-100 dark:border-slate-700 flex items-start gap-3.5">
              <ShieldCheck size={28} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  Chính Sách Bảo Hành & Cam Kết Chất Lượng CTC:
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  Tất cả sản phẩm do <strong>Công ty Cổ phần Xây lắp Bưu điện Miền Trung (CTC)</strong> phân phối đều có đầy đủ chứng chỉ chất lượng (CQ), chứng chỉ xuất xứ (CO) và được hưởng chế độ bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Documents / Datasheet ── */}
        {activeTab === 'documents' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Tài Liệu Kỹ Thuật, Datasheet & Catalogue Tải Về
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tài liệu chính thức do hãng sản xuất và CTC ban hành, quý khách có thể tải về hoặc xem trực tuyến.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc, di) => (
                <a
                  key={di}
                  href={doc.fileUrl || doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300 dark:hover:border-sky-700 transition-all group shadow-2xs hover:shadow-md"
                >
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      {doc.title || 'Tài liệu kỹ thuật PDF'}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="uppercase font-mono font-bold text-[10px] bg-gray-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-gray-700 dark:text-gray-300">
                        {doc.fileType || 'PDF'}
                      </span>
                      <span>Nhấn để tải về</span>
                    </div>
                  </div>
                  <Download size={16} className="text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 4: Reviews ── */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t('products.detail_tab_reviews') || 'Đánh giá từ khách hàng'}
              </h3>
              <button 
                onClick={onWriteReviewClick}
                className="px-5 py-2 rounded-full border border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs sm:text-sm bg-transparent"
              >
                <MessageSquare size={16} />
                <span>{t('products.write_review') || 'Viết đánh giá'}</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-slate-850 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                <Star size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-xs sm:text-sm text-gray-500 italic mb-1">
                  {t('products.no_reviews') || 'Chưa có đánh giá nào cho sản phẩm này.'}
                </p>
                <p className="text-xs text-gray-400">
                  {t('products.be_first') || 'Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-slate-850 p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-950/60 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{review.userName}</h4>
                          {review.userRole && <p className="text-[11px] text-gray-400">{review.userRole}</p>}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex text-amber-400 text-xs mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star 
                          key={i} 
                          size={13} 
                          fill={i <= review.rating ? "currentColor" : "none"} 
                          className={i <= review.rating ? "text-amber-400" : "text-gray-300 dark:text-slate-600"} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
