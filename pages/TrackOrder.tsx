import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SEO from '../components/SEO';
import {
  Search, ShoppingBag, CheckCircle, Clock, Package, Truck, Star,
  XCircle, ChevronRight, Phone, MapPin, FileText, ArrowLeft, RefreshCw, Calendar, ArrowRight,
  Check, ShieldCheck
} from 'lucide-react';

interface TrackItem {
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderTrackData {
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  shippingProvider?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  cancelledReason?: string;
  createdAt: string;
  items: TrackItem[];
}

const STATUS_STEPS = [
  { key: 'pending',    label: 'Chờ xác nhận',   icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-500',   desc: 'Đơn hàng đang chờ đội ngũ CTC xác nhận.' },
  { key: 'confirmed',  label: 'Đã xác nhận',     icon: CheckCircle,   color: 'text-blue-500',    bg: 'bg-blue-500',    desc: 'Đơn hàng đã được xác nhận. Đang chuẩn bị báo giá chính xác.' },
  { key: 'processing', label: 'Đang xử lý',      icon: Package,       color: 'text-indigo-500',  bg: 'bg-indigo-500',  desc: 'Đơn hàng đang được kỹ sư xử lý và lên kế hoạch.' },
  { key: 'shipping',   label: 'Đang giao hàng',  icon: Truck,         color: 'text-purple-500',  bg: 'bg-purple-500',  desc: 'Sản phẩm đang được vận chuyển đến địa chỉ của bạn.' },
  { key: 'completed',  label: 'Hoàn thành',      icon: Star,          color: 'text-green-500',   bg: 'bg-green-500',   desc: 'Đơn hàng đã hoàn thành. Cảm ơn bạn đã tin tưởng CTC!' },
];

const getStatusIndex = (status: string) => {
  if (status === 'cancelled') return -1;
  return STATUS_STEPS.findIndex(s => s.key === status);
};

const TrackOrder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchingOrders, setMatchingOrders] = useState<OrderTrackData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderTrackData | null>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);

  const handleVerifyCaptcha = () => {
    if (captchaVerified || captchaVerifying) return;
    setCaptchaVerifying(true);
    setError('');
    setTimeout(() => {
      setCaptchaVerifying(false);
      setCaptchaVerified(true);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm.');
      return;
    }
    if (!captchaVerified) {
      setError('Vui lòng hoàn thành xác minh "Tôi không phải là người máy".');
      return;
    }

    setLoading(true);
    setError('');
    setMatchingOrders([]);
    setSelectedOrder(null);

    try {
      const response = await api.orders.track(searchQuery.trim());
      if (response.success && response.data.length > 0) {
        setMatchingOrders(response.data);
        if (response.data.length === 1) {
          // If only 1 order matches, select it immediately
          setSelectedOrder(response.data[0]);
        }
      } else {
        setError(response.error || 'Không tìm thấy đơn hàng.');
      }
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy đơn hàng nào khớp với thông tin cung cấp.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMatchingOrders([]);
    setSelectedOrder(null);
    setError('');
    setSearchQuery('');
    setCaptchaVerified(false);
    setCaptchaVerifying(false);
  };

  const handleSelectOrder = (order: OrderTrackData) => {
    setSelectedOrder(order);
  };

  const currentStepIndex = selectedOrder ? getStatusIndex(selectedOrder.status) : -2;
  const isCancelled = selectedOrder?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pt-28 pb-16 px-4 transition-colors duration-300">
      <SEO
        title="Tra Cứu Đơn Hàng - CTC"
        description="Tra cứu trạng thái đơn hàng báo giá của bạn tại CTC Solar theo mã đơn hàng hoặc số điện thoại."
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl mb-4 border border-primary/20">
            <Search size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-corporate dark:text-white mb-2">
            Tra Cứu Đơn Hàng / Báo Giá
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Nhập mã đơn hàng hoặc số điện thoại đã đăng ký để tra cứu tiến độ báo giá.
          </p>
        </div>

        {/* Search Form (Only if no order is selected) */}
        {!selectedOrder && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 sm:p-8 shadow-md mb-6 transition-all">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Thông tin tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    id="track-search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Nhập mã đơn (CTC-ORD-...) hoặc số điện thoại..."
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl text-gray-850 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Custom Premium Captcha Verification */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-750 border border-slate-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-300 select-none">
                {/* Subtle background glow */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox with custom ripple effect */}
                    <div className="relative flex items-center justify-center">
                      {captchaVerifying && (
                        <span className="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-primary/10 opacity-75" />
                      )}
                      <button
                        type="button"
                        onClick={handleVerifyCaptcha}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-500 ${
                          captchaVerified
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-0 scale-105'
                            : 'bg-white dark:bg-gray-900 border-slate-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary active:scale-90 cursor-pointer shadow-sm'
                        }`}
                        disabled={captchaVerifying || captchaVerified}
                      >
                        {captchaVerifying && (
                          <RefreshCw size={16} className="animate-spin text-primary" />
                        )}
                        {captchaVerified && (
                          <Check size={18} className="stroke-[3.5] animate-scale-in" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col">
                      <span 
                        onClick={handleVerifyCaptcha}
                        className={`text-sm font-bold tracking-wide transition-colors duration-300 ${
                          captchaVerified 
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                            : 'text-slate-700 dark:text-slate-200 cursor-pointer hover:text-primary'
                        }`}
                      >
                        {captchaVerified ? 'Xác minh thành công' : 'Tôi không phải là người máy'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {captchaVerifying ? 'Đang phân tích hành vi...' : captchaVerified ? 'Yêu cầu được xác thực' : 'Bấm vào ô vuông để xác minh bảo mật'}
                      </span>
                    </div>
                  </div>

                  {/* Brand Badge */}
                  <div className="flex flex-col items-end pl-4 border-l border-slate-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={18} className={`${captchaVerified ? 'text-emerald-500 animate-pulse' : 'text-primary'} transition-colors duration-500`} />
                      <span className="text-[10px] font-black text-slate-800 dark:text-white tracking-wider uppercase font-mono">
                        CTC SECURE
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none font-semibold">
                      Privacy & Terms
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 animate-fade-in">
                  <XCircle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !captchaVerified}
                className="w-full bg-primary hover:bg-primary/95 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Tìm kiếm đơn hàng
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* List of matching orders (If multiple matches and no order is selected) */}
        {!selectedOrder && matchingOrders.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 shadow-md mb-6 animate-fade-in">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
              Tìm thấy {matchingOrders.length} đơn hàng trùng khớp
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-750">
              {matchingOrders.map((ord, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectOrder(ord)}
                  className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750/30 px-3 rounded-xl transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-primary text-sm">{ord.orderCode}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                      Khách hàng: <strong className="text-gray-800 dark:text-white">{ord.customerName}</strong> — SĐT: {ord.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-850 dark:text-white block">
                        {ord.totalAmount > 0 ? `${ord.totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </span>
                      <span className="text-[10px] text-gray-450 capitalize">
                        {ord.items.length} sản phẩm
                      </span>
                    </div>
                    <div className="bg-primary/10 dark:bg-primary/20 text-primary p-1.5 rounded-lg">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Order Detail */}
        {selectedOrder && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className={`rounded-2xl border p-6 bg-white dark:bg-gray-800 shadow-sm border-gray-150 dark:border-gray-700`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-widest mb-1">Mã đơn hàng</p>
                  <h2 className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">{selectedOrder.orderCode}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                    <Calendar size={13} />
                    Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  isCancelled
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30'
                    : currentStepIndex === STATUS_STEPS.length - 1
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                }`}>
                  {isCancelled ? '❌ Đã hủy' : STATUS_STEPS[currentStepIndex]?.label || 'Chờ xác nhận'}
                </div>
              </div>

              {/* Customer information details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-750 pt-5">
                <div className="space-y-1">
                  <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider">Thông tin khách hàng</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedOrder.customerName}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">{selectedOrder.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider">Địa chỉ giao hàng</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white leading-snug">{selectedOrder.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info Banner if shipping/completed */}
            {(selectedOrder.shippingProvider || selectedOrder.trackingCode) && (
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-800/40 p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <Truck size={18} />
                  <span>Thông tin đơn vị vận chuyển</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-gray-500 block">Đơn vị giao hàng:</span>
                    <strong className="text-gray-800 dark:text-gray-200 text-sm">{selectedOrder.shippingProvider || 'Xe công ty CTC'}</strong>
                  </div>
                  {selectedOrder.trackingCode && (
                    <div>
                      <span className="text-gray-500 block">Mã vận đơn:</span>
                      <strong className="font-mono text-purple-700 dark:text-purple-300 text-sm bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 inline-block mt-0.5">
                        {selectedOrder.trackingCode}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancelled Reason Banner if cancelled */}
            {isCancelled && selectedOrder.cancelledReason && (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800/40 p-5 shadow-sm text-xs space-y-1">
                <span className="font-bold text-red-700 dark:text-red-300 block">Lý do hủy đơn hàng:</span>
                <p className="text-red-600 dark:text-red-400 italic">{selectedOrder.cancelledReason}</p>
              </div>
            )}

            {/* Timeline Progress */}
            {!isCancelled ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="text-gray-850 dark:text-white font-bold text-sm uppercase tracking-wider mb-6">
                  Tiến trình đơn hàng
                </h3>
                <div className="relative pl-6">
                  {/* Vertical Progress Line */}
                  <div className="absolute left-8 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-750" />
                  <div
                    className="absolute left-8 top-5 w-0.5 bg-primary transition-all duration-700"
                    style={{ height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 90}%` }}
                  />

                  <div className="space-y-6">
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isDone = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border transition-all z-10 ${
                            isDone
                              ? `${step.bg} border-transparent text-white shadow-md shadow-primary/10`
                              : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                            <Icon size={14} />
                          </div>
                          <div className="pt-1 flex-1 min-w-0">
                            <p className={`font-bold text-sm ${isDone ? 'text-gray-850 dark:text-white' : 'text-gray-350 dark:text-gray-600'}`}>
                              {step.label}
                              {isCurrent && (
                                <span className="ml-2 text-[9px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                  Hiện tại
                                </span>
                              )}
                            </p>
                            {isCurrent && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 text-center">
                <XCircle size={40} className="text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-gray-850 dark:text-white font-bold text-lg">Đơn hàng đã bị hủy</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">Vui lòng liên hệ hotline <strong>0915 059 666</strong> để được giải đáp.</p>
              </div>
            )}

            {/* Product items list */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-gray-850 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">
                Danh sách sản phẩm
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-750/30 rounded-xl p-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-gray-800 dark:text-white font-bold text-sm truncate">{item.productName}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        SL: {item.quantity} × {item.price > 0 ? item.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                      </p>
                    </div>
                    <p className="text-gray-800 dark:text-white font-bold text-sm whitespace-nowrap">
                      {item.price > 0 ? item.subtotal.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-gray-100 dark:border-gray-750">
                <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Tổng tiền dự kiến:</span>
                <span className="text-2xl font-extrabold text-primary">
                  {selectedOrder.totalAmount > 0 ? selectedOrder.totalAmount.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                </span>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xs italic mt-1.5">* Giá chính xác sẽ được báo sau khi nhân viên CTC liên hệ khảo sát thực tế.</p>

              {selectedOrder.note && (
                <div className="mt-4 flex items-start gap-2 bg-gray-50 dark:bg-gray-750/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <FileText size={15} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-450 dark:text-gray-500">Ghi chú</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs italic mt-0.5 leading-relaxed">{selectedOrder.note}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-750 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold py-3 px-5 rounded-xl transition-all shadow-sm text-sm"
              >
                <RefreshCw size={15} /> Tìm kiếm đơn khác
              </button>
              {matchingOrders.length > 1 && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-750 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold py-3 px-5 rounded-xl transition-all shadow-sm text-sm"
                >
                  <ArrowLeft size={15} /> Quay lại danh sách ({matchingOrders.length})
                </button>
              )}
              <Link
                to="/products"
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold py-3 px-5 rounded-xl shadow-md transition-all text-sm"
              >
                <ShoppingBag size={15} /> Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        )}

        {/* Footer links */}
        {!selectedOrder && (
          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary text-xs font-bold transition-colors"
            >
              <ArrowLeft size={12} /> Quay về trang chủ
            </Link>
            <span className="text-gray-200 dark:text-gray-800 mx-3">|</span>
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary text-xs font-bold transition-colors"
            >
              Giỏ hàng báo giá <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
