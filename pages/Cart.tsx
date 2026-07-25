import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { 
  Trash2, Plus, Minus, ArrowLeft, CheckCircle, ShoppingBag, User, Phone, Mail, 
  MapPin, FileText, ChevronRight, AlertCircle, Check, X, ShieldCheck, Truck, 
  Wrench, Receipt, Tag, Printer, Sparkles, Send, CreditCard, Building2, Store, DollarSign,
  Package, Clock, Calendar, Star, Zap, Gift, BadgeCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import SEO from '../components/SEO';
import { validateName, validatePhone, validateEmail, validateAddress } from '../utils/validation';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { useSettings } from '../contexts/SettingsContext';

// ─── Number to Vietnamese Words Converter ──────────────────────────────────
function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Không đồng';
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const blockNames = ['', ' nghìn', ' triệu', ' tỷ'];

  function readTriple(n: number, isTop: boolean): string {
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;
    let res = '';
    if (hundred > 0 || !isTop) res += units[hundred] + ' trăm ';
    if (ten > 1) {
      res += units[ten] + ' mươi ';
      if (unit === 1) res += 'mốt ';
      else if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (ten === 1) {
      res += 'mười ';
      if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += units[unit] + ' ';
    } else if (unit > 0) {
      if (res !== '') res += 'lẻ ';
      res += units[unit] + ' ';
    }
    return res;
  }

  let str = Math.round(num).toString();
  const blocks: number[] = [];
  while (str.length > 0) {
    blocks.push(parseInt(str.slice(-3), 10));
    str = str.slice(0, -3);
  }

  let words = '';
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i] > 0) {
      words += readTriple(blocks[i], i === blocks.length - 1) + blockNames[i] + ' ';
    }
  }
  words = words.trim();
  if (!words) return 'Không đồng';
  return words.charAt(0).toUpperCase() + words.slice(1) + ' đồng';
}

