import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import PriceDisplay from '../PriceDisplay';

interface RelatedProductsProps {
  relatedProducts: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ relatedProducts }) => {
  const { t } = useLanguage();

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-corporate mb-6 border-l-4 border-primary pl-3">
        {t('products.related_products') || 'Sản phẩm tương tự'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((item, index) => {
          const itemId = item.id || item._id;
          return (
            <Link 
              key={`related-product-${itemId}-${index}`} 
              to={`/products/${itemId}`} 
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group block"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 truncate group-hover:text-primary transition-colors">
                  {item.name}
                </h4>
                <PriceDisplay 
                  price={item.price || 0}
                  originalPrice={item.originalPrice}
                  contactPrice={item.contactPrice}
                  size="sm"
                  layout="horizontal"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;
