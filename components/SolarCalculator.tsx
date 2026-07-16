
import React, { useState, useEffect } from 'react';
import { Calculator, Sun, Zap, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const SolarCalculator: React.FC = () => {
  const [monthlyBill, setMonthlyBill] = useState<number>(2000000); // Default 2 million VND
  const [customerType, setCustomerType] = useState<'residential' | 'commercial'>('residential'); // Hộ gia đình / Công ty
  const [daytimeUsageRatio, setDaytimeUsageRatio] = useState<number>(0.30); // Default 30%
  const [systemSize, setSystemSize] = useState<number>(0);
  const [installationCost, setInstallationCost] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [roiYears, setRoiYears] = useState<number>(0);
  const [kwhUsed, setKwhUsed] = useState<number>(0);
  const [monthlyProduction, setMonthlyProduction] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [roofArea, setRoofArea] = useState<number>(0);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(0);
  const { t } = useLanguage();

  // Auto adjust daytime usage ratio when customer type changes
  useEffect(() => {
    if (customerType === 'residential') {
      setDaytimeUsageRatio(0.30); // Hộ gia đình: 30% ban ngày
    } else {
      setDaytimeUsageRatio(0.80); // Công ty: 80% ban ngày
    }
  }, [customerType]);

  // Constants for calculation (Based on 2025 Vietnam electricity prices + 8% VAT)
  const VAT_RATE = 1.08; // 8% VAT
  
  // Giá điện sinh hoạt 2025 (VND/kWh) - ĐÃ BAO GỒM VAT 8%
  const RESIDENTIAL_TIERS = [
    { max: 50, price: 1984 * VAT_RATE },    // Bậc 1: 0-50 kWh
    { max: 100, price: 2050 * VAT_RATE },   // Bậc 2: 51-100 kWh
    { max: 200, price: 2380 * VAT_RATE },   // Bậc 3: 101-200 kWh
    { max: 300, price: 2998 * VAT_RATE },   // Bậc 4: 201-300 kWh
    { max: 400, price: 3350 * VAT_RATE },   // Bậc 5: 301-400 kWh
    { max: Infinity, price: 3460 * VAT_RATE } // Bậc 6: >400 kWh
  ];

  // Giá điện kinh doanh 2025 (VND/kWh) - ĐÃ BAO GỒM VAT 8%
  // Cấp điện áp từ 6 kV đến dưới 22 kV
  const COMMERCIAL_RATES = {
    normal: 3108 * VAT_RATE,    // Giờ bình thường: 3,108 đ/kWh
    offPeak: 1829 * VAT_RATE,   // Giờ thấp điểm: 1,829 đ/kWh
    peak: 5202 * VAT_RATE       // Giờ cao điểm: 5,202 đ/kWh
  };

  // Tỷ lệ sử dụng điện theo giờ (kinh doanh)
  const COMMERCIAL_TIME_RATIO = {
    normal: 0.60,   // 60% giờ bình thường
    offPeak: 0.20,  // 20% giờ thấp điểm
    peak: 0.20      // 20% giờ cao điểm
  };

  // Chọn bảng giá theo loại hình
  // Note: Currently both customer types use RESIDENTIAL_TIERS for bill calculation
  // Commercial rates are calculated separately in calculateCommercialBill()
  const ELECTRICITY_TIERS = RESIDENTIAL_TIERS;
  
  // Hằng số hệ thống PV
  const H_PV = 4;           // Bức xạ trung bình (kWh/kWp/ngày) - Đà Nẵng
  const PR = 0.80;            // Hệ số hiệu suất hệ thống
  const ETA_SYS = 0.90;       // Hệ số tổn thất
  const COVERAGE_RATIO = 0.80; // Tỷ lệ bù điện (80%)
  const COST_PER_KWP = 9000000; // 9 triệu VND/kWp
  const BATTERY_RESERVE_FACTOR = 1.2; // Hệ số dự phòng + tổn thất battery/inverter

  // Hàm tính tiền điện kinh doanh (theo giờ)
  const calculateCommercialBill = (kwhUsed: number): number => {
    const normalKwh = kwhUsed * COMMERCIAL_TIME_RATIO.normal;
    const offPeakKwh = kwhUsed * COMMERCIAL_TIME_RATIO.offPeak;
    const peakKwh = kwhUsed * COMMERCIAL_TIME_RATIO.peak;

    const totalCost = 
      (normalKwh * COMMERCIAL_RATES.normal) +
      (offPeakKwh * COMMERCIAL_RATES.offPeak) +
      (peakKwh * COMMERCIAL_RATES.peak);

    return totalCost;
  };

  // Hàm tính tiền điện sinh hoạt (theo bậc thang)
  const calculateResidentialBill = (kwhUsed: number): number => {
    let totalCost = 0;
    let remainingKwh = kwhUsed;
    let previousMax = 0;

    for (const tier of RESIDENTIAL_TIERS) {
      const tierRange = tier.max - previousMax;
      const kwhInTier = Math.min(remainingKwh, tierRange);
      
      if (kwhInTier > 0) {
        totalCost += kwhInTier * tier.price;
        remainingKwh -= kwhInTier;
      }
      
      if (remainingKwh <= 0) break;
      previousMax = tier.max;
    }

    return totalCost;
  };

  // Hàm tính tiền điện (tự động chọn theo loại hình)
  const calculateElectricityBill = (kwhUsed: number): number => {
    return customerType === 'residential' 
      ? calculateResidentialBill(kwhUsed)
      : calculateCommercialBill(kwhUsed);
  };

  // Hàm tính kWh từ tiền điện kinh doanh
  const calculateKwhFromCommercialBill = (bill: number): number => {
    // Tính giá trung bình có trọng số
    const avgPrice = 
      (COMMERCIAL_RATES.normal * COMMERCIAL_TIME_RATIO.normal) +
      (COMMERCIAL_RATES.offPeak * COMMERCIAL_TIME_RATIO.offPeak) +
      (COMMERCIAL_RATES.peak * COMMERCIAL_TIME_RATIO.peak);
    
    return bill / avgPrice;
  };

  // Hàm tính kWh từ tiền điện sinh hoạt (ngược lại)
  const calculateKwhFromResidentialBill = (bill: number): number => {
    let totalKwh = 0;
    let remainingBill = bill;
    let previousMax = 0;

    for (const tier of RESIDENTIAL_TIERS) {
      const tierRange = tier.max - previousMax;
      const tierMaxCost = tierRange * tier.price;
      
      if (remainingBill > tierMaxCost) {
        totalKwh += tierRange;
        remainingBill -= tierMaxCost;
      } else {
        totalKwh += remainingBill / tier.price;
        break;
      }
      
      previousMax = tier.max;
    }

    return totalKwh;
  };

  // Hàm tính kWh từ tiền điện (tự động chọn theo loại hình)
  const calculateKwhFromBill = (bill: number): number => {
    return customerType === 'residential'
      ? calculateKwhFromResidentialBill(bill)
      : calculateKwhFromCommercialBill(bill);
  };

  // Hàm tính giá điện trung bình
  const calculateAveragePrice = (kwhUsed: number): number => {
    const totalBill = calculateElectricityBill(kwhUsed);
    return totalBill / kwhUsed;
  };

  useEffect(() => {
    // 1. Tính kWh tiêu thụ từ hóa đơn tiền điện
    const D_thang = calculateKwhFromBill(monthlyBill);
    
    // 2. Điện tiêu thụ trung bình mỗi ngày
    const D_ngay = D_thang / 30;
    
    // 3. Lượng điện cần bù mỗi ngày (70%)
    const D_bu_ngay = D_ngay * COVERAGE_RATIO;
    
    // 4. Công suất PV cần lắp (kWp)
    const C_PV = D_bu_ngay / H_PV;
    
    // Round to nearest 0.5 kWp
    const finalSize = Math.round(C_PV * 2) / 2;
    const size = finalSize < 3 ? 3 : finalSize; // Minimum 3kWp
    
    // 5. Sản lượng điện PV hàng tháng (kWh/tháng)
    const E_pv_thang = size * PR * H_PV * 30 * ETA_SYS;
    
    // 6. Chi phí đầu tư (C_inv = c × P)
    const C_inv = size * COST_PER_KWP;
    
    // 7. Tiền tiết kiệm hàng tháng (S_month)
    // Tính chính xác: Tiền điện hiện tại - Tiền điện sau khi lắp PV
    const currentBill = monthlyBill;
    const newBill = calculateElectricityBill(Math.max(0, D_thang - E_pv_thang));
    const S_month = currentBill - newBill;
    
    // 8. Thời gian hoàn vốn
    // T_pay,month = C_inv / S_month (tháng)
    // T_pay,year = C_inv / (S_month × 12) (năm)
    const T_pay_month = S_month > 0 ? C_inv / S_month : 0;
    const T_pay_year = S_month > 0 ? C_inv / (S_month * 12) : 0;
    
    // 9. Tính dung lượng pin lưu trữ cho hệ Hybrid (kWh)
    // E_battery = (D_ngay - D_ban_ngay) × 1.2
    const D_ban_ngay = D_ngay * daytimeUsageRatio;
    const E_battery = (D_ngay - D_ban_ngay) * BATTERY_RESERVE_FACTOR;
    
    // 10. Tính diện tích mái cần thiết (m2)
    // DIỆN TÍCH KHUYẾN NGHỊ = 5.45 × CÔNG SUẤT HỆ THỐNG
    const area = size * 5.45;

    setSystemSize(size);
    setInstallationCost(C_inv);
    setMonthlySavings(S_month);
    setRoiYears(T_pay_year);
    setKwhUsed(D_thang);
    setMonthlyProduction(E_pv_thang);
    setTotalSavings(S_month);
    setRoofArea(area);
    setBatteryCapacity(E_battery);
  }, [monthlyBill, daytimeUsageRatio, customerType]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row h-full">
      {/* Input Section */}
      <div className="p-8 lg:w-1/2 bg-gray-50 dark:bg-slate-900 flex flex-col justify-center relative">
        <div className="flex items-center gap-2 text-corporate dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">
          <Calculator size={18} className="text-primary" /> {t('calculator.title')}
        </div>

        {/* Customer Type Selection */}
        <div className="mb-8 relative z-10">
          <label className="block text-gray-700 dark:text-slate-200 font-bold mb-4 text-lg">
            {t('calculator.usage_type')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCustomerType('residential')}
              className={`p-4 rounded-xl border-2 transition-all ${
                customerType === 'residential'
                  ? 'border-primary bg-primary text-white shadow-lg'
                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-bold text-sm">{t('calculator.household')}</div>
              <div className="text-xs opacity-80 mt-1">{t('calculator.household_desc')}</div>
            </button>
            <button
              onClick={() => setCustomerType('commercial')}
              className={`p-4 rounded-xl border-2 transition-all ${
                customerType === 'commercial'
                  ? 'border-secondary bg-secondary text-white shadow-lg'
                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-secondary/50'
              }`}
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-bold text-sm">{t('calculator.company')}</div>
              <div className="text-xs opacity-80 mt-1">{t('calculator.company_desc')}</div>
            </button>
          </div>
        </div>

        <div className="mb-8 relative z-10">
          <label className="block text-gray-700 dark:text-slate-200 font-bold mb-4 text-lg">
            {t('calculator.bill_label')}
          </label>
          <div className="text-4xl font-bold text-primary mb-6 tracking-tight">
            {formatCurrency(monthlyBill)}
          </div>
          
          <div className="relative w-full h-12 flex items-center">
            <input
              type="range"
              min="500000"
              max="20000000"
              step="100000"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(Number(e.target.value))}
              className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">
            <span>500k VNĐ</span>
            <span>20 Triệu VNĐ</span>
          </div>
        </div>

        {/* Daytime Usage Ratio Slider */}
        <div className="mb-8 relative z-10">
          <label className="block text-gray-700 dark:text-slate-200 font-bold mb-4 text-lg">
            {t('calculator.daytime_usage')}
          </label>
          <div className="text-4xl font-bold text-secondary mb-6 tracking-tight">
            {(daytimeUsageRatio * 100).toFixed(0)}%
          </div>
          
          <div className="relative w-full h-12 flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={daytimeUsageRatio * 100}
              onChange={(e) => setDaytimeUsageRatio(Number(e.target.value) / 100)}
              className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer accent-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
          
          <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">
            <span>0% ({t('calculator.all_night')})</span>
            <span>100% ({t('calculator.all_day')})</span>
          </div>
          
          <div className={`mt-3 p-3 border-l-4 rounded ${
            customerType === 'residential' 
              ? 'bg-orange-50 border-primary' 
              : 'bg-blue-50 border-secondary'
          }`}>
            <p className={`text-xs ${
              customerType === 'residential' ? 'text-orange-800' : 'text-blue-800'
            }`}>
              <strong>💡 {t('calculator.tip')}:</strong> {
                customerType === 'residential'
                  ? t('calculator.tip_residential')
                  : t('calculator.tip_commercial')
              }
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 italic leading-relaxed border-t border-gray-200 pt-4">
          {t('calculator.disclaimer')}
        </p>
      </div>

      {/* Result Section */}
      <div className="p-8 lg:w-1/2 bg-corporate text-white relative overflow-hidden flex flex-col justify-between">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
            <h3 className="font-bold text-lg mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
                <span>{t('calculator.system_size')}</span>
                <Sun className="text-yellow-400 animate-spin-slow" size={20}/>
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400 group-hover:bg-white/20 transition-colors">
                  <Sun size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-300 uppercase tracking-wide">kWp</div>
                  <div className="text-2xl font-bold">{systemSize} kWp</div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-green-400 group-hover:bg-white/20 transition-colors">
                  <Zap size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-300 uppercase tracking-wide">{t('calculator.monthly_savings')}</div>
                  <div className="text-2xl font-bold">{formatCurrency(monthlySavings)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary group-hover:bg-white/20 transition-colors">
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-300 uppercase tracking-wide">{t('calculator.investment')}</div>
                  <div className="text-2xl font-bold">{formatCurrency(installationCost)}</div>
                </div>
              </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-medium text-gray-300">{t('calculator.roi')}</span>
            <span className="text-4xl font-bold text-primary leading-none">{roiYears.toFixed(1)} <span className="text-base text-white/80 font-normal">{t('calculator.years')}</span></span>
          </div>
          
          {/* Detailed Results Table */}
          <div className="bg-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-2.5 text-white/90 font-medium">{t('calculator.system_capacity')}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-primary font-bold text-lg">{systemSize.toFixed(1)}</span>
                    <span className="text-white/70 text-xs ml-1">kWp</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2.5 text-white/90 font-medium">{t('calculator.storage')}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-primary font-bold text-lg">{batteryCapacity.toFixed(1)}</span>
                    <span className="text-white/70 text-xs ml-1">kWh</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2.5 text-white/90 font-medium">{t('calculator.estimated_bill')}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-primary font-bold text-lg">{formatCurrency(monthlyBill - totalSavings)}</span>
                    <span className="text-white/70 text-xs ml-1">{t('calculator.per_month')}</span>
                  </td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2.5 text-white/90 font-medium">{t('calculator.max_savings')}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-green-400 font-bold text-lg">{formatCurrency(totalSavings)}</span>
                    <span className="text-white/70 text-xs ml-1">{t('calculator.per_month')}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/90 font-medium">{t('calculator.recommended_area')}</td>
                  <td className="py-2.5 text-right">
                    <span className="text-primary font-bold text-lg">{roofArea.toFixed(2)}</span>
                    <span className="text-white/70 text-xs ml-1">m2</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <Link 
            to="/contact" 
            className="w-full bg-primary hover:bg-secondary text-white text-center font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2 transform active:scale-95"
          >
            {t('calculator.consult_btn')} <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SolarCalculator;
