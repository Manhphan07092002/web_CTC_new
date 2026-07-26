import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ChevronUp, ChevronDown, Package, ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import PriceDisplay from '../PriceDisplay';
import { DeliveryTimeline } from './DeliveryTimeline';
import { getProductUrl } from '../../utils/news-url-helper';

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartItemListProps {
  cartItems: CartItem[];
  totalQty: number;
  onUpdateQuantity: (productId: string, currentQty: number, change: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  deliveryMethod: 'shipping' | 'pickup';
  placeholderImage: string;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  cartItems,
  totalQty,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  deliveryMethod,
  placeholderImage
}) => {
  const [itemsExpanded, setItemsExpanded] = useState(true);

  if (cartItems.length === 0) {
    return (
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
          Hãy khám phá danh mục các thiết bị điện mặt trời cao cấp của CTC Solar để chọn sản phẩm phù hợp nhất.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-all hover:scale-105"
        >
          <ArrowLeft size={16} /> Khám phá sản phẩm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Products Collapsible Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Sản phẩm chọn mua
              <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-bold">
                {totalQty}
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearCart}
              className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 size={13} /> Xóa tất cả
            </button>
            <button
              onClick={() => setItemsExpanded(!itemsExpanded)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {itemsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Item rows */}
        {itemsExpanded && (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {cartItems.map((item) => (
              <div key={item.product_id} className="p-4 sm:p-5 flex gap-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                {/* Product image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                  <img
                    src={item.image || placeholderImage}
                    alt={item.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                  />
                  {item.quantity > 1 && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
                      x{item.quantity}
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-1">

                  <Link
                    to={getProductUrl({ id: item.product_id, name: item.product_name })}
                    className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2 leading-snug"
                  >
                    {item.product_name}
                  </Link>
                  <PriceDisplay
                    price={item.price}
                    size="sm"
                  />

                  {/* Quantity controls */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700/50">
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center font-bold text-xs text-gray-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(item.product_id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-xs flex items-center gap-1 font-medium"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>

                {/* Subtotal column */}
                <div className="hidden sm:block text-right flex-shrink-0 min-w-[120px]">
                  <p className="text-xs text-gray-400 font-medium">Thành tiền</p>
                  <p className="font-extrabold text-base text-primary dark:text-white">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="flex items-center justify-between pt-2">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Tiếp tục mua hàng
        </Link>
      </div>

      {/* Estimated Delivery Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          Lộ trình giao nhận dự kiến
        </h3>
        <DeliveryTimeline method={deliveryMethod} />
      </div>
    </div>
  );
};
