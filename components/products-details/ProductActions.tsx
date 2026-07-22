import React from 'react';
import { Phone, ShoppingCart, Heart, Share2, CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductActionsProps {
  warranty?: string;
  likes: number;
  shares: number;
  isLiking: boolean;
  isSharing: boolean;
  floatingHearts: Array<{ id: number; x: number }>;
  floatingShares: Array<{ id: number; x: number }>;
  onLike: () => void;
  onShare: () => void;
  onCallBuy: () => void;
  onAddToQuote: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  warranty,
  likes,
  shares,
  isLiking,
  isSharing,
  floatingHearts,
  floatingShares,
  onLike,
  onShare,
  onCallBuy,
  onAddToQuote
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCallBuy}
            className="bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Phone size={20} /> {t('products.call_to_buy')}
          </button>
          <button 
            onClick={onAddToQuote}
            className="border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold text-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} /> {t('products.add_to_quote')}
          </button>
        </div>
        
        {/* Engagement Buttons */}
        <div className="flex items-center gap-3 relative">
          {/* Floating Hearts */}
          {floatingHearts.map(heart => (
            <div
              key={heart.id}
              className="absolute pointer-events-none animate-float-up text-red-500"
              style={{
                left: `calc(25% + ${heart.x}px)`,
                bottom: '0px',
                fontSize: '24px'
              }}
            >
              ❤️
            </div>
          ))}
          
          {/* Floating Share Icons */}
          {floatingShares.map(share => (
            <div
              key={share.id}
              className="absolute pointer-events-none animate-float-up text-blue-500"
              style={{
                left: `calc(65% + ${share.x}px)`,
                bottom: '0px',
                fontSize: '24px'
              }}
            >
              📤
            </div>
          ))}
          
          <button 
            onClick={onLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:scale-105 active:scale-95 ${
              isLiking ? 'scale-110' : ''
            }`}
          >
            <Heart 
              size={18} 
              className={`transition-all duration-300 ${isLiking ? 'animate-heart-beat text-red-500' : ''}`}
            /> 
            <span className={`transition-all ${isLiking ? 'animate-bounce-once' : ''}`}>{likes}</span> {t('products.like')}
          </button>
          
          <button 
            onClick={onShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 active:scale-95 ${
              isSharing ? 'scale-110' : ''
            }`}
          >
            <Share2 
              size={18} 
              className={`transition-all duration-300 ${isSharing ? 'rotate-12 text-blue-500' : ''}`}
            /> 
            <span className={`transition-all ${isSharing ? 'animate-bounce-once' : ''}`}>{shares}</span> {t('products.share_btn')}
          </button>
        </div>
      </div>

      {/* Trust Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Truck className="text-primary flex-shrink-0" size={24} />
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.shipping')}</p>
            <p className="text-xs text-gray-500">{t('products.free_shipping_nationwide')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="text-primary flex-shrink-0" size={24} />
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.authentic')}</p>
            <p className="text-xs text-gray-500">{t('products.authentic_cocq')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="text-primary flex-shrink-0" size={24} />
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('products.payment')}</p>
            <p className="text-xs text-gray-500">{t('products.secure')}</p>
          </div>
        </div>
      </div>
  );
};

export default ProductActions;
