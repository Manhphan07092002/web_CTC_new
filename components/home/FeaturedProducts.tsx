import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, ExternalLink, Boxes } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLangText } from '../../utils/translation-helper';
import { useInView } from '../../hooks/useInView';
import { Product } from '../../types';
import { getProductUrl } from '../../utils/news-url-helper';
import { stripHtmlAndJson } from '../../utils/priceUtils';
import OptimizedImage from '../OptimizedImage';

interface FeaturedProductsProps {
  featuredProducts: Product[];
  isLoading?: boolean;
}

const DEFAULT_FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'jinko-solar-550w',
    name: 'Tấm pin năng lượng mặt trời Jinko Solar 550W Tiger Pro',
    category: 'Tấm pin mặt trời',
    price: 'Liên hệ',
    contactPrice: true,
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80',
    description: 'Tấm pin mặt trời mono đơn tinh thể công nghệ Half-cell, hiệu suất chuyển đổi quang năng 21.33%, độ bền vượt trội Tier 1.',
    stock: 50,
    stockStatus: 'in_stock'
  },
  {
    id: 'sungrow-inverter-110kw',
    name: 'Biến tần Inverter hòa lưới Sungrow 110kW SG110CX',
    category: 'Biến tần Inverter',
    price: 'Liên hệ',
    contactPrice: true,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    description: 'Inverter công nghiệp 9 MPPT cho hiệu suất tối đa 98.7%, chuẩn chống nước bụi IP66, tích hợp giám sát thông minh iSolarCloud.',
    stock: 25,
    stockStatus: 'in_stock'
  },
  {
    id: 'longi-solar-540w',
    name: 'Tấm pin năng lượng mặt trời Longi Solar Hi-MO 5 540W',
    category: 'Tấm pin mặt trời',
    price: 'Liên hệ',
    contactPrice: true,
    image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&q=80',
    description: 'Dòng pin hiệu suất cao đạt tiêu chuẩn IEC quốc tế, bảo hành cơ lý 12 năm và bảo hành hiệu suất tuyến tính 25 năm.',
    stock: 40,
    stockStatus: 'in_stock'
  },
  {
    id: 'huawei-inverter-100kw',
    name: 'Biến tần Inverter thông minh Huawei SUN2000-100KTL-M1',
    category: 'Biến tần Inverter',
    price: 'Liên hệ',
    contactPrice: true,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    description: 'Biến tần chuỗi hòa lưới cao cấp 100kW tích hợp công nghệ AI bảo vệ hồ quang AFCI an toàn tuyệt đối chống cháy nổ.',
    stock: 20,
    stockStatus: 'in_stock'
  }
];

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ featuredProducts, isLoading = false }) => {
  const { t, language } = useLanguage();
  const { ref: productsRef, isInView } = useInView(0.1);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const displayProducts = featuredProducts && featuredProducts.length > 0 
    ? featuredProducts 
    : DEFAULT_FALLBACK_PRODUCTS;

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
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {getLangText(language, {
                  vi: 'Sản phẩm',
                  en: 'PRODUCTS',
                  ko: '제품',
                  ja: '製品',
                  zh: '产品',
                  de: 'PRODUKTE'
                })}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              {getLangText(language, {
                vi: 'Sản phẩm mới',
                en: 'Latest Products',
                ko: '최신 제품',
                ja: '最新製品',
                zh: '最新产品',
                de: 'Neueste Produkte'
              })}
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-primary/30 rounded-full mb-5" />
            <p className="text-gray-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              {getLangText(language, {
                vi: 'Chúng tôi chỉ phân phối các dòng thiết bị từ Top 5 thế giới (Tier 1) để đảm bảo độ bền và hiệu suất.',
                en: 'We only distribute Tier 1 equipment from top global brands to ensure durability and high performance.',
                ko: '내구성과 효율성을 보장하기 위해 세계 Top 5 장비(Tier 1)만 유통합니다.',
                ja: '耐久性と高効率を保証するため、世界Top 5（Tier 1）機器のみを販売しています。',
                zh: '我们仅分销全球 Top 5（Tier 1）品牌设备，以确保耐用性与高效率。',
                de: 'Wir vertreiben ausschließlich Tier-1-Geräte der globalen Top-5-Marken.'
              })}
            </p>
          </div>

          <Link
            to="/products"
            className="group flex-shrink-0 inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl border-2 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary font-black text-xs uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            {getLangText(language, {
              vi: 'XEM TẤT CẢ',
              en: 'VIEW ALL PRODUCTS',
              ko: '전체 보기',
              ja: 'すべてを見る',
              zh: '查看全部',
              de: 'ALLE ANZEIGEN'
            })}
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
            : displayProducts.map((product, index) => {
              const isHovered = hoveredCard === index;
              return (
                <Link
                  key={`product-${index}-${product._id || product.id}`}
                  to={getProductUrl(product)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-gray-50 dark:bg-slate-700 flex-shrink-0">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
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
                      {stripHtmlAndJson(product.shortDescription || product.description)}
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
