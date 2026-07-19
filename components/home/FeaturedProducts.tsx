import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, ExternalLink, Boxes } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Product } from '../../types';

interface FeaturedProductsProps {
  featuredProducts: Product[];
  isLoading?: boolean;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ featuredProducts, isLoading = false }) => {
  const { t } = useLanguage();
  const { ref: productsRef, isInView } = useInView(0.1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section ref={productsRef} className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">

      {/* Subtle background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-primary/8 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-gradient-to-tr from-orange-400/5 via-transparent to-transparent" />
      </div>

      <div className="container max-w-[1440px] mx-auto px-6 relative z-10">

        {/* Header */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full mb-4">
              <Cpu size={13} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sản phẩm</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              {t('home.latest_products')}
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/30 rounded-full mb-5" />
            <p className="text-gray-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              {t('home.latest_products_desc')}
            </p>
          </div>

          <Link
            to="/products"
            className="group flex-shrink-0 inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary font-black text-xs uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            {t('home.view_all_products')}
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards */}
        <div
          aria-busy={isLoading}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-150 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
              <div key={`product-skeleton-${index}`} className="rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-pulse bg-gray-50 dark:bg-slate-800">
                <div className="h-56 bg-slate-200 dark:bg-slate-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))
            : featuredProducts.map((product, index) => {
              const isHovered = hoveredCard === index;
              return (
                <Link
                  key={`product-${index}-${product._id || product.id}`}
                  to={`/products/${product._id || product.id}`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-gray-50 dark:bg-slate-700 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Category tag */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-gray-800 dark:text-slate-200 text-[10px] font-black uppercase tracking-wide rounded-full shadow-md border border-white/50 dark:border-slate-700/50">
                        {product.category}
                      </span>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute inset-x-0 bottom-4 flex justify-center">
                      <span className={`flex items-center gap-2 bg-white text-primary text-xs font-black uppercase tracking-wider px-5 py-2 rounded-full shadow-xl border border-primary/10 transition-all duration-400 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                        <ExternalLink size={12} />
                        Xem chi tiết
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-base text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
                      {product.description}
                    </p>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Boxes size={12} className="text-gray-400" />
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400">
                          {t('common.stock')}: <span className={`font-black ${(product.stock ?? 0) > 0 ? 'text-emerald-500' : 'text-red-400'}`}>{product.stock ?? 0}</span>
                        </span>
                      </div>
                      <div className={`w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-primary scale-110' : ''}`}>
                        <ArrowRight size={13} className={`transition-all duration-300 ${isHovered ? 'text-white translate-x-0.5' : 'text-primary'}`} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>



      </div>
    </section>
  );
};

export default FeaturedProducts;
