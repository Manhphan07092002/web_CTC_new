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
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400">
              <p className="text-justify">{product.description}</p>
              {product.shortDescription && (
                <p className="text-gray-500 italic mt-2">{product.shortDescription}</p>
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
          <div className="max-w-2xl overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                {/* Basic specifications */}
                {product.power && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300 w-1/3">
                      {t('products.power') || 'Công suất'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {product.power}W
                    </td>
                  </tr>
                )}
                {product.efficiency && (
                  <tr className="bg-white dark:bg-gray-800">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      {t('products.efficiency') || 'Hiệu suất'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {product.efficiency}%
                    </td>
                  </tr>
                )}
                {product.warranty && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      {t('products.warranty') || 'Bảo hành'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {product.warranty}
                    </td>
                  </tr>
                )}
                
                {/* Custom specifications list */}
                {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'}>
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{key}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
