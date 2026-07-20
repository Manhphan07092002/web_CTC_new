
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line 
} from 'recharts';
import { 
  Users, DollarSign, ShoppingBag, Activity, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Clock, Package, Plus, FileText, Briefcase, Image,
  Eye, Heart, Share2, Star, MessageSquare, Shield, Crown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePermission } from '../contexts/PermissionContext';
import { api } from '../services/api';
import AIInsights from './AIInsights';
import AdvancedCharts from './AdvancedCharts';
import PermissionSummary from '../components/PermissionSummary';
import ExportService from '../services/export-service';

const getApiBase = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return '/api';
  }
  return `${protocol}//${hostname}:4000/api`;
};
const API_BASE = getApiBase();

const Overview: React.FC = () => {
  const { t } = useLanguage();
  const { role, roleLevel, permissions } = usePermission();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showComparison, setShowComparison] = useState(true);
  const [engagementStats, setEngagementStats] = useState<any>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (!loading) setLoading(true);
      const [stats, revenue, products, reviews, goalResponse, analyticsResponse] = await Promise.all([
        api.statistics.get(),
        api.statistics.getRevenue(),
        api.products.getAll(),
        api.reviews.getAll(),
        fetch(`${API_BASE}/goals/current`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/analytics/funnel`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      setStatistics(stats);
      setRevenueData(revenue);
      
      // Calculate engagement stats
      const totalViews = products.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
      const totalLikes = products.reduce((sum: number, p: any) => sum + (p.likes || 0), 0);
      const totalShares = products.reduce((sum: number, p: any) => sum + (p.shares || 0), 0);
      setEngagementStats({ totalViews, totalLikes, totalShares });
      
      // Calculate review stats
      const totalReviews = reviews.length;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length 
        : 0;
      setReviewStats({ totalReviews, avgRating });
      
      // Set goal and funnel data
      setCurrentGoal(goalResponse);
      setFunnelData(analyticsResponse);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExportPDF = () => {
    if (!statistics) return;
    ExportService.exportToPDF(statistics);
  };

  const handleExportExcel = () => {
    if (!statistics) return;
    ExportService.exportToExcel(statistics);
  };

  const handleExportJSON = () => {
    if (!statistics) return;

    const reportData = {
      date: new Date().toLocaleDateString('vi-VN'),
      summary: {
        totalProducts: statistics.totalProducts,
        totalCategories: statistics.totalCategories,
        totalProjects: statistics.totalProjects,
        totalNews: statistics.totalNews,
        totalTestimonials: statistics.totalTestimonials
      },
      thisMonth: statistics.quickStats,
      productsByCategory: statistics.productsByCategory,
      monthlyGrowth: statistics.monthlyGrowth,
      ai: statistics.ai,
      analytics: statistics.analytics
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const projectData = statistics?.productsByCategory || [];

  const stats = [
    { 
      title: 'Sản phẩm', 
      value: statistics?.totalProducts || 0, 
      change: showComparison && statistics?.comparison?.products 
        ? `${statistics.comparison.products.change > 0 ? '+' : ''}${statistics.comparison.products.change}%`
        : `${statistics?.totalCategories || 0} danh mục`, 
      isIncrease: !showComparison || (statistics?.comparison?.products?.change || 0) >= 0, 
      icon: Package, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      title: 'Dự án', 
      value: statistics?.totalProjects || 0, 
      change: showComparison && statistics?.comparison?.projects
        ? `${statistics.comparison.projects.change > 0 ? '+' : ''}${statistics.comparison.projects.change}%`
        : 'Đã hoàn thành', 
      isIncrease: !showComparison || (statistics?.comparison?.projects?.change || 0) >= 0, 
      icon: Activity, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      title: 'Tin tức', 
      value: statistics?.totalNews || 0, 
      change: showComparison && statistics?.comparison?.news
        ? `${statistics.comparison.news.change > 0 ? '+' : ''}${statistics.comparison.news.change}%`
        : 'Đã đăng', 
      isIncrease: !showComparison || (statistics?.comparison?.news?.change || 0) >= 0, 
      icon: ShoppingBag, 
      color: 'bg-orange-100 text-orange-600' 
    },
    { 
      title: 'Đánh giá', 
      value: statistics?.totalTestimonials || 0, 
      change: 'Từ khách hàng', 
      isIncrease: true, 
      icon: Users, 
      color: 'bg-purple-100 text-purple-600' 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Role Info Banner */}
      {role && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: role.color + '20', color: role.color }}
            >
              {role.icon === 'Crown' && <Crown size={20} />}
              {role.icon === 'Shield' && <Shield size={20} />}
              {!['Crown', 'Shield'].includes(role.icon) && <Users size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">Vai trò: {role.displayName}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Level {roleLevel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Bạn có {permissions.length} quyền được phép trong hệ thống
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">
            Chào mừng quay trở lại, đây là tình hình kinh doanh hôm nay.
            <span className="ml-2 text-xs text-gray-400">
              Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {autoRefresh ? 'Tự động' : 'Thủ công'}
          </button>

          {/* Comparison Toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all ${
              showComparison 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            So sánh
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="bg-corporate text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-primary transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất báo cáo
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 rounded-t-lg"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Xuất PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
              >
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất Excel
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 rounded-b-lg"
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Xuất JSON
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isIncrease ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.isIncrease ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Permission Summary */}
      <PermissionSummary />

      {/* AI Insights & Recommendations */}
      {statistics?.ai && (
        <AIInsights aiData={statistics.ai} />
      )}

      {/* Advanced Analytics & Charts */}
      {statistics?.analytics && (
        <AdvancedCharts 
          analytics={statistics.analytics} 
          currentGoal={currentGoal}
          actualData={funnelData}
        />
      )}

      {/* Reviews & Engagement Section */}
      {(reviewStats || engagementStats) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Star className="text-yellow-500" size={24} />
              Đánh Giá & Tương Tác Khách Hàng
            </h3>
            <Link 
              to="/admin/reviews"
              className="text-sm text-primary hover:text-secondary font-medium flex items-center gap-1"
            >
              Xem chi tiết
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Reviews Stats */}
            {reviewStats && (
              <>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <Star size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Tổng đánh giá</p>
                      <p className="text-2xl font-bold text-gray-800">{reviewStats.totalReviews}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= Math.round(reviewStats.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      {reviewStats.avgRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Phản hồi</p>
                      <p className="text-2xl font-bold text-gray-800">{reviewStats.totalReviews}</p>
                      <p className="text-xs text-gray-500 mt-1">Từ khách hàng</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Engagement Stats */}
            {engagementStats && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Eye size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Lượt xem</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {engagementStats.totalViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Sản phẩm</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Lượt thích</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {engagementStats.totalLikes.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Tương tác</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Share2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Lượt chia sẻ</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {engagementStats.totalShares.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Lan tỏa</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
            <Link
              to="/admin/reviews"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
            >
              <Star size={18} />
              Quản lý đánh giá
            </Link>
            <Link
              to="/admin/engagement"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              <TrendingUp size={18} />
              Xem tương tác
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/content?tab=products" className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <Plus size={24} />
            </div>
            <ArrowUpRight size={20} className="opacity-50" />
          </div>
          <h3 className="font-bold text-lg">Thêm sản phẩm</h3>
          <p className="text-sm opacity-80 mt-1">Tạo sản phẩm mới</p>
        </Link>

        <Link to="/admin/content?tab=projects" className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <Briefcase size={24} />
            </div>
            <ArrowUpRight size={20} className="opacity-50" />
          </div>
          <h3 className="font-bold text-lg">Thêm dự án</h3>
          <p className="text-sm opacity-80 mt-1">Tạo dự án mới</p>
        </Link>

        <Link to="/admin/content?tab=news" className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <FileText size={24} />
            </div>
            <ArrowUpRight size={20} className="opacity-50" />
          </div>
          <h3 className="font-bold text-lg">Thêm tin tức</h3>
          <p className="text-sm opacity-80 mt-1">Đăng bài viết mới</p>
        </Link>

        <Link to="/admin/files" className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-white group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
              <Image size={24} />
            </div>
            <ArrowUpRight size={20} className="opacity-50" />
          </div>
          <h3 className="font-bold text-lg">Quản lý file</h3>
          <p className="text-sm opacity-80 mt-1">Upload hình ảnh</p>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">Xu hướng tăng trưởng (6 tháng)</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Sản phẩm</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div> Dự án</span>
            </div>
          </div>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
              <LineChart data={statistics?.monthlyGrowth || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="products" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} />
                <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products by Category Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Sản phẩm theo danh mục</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
              <span className="block text-3xl font-bold text-gray-800">{statistics?.totalProducts || 0}</span>
              <span className="text-xs text-gray-500">Tổng sản phẩm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {statistics?.topPerformers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">Top Sản phẩm</h3>
              </div>
              <Link to="/admin/content?tab=products" className="text-blue-600 text-sm font-bold hover:underline">Xem tất cả</Link>
            </div>
            <div className="space-y-3">
              {statistics.topPerformers.products?.map((product: any, idx: number) => (
                <div key={`top-product-${idx}-${product._id || product.id}`} className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    #{idx + 1}
                  </div>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{product.price?.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Projects */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-sm border border-green-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Briefcase size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">Top Dự án</h3>
              </div>
              <Link to="/admin/content?tab=projects" className="text-green-600 text-sm font-bold hover:underline">Xem tất cả</Link>
            </div>
            <div className="space-y-3">
              {statistics.topPerformers.projects?.map((project: any, idx: number) => (
                <div key={`top-project-${idx}-${project._id || project.id}`} className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                    #{idx + 1}
                  </div>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 line-clamp-1">{project.title}</h4>
                    <p className="text-sm text-gray-500">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{project.capacity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Hiệu suất tháng này</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Sản phẩm</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{statistics?.quickStats?.productsThisMonth || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Được thêm tháng này</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={20} className="text-green-600" />
                <span className="text-sm font-medium text-gray-600">Dự án</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{statistics?.quickStats?.projectsThisMonth || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Được tạo tháng này</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Tin tức</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{statistics?.quickStats?.newsThisMonth || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Được đăng tháng này</p>
            </div>
          </div>
        </div>

        {/* Recent Activities Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {statistics?.recentActivities?.length > 0 ? (
              statistics.recentActivities.map((activity: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'product' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'project' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'product' && <Package size={16} />}
                    {activity.type === 'project' && <Briefcase size={16} />}
                    {activity.type === 'news' && <FileText size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium line-clamp-2">{activity.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.time).toLocaleDateString('vi-VN', { 
                        day: '2-digit', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">Dự án gần đây</h3>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Link to="/admin/content?tab=projects" className="text-primary text-sm font-bold hover:underline">Xem tất cả</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium rounded-lg">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Tên dự án</th>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3">Công suất</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statistics?.recentProjects?.length > 0 ? (
                statistics.recentProjects
                  .filter((project: any) => 
                    !searchTerm || 
                    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((project: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-corporate">{project.title}</td>
                      <td className="px-4 py-3 text-gray-600">{project.location}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{project.capacity}</td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs">
                        {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    {searchTerm ? 'Không tìm thấy dự án nào' : 'Chưa có dự án nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
