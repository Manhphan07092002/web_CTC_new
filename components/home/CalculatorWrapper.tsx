import React from 'react';
import { Zap, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SolarCalculator from '../SolarCalculator';

const CalculatorWrapper: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-5/12">
            <div className="inline-block bg-orange-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">{t('calculator.intro_badge')}</div>
            <h2 className="text-4xl font-bold text-corporate mb-6 leading-tight">{t('calculator.intro_title')}</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {t('calculator.intro_desc')}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-corporate border border-gray-100"><Zap size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-800">{t('calculator.feature_1_title')}</h4>
                  <p className="text-sm text-gray-500">{t('calculator.feature_1_desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-corporate border border-gray-100"><DollarSign size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-800">{t('calculator.feature_2_title')}</h4>
                  <p className="text-sm text-gray-500">{t('calculator.feature_2_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-7/12 w-full">
            <div className="transform hover:scale-[1.01] transition-transform duration-200">
              <SolarCalculator />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorWrapper;
