import React from 'react';
import { Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { parseNumericPrice, calculatePriceWithVat, formatVnCurrency } from '../../utils/priceUtils';

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

  const vat = Number(product.vat) || 0;
  const isContact = Boolean(product.contactPrice);

  // Parse raw price values from product (chưa VAT)
  const rawPrice = parseNumericPrice(product.price);
  const rawOriginal = parseNumericPrice(product.originalPrice);

  // Calculate promotional price with VAT
  const promotionalPriceWithVat = calculatePriceWithVat(rawPrice, vat);

  // Calculate listed price with VAT (if listed price exists)
  const listedPriceWithVat = rawOriginal > 0 ? calculatePriceWithVat(rawOriginal, vat) : 0;

  // Hide listed price line if listed price <= 0 or listed price == promotional price
  const showListedPrice = !isContact && listedPriceWithVat > 0 && listedPriceWithVat !== promotionalPriceWithVat;

  const discountPercent = (!isContact && showListedPrice && listedPriceWithVat > promotionalPriceWithVat)
    ? Math.round(((listedPriceWithVat - promotionalPriceWithVat) / listedPriceWithVat) * 100)
    : 0;

  const stock = product.stock !== undefined ? product.stock : 1;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-corporate dark:text-white mb-3 leading-tight">
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
        <span className="text-gray-400 text-sm border-l border-gray-300 dark:border-gray-700 pl-4">
          {reviewsCount} {t('products.reviews') || 'đánh giá'}
        </span>
        <span className="text-gray-400 text-sm border-l border-gray-300 dark:border-gray-700 pl-4 flex items-center gap-1">
          <Eye size={14} /> {views} {t('products.views') || 'lượt xem'}
        </span>
      </div>

      {/* Redesigned 2-column price & stock area */}
      <div className="space-y-3 mb-6 font-sans">
        {/* Row 1: Giá niêm yết */}
        {!isContact && showListedPrice && (
          <div className="flex items-baseline flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
            <span className="w-32 sm:w-36 flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
              Giá niêm yết:
            </span>
            <span className="text-gray-400 dark:text-gray-500 line-through font-normal text-base sm:text-lg">
              {formatVnCurrency(listedPriceWithVat)}
            </span>
          </div>
        )}

        {/* Row 2: Giá khuyến mại / Giá sản phẩm */}
        <div className="flex items-baseline flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
          <span className="w-32 sm:w-36 flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
            {isContact ? 'Giá sản phẩm:' : 'Giá khuyến mại:'}
          </span>
          {isContact ? (
            <span className="text-red-600 dark:text-red-500 font-bold text-xl sm:text-2xl">
              {t('products.contact_price') || 'Liên hệ báo giá'}
            </span>
          ) : (
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-red-600 dark:text-red-500 font-bold text-2xl sm:text-3xl">
                {formatVnCurrency(promotionalPriceWithVat)}
              </span>
              {discountPercent > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 bg-red-100/80 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm rounded-full border border-red-200/60 dark:border-red-900/40">
                  -{discountPercent}%
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-normal ml-0.5">
                [Giá đã có VAT]
              </span>
            </div>
          )}
        </div>

        {/* Row 3: Tình trạng hàng */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-4 pt-1">
          <span className="w-32 sm:w-36 flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">
            Tình trạng:
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            <span className={stock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium text-sm sm:text-base' : 'text-red-600 dark:text-red-400 font-medium text-sm sm:text-base'}>
              {stock > 0 ? t('common.in_stock') || 'Còn hàng' : t('common.out_of_stock') || 'Hết hàng'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
