
import React, { useState, useEffect } from 'react';
import { Sun, Zap, DollarSign, ArrowRight, Home, Building2, TrendingDown, AreaChart, Battery, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const SolarCalculator: React.FC = () => {
  const [monthlyBill, setMonthlyBill] = useState<number>(2000000);
  const [customerType, setCustomerType] = useState<'residential' | 'commercial'>('residential');
  const [daytimeUsageRatio, setDaytimeUsageRatio] = useState<number>(0.30);
  const [systemSize, setSystemSize] = useState<number>(0);
  const [installationCost, setInstallationCost] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [roiYears, setRoiYears] = useState<number>(0);
  const [monthlyProduction, setMonthlyProduction] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [roofArea, setRoofArea] = useState<number>(0);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (customerType === 'residential') setDaytimeUsageRatio(0.30);
    else setDaytimeUsageRatio(0.80);
  }, [customerType]);

  const VAT_RATE = 1.08;
  const RESIDENTIAL_TIERS = [
    { max: 50, price: 1984 * VAT_RATE },
    { max: 100, price: 2050 * VAT_RATE },
    { max: 200, price: 2380 * VAT_RATE },
    { max: 300, price: 2998 * VAT_RATE },
    { max: 400, price: 3350 * VAT_RATE },
    { max: Infinity, price: 3460 * VAT_RATE }
  ];
  const COMMERCIAL_RATES = {
    normal: 3108 * VAT_RATE,
    offPeak: 1829 * VAT_RATE,
    peak: 5202 * VAT_RATE
  };
  const COMMERCIAL_TIME_RATIO = { normal: 0.60, offPeak: 0.20, peak: 0.20 };
  const H_PV = 4; const PR = 0.80; const ETA_SYS = 0.90;
  const COVERAGE_RATIO = 0.80; const COST_PER_KWP = 9000000;
  const BATTERY_RESERVE_FACTOR = 1.2;

  const calculateCommercialBill = (kwh: number) =>
    (kwh * COMMERCIAL_TIME_RATIO.normal * COMMERCIAL_RATES.normal) +
    (kwh * COMMERCIAL_TIME_RATIO.offPeak * COMMERCIAL_RATES.offPeak) +
    (kwh * COMMERCIAL_TIME_RATIO.peak * COMMERCIAL_RATES.peak);

  const calculateResidentialBill = (kwh: number) => {
    let total = 0, rem = kwh, prev = 0;
    for (const tier of RESIDENTIAL_TIERS) {
      const range = tier.max - prev;
      const inTier = Math.min(rem, range);
      if (inTier > 0) { total += inTier * tier.price; rem -= inTier; }
      if (rem <= 0) break;
      prev = tier.max;
    }
    return total;
  };

  const calculateKwhFromCommercialBill = (bill: number) => {
    const avg = (COMMERCIAL_RATES.normal * COMMERCIAL_TIME_RATIO.normal) +
      (COMMERCIAL_RATES.offPeak * COMMERCIAL_TIME_RATIO.offPeak) +
      (COMMERCIAL_RATES.peak * COMMERCIAL_TIME_RATIO.peak);
    return bill / avg;
  };

  const calculateKwhFromResidentialBill = (bill: number) => {
    let kwh = 0, rem = bill, prev = 0;
    for (const tier of RESIDENTIAL_TIERS) {
      const range = tier.max - prev;
      const maxCost = range * tier.price;
      if (rem > maxCost) { kwh += range; rem -= maxCost; }
      else { kwh += rem / tier.price; break; }
      prev = tier.max;
    }
    return kwh;
  };

  const calculateKwhFromBill = (bill: number) =>
    customerType === 'residential' ? calculateKwhFromResidentialBill(bill) : calculateKwhFromCommercialBill(bill);

  const calcBill = (kwh: number) =>
    customerType === 'residential' ? calculateResidentialBill(kwh) : calculateCommercialBill(kwh);

  useEffect(() => {
    const D_thang = calculateKwhFromBill(monthlyBill);
    const D_ngay = D_thang / 30;
    const D_bu_ngay = D_ngay * COVERAGE_RATIO;
    const C_PV = D_bu_ngay / H_PV;
    const finalSize = Math.round(C_PV * 2) / 2;
    const size = finalSize < 3 ? 3 : finalSize;
    const E_pv_thang = size * PR * H_PV * 30 * ETA_SYS;
    const C_inv = size * COST_PER_KWP;
    const newBill = calcBill(Math.max(0, D_thang - E_pv_thang));
    const S_month = monthlyBill - newBill;
    const T_pay_year = S_month > 0 ? C_inv / (S_month * 12) : 0;
    const D_ban_ngay = D_ngay * daytimeUsageRatio;
    const E_battery = (D_ngay - D_ban_ngay) * BATTERY_RESERVE_FACTOR;
    const area = size * 5.45;
    setSystemSize(size); setInstallationCost(C_inv); setMonthlySavings(S_month);
    setRoiYears(T_pay_year); setMonthlyProduction(E_pv_thang); setTotalSavings(S_month);
    setRoofArea(area); setBatteryCapacity(E_battery);
  }, [monthlyBill, daytimeUsageRatio, customerType]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const savingPercent = monthlyBill > 0 ? Math.min(100, Math.round((monthlySavings / monthlyBill) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-gray-100 dark:border-slate-700/60">

      {/* ── LEFT: INPUT PANEL ── */}
      <div className="bg-white dark:bg-slate-900 p-8 flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sun size={18} className="text-primary" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary">{t('calculator.title')}</span>
        </div>

        {/* Customer Type */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">{t('calculator.usage_type')}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'residential' as const, icon: Home, label: t('calculator.household'), sub: t('calculator.household_desc') },
              { key: 'commercial' as const, icon: Building2, label: t('calculator.company'), sub: t('calculator.company_desc') },
            ].map(({ key, icon: Icon, label, sub }) => {
              const active = customerType === key;
              return (
                <button
                  key={key}
                  onClick={() => setCustomerType(key)}
                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                    active
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-100 dark:border-slate-700 hover:border-primary/40 bg-gray-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-black leading-none ${active ? 'text-primary' : 'text-gray-700 dark:text-slate-300'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 leading-tight">{sub}</p>
                  </div>
                  {active && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly Bill Slider */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('calculator.bill_label')}</p>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {formatCurrency(monthlyBill)}
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-200"
                style={{ width: `${((monthlyBill - 500000) / (20000000 - 500000)) * 100}%` }}
              />
            </div>
            <input
              type="range" min="500000" max="20000000" step="100000"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
              style={{ top: 0 }}
            />
            <div
              className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-md shadow-primary/30 transition-all duration-200 pointer-events-none"
              style={{ left: `calc(${((monthlyBill - 500000) / (20000000 - 500000)) * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-gray-300 dark:text-slate-600 mt-2 uppercase tracking-wide">
            <span>500K</span><span>20 Triệu</span>
          </div>
        </div>

        {/* Daytime Usage Slider */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('calculator.daytime_usage')}</p>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            {(daytimeUsageRatio * 100).toFixed(0)}%
          </div>
          <div className="relative">
            <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-200"
                style={{ width: `${daytimeUsageRatio * 100}%` }}
              />
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={daytimeUsageRatio * 100}
              onChange={(e) => setDaytimeUsageRatio(Number(e.target.value) / 100)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
              style={{ top: 0 }}
            />
            <div
              className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-md shadow-amber-300/30 transition-all duration-200 pointer-events-none"
              style={{ left: `calc(${daytimeUsageRatio * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-gray-300 dark:text-slate-600 mt-2 uppercase tracking-wide">
            <span>0% (Tất cả ban đêm)</span><span>100% (Tất cả ban ngày)</span>
          </div>
          <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-[11px] leading-relaxed ${
            customerType === 'residential' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}>
            <span className="mt-0.5">💡</span>
            <span>{customerType === 'residential' ? t('calculator.tip_residential') : t('calculator.tip_commercial')}</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-600 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-4 mt-auto italic">
          {t('calculator.disclaimer')}
        </p>
      </div>

      {/* ── RIGHT: RESULT PANEL ── */}
      <div className="relative bg-[#0d1b35] text-white p-8 flex flex-col gap-6 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">{t('calculator.system_size')}</p>
            <h3 className="text-white/90 font-black text-sm">{t('calculator.system_size')}</h3>
          </div>
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
            <Sun size={18} className="text-yellow-400" />
          </div>
        </div>

        {/* Big 3 KPIs */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'kWp', value: `${systemSize}` },
            { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: t('calculator.monthly_savings'), value: `${(monthlySavings / 1000000).toFixed(1)}M` },
            { icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', label: t('calculator.investment'), value: `${(installationCost / 1000000).toFixed(0)}M` },
          ].map(({ icon: Icon, color, bg, label, value }) => (
            <div key={label} className={`relative rounded-2xl border p-4 ${bg} flex flex-col items-center text-center gap-1 overflow-hidden`}>
              <Icon size={18} className={color} />
              <p className={`text-2xl font-black ${color} leading-none mt-1`}>{value}</p>
              <p className="text-[9px] text-white/50 uppercase tracking-wide leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ROI Banner */}
        <div className="relative z-10 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('calculator.roi')}</p>
            <p className="text-4xl font-black text-white mt-1 leading-none">
              {roiYears.toFixed(1)}
              <span className="text-base font-normal text-white/50 ml-1">{t('calculator.years')}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Tiết kiệm</p>
            <p className="text-2xl font-black text-emerald-400 mt-1 leading-none">{savingPercent}%</p>
            <p className="text-[10px] text-white/30 mt-0.5">hóa đơn/tháng</p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="relative z-10 bg-white/[0.04] border border-white/8 rounded-2xl divide-y divide-white/8 overflow-hidden">
          {[
            { icon: LayoutGrid, label: t('calculator.system_capacity'), value: `${systemSize.toFixed(1)} kWp`, color: 'text-primary' },
            { icon: Battery, label: t('calculator.storage'), value: `${batteryCapacity.toFixed(1)} kWh`, color: 'text-primary' },
            { icon: TrendingDown, label: t('calculator.estimated_bill'), value: formatCurrency(monthlyBill - totalSavings), color: 'text-primary' },
            { icon: Zap, label: t('calculator.max_savings'), value: formatCurrency(totalSavings), color: 'text-emerald-400' },
            { icon: AreaChart, label: t('calculator.recommended_area'), value: `${roofArea.toFixed(1)} m²`, color: 'text-primary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 group hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2.5">
                <Icon size={13} className="text-white/30 group-hover:text-white/50 transition-colors" />
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{label}</span>
              </div>
              <span className={`text-sm font-black ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/contact"
          className="relative z-10 group w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-black text-sm py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0"
        >
          {t('calculator.consult_btn')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};

export default SolarCalculator;
