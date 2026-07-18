import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Battery, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Product } from '../../types';

interface FeaturedProductsProps {
  featuredProducts: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ featuredProducts }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { ref: productsRef, isInView } = useInView(0.1);

  return (
    <section ref={productsRef} className="py-24 bg-gray-50">
      <div className="container max-w-[1440px] mx-auto px-6">
        <div className={`flex flex-col md:flex-row justify-between items-end mb-12 gap-4 transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Battery size={18} className="text-primary animate-pulse" />
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Sản phẩm</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t('home.latest_products')}</h2>
            <p className="text-gray-600 text-lg">{t('home.latest_products_desc')}</p>
          </div>
          <Link to="/products" className="bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg group">
            {t('home.view_all_products')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {featuredProducts.map((product, index) => (
            <div 
              key={`product-${index}-${product._id || product.id}`} 
              className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-200 border border-gray-100 hover:border-primary/20 flex flex-col hover:-translate-y-2 cursor-pointer"
              onClick={() => navigate(`/products/${product._id || product.id}`)}
            >
              <div className="h-64 overflow-hidden relative bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-100">
                  {product.category}
                </span>
                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:bg-primary hover:text-white">
                    Xem chi tiết
                  </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-gray-600">{t('common.stock')}: {product.stock || 0}</span>
                  </div>
                  <span className="text-primary font-bold text-sm hover:underline flex items-center gap-1 group-hover/link:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
