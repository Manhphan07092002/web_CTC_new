import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Eye, Trash2, Check, AlertCircle, ShoppingCart, User, Phone, Mail, MapPin, FileText, ChevronRight, X, Send } from 'lucide-react';
import Loading from '../components/Loading';

interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
  items?: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'shipping', label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' }
];

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.orders.getAll(selectedStatus || undefined, searchQuery || undefined);
      if (response.success) {
        setOrders(response.data);
      } else {
        showToast('Lấy danh sách đơn hàng thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Lỗi kết nối đến máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleViewDetails = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.orders.getById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
      } else {
        showToast('Không thể lấy chi tiết đơn hàng.', 'error');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToast('Lỗi khi tải chi tiết đơn hàng.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.orders.updateStatus(orderId, newStatus);
      if (response.success) {
        showToast('Cập nhật trạng thái thành công!', 'success');
        
        // Refresh orders list
        setOrders(prev => prev.map(ord => ord._id === orderId ? { ...ord, status: newStatus as any } : ord));
        
        // Update selected order details view if open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        showToast(response.error || 'Cập nhật trạng thái thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) return;

    try {
      const response = await api.orders.delete(orderId);
      if (response.success) {
        showToast('Xóa đơn hàng thành công!', 'success');
        setOrders(prev => prev.filter(ord => ord._id !== orderId));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        showToast('Xóa đơn hàng thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Không thể kết nối đến máy chủ.', 'error');
    }
  };

  const handleResendEmail = async (orderId: string) => {
    setResendingEmail(true);
    try {
      const response = await api.orders.resendEmail(orderId);
      if (response.success) {
        showToast('Email xác nhận đã được gửi lại thành công!', 'success');
      } else {
        showToast(response.error || 'Không thể gửi email. Kiểm tra cấu hình SMTP.', 'error');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      showToast('Không thể gửi email lúc này.', 'error');
    } finally {
      setResendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="text-primary" /> Quản Lý Đơn Hàng / Báo Giá
        </h1>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-150/50 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên, SĐT, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-250 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left / Middle: Orders List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150/50 overflow-hidden transition-colors">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loading fullScreen={false} className="h-16" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <AlertCircle className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="font-bold">Không tìm thấy đơn hàng nào</p>
              <p className="text-sm text-gray-400">Hãy thử lại với tiêu chí tìm kiếm khác.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-750 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">SĐT</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr 
                      key={order._id} 
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors ${selectedOrder?._id === order._id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                        {order.orderCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 dark:text-gray-200">{order.customerName}</div>
                        <div className="text-xs text-gray-400">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-350">{order.phone}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(order._id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors inline-flex"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Details Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150/50 p-6 transition-colors">
          {detailLoading ? (
            <div className="py-20 flex justify-center">
              <Loading fullScreen={false} className="h-12" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Chi tiết đơn hàng</h3>
                  <span className="font-mono text-sm text-primary font-bold">{selectedOrder.orderCode}</span>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Change Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Trạng thái đơn hàng</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="w-full border border-gray-250 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Customer Info Card */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border border-gray-100 dark:border-gray-650">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                  <User size={13} className="text-primary" /> Thông tin khách hàng
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Họ tên:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Số điện thoại:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-bold text-gray-800 dark:text-white truncate max-w-[160px]" title={selectedOrder.email}>
                      {selectedOrder.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Địa chỉ:</span>
                    <span className="font-bold text-gray-800 dark:text-white text-right max-w-[160px]" title={selectedOrder.address}>
                      {selectedOrder.address}
                    </span>
                  </div>
                  {selectedOrder.note && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                      <span className="text-gray-450 block font-medium mb-1">Ghi chú:</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        {selectedOrder.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ShoppingCart size={13} className="text-primary" /> Danh sách sản phẩm
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-750 rounded-xl divide-y divide-gray-550/20">
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item._id} className="p-3 text-sm flex justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-850 dark:text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.quantity} x {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap self-center font-bold text-gray-850 dark:text-white">
                        {item.price > 0 ? `${item.subtotal.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sum totals */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-sm text-gray-500">Tổng tiền:</span>
                <span className="text-xl font-extrabold text-primary">
                  {selectedOrder.totalAmount > 0 ? `${selectedOrder.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                </span>
              </div>

              {/* Resend email button */}
              <button
                onClick={() => handleResendEmail(selectedOrder._id)}
                disabled={resendingEmail}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold py-2.5 px-4 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                <Send size={14} className={resendingEmail ? 'animate-pulse' : ''} />
                {resendingEmail ? 'Đang gửi...' : 'Gửi lại email xác nhận'}
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <Eye size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">Chọn một đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrdersManagement;
