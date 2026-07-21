import React from 'react';
import { Package } from 'lucide-react';
import { Product } from '../../types';
import ProductSkeleton from '../ProductSkeleton';
import ProductCard from './ProductCard';

interface ProductGridProps {
  loading: boolean;
  categoriesLoading: boolean;
  filteredProducts: Product[];
  handleProductClick: (id: string) => void;
  onAddToCart: (product: Product) => void;
  handleClearFilters: () => void;
  t: (key: string) => any;
  placeholderImage: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  loading,
  categoriesLoading,
  filteredProducts,
  handleProductClick,
  onAddToCart,
  handleClearFilters,
  t,
  placeholderImage
}) => {
  const showSkeleton = loading || categoriesLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {showSkeleton ? (
        // Render Skeletons
        Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))
      ) : filteredProducts.length > 0 ? (
        // Render Products
        filteredProducts.map((product, idx) => (
          <ProductCard
            key={`${product.id}-${idx}`}
            product={product}
            onClick={() => handleProductClick(product.id)}
            onAddToCart={() => onAddToCart(product)}
            t={t}
            placeholderImage={placeholderImage}
          />
        ))
      ) : (
        // Render Empty Results State
        <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
          <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
            {t('products.no_result')}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {t('products.no_result_desc')}
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-primary font-bold text-sm hover:underline"
          >
            {t('products.clear_filter')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
