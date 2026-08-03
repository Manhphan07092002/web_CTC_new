import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import PriceDisplay from '../PriceDisplay';

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddToCart: (product: Product, quantity: number) => void;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80";

const parsePrice = (priceVal: any): number => {
  if (!priceVal) return 0;
  if (typeof priceVal === 'number') return priceVal;
  const cleanStr = String(priceVal).replace(/[^0-9]/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
};

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmAddToCart
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const { language } = useLanguage();

  // Reset quantity when modal opens for a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const unitPrice = parsePrice(product.price);
  const subtotal = unitPrice * quantity;

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else {
      setQuantity(val);
    }
  };

  const handleQuickPreset = (addQty: number) => {
    setQuantity(prev => prev + addQty);
  };

  const handleAddToCart = () => {
    onConfirmAddToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    onConfirmAddToCart(product, quantity);
    onClose();
    window.location.href = '/cart';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingCart size={18} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {getLangText(language, {
                vi: 'Chọn số lượng sản phẩm',
                en: 'Select Product Quantity',
                ko: '수량 chọn 선택',
                ja: '数量を選択',
                zh: '选择商品数量',
                de: 'Produktmenge wählen'
              })}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Product Summary Row */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
            <img 
              src={product.image || PLACEHOLDER_IMAGE} 
              alt={product.name}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200 dark:border-slate-700 flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
                {product.category || 'Sản phẩm'}
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 leading-snug">
                {product.name}
              </h4>
              <div className="pt-1">
                <PriceDisplay 
                  price={product.price || 0}
                  originalPrice={product.originalPrice}
                  contactPrice={product.contactPrice}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Shopee-style Quantity Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {getLangText(language, {
                  vi: 'Số lượng đặt hàng',
                  en: 'Order Quantity',
                  ko: '주문 수량',
                  ja: '注文数量',
                  zh: '订购数量',
                  de: 'Bestellmenge'
                })}
              </label>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={13} />
                {getLangText(language, {
                  vi: 'Còn hàng sẵn sàng giao',
                  en: 'In Stock Ready to Ship',
                  ko: '재고 있음',
                  ja: '在庫あり',
                  zh: '现货',
                  de: 'Auf Lager'
                })}
              </span>
            </div>

            {/* Shopee Style Controls Box */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-bold text-lg"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  className="w-16 h-11 text-center font-bold text-base bg-white dark:bg-slate-900 border-x-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <button
                  type="button"
                  onClick={handleIncrease}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Quick Add Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 5, 10, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickPreset(preset)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-200/60 dark:border-slate-700"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtotal Calculation Box */}
          {unitPrice > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wider">
                {getLangText(language, {
                  vi: 'Tạm tính:',
                  en: 'Subtotal:',
                  ko: '소계:',
                  ja: '小計:',
                  zh: '小计:',
                  de: 'Zwischensumme:'
                })}
              </span>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-extrabold text-primary dark:text-sky-400">
                  {subtotal.toLocaleString('vi-VN')} VNĐ
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  ({unitPrice.toLocaleString('vi-VN')} VNĐ × {quantity})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3.5 px-4 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <ShoppingCart size={18} />
            <span>
              {getLangText(language, {
                vi: 'Thêm vào giỏ hàng',
                en: 'Add to Cart',
                ko: '장바구니 담기',
                ja: 'カートに追加',
                zh: '加入购物车',
                de: 'In den Warenkorb'
              })}
            </span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            <Zap size={18} />
            <span>
              {getLangText(language, {
                vi: 'Đặt hàng ngay',
                en: 'Buy Now',
                ko: '지금 구매',
                ja: '今すぐ購入',
                zh: '立即购买',
                de: 'Jetzt kaufen'
              })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
