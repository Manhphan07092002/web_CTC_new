import React from 'react';
import { Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import PriceDisplay from '../PriceDisplay';
import { stripHtmlAndJson, parseNumericPrice } from '../../utils/priceUtils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: () => void;
  t: (key: string) => any;
  placeholderImage: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onAddToCart,
  t,
  placeholderImage
}) => {
  const cleanDesc = stripHtmlAndJson(product.shortDescription || product.description);

  // Calculate numeric prices for safe comparison and discount calculation
  const numericPrice = parseNumericPrice(product.price);
  const numericOriginalPrice = parseNumericPrice(product.originalPrice);

  const hasDiscount = numericOriginalPrice > 0 && numericPrice > 0 && numericOriginalPrice > numericPrice;
  const discountPercent = hasDiscount
    ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 flex flex-col group h-full cursor-pointer w-full max-w-full"
    >
      {/* Image Section - aspect ratio uniform for all screen sizes */}
      <div className="w-full aspect-square relative bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
        <img
          src={(!product.image || typeof product.image !== 'string' || product.image.startsWith('x-raw-image:')) ? placeholderImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImage;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none gap-1">
          <div className="flex flex-col gap-1 items-start max-w-[70%]">
            {product.category && (
              <span className="bg-white/95 dark:bg-gray-800/95 backdrop-blur text-corporate dark:text-sky-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-xs uppercase tracking-wider truncate max-w-full">
                {product.category}
              </span>
            )}
            {(product.isHot || product.badge === 'HOT') && (
              <img src="/assets/icons/tag-hot.svg" alt="HOT Deal" className="h-5 sm:h-6 object-contain drop-shadow-md" />
            )}
            {(product.isNew || product.badge === 'NEW') && (
              <img src="/assets/icons/tag-new.svg" alt="NEW Product" className="h-5 sm:h-6 object-contain drop-shadow-md" />
            )}
            {(product.isFeatured || (product as any).featured) && (
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-md uppercase tracking-wider flex items-center gap-1">
                ⭐ {t('home.products_featured') || 'Nổi bật'}
              </span>
            )}
            {(product.stockStatus === 'out_of_stock' || (product.stock === 0 && !product.contactPrice && product.stockStatus !== 'contact')) && (
              <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                {t('common.out_of_stock')}
              </span>
            )}

          </div>

          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md transform group-hover:scale-110 transition-transform">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Actions Overlay (Hidden on touch devices, hover on desktop) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
          <button className="bg-white text-corporate px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg transform hover:scale-105 font-bold text-xs flex items-center gap-1.5">
            <Eye size={16} /> {t('common.view_details')}
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name - Line clamped to 2 lines with standard min-height */}
          <h3 
            className="font-bold text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-100 mb-1.5 line-clamp-2 group-hover:text-primary dark:group-hover:text-sky-400 transition-colors leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Specs Preview */}
          {(product.power || product.efficiency) && (
            <div className="flex flex-wrap gap-1.5 mb-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {product.power && (
                <span className="bg-gray-100 dark:bg-gray-750 px-1.5 py-0.5 rounded border border-gray-200/50 dark:border-gray-700">
                  {product.power}W
                </span>
              )}
              {product.efficiency && (
                <span className="bg-gray-100 dark:bg-gray-750 px-1.5 py-0.5 rounded border border-gray-200/50 dark:border-gray-700">
                  Eff: {product.efficiency}%
                </span>
              )}
            </div>
          )}

          {/* Description (Hidden on extra small mobile grid to keep cards compact) */}
          <div className="mb-2 hidden sm:block">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {cleanDesc}
            </p>
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700/80 flex items-end justify-between gap-1.5 min-w-0 mt-auto">
          <div className="flex-1 min-w-0">
            <PriceDisplay
              price={product.price || 0}
              originalPrice={product.originalPrice}
              vat={product.vat}
              contactPrice={product.contactPrice}
              size="md"
              layout="vertical"
              className="flex-1 min-w-0"
            />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="text-primary dark:text-sky-400 hover:text-white hover:bg-primary dark:hover:bg-sky-500 bg-sky-50 dark:bg-sky-950/60 p-2 sm:p-2.5 rounded-lg transition-all flex-shrink-0 active:scale-95 border border-sky-100 dark:border-sky-900"
            title="Thêm vào báo giá"
            aria-label="Thêm vào báo giá"
          >
            <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
