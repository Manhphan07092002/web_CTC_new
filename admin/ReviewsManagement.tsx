import React, { useState, useEffect } from 'react';
import { Star, Eye, Trash2, Search, Filter, Calendar, User, MessageSquare, Package, RefreshCw, TrendingUp, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  userName: string;
  userRole?: string;
  userPhone?: string;
  rating: number;
  comment: string;
  date: string;
  productId: string;
  productTitle: string;
  reviewIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ReviewsManagement: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.reviews.getAll();
      console.log('Loaded reviews:', data);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Lỗi khi tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      (review.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.productTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === null || review.rating === filterRating;
    
    return matchesSearch && matchesRating;
  });

  // Show delete confirmation modal
  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  // Delete review
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      setDeleting(true);
      
      if (!reviewToDelete.productId || reviewToDelete.reviewIndex === undefined) {
        showToast('Không thể xóa đánh giá: thiếu thông tin cần thiết', 'error');
        return;
      }

      await api.reviews.deleteFromProduct(reviewToDelete.productId, reviewToDelete.reviewIndex);
      
      // Reload reviews after successful deletion
      await loadReviews();
      showToast('Xóa đánh giá thành công!', 'success');
      
      // Close modal
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Lỗi khi xóa đánh giá', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Render star rating
  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <span className="ml-2 text-gray-600">Đang tải đánh giá...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="text-yellow-500" size={28} />
            Quản Lý Đánh Giá Khách Hàng
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi đánh giá của khách hàng về sản phẩm
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/engagement"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <TrendingUp size={16} />
            Xem Tương Tác
          </Link>
          <button
            onClick={loadReviews}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
            </div>
            <MessageSquare className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đánh giá 5 sao</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => r.rating === 5).length}
              </p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đánh giá trung bình</p>
              <p className="text-2xl font-bold text-blue-600">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <Star className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đánh giá thấp (≤3 sao)</p>
              <p className="text-2xl font-bold text-red-600">
                {reviews.filter(r => r.rating <= 3).length}
              </p>
            </div>
            <Star className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, bình luận hoặc sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Không có đánh giá nào</p>
            <p className="text-sm">
              {searchTerm || filterRating 
                ? 'Không tìm thấy đánh giá phù hợp với bộ lọc'
                : 'Chưa có đánh giá nào từ khách hàng'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bình luận
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review, index) => (
                  <tr key={review.id || `review-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                            {(review.userName || 'K').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {review.userName || 'Khách hàng'}
                          </div>
                          {review.userRole && (
                            <div className="text-sm text-gray-500">
                              {review.userRole}
                            </div>
                          )}
                          {review.userPhone && (
                            <div className="text-xs text-gray-400">
                              {review.userPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {review.productTitle || 'Sản phẩm không xác định'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment || 'Không có bình luận'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.date || review.createdAt || new Date().toISOString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(review)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="text-yellow-500" size={24} />
                Chi tiết đánh giá
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} />
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tên khách hàng</label>
                    <p className="text-gray-800 font-medium">{selectedReview.userName || 'Khách hàng'}</p>
                  </div>
                  {selectedReview.userRole && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vai trò</label>
                      <p className="text-gray-800">{selectedReview.userRole}</p>
                    </div>
                  )}
                  {selectedReview.userPhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                      <p className="text-gray-800">{selectedReview.userPhone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày đánh giá</label>
                    <p className="text-gray-800">{formatDate(selectedReview.date || selectedReview.createdAt || new Date().toISOString())}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Sản phẩm được đánh giá
                </h4>
                <p className="text-gray-800 font-medium">{selectedReview.productTitle || 'Sản phẩm không xác định'}</p>
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={18} />
                  Đánh giá
                </h4>
                {renderStars(selectedReview.rating || 0, 24)}
              </div>

              {/* Comment */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Bình luận
                </h4>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedReview.comment || 'Không có bình luận'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={20} />
                Xác nhận xóa đánh giá
              </h3>
              {!deleting && (
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Bạn có chắc chắn muốn xóa đánh giá này?
                </h4>
                <p className="text-gray-600 text-sm">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              {/* Review Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    {(reviewToDelete.userName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{reviewToDelete.userName || 'Khách hàng'}</p>
                    <p className="text-xs text-gray-500">{reviewToDelete.productTitle || 'Sản phẩm không xác định'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(reviewToDelete.rating || 0, 14)}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {reviewToDelete.comment || 'Không có bình luận'}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)} 
                  disabled={deleting}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Xóa đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;
