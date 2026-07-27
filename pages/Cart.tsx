import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { validateName, validatePhone, validateEmail, validateAddress } from '../utils/validation';
import {
  ProgressStepper,
  OrderSuccessScreen,
  PrintableQuotation,
  CartItemList,
  CartSummary,
  OrderModal
} from '../components/cart';

const PLACEHOLDER_IMAGE = '/uploads/images/products/solarpane.png';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ code: string } | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'vat_invoice'>('cod');

  // VAT Invoice Form Fields
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');

  // Voucher state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Errors & Touched
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, val: string) => {
    let err = '';
    if (field === 'customerName') {
      const res = validateName(val);
      if (!res.isValid) err = res.errors?.[0] || 'Tên không hợp lệ.';
    } else if (field === 'phone') {
      const res = validatePhone(val);
      if (!res.isValid) err = res.errors?.[0] || 'Số điện thoại không hợp lệ.';
    } else if (field === 'email') {
      const res = validateEmail(val);
      if (!res.isValid) err = res.errors?.[0] || 'Email không hợp lệ.';
    } else if (field === 'address' && deliveryMethod === 'shipping') {
      const res = validateAddress(val);
      if (!res.isValid) err = res.errors?.[0] || 'Địa chỉ không hợp lệ.';
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return !err;
  };

  useEffect(() => {
    if (touched.customerName) validateField('customerName', customerName);
  }, [customerName, touched.customerName]);

  useEffect(() => {
    if (touched.phone) validateField('phone', phone);
  }, [phone, touched.phone]);

  useEffect(() => {
    if (touched.email) validateField('email', email);
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.address && deliveryMethod === 'shipping') validateField('address', address);
  }, [address, deliveryMethod, touched.address]);

  // Handle Voucher Submission
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponSuccessMsg('');
    setCouponErrorMsg('');

    try {
      const code = couponInput.trim().toUpperCase();
      if (code === 'CTC100' || code === 'CTC10' || code === 'SOLAR100') {
        const discount = Math.round(totalAmount * 0.05); // 5% discount
        setAppliedDiscount(discount);
        setAppliedCouponCode(code);
        setCouponSuccessMsg(`Áp dụng mã ${code} thành công! Giảm ${discount.toLocaleString('vi-VN')}đ.`);
      } else {
        setCouponErrorMsg('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
    } catch {
      setCouponErrorMsg('Không thể kiểm tra mã giảm giá.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedCouponCode('');
    setCouponInput('');
    setCouponSuccessMsg('');
    setCouponErrorMsg('');
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

    const isNameOk = validateField('customerName', customerName);
    const isPhoneOk = validateField('phone', phone);
    const isEmailOk = validateField('email', email);
    const isAddressOk = deliveryMethod === 'pickup' || validateField('address', address);

    if (!isNameOk || !isPhoneOk || !isEmailOk || !isAddressOk) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderAddress = deliveryMethod === 'pickup' ? 'Nhận tại Showroom CTC Đà Nẵng' : address;
      const orderPayload = {
        customerName: customerName,
        customer_name: customerName,
        phone: phone,
        customer_phone: phone,
        email: email,
        customer_email: email,
        address: orderAddress,
        customer_address: orderAddress,
        note: note,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        company_name: paymentMethod === 'vat_invoice' ? companyName : undefined,
        tax_code: paymentMethod === 'vat_invoice' ? taxCode : undefined,
        company_address: paymentMethod === 'vat_invoice' ? companyAddress : undefined,
        invoice_email: paymentMethod === 'vat_invoice' ? invoiceEmail : undefined,
        items: cartItems.map(item => ({
          productId: item.product_id,
          product_id: item.product_id,
          productName: item.product_name,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: finalTotalAmount,
        total_amount: finalTotalAmount,
        original_amount: totalAmount,
        discount_amount: appliedDiscount,
        coupon_code: appliedCouponCode || undefined
      };

      const response = await api.orders.create(orderPayload);
      if (response.success) {
        clearCart();
        setOrderSuccess({ code: response.data?.code || response.order_code || response.quote_code || `CTC-${Date.now().toString().slice(-6)}` });
        setShowOrderForm(false);
        setStep(2);
        showToast('Tạo yêu cầu báo giá/đặt hàng thành công!', 'success');
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

  // ─── Render: Order Success Screen ─────────────────────────────────────────
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
      <SEO title="Giỏ Hàng & Báo Giá" description="Xem giỏ hàng, nhận báo giá chi tiết hệ thống điện mặt trời CTC Solar." />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 sm:pt-36 pb-16 transition-colors duration-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Giỏ Hàng & Báo Giá
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
              Kiểm tra các thiết bị đã chọn, áp dụng ưu đãi và gửi yêu cầu đặt hàng/báo giá chính thức từ CTC Solar.
            </p>
          </div>

          {/* Stepper Header */}
          <ProgressStepper step={step} />

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Item List & Delivery Timeline */}
            <CartItemList
              cartItems={cartItems}
              totalQty={totalQty}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              deliveryMethod={deliveryMethod}
              placeholderImage={PLACEHOLDER_IMAGE}
            />

            {/* Right: Cart Summary & Checkout CTA */}
            {cartItems.length > 0 && (
              <CartSummary
                totalAmount={totalAmount}
                appliedDiscount={appliedDiscount}
                finalTotalAmount={finalTotalAmount}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCouponCode={appliedCouponCode}
                couponSuccessMsg={couponSuccessMsg}
                couponErrorMsg={couponErrorMsg}
                isApplyingCoupon={isApplyingCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onOpenOrderForm={openOrderForm}
                onPrintQuote={handlePrintQuote}
              />
            )}
          </div>
        </div>

        {/* Wide Order Form Modal */}
        <OrderModal
          showModal={showOrderForm}
          onClose={closeOrderForm}
          cartItems={cartItems}
          totalQty={totalQty}
          finalTotalAmount={finalTotalAmount}
          customerName={customerName}
          setCustomerName={setCustomerName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          address={address}
          setAddress={setAddress}
          note={note}
          setNote={setNote}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          companyName={companyName}
          setCompanyName={setCompanyName}
          taxCode={taxCode}
          setTaxCode={setTaxCode}
          companyAddress={companyAddress}
          setCompanyAddress={setCompanyAddress}
          invoiceEmail={invoiceEmail}
          setInvoiceEmail={setInvoiceEmail}
          errors={errors}
          touched={touched}
          isSubmitting={isSubmitting}
          onSubmitOrder={handleSubmitOrder}
          placeholderImage={PLACEHOLDER_IMAGE}
        />
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
