import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  description?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  targets: {
    pageViews: number;
    productViews: number;
    contactRequests: number;
    quoteRequests: number;
    purchases: number;
    conversionRate: number;
  };
  isActive: boolean;
  createdAt: string;
}

const GoalsManagement: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    period: 'monthly' as const,
    startDate: '',
    endDate: '',
    targets: {
      pageViews: 0,
      productViews: 0,
      contactRequests: 0,
      quoteRequests: 0,
      purchases: 0,
      conversionRate: 0,
      totalProducts: 0,
      totalProjects: 0,
      totalNews: 0,
      totalReviews: 0
    },
    isActive: true
  });

  useEffect(() => {
    fetchGoals();
    fetchCurrentGoal();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://103.161.171.54:4000/api/goals');
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentGoal = async () => {
    try {
      const response = await fetch('http://103.161.171.54:4000/api/goals/current');
      const data = await response.json();
      setCurrentGoal(data);
    } catch (error) {
      console.error('Error fetching current goal:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingGoal
        ? `http://103.161.171.54:4000/api/goals/${editingGoal.id}`
        : 'http://103.161.171.54:4000/api/goals';
      
      const method = editingGoal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchGoals();
        fetchCurrentGoal();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục tiêu này?')) return;
    
    try {
      const response = await fetch(`http://103.161.171.54:4000/api/goals/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchGoals();
        fetchCurrentGoal();
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      period: goal.period,
      startDate: goal.startDate.split('T')[0],
      endDate: goal.endDate.split('T')[0],
      targets: goal.targets,
      isActive: goal.isActive
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      description: '',
      period: 'monthly',
      startDate: '',
      endDate: '',
      targets: {
        pageViews: 0,
        productViews: 0,
        contactRequests: 0,
        quoteRequests: 0,
        purchases: 0,
        conversionRate: 0,
        totalProducts: 0,
        totalProjects: 0,
        totalNews: 0,
        totalReviews: 0
      },
      isActive: true
    });
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Hàng ngày',
      weekly: 'Hàng tuần',
      monthly: 'Hàng tháng',
      quarterly: 'Hàng quý',
      yearly: 'Hàng năm'
    };
    return labels[period] || period;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-blue-600" size={28} />
            Quản lý Mục tiêu
          </h1>
          <p className="text-gray-600 mt-1">Thiết lập và theo dõi mục tiêu analytics</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm mục tiêu
        </button>
      </div>

      {/* Current Goal Card */}
      {currentGoal && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentGoal.name}</h2>
                <p className="text-blue-100">{getPeriodLabel(currentGoal.period)}</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <Calendar size={16} className="inline mr-2" />
              {formatDate(currentGoal.startDate)} - {formatDate(currentGoal.endDate)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Lượt xem</p>
              <p className="text-2xl font-bold">{currentGoal.targets.pageViews.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Xem SP</p>
              <p className="text-2xl font-bold">{currentGoal.targets.productViews.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Tư vấn</p>
              <p className="text-2xl font-bold">{currentGoal.targets.contactRequests.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Báo giá</p>
              <p className="text-2xl font-bold">{currentGoal.targets.quoteRequests.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Mua hàng</p>
              <p className="text-2xl font-bold">{currentGoal.targets.purchases.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Sản phẩm</p>
              <p className="text-2xl font-bold">{currentGoal.targets.totalProducts?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Dự án</p>
              <p className="text-2xl font-bold">{currentGoal.targets.totalProjects?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Tin tức</p>
              <p className="text-2xl font-bold">{currentGoal.targets.totalNews?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Đánh giá</p>
              <p className="text-2xl font-bold">{currentGoal.targets.totalReviews?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-xs text-blue-100 mb-1">Tỷ lệ CV</p>
              <p className="text-2xl font-bold">{currentGoal.targets.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tất cả mục tiêu</h3>
          
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Chưa có mục tiêu nào</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Tạo mục tiêu đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div
                  key={`goal-${idx}-${goal.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-800">{goal.name}</h4>
                        {goal.isActive ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertCircle size={12} />
                            Không hoạt động
                          </span>
                        )}
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {getPeriodLabel(goal.period)}
                        </span>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Lượt xem</p>
                          <p className="font-bold text-gray-800">{goal.targets.pageViews.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Xem SP</p>
                          <p className="font-bold text-gray-800">{goal.targets.productViews.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Tư vấn</p>
                          <p className="font-bold text-gray-800">{goal.targets.contactRequests.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Báo giá</p>
                          <p className="font-bold text-gray-800">{goal.targets.quoteRequests.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Mua hàng</p>
                          <p className="font-bold text-gray-800">{goal.targets.purchases.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Tỷ lệ CV</p>
                          <p className="font-bold text-gray-800">{goal.targets.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu mới'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên mục tiêu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Mục tiêu Q4 2025"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Mô tả chi tiết về mục tiêu"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chu kỳ *
                    </label>
                    <select
                      required
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                      <option value="monthly">Hàng tháng</option>
                      <option value="quarterly">Hàng quý</option>
                      <option value="yearly">Hàng năm</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Targets */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3">Mục tiêu cụ thể</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lượt xem trang
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.pageViews}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, pageViews: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xem sản phẩm
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.productViews}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, productViews: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yêu cầu tư vấn
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.contactRequests}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, contactRequests: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhận báo giá
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.quoteRequests}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, quoteRequests: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mua hàng
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.purchases}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, purchases: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỷ lệ chuyển đổi (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.targets.conversionRate}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, conversionRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số sản phẩm
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.totalProducts}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, totalProducts: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số dự án
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.totalProjects}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, totalProjects: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số tin tức
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.totalNews}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, totalNews: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số đánh giá
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.targets.totalReviews}
                        onChange={(e) => setFormData({
                          ...formData,
                          targets: { ...formData.targets, totalReviews: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Kích hoạt mục tiêu này
                  </label>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingGoal ? 'Cập nhật' : 'Tạo mục tiêu'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManagement;