// ─── Official Printable Quotation Document (Executive CTC Template) ─────────────
const PrintableQuotation: React.FC<{
  cartItems: any[];
  totalAmount: number;
  appliedDiscount: number;
  finalTotalAmount: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
}> = ({ cartItems, totalAmount, appliedDiscount, finalTotalAmount, customerName, phone, email, address }) => {
  const { settings } = useSettings();
  const logoSrc = settings?.logoHeader || settings?.logo || '/uploads/images/logo/logodo.png';

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  // VAT calculations (8% VAT)
  const subtotal = Math.max(0, totalAmount - appliedDiscount);
  const vatAmount = Math.round(subtotal * 0.08);
  const totalWithVat = subtotal + vatAmount;

  return (
    <div className="hidden print:block bg-white text-slate-900 p-6 font-sans text-[11px] leading-snug">
      {/* Strict Print CSS Override */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 12mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, nav, aside, iframe,
          .print\\:hidden, div.fixed, a.fixed, button.fixed,
          [class*="Header"], [class*="Footer"], [class*="ChatBox"], [class*="BackToTop"],
          [class*="zalo"], [class*="Notification"], [class*="float"], button, a[href*="zalo"], a[href*="tel"] {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>

      {/* 1. Header: Company Logo & Official Legal Details */}
      <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900 mb-2">
        <img
          src={logoSrc}
          alt="CTC Logo"
          className="h-16 w-auto object-contain flex-shrink-0"
        />
        <div className="flex-1 text-center space-y-0.5">
          <h1 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
            CÔNG TY CỔ PHẦN XÂY LẮP BƯU ĐIỆN MIỀN TRUNG - CTC
          </h1>
          <p className="text-[10.5px] text-slate-800">
            Địa chỉ: 50B Nguyễn Du, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam.
          </p>
          <p className="text-[10.5px] text-slate-800">
            Điện thoại: 02363.745.745 - 02363.745.746 &nbsp;|&nbsp; Fax: 0236.3863669
          </p>
          <p className="text-[10.5px] text-slate-800">
            Website: <span className="underline font-semibold text-slate-900">https://ctcdn.vn</span> &nbsp;&nbsp;&nbsp; Email: <span className="underline font-semibold text-slate-900">ctcdanang@gmail.com</span>
          </p>
        </div>
      </div>

      {/* 2. Date Line */}
      <div className="text-right italic text-slate-800 mb-3 text-[11px] font-medium">
        Đà Nẵng, ngày {day} tháng {month} năm {year}
      </div>

      {/* 3. Main Document Title & Salutation */}
      <div className="text-center my-4 space-y-1">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
          BẢNG CHÀO GIÁ
        </h2>
        <p className="text-xs text-slate-900 font-bold">
          Kính gửi: <span className="underline">{customerName || 'Quý Khách hàng'}</span>
        </p>
        <p className="text-[10.5px] text-slate-900 italic max-w-2xl mx-auto">
          CTC chân thành cảm ơn sự quan tâm của Quý {customerName ? `khách hàng (${customerName})` : 'Khách hàng'} đến sản phẩm Công ty chúng tôi trong thời gian qua.
        </p>
        <p className="text-[10.5px] text-slate-900 italic max-w-2xl mx-auto">
          Theo yêu cầu của Quý {customerName ? `khách hàng` : 'Khách hàng'} về việc báo giá thiết bị, chúng tôi xin trân trọng gửi báo giá chi tiết như sau:
        </p>
      </div>

      {/* 4. Products & Equipment Table (Clean Excel Grid Style) */}
      <table className="w-full border-collapse border-2 border-slate-900 my-4 text-[10.5px]">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-extrabold text-center uppercase tracking-wide">
            <th className="p-2 border border-slate-900 w-10 text-center">STT</th>
            <th className="p-2 border border-slate-900 text-center">TÊN HÀNG HÓA<br/><span className="normal-case font-normal text-[9.5px]">(Mã hàng)</span></th>
            <th className="p-2 border border-slate-900 w-12 text-center">ĐVT</th>
            <th className="p-2 border border-slate-900 w-10 text-center">SL</th>
            <th className="p-2 border border-slate-900 w-28 text-center">XUẤT XỨ</th>
            <th className="p-2 border border-slate-900 text-right w-28">ĐƠN GIÁ</th>
            <th className="p-2 border border-slate-900 text-right w-32">THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, idx) => (
            <tr key={item.product_id} className="text-slate-900">
              <td className="p-2 border border-slate-900 text-center font-medium">{idx + 1}</td>
              <td className="p-2 border border-slate-900 font-bold text-slate-900">
                {item.product_name}
                {item.power && <span className="block text-[9.5px] font-normal text-slate-600">Công suất: {item.power}W</span>}
              </td>
              <td className="p-2 border border-slate-900 text-center">Cái</td>
              <td className="p-2 border border-slate-900 text-center font-bold">{item.quantity}</td>
              <td className="p-2 border border-slate-900 text-center">Việt Nam / Chính hãng</td>
              <td className="p-2 border border-slate-900 text-right font-semibold text-slate-900">
                {item.price > 0 ? item.price.toLocaleString('vi-VN') : 'Liên hệ'}
              </td>
              <td className="p-2 border border-slate-900 text-right font-bold text-slate-900">
                {item.price > 0 ? (item.price * item.quantity).toLocaleString('vi-VN') : 'Liên hệ'}
              </td>
            </tr>
          ))}

          {/* Summary Rows inside table */}
          <tr className="bg-slate-50 font-bold">
            <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
              Cộng trước thuế GTGT:
            </td>
            <td className="p-2 border border-slate-900 text-right font-extrabold">
              {subtotal.toLocaleString('vi-VN')}
            </td>
          </tr>

          {appliedDiscount > 0 && (
            <tr className="bg-slate-50 font-bold text-emerald-800">
              <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
                Chiết khấu Voucher:
              </td>
              <td className="p-2 border border-slate-900 text-right font-extrabold">
                -{appliedDiscount.toLocaleString('vi-VN')}
              </td>
            </tr>
          )}

          <tr className="bg-slate-50 font-bold">
            <td colSpan={6} className="p-2 border border-slate-900 text-right uppercase tracking-wide font-bold">
              VAT 8%:
            </td>
            <td className="p-2 border border-slate-900 text-right font-extrabold">
              {vatAmount.toLocaleString('vi-VN')}
            </td>
          </tr>

          <tr className="bg-slate-100 font-extrabold text-xs">
            <td colSpan={6} className="p-2.5 border border-slate-900 text-right uppercase tracking-wider font-black">
              Tổng tiền sau thuế GTGT:
            </td>
            <td className="p-2.5 border border-slate-900 text-right font-black text-xs">
              {totalWithVat.toLocaleString('vi-VN')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in Words Box */}
      <div className="border-2 border-slate-900 p-2.5 my-3 text-center text-slate-900 italic font-bold text-[11.5px] bg-slate-50/50">
        Bằng chữ: {numberToVietnameseWords(totalWithVat)}.
      </div>

      {/* 5. Official Terms & Conditions */}
      <div className="space-y-1 text-[10px] text-slate-900 font-medium my-4 leading-relaxed">
        <p>* Hàng hóa mới 100%, xuất xứ như biểu giá trên.</p>
        <p>* Tiến độ và địa điểm giao nhận: 15-30 ngày kể từ ngày ký hợp đồng (không tính ngày nghỉ và lễ), địa điểm giao nhận: Tại kho của bên mua.</p>
        <p>* Tiến độ và phương thức thanh toán: 30 ngày, kể từ ngày bàn giao nghiệm thu hàng hóa và bên mua nhận được hóa đơn có thuế GTGT, và các giấy tờ liên quan. Thanh toán bằng chuyển khoản vào tài khoản của bên bán.</p>
        <p>* Số tài khoản giao dịch của bên bán: <strong>5650006625 NH TMCP Đầu tư và Phát triển Việt Nam CN Sông Hàn (BIDV)</strong></p>
        <p>* Thời gian bảo hành: 12 tháng kể từ ngày hàng hóa được nghiệm thu.</p>
        <p>* Hiệu lực báo giá: 30 ngày kể từ ngày ký.</p>
        <p>* Rất mong sự hợp tác của Quý {customerName || 'Khách hàng'}.</p>
        <p className="font-extrabold italic text-slate-900 mt-1 uppercase text-[10.5px]">TRÂN TRỌNG CẢM ƠN!</p>
      </div>

      {/* 6. Legal Representative Signature Block */}
      <div className="flex justify-between items-start text-center mt-8 pt-2">
        <div className="w-64">
          <p className="font-extrabold text-slate-900 uppercase text-xs">ĐẠI DIỆN KHÁCH HÀNG</p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký & ghi rõ họ tên)</p>
          <div className="h-20" />
          <p className="font-extrabold text-slate-800 text-xs">{customerName || '........................................'}</p>
        </div>

        <div className="w-80">
          <p className="font-extrabold text-slate-900 uppercase text-xs">CÔNG TY CP XÂY LẮP BƯU ĐIỆN MIỀN TRUNG</p>
          <p className="font-extrabold text-slate-900 uppercase text-xs mt-0.5">TỔNG GIÁM ĐỐC</p>
          <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, đóng dấu & ghi rõ họ tên)</p>
          <div className="h-16" />
          <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">NGUYỄN VĂN DUY</p>
        </div>
      </div>
    </div>
  );
};

