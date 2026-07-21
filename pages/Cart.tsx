import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle, ShoppingBag, User, Phone, Mail, MapPin, FileText, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ code: string; name: string } | null>(null);

  const handleQuantityChange = (productId: string, currentQty: number, change: number) => {
    updateQuantity(productId, currentQty + change);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      showToast('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }));

      const orderData = {
        customerName,
        phone,
        email,
        address,
        note,
        items
      };

      const response = await api.orders.create(orderData);

      if (response.success) {
        setOrderSuccess({
          code: response.order.orderCode,
          name: customerName
        });
        clearCart();
        showToast('Đặt hàng thành công!', 'success');
      } else {
        showToast(response.error || 'Đặt hàng thất bại. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Có lỗi xảy ra trong quá trình đặt hàng.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully placed
  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <SEO title="Đặt Hàng Thành Công" description="Cảm ơn bạn đã đặt hàng tại CTC Solar." />
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Cảm ơn <strong>{orderSuccess.name}</strong>. Yêu cầu báo giá của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 mb-4 text-left border border-gray-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-primary">{orderSuccess.code}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Trạng thái:</span>
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase">
                Chờ xác nhận
              </span>
            </div>
          </div>

          {/* Email hint */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-6 text-left border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <span className="text-lg leading-none">📧</span>
              <span>Email xác nhận đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (và thư mục spam nếu không thấy).</span>
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/track-order"
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              🔍 Tra cứu trạng thái đơn hàng
            </Link>
            <Link
              to="/products"
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl block hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors"
            >
              Tiếp tục mua hàng
            </Link>
            <Link
              to="/"
              className="w-full text-gray-500 dark:text-gray-400 font-semibold py-2 px-6 rounded-xl block hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10 font-sans text-gray-700 dark:text-gray-350 transition-colors duration-300">
      <SEO title="Giỏ hàng báo giá" description="Quản lý danh sách các sản phẩm cần yêu cầu báo giá kỹ thuật." />
      
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary">Sản phẩm</Link>
          <ChevronRight size={12} />
          <span className="text-gray-800 dark:text-white font-bold">Giỏ hàng báo giá</span>
        </div>

        <h1 className="text-3xl font-extrabold text-corporate dark:text-white mb-8 border-l-4 border-primary pl-4 flex items-center gap-3">
          <ShoppingBag className="text-primary" /> Giỏ hàng báo giá
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vui lòng duyệt qua danh mục sản phẩm của chúng tôi và chọn các sản phẩm bạn cần báo giá.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <ArrowLeft size={16} /> Quay lại mua hàng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="font-bold text-lg text-gray-800 dark:text-white">Danh sách yêu cầu ({cartItems.length})</h2>
                  <button 
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-650 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Xóa tất cả
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors">
                      {/* Product details */}
                      <div className="flex items-center gap-4 flex-1">
                        <img 
                          src={item.image} 
                          alt={item.product_name} 
                          className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-gray-850 dark:text-white text-sm md:text-base hover:text-primary transition-colors">
                            <Link to={`/products/${item.product_id}`}>{item.product_name}</Link>
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Đơn giá: {item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </p>
                        </div>
                      </div>

                      {/* Quantity counter */}
                      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-850 dark:hover:text-white p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-8 text-center text-gray-800 dark:text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-850 dark:hover:text-white p-1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total price for this item */}
                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                        <span className="text-xs text-gray-400 sm:hidden">Thành tiền:</span>
                        <span className="font-bold text-gray-850 dark:text-white text-base">
                          {item.price > 0 ? `${(item.price * item.quantity).toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 rounded-full transition-all sm:mt-1 self-end sm:self-auto"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back to buy */}
              <div className="flex justify-between items-center">
                <Link
                  to="/products"
                  className="flex items-center gap-2 text-primary hover:underline font-bold text-sm"
                >
                  <ArrowLeft size={16} /> Tiếp tục mua hàng
                </Link>
              </div>
            </div>

            {/* Right: Summary or Checkout Form */}
            <div className="space-y-6">
              
              {/* Cart Totals */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Tổng giá trị đơn hàng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Số lượng sản phẩm:</span>
                    <span className="font-bold">{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-850 dark:text-white text-base">Tổng tiền dự kiến:</span>
                    <span className="text-xl font-extrabold text-primary">
                      {totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 italic">
                    * Giá trị trên là dự kiến dựa trên giá niêm yết. Kỹ sư của chúng tôi sẽ gọi điện báo giá ưu đãi chính xác.
                  </p>
                </div>
                
                {!showOrderForm && (
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl mt-6 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    Tiến hành đặt hàng
                  </button>
                )}
              </div>

              {/* Order checkout form */}
              {showOrderForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 animate-slide-up">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                    <User size={18} className="text-primary" /> Thông tin nhận báo giá
                  </h3>
                  
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-805 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="tel"
                          required
                          placeholder="0912 345 678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-805 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          required
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-805 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Địa chỉ lắp đặt / giao hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          required
                          placeholder="Đà Nẵng, Việt Nam"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-805 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        Ghi chú thêm
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                        <textarea
                          placeholder="Yêu cầu tư vấn thêm về giải pháp hoặc thời gian giao nhận..."
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-805 dark:text-white transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-6 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đặt hàng'}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
