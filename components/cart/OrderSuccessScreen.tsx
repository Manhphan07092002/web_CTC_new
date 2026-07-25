import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronRight, Phone, ShieldCheck, Zap, Printer } from 'lucide-react';
import SEO from '../SEO';

interface OrderSuccessScreenProps {
  code: string;
  onPrint: () => void;
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ code, onPrint }) => (
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
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Chờ xác nhận
          </span>
        </div>
        <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3" />
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
          className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-all shadow-md shadow-primary/20"
        >
          Tiếp tục xem SP <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  </div>
);
