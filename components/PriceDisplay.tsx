import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { formatPrice, calculateDiscount, hasDiscount, SupportedCurrency } from '../utils/priceUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface PriceDisplayProps {
  price: string | number;
  originalPrice?: string | number;
  contactPrice?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showDiscount?: boolean;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  contactPrice = false,
  size = 'md',
  layout = 'horizontal',
  showDiscount = true,
  className = ''
}) => {
  const { language, t } = useLanguage();
  const lang = language as SupportedCurrency;

  // If contact price, show contact message
  if (contactPrice) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="flex items-center gap-1.5 font-bold text-primary text-sm hover:text-secondary transition-colors">
          <MessageSquare size={16} className="text-primary animate-pulse" />
          <span>{t('products.contact_price') || 'Liên hệ báo giá'}</span>
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            window.location.href = "tel:0915059666";
          }}
          className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/25 text-primary text-[10px] rounded-full font-bold border border-primary/20 transition-all active:scale-95"
        >
          <Phone size={10} />
          <span>{t('header.hotline') || 'Hotline'}</span>
        </button>
      </div>
    );
  }

  const currentPrice = formatPrice(price, { language: lang });
  const hasOriginalPrice = originalPrice && hasDiscount(originalPrice, price);
  const discountPercent = hasOriginalPrice ? calculateDiscount(originalPrice, price) : 0;

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {/* Current Price */}
        <div className="flex items-center gap-2">
          <span className={`font-bold text-red-600 ${getSizeClasses(size)}`}>
            {currentPrice}
          </span>
          {showDiscount && discountPercent > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
              -{discountPercent}%
            </span>
          )}
        </div>
        
        {/* Original Price */}
        {hasOriginalPrice && (
          <span className={`text-gray-500 line-through ${getOriginalSizeClasses(size)}`}>
            {formatPrice(originalPrice, { language: lang })}
          </span>
        )}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Current Price */}
      <span className={`font-bold text-red-600 ${getSizeClasses(size)}`}>
        {currentPrice}
      </span>
      
      {/* Original Price */}
      {hasOriginalPrice && (
        <span className={`text-gray-500 line-through ${getOriginalSizeClasses(size)}`}>
          {formatPrice(originalPrice, { language: lang })}
        </span>
      )}
      
      {/* Discount Badge */}
      {showDiscount && discountPercent > 0 && (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};

// Size classes for current price
function getSizeClasses(size: string): string {
  switch (size) {
    case 'sm': return 'text-sm';
    case 'md': return 'text-base';
    case 'lg': return 'text-lg';
    case 'xl': return 'text-xl';
    default: return 'text-base';
  }
}

// Size classes for original price (smaller than current)
function getOriginalSizeClasses(size: string): string {
  switch (size) {
    case 'sm': return 'text-xs';
    case 'md': return 'text-sm';
    case 'lg': return 'text-base';
    case 'xl': return 'text-lg';
    default: return 'text-sm';
  }
}

export default PriceDisplay;
