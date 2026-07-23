import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, ResponsiveContainer, Tooltip, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

interface AdvancedChartsProps {
  analytics: any;
  currentGoal?: any;
  actualData?: any;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ analytics, currentGoal, actualData }) => {
  if (!analytics) return null;

  const { performanceMetrics, radarData, funnelData, heatMap, conversionRates } = analytics;
  
  // Convert funnelData from object to array format
  const funnelArray = React.useMemo(() => {
    if (!funnelData) return [];
    
    // If funnelData is already an array, return it
    if (Array.isArray(funnelData)) return funnelData;
    
    // If funnelData is object with new structure from MongoDB
    const { pageViews, productViews, contactRequests, quoteRequests, purchases } = funnelData;
    const total = pageViews || 100;
    
    return [
      {
        stage: 'Khách truy cập',
        value: pageViews || 0,
        percentage: 100
      },
      {
        stage: 'Xem sản phẩm',
        value: productViews || 0,
        percentage: total > 0 ? Math.round((productViews / total) * 100) : 0
      },
      {
        stage: 'Yêu cầu tư vấn',
        value: contactRequests || 0,
        percentage: total > 0 ? Math.round((contactRequests / total) * 100) : 0
      },
      {
        stage: 'Nhận báo giá',
        value: quoteRequests || 0,
        percentage: total > 0 ? Math.round((quoteRequests / total) * 100) : 0
      },
      {
        stage: 'Mua hàng',
        value: purchases || 0,
        percentage: total > 0 ? Math.round((purchases / total) * 100) : 0
      }
    ];
  }, [funnelData]);
  
  // Calculate conversion rates from funnelArray
  const calculatedRates = React.useMemo(() => {
    if (funnelArray.length < 5) return { visitorToLead: 0, leadToCustomer: 0, overallConversion: 0 };
    
    const visitors = funnelArray[0].value; // Khách truy cập
    const leads = funnelArray[2].value;    // Yêu cầu tư vấn (Lead)
    const customers = funnelArray[4].value; // Mua hàng (Customer)
    
    return {
      visitorToLead: visitors > 0 ? Math.round((leads / visitors) * 100) : 0,
      leadToCustomer: leads > 0 ? Math.round((customers / leads) * 100) : 0,
      overallConversion: visitors > 0 ? Math.round((customers / visitors) * 100) : 0
    };
  }, [funnelArray]);
  
  // Generate radar data from goal and actual data
  const radarChartData = React.useMemo(() => {
    if (!currentGoal || !actualData) {
      // Fallback to mock data if no goal/actual data
      return radarData || [
        { subject: 'Sản phẩm', A: 80, B: 100, fullMark: 100 },
        { subject: 'Danh mục', A: 75, B: 100, fullMark: 100 },
        { subject: 'Dự án', A: 90, B: 100, fullMark: 100 },
        { subject: 'Đánh giá', A: 85, B: 100, fullMark: 100 },
        { subject: 'Nội dung', A: 70, B: 100, fullMark: 100 }
      ];
    }
    
    const { targets } = currentGoal;
    const calculatePercentage = (actual: number, target: number) => {
      if (target === 0) return 0;
      return Math.min(Math.round((actual / target) * 100), 150); // Cap at 150%
    };
    
    return [
      { 
        subject: 'Sản phẩm', 
        'Hiện tại': calculatePercentage(actualData.productViews || 0, targets.productViews),
        'Mục tiêu': 100,
        fullMark: 150 
      },
      { 
        subject: 'Danh mục', 
        'Hiện tại': calculatePercentage(actualData.pageViews || 0, targets.pageViews),
        'Mục tiêu': 100,
        fullMark: 150 
      },
      { 
        subject: 'Dự án', 
        'Hiện tại': calculatePercentage(actualData.purchases || 0, targets.purchases),
        'Mục tiêu': 100,
        fullMark: 150 
      },
      { 
        subject: 'Đánh giá', 
        'Hiện tại': calculatePercentage(actualData.quoteRequests || 0, targets.quoteRequests),
        'Mục tiêu': 100,
        fullMark: 150 
      },
      { 
        subject: 'Nội dung', 
        'Hiện tại': calculatePercentage(actualData.contactRequests || 0, targets.contactRequests),
        'Mục tiêu': 100,
        fullMark: 150 
      }
    ];
  }, [currentGoal, actualData, radarData]);

  // Gauge Chart Component (Custom)
  const GaugeChart: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const percentage = (value / max) * 100;

    return (
      <div className="relative w-full aspect-square">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-slate-700"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="transition-all duration-1000"
          />
          {/* Center text */}
          <text x="100" y="85" textAnchor="middle" className="text-3xl font-bold fill-gray-800 dark:fill-white">
            {value}%
          </text>
          <text x="100" y="105" textAnchor="middle" className="text-xs fill-gray-500 dark:fill-slate-400">
            {label}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Performance Gauges */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={20} className="text-yellow-500" />
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Hiệu suất tổng quan</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <GaugeChart value={performanceMetrics.overall} max={100} label="Tổng thể" color="#8b5cf6" />
            <p className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400">{performanceMetrics.rating}</p>
          </div>
          <div className="text-center">
            <GaugeChart value={performanceMetrics.products} max={100} label="Sản phẩm" color="#3b82f6" />
          </div>
          <div className="text-center">
            <GaugeChart value={performanceMetrics.projects} max={100} label="Dự án" color="#10b981" />
          </div>
          <div className="text-center">
            <GaugeChart value={performanceMetrics.content} max={100} label="Nội dung" color="#f59e0b" />
          </div>
          <div className="text-center">
            <GaugeChart value={performanceMetrics.engagement} max={100} label="Tương tác" color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Conversion Funnel & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-blue-500" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Phễu chuyển đổi</h3>
          </div>
          
          <div className="space-y-2">
            {funnelArray.map((stage: any, idx: number) => {
              const width = stage.percentage;
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
              
              return (
                <div key={idx} className="relative">
                  <div 
                    className="h-16 rounded-lg flex items-center justify-between px-4 text-white font-bold transition-all duration-500"
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: colors[idx],
                      minWidth: '200px'
                    }}
                  >
                    <span className="text-sm">{stage.stage}</span>
                    <span className="text-lg">{stage.value}</span>
                  </div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full ml-2 text-xs text-gray-500 dark:text-slate-300">
                    {stage.percentage}%
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Conversion Rates */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-transparent dark:border-blue-900/40 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">Khách → Lead</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{calculatedRates.visitorToLead}%</p>
            </div>
            <div className="bg-green-50 dark:bg-emerald-950/40 border border-transparent dark:border-emerald-900/40 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">Lead → KH</p>
              <p className="text-xl font-bold text-green-600 dark:text-emerald-400">{calculatedRates.leadToCustomer}%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-transparent dark:border-purple-900/40 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-1">Tổng thể</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{calculatedRates.overallConversion}%</p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <Award size={20} className="text-purple-500" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">So sánh mục tiêu</h3>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                <Radar name="Hiện tại" dataKey="Hiện tại" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Radar name="Mục tiêu" dataKey="Mục tiêu" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  formatter={(value: any) => `${value}%`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Hiện tại</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Mục tiêu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Map */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-red-500" />
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Bản đồ nhiệt danh mục</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {heatMap.categories.map((cat: any, idx: number) => {
            const intensity = (cat.value / heatMap.maxValue) * 100;
            const bgColor = intensity > 75 ? 'bg-red-500' : 
                           intensity > 50 ? 'bg-orange-500' : 
                           intensity > 25 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div 
                key={idx}
                className={`${bgColor} p-4 rounded-xl text-white hover:scale-105 transition-transform cursor-pointer`}
                style={{ opacity: 0.7 + (intensity / 300) }}
              >
                <p className="font-bold text-lg mb-1">{cat.category}</p>
                <p className="text-sm opacity-90">{cat.label}</p>
                <div className="mt-2 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.intensity * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
