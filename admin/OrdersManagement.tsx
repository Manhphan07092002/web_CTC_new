import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, Eye, Trash2, Check, AlertCircle, ShoppingCart, User, Phone, Mail, MapPin, 
  FileText, ChevronRight, X, Send, Truck, Clock, CheckCircle2, XCircle, Plus, 
  Printer, DollarSign, PackageCheck, ListFilter, ShieldCheck, ExternalLink
} from 'lucide-react';
import Loading from '../components/Loading';

interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface StatusHistory {
  status: string;
  updatedAt: string;
  note?: string;
  updatedBy?: string;
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
  shippingProvider?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  cancelledReason?: string;
  statusHistory?: StatusHistory[];
  createdAt: string;
  items?: OrderItem[];
}

interface OrderStats {
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  shippingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalOrders: number;
  totalRevenue: number;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'shipping', label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400' }
];

const SHIPPING_PROVIDERS = [
  'Xe công ty CTC',
  'Viettel Post',
  'Giao Hàng Nhanh (GHN)',
  'Giao Hàng Tiết Kiệm (GHTK)',
  'Ahamove / GrabExpress',
  'Đơn vị vận chuyển riêng của khách'
];

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Status Modal form state
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [modalNewStatus, setModalNewStatus] = useState<string>('confirmed');
  const [modalShippingProvider, setModalShippingProvider] = useState<string>('Xe công ty CTC');
  const [modalTrackingCode, setModalTrackingCode] = useState<string>('');
  const [modalEstimatedDate, setModalEstimatedDate] = useState<string>('');
  const [modalCancelledReason, setModalCancelledReason] = useState<string>('');
  const [modalNote, setModalNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Admin Create Order form state
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<{ productId: string; productName: string; price: number; quantity: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [creatingOrder, setCreatingOrder] = useState(false);

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

  const fetchStats = async () => {
    try {
      const response = await api.orders.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const prods = await api.products.getAll();
      if (Array.isArray(prods)) {
        setAvailableProducts(prods);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // Quick 1-click confirm order
  const handleQuickConfirm = async (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.orders.updateStatus(order._id, 'confirmed', {
        note: 'Duyệt đơn nhanh từ Admin Dashboard'
      });
      if (response.success) {
        showToast(`Đã duyệt đơn hàng ${order.orderCode} thành công!`, 'success');
        fetchOrders();
        fetchStats();
        if (selectedOrder && selectedOrder._id === order._id) {
          setSelectedOrder(response.data);
        }
      } else {
        showToast(response.error || 'Duyệt đơn thất bại.', 'error');
      }
    } catch (error) {
      console.error('Quick confirm error:', error);
      showToast('Lỗi khi duyệt đơn hàng.', 'error');
    }
  };

  // Open status modal
  const handleOpenStatusModal = (order: Order) => {
    setModalOrder(order);
    setModalNewStatus(order.status);
    setModalShippingProvider(order.shippingProvider || 'Xe công ty CTC');
    setModalTrackingCode(order.trackingCode || '');
    setModalEstimatedDate(order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().split('T')[0] : '');
    setModalCancelledReason(order.cancelledReason || '');
    setModalNote('');
    setShowStatusModal(true);
  };

  // Save status & shipping info
  const handleSaveStatusModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalOrder) return;

    setUpdatingStatus(true);
    try {
      const extraData: any = {
        note: modalNote,
        shippingProvider: modalNewStatus === 'shipping' ? modalShippingProvider : modalOrder.shippingProvider,
        trackingCode: modalNewStatus === 'shipping' ? modalTrackingCode : modalOrder.trackingCode,
        estimatedDeliveryDate: modalNewStatus === 'shipping' ? modalEstimatedDate : modalOrder.estimatedDeliveryDate,
        cancelledReason: modalNewStatus === 'cancelled' ? modalCancelledReason : undefined
      };

      const response = await api.orders.updateStatus(modalOrder._id, modalNewStatus, extraData);
      if (response.success) {
        showToast('Cập nhật trạng thái & vận chuyển thành công!', 'success');
        setShowStatusModal(false);
        fetchOrders();
        fetchStats();
        if (selectedOrder && selectedOrder._id === modalOrder._id) {
          setSelectedOrder(response.data);
        }
      } else {
        showToast(response.error || 'Cập nhật thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error updating status modal:', error);
      showToast('Lỗi khi cập nhật trạng thái.', 'error');
    } finally {
      setUpdatingStatus(false);
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
        fetchStats();
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

  // Add Item to Admin Create Form
  const handleAddItemToCreate = () => {
    if (!selectedProductId) {
      showToast('Vui lòng chọn sản phẩm.', 'warning');
      return;
    }
    const prod = availableProducts.find(p => p._id === selectedProductId || p.id === selectedProductId);
    if (!prod) return;

    let price = 0;
    if (prod.price) {
      const parsedPrice = parseInt(prod.price.toString().replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedPrice)) price = parsedPrice;
    }

    const existingIdx = newOrderItems.findIndex(i => i.productId === selectedProductId);
    if (existingIdx >= 0) {
      const updated = [...newOrderItems];
      updated[existingIdx].quantity += selectedProductQty;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([...newOrderItems, {
        productId: prod._id || prod.id,
        productName: prod.name,
        price,
        quantity: selectedProductQty
      }]);
    }
    setSelectedProductId('');
    setSelectedProductQty(1);
  };

  const handleRemoveItemFromCreate = (index: number) => {
    setNewOrderItems(newOrderItems.filter((_, idx) => idx !== index));
  };

  const handleAdminCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newPhone || !newEmail || !newAddress) {
      showToast('Vui lòng điền đầy đủ thông tin khách hàng.', 'warning');
      return;
    }
    if (newOrderItems.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng.', 'warning');
      return;
    }

    setCreatingOrder(true);
    try {
      const response = await api.orders.adminCreate({
        customerName: newCustomerName,
        phone: newPhone,
        email: newEmail,
        address: newAddress,
        note: newNote,
        items: newOrderItems
      });

      if (response.success) {
        showToast('Tạo đơn hàng mới thành công!', 'success');
        setShowCreateModal(false);
        // Reset form
        setNewCustomerName('');
        setNewPhone('');
        setNewEmail('');
        setNewAddress('');
        setNewNote('');
        setNewOrderItems([]);
        fetchOrders();
        fetchStats();
      } else {
        showToast(response.error || 'Tạo đơn hàng thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Không thể tạo đơn hàng.', 'error');
    } finally {
      setCreatingOrder(false);
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
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-primary" /> Quản Lý Đơn Hàng & Vận Chuyển
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tiếp nhận, duyệt đơn, gán mã vận đơn và theo dõi tiến trình giao hàng cho khách.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-primary/20 transition-all cursor-pointer"
        >
          <Plus size={18} /> Tạo đơn hàng mới
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150/50 shadow-sm">
            <div className="flex justify-between items-center text-amber-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Chờ duyệt</span>
              <Clock size={18} />
            </div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pendingCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150/50 shadow-sm">
            <div className="flex justify-between items-center text-blue-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Đã duyệt</span>
              <PackageCheck size={18} />
            </div>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.confirmedCount + stats.processingCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150/50 shadow-sm">
            <div className="flex justify-between items-center text-purple-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Đang giao</span>
              <Truck size={18} />
            </div>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{stats.shippingCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150/50 shadow-sm">
            <div className="flex justify-between items-center text-green-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Hoàn thành</span>
              <CheckCircle2 size={18} />
            </div>
            <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">{stats.completedCount}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150/50 shadow-sm col-span-2 md:col-span-1">
            <div className="flex justify-between items-center text-emerald-600 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Doanh thu</span>
              <DollarSign size={18} />
            </div>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate" title={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}>
              {stats.totalRevenue > 0 ? `${(stats.totalRevenue / 1000000).toFixed(1)}M đ` : '0đ'}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-150/50 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === '' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Tất cả ({stats?.totalOrders || 0})
          </button>
          {STATUS_OPTIONS.map(opt => {
            const countKey = `${opt.value}Count` as keyof OrderStats;
            const count = stats ? (stats[countKey] as number || 0) : 0;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === opt.value
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{opt.label}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn (CTC-ORD-...), tên khách, SĐT, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm dark:bg-gray-900 dark:text-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Tìm kiếm
          </button>
        </form>
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
                    <th className="px-5 py-4">Mã đơn</th>
                    <th className="px-5 py-4">Khách hàng</th>
                    <th className="px-5 py-4">Tổng tiền</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4">Vận chuyển</th>
                    <th className="px-5 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr 
                      key={order._id} 
                      onClick={() => handleViewDetails(order._id)}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors cursor-pointer ${selectedOrder?._id === order._id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="text-primary font-bold">{order.orderCode}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-800 dark:text-gray-200">{order.customerName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{order.phone}</div>
                      </td>

                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {order.totalAmount > 0 ? `${order.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {order.status === 'shipping' && order.trackingCode ? (
                          <div>
                            <span className="font-semibold text-purple-700 dark:text-purple-300 block">{order.shippingProvider || 'Xe công ty'}</span>
                            <span className="font-mono text-gray-500 dark:text-gray-400">{order.trackingCode}</span>
                          </div>
                        ) : order.shippingProvider ? (
                          <span className="text-gray-600 dark:text-gray-400">{order.shippingProvider}</span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Approve button for pending orders */}
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => handleQuickConfirm(order, e)}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                            title="Duyệt đơn nhanh 1-click"
                          >
                            <Check size={14} /> Duyệt
                          </button>
                        )}

                        {/* Open status & shipping modal */}
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors inline-flex"
                          title="Cập nhật trạng thái & giao hàng"
                        >
                          <Truck size={16} />
                        </button>

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-150/50 p-6 transition-colors sticky top-24">
          {detailLoading ? (
            <div className="py-20 flex justify-center">
              <Loading fullScreen={false} className="h-12" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Chi tiết đơn hàng</h3>
                  <span className="font-mono text-sm text-primary font-bold">{selectedOrder.orderCode}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="In hóa đơn"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Status Action Card */}
              <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Trạng thái hiện tại:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <button
                  onClick={() => handleOpenStatusModal(selectedOrder)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck size={14} /> Cập nhật trạng thái / Giao hàng
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border border-gray-100 dark:border-gray-650 text-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2">
                  <User size={13} className="text-primary" /> Thông tin khách hàng
                </h4>
                <div className="space-y-2">
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
                      <span className="text-gray-400 block font-medium mb-1 text-xs">Ghi chú:</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                        {selectedOrder.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Info Card if shipping/completed */}
              {(selectedOrder.shippingProvider || selectedOrder.trackingCode) && (
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-150 dark:border-purple-800 text-sm space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Truck size={13} /> Thông tin vận chuyển
                  </h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Đơn vị:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.shippingProvider || 'N/A'}</span>
                  </div>
                  {selectedOrder.trackingCode && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mã vận đơn:</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {selectedOrder.trackingCode}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Items Card */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <ShoppingCart size={13} className="text-primary" /> Danh sách sản phẩm
                </h4>
                <div className="max-h-52 overflow-y-auto space-y-2 border border-gray-100 dark:border-gray-750 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item._id} className="p-2.5 text-sm flex justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 dark:text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.quantity} x {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap self-center font-bold text-gray-800 dark:text-white text-xs">
                        {item.price > 0 ? `${item.subtotal.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sum totals */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-sm text-gray-500">Tổng tiền:</span>
                <span className="text-xl font-extrabold text-primary">
                  {selectedOrder.totalAmount > 0 ? `${selectedOrder.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                </span>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Lịch sử thay đổi</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto text-xs">
                    {selectedOrder.statusHistory.map((hist, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{hist.status}</span>
                          <span className="text-[10px] text-gray-400 ml-2">{new Date(hist.updatedAt).toLocaleString('vi-VN')}</span>
                          {hist.note && <p className="italic text-gray-500">{hist.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resend email button */}
              <button
                onClick={() => handleResendEmail(selectedOrder._id)}
                disabled={resendingEmail}
                className="mt-2 w-full flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold py-2 px-4 rounded-xl transition-all text-xs disabled:opacity-50 cursor-pointer"
              >
                <Send size={13} className={resendingEmail ? 'animate-pulse' : ''} />
                {resendingEmail ? 'Đang gửi...' : 'Gửi lại email thông báo cho khách'}
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

      {/* ========================================================= */}
      {/* MODAL: UPDATE STATUS & SHIPPING INFORMATION               */}
      {/* ========================================================= */}
      {showStatusModal && modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-150 dark:border-gray-700">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Truck className="text-primary" size={20} /> Cập Nhật Đơn {modalOrder.orderCode}
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStatusModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Trạng thái đơn hàng
                </label>
                <select
                  value={modalNewStatus}
                  onChange={(e) => setModalNewStatus(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-700 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm dark:bg-gray-900 dark:text-white cursor-pointer font-bold"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic inputs for SHIPPING status */}
              {modalNewStatus === 'shipping' && (
                <div className="space-y-3 p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 animate-fade-in">
                  <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <Truck size={14} /> Thông tin vận chuyển
                  </h4>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Đơn vị vận chuyển</label>
                    <select
                      value={modalShippingProvider}
                      onChange={(e) => setModalShippingProvider(e.target.value)}
                      className="w-full border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-xs dark:bg-gray-900 dark:text-white"
                    >
                      {SHIPPING_PROVIDERS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mã vận đơn (Tracking Code)</label>
                    <input
                      type="text"
                      placeholder="VD: VTP123456789, GHN987654..."
                      value={modalTrackingCode}
                      onChange={(e) => setModalTrackingCode(e.target.value)}
                      className="w-full border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-xs font-mono dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ngày dự kiến giao</label>
                    <input
                      type="date"
                      value={modalEstimatedDate}
                      onChange={(e) => setModalEstimatedDate(e.target.value)}
                      className="w-full border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-xs dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic inputs for CANCELLED status */}
              {modalNewStatus === 'cancelled' && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in">
                  <label className="block text-xs font-bold text-red-700 dark:text-red-300 mb-1">Lý do hủy đơn</label>
                  <textarea
                    rows={2}
                    placeholder="Nhập lý do hủy (hết hàng, khách đổi ý, sai SĐT...)"
                    value={modalCancelledReason}
                    onChange={(e) => setModalCancelledReason(e.target.value)}
                    className="w-full border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs dark:bg-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Ghi chú xử lý (Nội bộ / Email)</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-700 rounded-xl py-2 px-3 text-xs dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updatingStatus ? 'Đang lưu...' : 'Cập nhật & Gửi email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADMIN CREATE ORDER                                 */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-gray-150 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="text-primary" size={20} /> Tạo Đơn Hàng Mới (Admin)
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdminCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-700 rounded-xl p-2.5 text-xs dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    placeholder="0905xxxxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-700 rounded-xl p-2.5 text-xs dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="khachhang@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-700 rounded-xl p-2.5 text-xs dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Địa chỉ giao hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, Đường, Quận/Huyện, TP..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full border border-gray-250 dark:border-gray-700 rounded-xl p-2.5 text-xs dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Ghi chú đơn hàng</label>
                <input
                  type="text"
                  placeholder="Khách đặt qua điện thoại / tư vấn trực tiếp..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full border border-gray-250 dark:border-gray-700 rounded-xl p-2 text-xs dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Product Picker */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Danh sách sản phẩm chọn</h4>
                
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 border border-gray-250 dark:border-gray-700 rounded-xl p-2 text-xs dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {availableProducts.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name} ({p.price || 'Liên hệ'})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={selectedProductQty}
                    onChange={(e) => setSelectedProductQty(parseInt(e.target.value, 10) || 1)}
                    className="w-20 border border-gray-250 dark:border-gray-700 rounded-xl p-2 text-xs text-center dark:bg-gray-900 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={handleAddItemToCreate}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                {/* Item Table */}
                {newOrderItems.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-750 font-bold text-gray-500">
                        <tr>
                          <th className="p-2">Sản phẩm</th>
                          <th className="p-2 text-center">SL</th>
                          <th className="p-2 text-right">Đơn giá</th>
                          <th className="p-2 text-right">Thành tiền</th>
                          <th className="p-2 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {newOrderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{item.productName}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</td>
                            <td className="p-2 text-right font-bold">{item.price > 0 ? `${(item.price * item.quantity).toLocaleString('vi-VN')}đ` : 'Liên hệ'}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromCreate(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {creatingOrder ? 'Đang tạo...' : 'Tạo đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INVOICE PRINT VIEW                                 */}
      {/* ========================================================= */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl text-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-primary">CÔNG TY CP XÂY LẮP BƯU ĐIỆN MIỀN TRUNG (CTC)</h2>
                <p className="text-xs text-gray-500">Địa chỉ: 50B Nguyễn Du, Phường Thạch Thang, Q. Hải Châu, TP Đà Nẵng</p>
                <p className="text-xs text-gray-500">Hotline: 0915 059 666 | Email: info@ctcdn.vn</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-gray-900 uppercase">Hóa Đơn / Phiếu Giao Hàng</h3>
                <p className="font-mono font-bold text-primary text-sm">{selectedOrder.orderCode}</p>
                <p className="text-xs text-gray-400">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Customer & Shipping info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <h4 className="font-bold text-gray-700 uppercase mb-1">Khách Hàng (Người Nhận):</h4>
                <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                <p>SĐT: {selectedOrder.phone}</p>
                <p>Email: {selectedOrder.email}</p>
                <p>Địa chỉ: {selectedOrder.address}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 uppercase mb-1">Vận Chuyển:</h4>
                <p>Đơn vị VC: <strong>{selectedOrder.shippingProvider || 'Xe công ty CTC'}</strong></p>
                {selectedOrder.trackingCode && <p>Mã vận đơn: <strong className="font-mono">{selectedOrder.trackingCode}</strong></p>}
                {selectedOrder.note && <p className="italic text-gray-500 mt-1">Ghi chú: {selectedOrder.note}</p>}
              </div>
            </div>

            {/* Product Table */}
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 font-bold text-gray-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Tên Sản Phẩm</th>
                  <th className="p-3 text-center">SL</th>
                  <th className="p-3 text-right">Đơn Giá</th>
                  <th className="p-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-gray-400">{idx + 1}</td>
                    <td className="p-3 font-bold">{item.productName}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</td>
                    <td className="p-3 text-right font-bold">{item.price > 0 ? `${item.subtotal.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-400">
                * Phiếu giao hàng kiêm xác nhận bảo hành sản phẩm chính hãng CTC.
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-500">TỔNG THÀNH TIỀN: </span>
                <span className="text-xl font-black text-primary">
                  {selectedOrder.totalAmount > 0 ? `${selectedOrder.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                </span>
              </div>
            </div>

            {/* Signature block */}
            <div className="grid grid-cols-2 text-center text-xs pt-8">
              <div>
                <p className="font-bold">Người Lập Phiếu</p>
                <p className="text-gray-400 italic mt-12">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold">Khách Hàng Nhận Hàng</p>
                <p className="text-gray-400 italic mt-12">(Ký & ghi rõ họ tên)</p>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 print:hidden">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Printer size={14} /> In phiếu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
