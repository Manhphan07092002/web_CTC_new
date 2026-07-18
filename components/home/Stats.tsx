import React from 'react';
import { Briefcase, Check, Zap, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useInView } from '../../hooks/useInView';

const Stats: React.FC = () => {
  const { t } = useLanguage();
  const { ref: statsRef, isInView } = useInView(0.1);

  const statsList = [
    { icon: Briefcase, value: '22+', label: t('home.stat_exp'), color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { icon: Check, value: '500+', label: t('home.stat_projects'), color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { icon: Zap, value: '50MW', label: t('home.stat_capacity'), color: 'from-primary to-orange-500', bg: 'bg-orange-50' },
    { icon: Users, value: '98%', label: t('home.stat_satisfaction'), color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' }
  ];

  return (
    <section ref={statsRef} className="py-20 bg-white relative z-20 -mt-20 container mx-auto px-4">
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 transition-all duration-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {statsList.map((stat, idx) => (
          <div key={idx} className="group text-center p-8 rounded-3xl bg-white hover:bg-gray-50/50 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:-translate-y-2 perspective-1000 animate-card-hover">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <stat.icon size={28} className="text-white relative z-10" />
            </div>
            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{stat.value}</div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