// ─── Progress Stepper ────────────────────────────────────────────────────────
const STEPS = ['Giỏ hàng', 'Thông tin', 'Xác nhận'];

const ProgressStepper: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center mb-8 select-none">
    {STEPS.map((label, i) => {
      const done = i < step;
      const active = i === step;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
              done
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : active
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400'
            }`}>
              {done ? <Check size={16} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[11px] font-bold tracking-wide uppercase ${
              active ? 'text-primary' : done ? 'text-emerald-500' : 'text-gray-400'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${
              done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Delivery Timeline ────────────────────────────────────────────────────────
const DeliveryTimeline: React.FC<{ method: 'shipping' | 'pickup' }> = ({ method }) => {
  const items = method === 'shipping' ? [
    { icon: <BadgeCheck size={14} />, label: 'Xác nhận đơn hàng', time: 'Trong 30 phút', color: 'text-primary' },
    { icon: <Package size={14} />, label: 'Chuẩn bị hàng & kiểm tra kỹ thuật', time: '1-2 giờ', color: 'text-amber-500' },
    { icon: <Truck size={14} />, label: 'Giao hàng & lắp đặt', time: '24-48 giờ làm việc', color: 'text-emerald-500' },
    { icon: <Star size={14} />, label: 'Bàn giao & nghiệm thu', time: 'Tại công trình', color: 'text-violet-500' },
  ] : [
    { icon: <BadgeCheck size={14} />, label: 'Xác nhận báo giá', time: 'Trong 30 phút', color: 'text-primary' },
    { icon: <Clock size={14} />, label: 'Chuẩn bị hàng sẵn sàng', time: '2-4 giờ', color: 'text-amber-500' },
    { icon: <Store size={14} />, label: 'Đến kho CTC nhận hàng', time: 'Theo lịch hẹn', color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <div className={`w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 ${it.color}`}>
            {it.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{it.label}</span>
          </div>
          <span className="text-gray-400 text-[11px] whitespace-nowrap">{it.time}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Order Success Screen ─────────────────────────────────────────────────────
const OrderSuccessScreen: React.FC<{ code: string; onPrint: () => void }> = ({ code, onPrint }) => (
  <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-28 sm:pt-36 pb-16 px-4 print:hidden">
    <SEO title="Đặt Hàng Thành Công" description="Cảm ơn bạn đã đặt hàng tại CTC Solar." />
    <div className="max-w-lg w-full space-y-6 text-center">
      {/* Animated check ring */}
      <div className="relative mx-auto w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
          <CheckCircle size={56} className="text-white" strokeWidth={1.5} />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Đặt Hàng Thành Công! 🎉</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
          Yêu cầu báo giá của bạn đã được ghi nhận. Kỹ sư CTC Solar sẽ gọi điện xác nhận trong thời gian sớm nhất.
        </p>
      </div>

      {/* Order code card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-xl p-6 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mã đơn hàng</span>
          <span className="font-mono font-extrabold text-lg text-primary tracking-widest bg-primary/5 px-3 py-1 rounded-lg border border-primary/20">{code}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Trạng thái</span>
          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
            <Clock size={11} /> Chờ xác nhận
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Theo dõi đơn hàng</span>
          <Link to="/track-order" className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
            Xem ngay <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Info badges */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: <Phone size={16} />, label: 'Kỹ sư gọi trong 30 phút', color: 'text-primary' },
          { icon: <ShieldCheck size={16} />, label: 'Bảo hành chính hãng', color: 'text-emerald-500' },
          { icon: <Zap size={16} />, label: 'Lắp đặt chuyên nghiệp', color: 'text-amber-500' },
        ].map((b, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className={`mx-auto mb-1 ${b.color}`}>{b.icon}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight font-medium">{b.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPrint}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Printer size={16} /> In Báo Giá
        </button>
        <Link
          to="/products"
          className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25"
        >
          <ShoppingBag size={16} /> Tiếp tục mua
        </Link>
      </div>
    </div>
  </div>
);

// ─── Main Cart Component ──────────────────────────────────────────────────────
const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Step: 0=cart overview, 1=checkout form open
  const [step, setStep] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ code: string } | null>(null);

  // VAT Invoice Fields
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');

  // Delivery & Payment
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'vat'>('cod');

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ customerName?: string; phone?: string; email?: string; address?: string }>({});
  const [touched, setTouched] = useState<{ customerName?: boolean; phone?: boolean; email?: boolean; address?: boolean }>({});

  // Cart product list expand
  const [cartExpanded, setCartExpanded] = useState(true);

  // Auto load saved profile
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ctc_user_checkout_profile');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.phone) setPhone(p.phone);
        if (p.email) setEmail(p.email);
        if (p.address) setAddress(p.address);
      }
    } catch (e) {}
  }, []);

  const validateField = (field: string, val: string) => {
    let err = '';
    if (field === 'customerName') { const r = validateName(val); if (!r.isValid) err = r.errors[0]; }
    else if (field === 'phone') { const r = validatePhone(val); if (!r.isValid) err = r.errors[0]; }
    else if (field === 'email') { const r = validateEmail(val); if (!r.isValid) err = r.errors[0]; }
    else if (field === 'address') { const r = validateAddress(val); if (!r.isValid) err = r.errors[0]; }
    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  const handleBlur = (field: string, val: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, val);
  };

  const handleQuantityChange = (productId: string, currentQty: number, change: number) => {
    updateQuantity(productId, currentQty + change);
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    setCouponErrorMsg(''); setCouponSuccessMsg('');
    if (!code) { setCouponErrorMsg('Vui lòng nhập mã giảm giá.'); return; }
    if (code === 'CTC2025') {
      setAppliedDiscount(500000); setAppliedCouponCode('CTC2025');
      setCouponSuccessMsg('Áp dụng mã CTC2025: Giảm 500.000đ!');
      showToast('Áp dụng Voucher CTC2025 thành công!', 'success');
    } else if (code === 'SOLAR5') {
      const disc = Math.round(totalAmount * 0.05);
      setAppliedDiscount(disc); setAppliedCouponCode('SOLAR5');
      setCouponSuccessMsg(`Áp dụng mã SOLAR5: Giảm 5% (${disc.toLocaleString('vi-VN')}đ)!`);
      showToast('Áp dụng Voucher SOLAR5 thành công!', 'success');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(300000); setAppliedCouponCode('FREESHIP');
      setCouponSuccessMsg('Áp dụng mã FREESHIP: Trừ 300.000đ phí giao hàng!');
      showToast('Áp dụng Voucher FREESHIP thành công!', 'success');
    } else {
      setCouponErrorMsg('Mã giảm giá không đúng hoặc đã hết hạn.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0); setAppliedCouponCode('');
    setCouponInput(''); setCouponSuccessMsg(''); setCouponErrorMsg('');
  };

  const finalTotalAmount = Math.max(0, totalAmount - appliedDiscount);

  const openOrderForm = () => {
    setStep(1);
    setShowOrderForm(true);
  };

  const closeOrderForm = useCallback(() => {
    setStep(0);
    setShowOrderForm(false);
  }, []);

  // Close modal on Escape key only
  useEffect(() => {
    if (!showOrderForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOrderForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOrderForm, closeOrderForm]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ customerName: true, phone: true, email: true, address: true });
    const ok = validateField('customerName', customerName) &&
                validateField('phone', phone) &&
                validateField('email', email) &&
                validateField('address', address);
    if (!ok) { showToast('Vui lòng kiểm tra và điền chính xác thông tin đặt hàng.', 'error'); return; }

    setIsSubmitting(true);
    try {
      localStorage.setItem('ctc_user_checkout_profile', JSON.stringify({ phone, email, address }));
    } catch (e) {}

    try {
      const orderData = {
        customerName,
        phone,
        email,
        address,
        note: `[HÌNH THỨC: ${deliveryMethod === 'shipping' ? 'Giao hàng tận nơi' : 'Nhận tại Showroom'}] | [THANH TOÁN: ${paymentMethod === 'cod' ? 'COD' : paymentMethod === 'bank' ? 'Chuyển khoản' : 'Xuất VAT'}]${paymentMethod === 'vat' && companyName ? ` | [CÔNG TY: ${companyName}]` : ''}${paymentMethod === 'vat' && taxCode ? ` | [MST: ${taxCode}]` : ''}${paymentMethod === 'vat' && companyAddress ? ` | [ĐỊA CHỈ CĐ: ${companyAddress}]` : ''}${paymentMethod === 'vat' && invoiceEmail ? ` | [EMAIL HĐ: ${invoiceEmail}]` : ''} ${appliedCouponCode ? `| [MÃ: ${appliedCouponCode}]` : ''} | Ghi chú: ${note}`,
        items: cartItems.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          price: i.price,
          quantity: i.quantity
        }))
      };
      const response = await api.orders.create(orderData);
      if (response.success) {
        setOrderSuccess({ code: response.order.orderCode });
        setStep(2);
        setShowOrderForm(false);
        clearCart();
        showToast('Đặt hàng thành công!', 'success');
      } else {
        showToast(response.error || 'Đặt hàng thất bại. Vui lòng thử lại.', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra trong quá trình đặt hàng.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintQuote = () => window.print();

  // ─── Render: Order Success ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <>
        <OrderSuccessScreen code={orderSuccess.code} onPrint={handlePrintQuote} />
        <PrintableQuotation
          cartItems={cartItems}
          totalAmount={totalAmount}
          appliedDiscount={appliedDiscount}
          finalTotalAmount={finalTotalAmount}
          customerName={customerName}
          phone={phone}
          email={email}
          address={address}
        />
      </>
    );
  }

  const totalQty = cartItems.reduce((a, c) => a + c.quantity, 0);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 sm:pt-36 pb-16 transition-colors duration-200 print:hidden">
      <SEO title="Giỏ Hàng / Báo Giá" description="Xem lại danh sách sản phẩm và gửi yêu cầu báo giá." />

      <div className="container max-w-[1280px] mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 dark:text-white font-medium">Giỏ hàng & Đặt hàng</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-primary" size={32} />
            <span>Giỏ Hàng & Yêu Cầu Báo Giá</span>
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handlePrintQuote}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary font-bold text-xs shadow-sm transition-all"
            >
              <Printer size={15} /> Tải / In báo giá PDF
            </button>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="max-w-md mx-auto">
          <ProgressStepper step={step} />
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <ShoppingBag size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Giỏ hàng của bạn đang trống</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Bạn chưa thêm sản phẩm nào. Hãy khám phá thiết bị điện mặt trời cao cấp của CTC Solar.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <ArrowLeft size={16} /> Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left: Cart Items ── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Cart header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/70 dark:bg-gray-750/40">
                  <button
                    onClick={() => setCartExpanded(v => !v)}
                    className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Package size={18} className="text-primary" />
                    Sản phẩm chọn mua
                    <span className="bg-primary/10 text-primary text-xs font-extrabold px-2 py-0.5 rounded-full">{totalQty}</span>
                    {cartExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Xóa tất cả
                  </button>
                </div>

                {/* Cart items list */}
                {cartExpanded && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-750/20 transition-colors group">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80"}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-700"
                          />
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
                            {item.quantity}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.product_name}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Đơn giá: <span className="font-semibold text-primary">{item.price > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-extrabold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Subtotal + delete */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white text-base">
                            {item.price > 0 ? `${(item.price * item.quantity).toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group-hover:text-red-400"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Back / Print */}
              <div className="flex flex-wrap justify-between items-center gap-4">
                <Link to="/products" className="flex items-center gap-2 text-primary hover:underline font-bold text-sm">
                  <ArrowLeft size={16} /> Tiếp tục mua hàng
                </Link>
                <button
                  onClick={handlePrintQuote}
                  className="inline-flex sm:hidden items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary font-bold text-xs shadow-sm"
                >
                  <Printer size={15} /> In Báo Giá
                </button>
              </div>

              {/* Delivery Timeline preview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  Lộ trình giao nhận dự kiến
                </h4>
                <DeliveryTimeline method={deliveryMethod} />
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className="space-y-5">
              {/* Cart Totals & Coupon */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                  <Receipt size={18} className="text-primary" /> Tổng giá trị đơn hàng
                </h3>

                {/* Coupon */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Tag size={13} className="text-primary" /> Mã giảm giá / Voucher:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VD: CTC2025, SOLAR5"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl uppercase font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {couponSuccessMsg && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                      <span className="flex items-center gap-1.5"><Gift size={13} /> {couponSuccessMsg}</span>
                      <button onClick={handleRemoveCoupon} className="text-red-500 text-[10px] underline ml-2">Xóa</button>
                    </div>
                  )}
                  {couponErrorMsg && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={12} /> {couponErrorMsg}</p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Số lượng sản phẩm:</span>
                    <span className="font-bold">{totalQty}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Tạm tính:</span>
                    <span className="font-bold">{totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-2 py-1">
                      <span>Giảm giá Voucher:</span>
                      <span>-{appliedDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900 dark:text-white text-base">Tổng tiền dự kiến:</span>
                    <span className="text-2xl font-extrabold text-primary">
                      {finalTotalAmount > 0 ? `${finalTotalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 italic">
                    * Giá dự kiến theo giá niêm yết. Kỹ sư CTC sẽ báo giá ưu đãi tốt nhất.
                  </p>
                </div>

                <button
                  onClick={openOrderForm}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
                >
                  <Truck size={18} /> Tiến hành đặt hàng ngay
                </button>
              </div>

              {/* Trust badges */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-500" /> Cam kết uy tín từ CTC Solar
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: <Truck size={16} />, title: 'Giao hàng 24h', sub: 'Khảo sát & giao tận công trình', color: 'text-primary' },
                    { icon: <Wrench size={16} />, title: 'Bảo hành 12-25 năm', sub: 'Chính hãng Top 1 Tier 1', color: 'text-primary' },
                    { icon: <Receipt size={16} />, title: 'Xuất hóa đơn VAT', sub: 'Đầy đủ chứng từ doanh nghiệp', color: 'text-primary' },
                    { icon: <Building2 size={16} />, title: 'Kỹ sư hỗ trợ 24/7', sub: 'Tư vấn giải pháp tối ưu', color: 'text-primary' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                      <div className={`${b.color} mt-0.5 flex-shrink-0`}>{b.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{b.title}</p>
                        <p className="text-[10px] text-gray-400">{b.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Order Form Modal ── */}
        {showOrderForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop – click KHÔNG đóng modal, chỉ Esc hoặc nút ✕ */}
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-default" />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 z-10 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Thông tin đặt hàng</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn tất để kỹ sư CTC liên hệ báo giá tốt nhất</p>
                  </div>
                </div>
                <button
                  onClick={closeOrderForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:rotate-90 duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body – scrollable */}
              <div className="p-5 sm:p-7 overflow-y-auto flex-1">
                <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">

                  {/* Honeypot */}
                  <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden absolute left-[-9999px] opacity-0 pointer-events-none" />

                  {/* ── Mini Order Summary ── */}
                  <div className="bg-sky-50/80 dark:bg-slate-800/70 rounded-2xl border border-sky-100 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" />
                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                          {totalQty} sản phẩm trong giỏ
                        </span>
                      </div>
                      <span className="text-lg font-extrabold text-primary">
                        {finalTotalAmount > 0 ? `${finalTotalAmount.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                      </span>
                    </div>
                    {/* Product mini list */}
                    <div className="border-t border-sky-100 dark:border-slate-700 divide-y divide-sky-100/60 dark:divide-slate-700/60 max-h-40 overflow-y-auto">
                      {cartItems.map(item => (
                        <div key={item.product_id} className="px-4 py-2.5 flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=80&q=80'}
                            alt={item.product_name}
                            className="w-9 h-9 object-cover rounded-lg border border-sky-100 dark:border-slate-700 flex-shrink-0"
                          />
                          <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-200 line-clamp-1">{item.product_name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                          <span className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {item.price > 0 ? `${(item.price * item.quantity).toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Delivery Method ── */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Truck size={13} className="text-primary" /> Hình thức nhận hàng:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'shipping', icon: <Truck size={18} />, title: 'Giao hàng & Lắp đặt tận nơi', sub: 'Khảo sát & bàn giao tại công trình' },
                        { key: 'pickup', icon: <Store size={18} />, title: 'Nhận trực tiếp tại Showroom', sub: 'Tại kho / văn phòng CTC Solar' }
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDeliveryMethod(opt.key as any)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
                            deliveryMethod === opt.key
                              ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-primary/40'
                          }`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${deliveryMethod === opt.key ? 'text-primary' : 'text-gray-400'}`}>{opt.icon}</div>
                          <div>
                            <p className="font-bold text-sm">{opt.title}</p>
                            <p className="text-[11px] opacity-70 mt-0.5">{opt.sub}</p>
                          </div>
                          {deliveryMethod === opt.key && (
                            <Check size={16} className="ml-auto text-primary flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Payment Method ── */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-primary" /> Phương thức thanh toán:
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { key: 'cod', icon: <DollarSign size={16} />, title: 'Thanh toán COD', sub: 'Khi bàn giao hàng' },
                        { key: 'bank', icon: <CreditCard size={16} />, title: 'Chuyển khoản QR', sub: 'Mã VietQR tự động' },
                        { key: 'vat', icon: <Receipt size={16} />, title: 'Xuất hoá đơn VAT', sub: 'Dành cho Doanh nghiệp' }
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setPaymentMethod(opt.key as any)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === opt.key
                              ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-primary/40'
                          }`}
                        >
                          <p className="text-xs font-bold flex items-center gap-1.5">{opt.icon} {opt.title}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>

                    {/* VAT Invoice Fields Block */}
                    {paymentMethod === 'vat' && (
                      <div className="mt-3 rounded-2xl border-2 border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt size={15} className="text-primary" />
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Thông tin xuất hóa đơn VAT doanh nghiệp</span>
                        </div>

                        {/* Company Name & Tax Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                              Tên doanh nghiệp <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Công ty TNHH/Cổ phần..."
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                              Mã số thuế <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="0123456789"
                                value={taxCode}
                                onChange={e => setTaxCode(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Company Address */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Địa chỉ doanh nghiệp (ghi trên ĐKKD) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP..."
                              value={companyAddress}
                              onChange={e => setCompanyAddress(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Invoice Email */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Email nhận hóa đơn điện tử <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              placeholder="ketoan@congty.com"
                              value={invoiceEmail}
                              onChange={e => setInvoiceEmail(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <p className="text-[10px] text-primary font-medium italic flex items-center gap-1">
                          <ShieldCheck size={12} /> Hóa đơn VAT điện tử sẽ được gửi trực tiếp đến email doanh nghiệp sau khi hoàn thành giao hàng.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Contact Info – 2-column ── */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2">
                      <User size={15} className="text-primary" /> Thông tin liên hệ
                    </h4>
                    
                    {/* Row 1: Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Họ tên */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between">
                          <span>Họ và tên <span className="text-red-500">*</span></span>
                          {touched.customerName && !errors.customerName && (
                            <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1"><Check size={11} /> Hợp lệ</span>
                          )}
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${touched.customerName && errors.customerName ? 'text-red-400' : customerName.trim() ? 'text-emerald-500' : 'text-gray-400'}`} size={15} />
                          <input
                            type="text"
                            required
                            placeholder="Nguyễn Văn A"
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); if (touched.customerName) validateField('customerName', e.target.value); }}
                            onBlur={(e) => handleBlur('customerName', e.target.value)}
                            className={`w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none transition-all ${
                              touched.customerName && errors.customerName ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                              : customerName.trim().length >= 2 ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                              : 'border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20'
                            } text-gray-900 dark:text-white`}
                          />
                          {touched.customerName && !errors.customerName && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={15} />}
                        </div>
                        {touched.customerName && errors.customerName && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.customerName}</p>
                        )}
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between">
                          <span>Số điện thoại <span className="text-red-500">*</span></span>
                          {touched.phone && !errors.phone && (
                            <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1"><Check size={11} /> Hợp lệ</span>
                          )}
                        </label>
                        <div className="relative">
                          <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${touched.phone && errors.phone ? 'text-red-400' : phone.trim() ? 'text-emerald-500' : 'text-gray-400'}`} size={15} />
                          <input
                            type="tel"
                            required
                            placeholder="0912 345 678"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); if (touched.phone) validateField('phone', e.target.value); }}
                            onBlur={(e) => handleBlur('phone', e.target.value)}
                            className={`w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none transition-all ${
                              touched.phone && errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                              : touched.phone && !errors.phone ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                              : 'border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20'
                            } text-gray-900 dark:text-white`}
                          />
                          {touched.phone && !errors.phone && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={15} />}
                        </div>
                        {touched.phone && errors.phone && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Email (full width) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between">
                        <span>Email <span className="text-red-500">*</span></span>
                        {touched.email && !errors.email && (
                          <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1"><Check size={11} /> Hợp lệ</span>
                        )}
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${touched.email && errors.email ? 'text-red-400' : email.trim() ? 'text-emerald-500' : 'text-gray-400'}`} size={15} />
                        <input
                          type="email"
                          required
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (touched.email) validateField('email', e.target.value); }}
                          onBlur={(e) => handleBlur('email', e.target.value)}
                          className={`w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none transition-all ${
                            touched.email && errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                            : touched.email && !errors.email ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                            : 'border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20'
                          } text-gray-900 dark:text-white`}
                        />
                        {touched.email && !errors.email && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" size={15} />}
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>
                      )}
                    </div>

                    {/* Row 3: Address (full width) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between">
                        <span>Địa chỉ lắp đặt / giao hàng <span className="text-red-500">*</span></span>
                        {touched.address && !errors.address && (
                          <span className="text-emerald-500 text-[11px] font-medium flex items-center gap-1"><Check size={11} /> Hợp lệ</span>
                        )}
                      </label>
                      <AddressAutocomplete
                        value={address}
                        onChange={(val) => { setAddress(val); if (touched.address) validateField('address', val); }}
                        onSelect={(val) => { setAddress(val); setTouched(prev => ({ ...prev, address: true })); validateField('address', val); }}
                        error={touched.address ? errors.address : undefined}
                        placeholder="Nhập địa chỉ lắp đặt hoặc nhận hàng..."
                        required
                      />
                      {touched.address && errors.address && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address}</p>
                      )}
                    </div>

                    {/* Row 4: Note */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                        Ghi chú thêm <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3 text-gray-400" size={15} />
                        <textarea
                          placeholder="Yêu cầu tư vấn thêm, thời gian giao nhận mong muốn..."
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 rounded-b-3xl flex items-center justify-between gap-3">
                <div className="text-xs text-gray-400 hidden sm:flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  Thông tin của bạn được bảo mật tuyệt đối
                </div>
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={closeOrderForm}
                    className="py-2.5 px-5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-bold text-sm transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="py-3 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Đang gửi...</>
                    ) : (
                      <><Send size={16} /> Gửi yêu cầu đặt hàng</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* Official Printable Quotation Document (Visible ONLY when printing / saving PDF) */}
    <PrintableQuotation
      cartItems={cartItems}
      totalAmount={totalAmount}
      appliedDiscount={appliedDiscount}
      finalTotalAmount={finalTotalAmount}
      customerName={customerName}
      phone={phone}
      email={email}
      address={address}
    />
  </>
  );
};

export default Cart;
