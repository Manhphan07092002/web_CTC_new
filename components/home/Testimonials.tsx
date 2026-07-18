import React from 'react';
import { Heart, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';
import { Testimonial } from '../../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const { t } = useLanguage();
  const { ref: testimonialsSection, isInView } = useInView(0.1);

  return (
    <section ref={testimonialsSection} className="py-24 bg-gradient-to-br from-primary/5 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 dark:opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-2 rounded-full mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <Heart size={18} className="text-red-500 animate-pulse" />
            <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">{t('home.testimonials')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{t('home.testimonials_title')}</h2>
        </div>

        <div className={`relative overflow-hidden transition-all duration-300 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Auto-scrolling container */}
          <div 
            className="flex gap-8 hover:pause-animation"
            style={{
              animation: 'scroll 15s linear infinite',
              animationFillMode: 'forwards'
            }}
          >
            {/* First set of testimonials */}
            {testimonials.map((item, index) => (
              <div key={`testimonial-${index}-${item._id || item.id}`} className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-lg hover:shadow-2xl border border-gray-100 dark:border-slate-600/50 relative flex flex-col min-w-[300px] sm:min-w-[400px] max-w-[300px] sm:max-w-[400px] h-[280px] sm:h-[320px] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 group flex-shrink-0">
                <div className="text-primary/20 text-6xl absolute top-4 right-6 font-serif leading-none group-hover:text-primary/30 transition-colors duration-200">"</div>
                
                <div className="flex items-center gap-1 mb-4 text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-600 dark:text-slate-300 italic mb-6 relative z-10 flex-1 leading-relaxed text-base line-clamp-4">"{item.content}"</p>
                
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-600 shadow-md group-hover:scale-110 transition-transform duration-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h4>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {testimonials.map((item, index) => (
              <div key={`testimonial-duplicate-${index}-${item._id || item.id}`} className="bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-8 rounded-[2rem] shadow-lg hover:shadow-2xl border border-gray-100 dark:border-slate-600/50 relative flex flex-col min-w-[400px] max-w-[400px] h-[320px] transition-all duration-700 ease-in-out hover:-translate-y-2 hover:scale-102 group flex-shrink-0">
                <div className="text-primary/20 text-6xl absolute top-4 right-6 font-serif leading-none group-hover:text-primary/30 transition-colors duration-200">"</div>
                
                <div className="flex items-center gap-1 mb-4 text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                
                <p className="text-gray-600 dark:text-slate-300 italic mb-6 relative z-10 flex-1 leading-relaxed text-base line-clamp-4">"{item.content}"</p>
                
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-600 shadow-md group-hover:scale-110 transition-transform duration-200">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{item.name}</h4>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
