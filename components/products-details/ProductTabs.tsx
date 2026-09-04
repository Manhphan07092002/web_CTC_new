import React from 'react';
import { Star, Sparkles, CheckCircle, MessageSquare } from 'lucide-react';
import { Product, Review } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  activeTab: 'desc' | 'specs' | 'reviews';
  setActiveTab: (tab: 'desc' | 'specs' | 'reviews') => void;
  onWriteReviewClick: () => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  reviews,
  activeTab,
  setActiveTab,
  onWriteReviewClick
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
      {/* Tabs Selector */}
      <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('desc')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeTab === 'desc' ? 'border-primary text-primary bg-orange-50/50 dark:bg-orange-950/10' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
        >
          {t('products.detail_tab_desc') || 'Chi tiết'}
        </button>
        <button 
          onClick={() => setActiveTab('specs')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeTab === 'specs' ? 'border-primary text-primary bg-orange-50/50 dark:bg-orange-950/10' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
        >
          {t('products.detail_tab_specs') || 'Thông số kỹ thuật'}
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-8 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary bg-orange-50/50 dark:bg-orange-950/10' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-gray-50'}`}
        >
          {t('products.detail_tab_reviews') || 'Đánh giá'} 
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
            {reviews.length}
          </span>
        </button>
      </div>
      
      {/* Tabs Content */}
      <div className="p-8 md:p-12">
        {/* Description Tab */}
        {activeTab === 'desc' && (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description && (product.description.includes('<') || product.description.includes('&lt;')) ? (
                <div 
                  className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed [&_img]:rounded-2xl [&_img]:shadow-lg [&_img]:my-6 [&_img]:max-h-[550px] [&_img]:mx-auto [&_img]:object-cover [&_a]:text-primary [&_a]:underline [&_a]:font-semibold [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-gray-200 [&_td]:p-3"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-justify whitespace-pre-line leading-relaxed">{product.description}</p>
              )}

              {product.shortDescription && (
                <div className="text-gray-600 dark:text-gray-400 italic bg-orange-50/60 dark:bg-orange-950/20 p-4 rounded-xl border-l-4 border-primary mt-6">
                  {product.shortDescription}
                </div>
              )}
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Sparkles size={24} className="text-primary" />
                  {t('products.key_features') || 'Tính năng nổi bật'}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/10 rounded-lg border border-green-100 dark:border-green-900/30">
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed specifications text */}
            {product.specifications && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {t('products.tech_details') || 'Chi tiết kỹ thuật'}
                </h3>
                <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 p-6 rounded-xl">
                  <p className="whitespace-pre-line text-justify">{product.specifications}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specs' && (
          <div className="max-w-3xl overflow-x-auto space-y-6">
            <table className="w-full text-sm text-left border-collapse rounded-xl overflow-hidden shadow-2xs border border-gray-100 dark:border-gray-700">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {/* Brand & Model */}
                {product.brand && (
                  <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300 w-1/3">
                      Hãng sản xuất / Thương hiệu
                    </td>
                    <td className="p-4 text-gray-800 dark:text-gray-200 font-semibold">
                      {product.brand}
                    </td>
                  </tr>
                )}
                {product.model && (
                  <tr className="bg-white dark:bg-gray-800">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      Model / Mã thiết bị
                    </td>
                    <td className="p-4 text-gray-800 dark:text-gray-200 font-mono font-medium">
                      {product.model}
                    </td>
                  </tr>
                )}
                {product.origin && (
                  <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      Xuất xứ / Nơi sản xuất
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {product.origin}
                    </td>
                  </tr>
                )}
                {product.warranty && (
                  <tr className="bg-white dark:bg-gray-800">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      {t('products.warranty') || 'Bảo hành'}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {product.warranty}
                    </td>
                  </tr>
                )}

                {/* Dynamic specifications list */}
                {Array.isArray(product.specificationsList) && product.specificationsList.length > 0 ? (
                  product.specificationsList.map((spec, idx) => (
                    <tr 
                      key={spec.key || idx} 
                      className={idx % 2 === 0 ? 'bg-gray-50/80 dark:bg-gray-900/40' : 'bg-white dark:bg-gray-800'}
                    >
                      <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <span>{spec.name}</span>
                          {spec.isHighlight && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              Nổi bật
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {spec.value} {spec.unit ? <span className="font-mono text-gray-500 font-medium">{spec.unit}</span> : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {/* Fallback legacy technicalSpecs */}
                    {product.power && (
                      <tr className="bg-gray-50/80 dark:bg-gray-900/40">
                        <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                          {t('products.power') || 'Công suất'}
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-mono">
                          {product.power}W
                        </td>
                      </tr>
                    )}
                    {product.efficiency && (
                      <tr className="bg-white dark:bg-gray-800">
                        <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                          {t('products.efficiency') || 'Hiệu suất'}
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300 font-mono">
                          {product.efficiency}%
                        </td>
                      </tr>
                    )}
                    {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-gray-50/80 dark:bg-gray-900/40' : 'bg-white dark:bg-gray-800'}>
                        <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{key}</td>
                        <td className="p-4 text-gray-700 dark:text-gray-300">{value}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            {/* Downloadable Documents / Datasheets in specs tab */}
            {Array.isArray(product.documents) && product.documents.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-3">
                  Tài liệu kỹ thuật & Catalogue PDF tải về:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.documents.map((doc, di) => (
                    <a
                      key={di}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300 transition-colors group"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg group-hover:scale-105 transition-transform">
                        <span className="font-bold text-xs uppercase font-mono">{doc.fileType || 'PDF'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate group-hover:text-sky-600">
                          {doc.title || 'Tài liệu kỹ thuật'}
                        </div>
                        <div className="text-[11px] text-gray-400">Bấm để tải về / xem trực tuyến</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {t('products.detail_tab_reviews') || 'Đánh giá khách hàng'}
              </h3>
              <button 
                onClick={onWriteReviewClick}
                className="border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-2 font-bold text-sm bg-transparent"
              >
                <MessageSquare size={16}/> {t('products.write_review') || 'Viết đánh giá'}
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-750">
                <Star size={48} className="mx-auto text-gray-300 mb-3"/>
                <p className="text-gray-500 italic mb-2">{t('products.no_reviews') || 'Chưa có đánh giá nào cho sản phẩm này.'}</p>
                <p className="text-sm text-gray-400">{t('products.be_first') || 'Hãy là người đầu tiên gửi đánh giá!'}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">{review.userName}</h4>
                          {review.userRole && <p className="text-xs text-gray-500 dark:text-gray-400">{review.userRole}</p>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex text-yellow-400 text-xs mb-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i <= review.rating ? "currentColor" : "none"} 
                          className={i <= review.rating ? "text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
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
