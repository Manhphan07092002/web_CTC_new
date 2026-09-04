import React, { useState } from 'react';
import { 
  Star, Eye, ShieldCheck, Tag, Globe, Check, 
  Copy, Layers, Sparkles, Flame
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { parseNumericPrice, calculatePriceWithVat, formatVnCurrency } from '../../utils/priceUtils';

interface ProductInfoProps {
  product: Product;
  averageRating: string | number;
  reviewsCount: number;
  views: number;
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (variant: ProductVariant) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  averageRating,
  reviewsCount,
  views,
  selectedVariant,
  onSelectVariant
}) => {
  const { t } = useLanguage();
  const [copiedSku, setCopiedSku] = useState(false);

  const vat = Number(product.vat) || 0;
  const isContact = Boolean(product.contactPrice);

  // Active price based on selected variant or base product
  const activePriceStr = selectedVariant?.price || product.price;
  const activeOriginalPriceStr = selectedVariant?.originalPrice || product.originalPrice;
  const activeSku = selectedVariant?.sku || product.sku || product.code;
  const activeStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : (product.stock !== undefined ? product.stock : 1);

  // Parse raw price values (chưa VAT)
  const rawPrice = parseNumericPrice(activePriceStr);
  const rawOriginal = parseNumericPrice(activeOriginalPriceStr);

  // Calculate promotional price with VAT
  const promotionalPriceWithVat = calculatePriceWithVat(rawPrice, vat);
  const listedPriceWithVat = rawOriginal > 0 ? calculatePriceWithVat(rawOriginal, vat) : 0;

  const showListedPrice = !isContact && listedPriceWithVat > 0 && listedPriceWithVat !== promotionalPriceWithVat;
  const discountPercent = (!isContact && showListedPrice && listedPriceWithVat > promotionalPriceWithVat)
    ? Math.round(((listedPriceWithVat - promotionalPriceWithVat) / listedPriceWithVat) * 100)
    : 0;

  const handleCopySku = () => {
    if (activeSku) {
      navigator.clipboard.writeText(activeSku);
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Badges Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.isHot && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
            <Flame size={12} className="animate-pulse" />
            HOT
          </span>
        )}
        {product.isNew && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
            <Sparkles size={12} />
            MỚI
          </span>
        )}
        {product.badge && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            {product.badge}
          </span>
        )}
        {product.unit && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
            ĐVT: {product.unit}
          </span>
        )}
      </div>

      {/* Product Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-corporate dark:text-white leading-tight tracking-tight">
        {product.name}
      </h1>
      
      {/* Ratings, Reviews, Views */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center text-amber-400 gap-1">
          <span className="font-bold text-gray-800 dark:text-gray-200 mr-1">
            {averageRating || 0}
          </span>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star 
              key={i} 
              size={15} 
              fill={i <= Math.round(Number(averageRating)) ? "currentColor" : "none"} 
              className={i <= Math.round(Number(averageRating)) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"} 
            />
          ))}
        </div>
        <span className="text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4">
          {reviewsCount} {t('products.reviews') || 'đánh giá'}
        </span>
        <span className="text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4 flex items-center gap-1">
          <Eye size={14} /> {views} {t('products.views') || 'lượt xem'}
        </span>
      </div>

      {/* Product Identification Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50/90 dark:bg-slate-800/60 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 text-xs">
        {/* Brand */}
        <div>
          <span className="text-gray-400 block mb-0.5">Thương hiệu:</span>
          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 truncate">
            <Tag size={12} className="text-primary-500 shrink-0" />
            {product.brand || 'Chính Hãng'}
          </span>
        </div>

        {/* Model */}
        {product.model && (
          <div>
            <span className="text-gray-400 block mb-0.5">Model:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white truncate block" title={product.model}>
              {product.model}
            </span>
          </div>
        )}

        {/* SKU / Part number */}
        {activeSku && (
          <div>
            <span className="text-gray-400 block mb-0.5">Mã SKU:</span>
            <button
              onClick={handleCopySku}
              title="Nhấn để copy mã"
              className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1 hover:text-primary-600 transition-colors"
            >
              <span className="truncate">{activeSku}</span>
              {copiedSku ? <Check size={11} className="text-emerald-500 shrink-0" /> : <Copy size={11} className="text-gray-400 shrink-0" />}
            </button>
          </div>
        )}

        {/* Origin */}
        {product.origin && (
          <div>
            <span className="text-gray-400 block mb-0.5">Xuất xứ:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1 truncate">
              <Globe size={12} className="text-sky-500 shrink-0" />
              {product.origin}
            </span>
          </div>
        )}

        {/* Warranty */}
        {product.warranty && (
          <div>
            <span className="text-gray-400 block mb-0.5">Bảo hành:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
              <ShieldCheck size={13} className="shrink-0" />
              {product.warranty}
            </span>
          </div>
        )}

        {/* Stock Status */}
        <div>
          <span className="text-gray-400 block mb-0.5">Tình trạng kho:</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${activeStock > 0 || product.stockStatus === 'in_stock' || product.stockStatus === 'contact' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className={`font-semibold ${activeStock > 0 || product.stockStatus === 'in_stock' || product.stockStatus === 'contact' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {activeStock > 0 || product.stockStatus === 'in_stock' || product.stockStatus === 'contact' ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Block */}
      <div className="p-4 bg-gradient-to-r from-orange-50/70 to-amber-50/40 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-orange-100 dark:border-slate-700">
        {isContact ? (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block mb-1">Giá sản phẩm:</span>
            <div className="flex items-center gap-3">
              <span className="text-rose-600 dark:text-rose-400 font-extrabold text-2xl sm:text-3xl">
                {t('products.contact_price') || 'Liên hệ báo giá'}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg">
                Dự án & Đại lý
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Liên hệ hotline để nhận mức chiết khấu và báo giá tốt nhất cho đơn hàng dự án.
            </p>
          </div>
        ) : (
          <div>
            {showListedPrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">Giá niêm yết:</span>
                <span className="text-gray-400 line-through text-sm font-medium">
                  {formatVnCurrency(listedPriceWithVat)}
                </span>
              </div>
            )}

            <div className="flex items-baseline flex-wrap gap-2.5">
              <span className="text-rose-600 dark:text-rose-500 font-extrabold text-2xl sm:text-3xl">
                {formatVnCurrency(promotionalPriceWithVat)}
              </span>

              {discountPercent > 0 && (
                <span className="px-2 py-0.5 text-xs font-extrabold bg-rose-500 text-white rounded-md shadow-xs">
                  -{discountPercent}%
                </span>
              )}

              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {vat > 0 ? `[Đã bao gồm VAT ${vat}%]` : '[Chưa bao gồm VAT]'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Variants Selector */}
      {product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0 && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
            <Layers size={14} className="text-primary-500" />
            <span>Chọn phiên bản / Cấu hình:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant, vi) => {
              const isSelected = selectedVariant?.name === variant.name || (!selectedVariant && vi === 0);
              return (
                <button
                  key={vi}
                  type="button"
                  onClick={() => onSelectVariant?.(variant)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-2 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-xs'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{variant.name}</span>
                  {variant.price && (
                    <span className="text-[11px] font-normal opacity-80 font-mono">
                      ({formatVnCurrency(parseNumericPrice(variant.price))})
                    </span>
                  )}
                  {isSelected && <Check size={13} strokeWidth={3} className="text-primary-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Highlight Specifications */}
      {Array.isArray(product.specificationsList) && product.specificationsList.filter(s => s.isHighlight && s.value).length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-700/80">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>Thông số nổi bật</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {product.specificationsList.filter(s => s.isHighlight && s.value).map((spec, i) => (
              <div key={i} className="flex flex-col bg-white dark:bg-slate-850 p-2 rounded-lg border border-gray-100 dark:border-slate-700/60">
                <span className="text-[11px] text-gray-400 font-medium truncate">{spec.name}</span>
                <span className="font-bold text-gray-800 dark:text-gray-100 font-mono text-xs truncate">
                  {String(spec.value)} {spec.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Short Description Callout */}
      {product.shortDescription && (
        <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/20 border-l-4 border-sky-500 rounded-r-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {product.shortDescription}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
