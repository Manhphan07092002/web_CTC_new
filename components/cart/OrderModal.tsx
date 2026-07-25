import React from 'react';
import { 
  X, User, Phone, Mail, MapPin, FileText, Send, Truck, Store, 
  CreditCard, DollarSign, Building2, Package, Check, AlertCircle 
} from 'lucide-react';
import AddressAutocomplete from '../AddressAutocomplete';
import PriceDisplay from '../PriceDisplay';

interface OrderModalProps {
  showModal: boolean;
  onClose: () => void;
  cartItems: any[];
  totalQty: number;
  finalTotalAmount: number;
  customerName: string;
  setCustomerName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  note: string;
  setNote: (val: string) => void;
  deliveryMethod: 'shipping' | 'pickup';
  setDeliveryMethod: (val: 'shipping' | 'pickup') => void;
  paymentMethod: 'cod' | 'transfer' | 'vat_invoice';
  setPaymentMethod: (val: 'cod' | 'transfer' | 'vat_invoice') => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  taxCode: string;
  setTaxCode: (val: string) => void;
  companyAddress: string;
  setCompanyAddress: (val: string) => void;
  invoiceEmail: string;
  setInvoiceEmail: (val: string) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  onSubmitOrder: (e: React.FormEvent) => void;
  placeholderImage: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  showModal,
  onClose,
  cartItems,
  totalQty,
  finalTotalAmount,
  customerName,
  setCustomerName,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  note,
  setNote,
  deliveryMethod,
  setDeliveryMethod,
  paymentMethod,
  setPaymentMethod,
  companyName,
  setCompanyName,
  taxCode,
  setTaxCode,
  companyAddress,
  setCompanyAddress,
  invoiceEmail,
  setInvoiceEmail,
  errors,
  touched,
  isSubmitting,
  onSubmitOrder,
  placeholderImage,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in print:hidden">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-corporate to-slate-900 text-white flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-white/10 px-2.5 py-0.5 rounded-full">
              Hoàn tất đơn hàng
            </span>
            <h3 className="font-extrabold text-lg sm:text-xl text-white mt-1">Thông tin nhận hàng & Báo giá</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Delivery Method */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              1. Hình thức nhận hàng
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'shipping', label: 'Giao hàng tận nơi', desc: 'CTC giao & lắp đặt toàn quốc', icon: <Truck size={18} /> },
                { id: 'pickup', label: 'Nhận tại Showroom', desc: 'CTC Solar Đà Nẵng', icon: <Store size={18} /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDeliveryMethod(m.id as any)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                    deliveryMethod === m.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                      : 'border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${deliveryMethod === m.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              2. Thông tin liên hệ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <User size={13} /> Họ và tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none ${
                    touched.customerName && errors.customerName ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-slate-700'
                  }`}
                />
                {touched.customerName && errors.customerName && (
                  <p className="text-[10.5px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Phone size={13} /> Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none ${
                    touched.phone && errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-slate-700'
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="text-[10.5px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Mail size={13} /> Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: nguyenvana@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none ${
                    touched.email && errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-slate-700'
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-[10.5px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>
                )}
              </div>
            </div>

            {/* Smart Address Autocomplete */}
            {deliveryMethod === 'shipping' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin size={13} /> Địa chỉ nhận hàng <span className="text-red-500">*</span>
                </label>
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  error={touched.address ? errors.address : undefined}
                />
              </div>
            )}
          </div>

          {/* Section 3: Payment & VAT Invoice */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              3. Phương thức thanh toán & Hóa đơn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'cod', label: 'Thanh toán COD', desc: 'Khi nhận hàng', icon: <DollarSign size={16} /> },
                { id: 'transfer', label: 'Chuyển khoản NH', desc: 'BIDV / Vietcombank', icon: <CreditCard size={16} /> },
                { id: 'vat_invoice', label: 'Xuất hoá đơn VAT', desc: 'Doanh nghiệp (VAT 8%)', icon: <Building2 size={16} /> },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id as any)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                    paymentMethod === p.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                      : 'border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${paymentMethod === p.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">{p.label}</p>
                    <p className="text-[10px] text-gray-400">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic VAT Invoice Form */}
            {paymentMethod === 'vat_invoice' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <Building2 size={15} /> Thông tin doanh nghiệp xuất hóa đơn VAT (8%)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Tên Doanh nghiệp / Công ty</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="CÔNG TY TNHH ABC..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Mã số thuế (MST)</label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      placeholder="0400123456"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Địa chỉ doanh nghiệp (theo ĐKKD)</label>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Số ... Đường ..., Phường ..., Quận ..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Email nhận hóa đơn điện tử</label>
                    <input
                      type="email"
                      value={invoiceEmail}
                      onChange={(e) => setInvoiceEmail(e.target.value)}
                      placeholder="ketoan@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Order Note */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <FileText size={13} /> Ghi chú thêm (Không bắt buộc)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Yêu cầu riêng về thời gian giao hàng, hướng dẫn vận chuyển..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Mini product summary in modal */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
              <span className="flex items-center gap-1.5"><Package size={14} className="text-primary" /> {totalQty} sản phẩm đã chọn</span>
              <span className="text-primary font-extrabold text-sm">{finalTotalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400">
                  <span className="truncate max-w-[240px]">{item.product_name}</span>
                  <span className="font-semibold">{item.quantity} x {item.price.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/80 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSubmitOrder}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-sm shadow-xl shadow-primary/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              'Đang gửi yêu cầu...'
            ) : (
              <>
                <Send size={16} /> Gửi yêu cầu đặt hàng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
