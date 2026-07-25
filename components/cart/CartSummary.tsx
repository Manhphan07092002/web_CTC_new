import React from 'react';
import { Tag, Check, ArrowLeft, Printer, ShieldCheck, Truck, Wrench, Receipt } from 'lucide-react';

interface CartSummaryProps {
  totalAmount: number;
  appliedDiscount: number;
  finalTotalAmount: number;
  couponInput: string;
  setCouponInput: (val: string) => void;
  appliedCouponCode: string;
  couponSuccessMsg: string;
  couponErrorMsg: string;
  isApplyingCoupon: boolean;
  onApplyCoupon: (e: React.FormEvent) => void;
  onRemoveCoupon: () => void;
  onOpenOrderForm: () => void;
  onPrintQuote: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalAmount,
  appliedDiscount,
  finalTotalAmount,
  couponInput,
  setCouponInput,
  appliedCouponCode,
  couponSuccessMsg,
  couponErrorMsg,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onOpenOrderForm,
  onPrintQuote,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 sticky top-28 space-y-6">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg border-b border-gray-100 dark:border-gray-700 pb-4">
          Tổng quan đơn hàng
        </h3>

        {/* Voucher Code Form */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Tag size={14} className="text-primary" /> Mã giảm giá / Voucher
          </label>
          {appliedCouponCode ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300 uppercase">
                  {appliedCouponCode}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  (-{appliedDiscount.toLocaleString('vi-VN')}đ)
                </span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="text-xs text-red-500 hover:text-red-700 font-bold underline ml-2"
              >
                Gỡ mã
              </button>
            </div>
          ) : (
            <form onSubmit={onApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã CTC100..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all disabled:opacity-50"
              >
                {isApplyingCoupon ? 'Áp dụng...' : 'Áp dụng'}
              </button>
            </form>
          )}

          {couponSuccessMsg && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccessMsg}</p>}
          {couponErrorMsg && <p className="text-[11px] text-red-500 font-medium">{couponErrorMsg}</p>}
        </div>

        {/* Pricing breakdown */}
        <div className="space-y-3 pt-2 text-sm border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tạm tính</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Giảm giá Voucher</span>
              <span className="font-semibold">
                -{appliedDiscount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Thuế VAT (8%)</span>
            <span className="text-xs text-gray-400 italic">Đã bao gồm trong báo giá</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Phí vận chuyển</span>
            <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">Miễn phí</span>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-baseline">
            <div>
              <span className="font-extrabold text-base text-gray-900 dark:text-white">Tổng cộng</span>
              <p className="text-[10px] text-gray-400 font-normal">Đã bao gồm VAT & Miễn phí vận chuyển</p>
            </div>
            <span className="font-extrabold text-2xl text-primary dark:text-white tracking-tight">
              {finalTotalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Checkout CTA Button */}
        <button
          onClick={onOpenOrderForm}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-extrabold text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
        >
          <Truck size={20} className="group-hover:translate-x-1 transition-transform" />
          Tiến hành đặt hàng ngay
        </button>

        {/* Print quote button */}
        <button
          onClick={onPrintQuote}
          className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
        >
          <Printer size={15} /> In / Tải Bảng Báo Giá (PDF)
        </button>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Cam kết dịch vụ CTC Solar</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl">
              <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="font-medium">Chính hãng 100%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl">
              <Truck size={14} className="text-primary flex-shrink-0" />
              <span className="font-medium">Giao nhanh 24h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl">
              <Wrench size={14} className="text-amber-500 flex-shrink-0" />
              <span className="font-medium">Hỗ trợ kỹ thuật</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-xl">
              <Receipt size={14} className="text-violet-500 flex-shrink-0" />
              <span className="font-medium">Xuất hóa đơn VAT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
