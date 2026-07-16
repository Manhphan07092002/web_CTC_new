import React, { useEffect, useState } from 'react';
import { Eye, Heart, Share2, TrendingUp, BarChart3, Package, RefreshCw, Download } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';

interface EngagementStats {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  topViewed: Product[];
  topLiked: Product[];
  topShared: Product[];
}

const EngagementManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EngagementStats>({
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    topViewed: [],
    topLiked: [],
    topShared: []
  });
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'shares'>('views');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await api.products.getAll();
      setProducts(productsData);
      calculateStats(productsData);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData: Product[]) => {
    const totalViews = productsData.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = productsData.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalShares = productsData.reduce((sum, p) => sum + (p.shares || 0), 0);

    const topViewed = [...productsData].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topLiked = [...productsData].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
    const topShared = [...productsData].sort((a, b) => (b.shares || 0) - (a.shares || 0)).slice(0, 5);

    setStats({
      totalViews,
      totalLikes,
      totalShares,
      topViewed,
      topLiked,
      topShared
    });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
    return (b.shares || 0) - (a.shares || 0);
  });

  const exportToCSV = () => {
    const headers = ['Tên sản phẩm', 'Lượt xem', 'Lượt thích', 'Lượt chia sẻ'];
    const rows = products.map(p => [
      p.name,
      p.views || 0,
      p.likes || 0,
      p.shares || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `engagement-stats-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="text-primary" size={32} />
            Quản Lý Tương Tác
          </h1>
          <p className="text-gray-500 mt-1">Theo dõi lượt xem, thích và chia sẻ sản phẩm</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download size={18} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Eye size={32} className="opacity-80" />
            <span className="text-sm font-medium opacity-90">Tổng lượt xem</span>
          </div>
          <div className="text-4xl font-bold">{stats.totalViews.toLocaleString()}</div>
          <div className="text-sm opacity-80 mt-2">
            Trung bình: {Math.round(stats.totalViews / products.length || 0)} / sản phẩm
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Heart size={32} className="opacity-80" />
            <span className="text-sm font-medium opacity-90">Tổng lượt thích</span>
          </div>
          <div className="text-4xl font-bold">{stats.totalLikes.toLocaleString()}</div>
          <div className="text-sm opacity-80 mt-2">
            Trung bình: {Math.round(stats.totalLikes / products.length || 0)} / sản phẩm
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Share2 size={32} className="opacity-80" />
            <span className="text-sm font-medium opacity-90">Tổng lượt chia sẻ</span>
          </div>
          <div className="text-4xl font-bold">{stats.totalShares.toLocaleString()}</div>
          <div className="text-sm opacity-80 mt-2">
            Trung bình: {Math.round(stats.totalShares / products.length || 0)} / sản phẩm
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Viewed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-blue-500" />
            Top 5 Xem Nhiều
          </h3>
          <div className="space-y-3">
            {stats.topViewed.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.views || 0} lượt xem</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Liked */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            Top 5 Được Thích
          </h3>
          <div className="space-y-3">
            {stats.topLiked.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.likes || 0} lượt thích</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Shared */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Share2 size={20} className="text-green-500" />
            Top 5 Chia Sẻ
          </h3>
          <div className="space-y-3">
            {stats.topShared.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.shares || 0} lượt chia sẻ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Tất Cả Sản Phẩm
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('views')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'views' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye size={14} className="inline mr-1" />
              Xem
            </button>
            <button
              onClick={() => setSortBy('likes')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'likes' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart size={14} className="inline mr-1" />
              Thích
            </button>
            <button
              onClick={() => setSortBy('shares')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'shares' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Share2 size={14} className="inline mr-1" />
              Chia sẻ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <Eye size={14} className="inline mr-1" />
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <Heart size={14} className="inline mr-1" />
                  Lượt thích
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <Share2 size={14} className="inline mr-1" />
                  Lượt chia sẻ
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tổng tương tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProducts.map((product) => {
                const totalEngagement = (product.views || 0) + (product.likes || 0) + (product.shares || 0);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#F3F4F6"/><g transform="translate(20, 20)"><path d="M50 40L35 20L25 30L10 10L0 40H50Z" fill="#D1D5DB"/><circle cx="40" cy="15" r="8" fill="#D1D5DB"/></g><text x="50" y="75" text-anchor="middle" font-family="system-ui" font-size="8" fill="#9CA3AF">No Image</text></svg>');
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {product.views || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        {product.likes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        {product.shares || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-gray-800">{totalEngagement}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EngagementManagement;
