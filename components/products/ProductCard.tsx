import React from 'react';
import { Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import PriceDisplay from '../PriceDisplay';

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
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 flex flex-col group h-full cursor-pointer"
    >
      {/* Image Section */}
      <div className="h-56 relative bg-gray-200 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
        <img
          src={product.image || placeholderImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-white/95 dark:bg-gray-800/95 backdrop-blur text-corporate dark:text-orange-500 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
            {product.category}
          </span>
          {product.stock === 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              {t('common.out_of_stock')}
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="bg-white text-corporate px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg transform hover:scale-105 font-bold flex items-center gap-2">
            <Eye size={18} /> {t('common.view_details')}
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors h-12">
          {product.name}
        </h3>

        {/* Specs Preview */}
        {(product.power || product.efficiency) && (
          <div className="flex gap-3 mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {product.power && (
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {product.power}W
              </span>
            )}
            {product.efficiency && (
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Eff: {product.efficiency}%
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <div className="mb-4 flex-grow">
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <PriceDisplay
            price={product.price || 0}
            originalPrice={product.originalPrice}
            contactPrice={product.contactPrice}
            size="lg"
            layout="vertical"
            className="flex-1"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-all ml-2"
            title="Thêm vào báo giá"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
