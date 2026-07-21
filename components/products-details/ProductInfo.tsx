import React from 'react';
import { Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import PriceDisplay from '../PriceDisplay';

interface ProductInfoProps {
  product: Product;
  averageRating: string | number;
  reviewsCount: number;
  views: number;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  averageRating,
  reviewsCount,
  views
}) => {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-corporate mb-4 leading-tight">
        {product.name}
      </h1>
      
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center text-yellow-400 text-sm gap-1">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mr-1">
            {averageRating || 0}
          </span>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star 
              key={i} 
              size={16} 
              fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} 
              className={i <= Math.round(Number(averageRating)) ? "text-yellow-400" : "text-gray-300"} 
            />
          ))}
        </div>
        <span className="text-gray-400 text-sm border-l border-gray-300 pl-4">
          {reviewsCount} {t('products.reviews')}
        </span>
        <span className="text-gray-400 text-sm border-l border-gray-300 pl-4 flex items-center gap-1">
          <Eye size={14} /> {views} {t('products.views')}
        </span>
      </div>

      <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-850 dark:to-blue-950/20 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
            💰 {t('products.product_price')}
          </h3>
          <PriceDisplay 
            price={product.price || 0}
            originalPrice={product.originalPrice}
            contactPrice={product.contactPrice}
            size="xl"
            layout="vertical"
            className="mb-3"
          />
        </div>
        
        {product.stock !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={product.stock > 0 ? 'text-green-700 font-medium dark:text-green-400' : 'text-red-600'}>
              {product.stock > 0 ? t('common.in_stock') : t('common.out_of_stock')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
