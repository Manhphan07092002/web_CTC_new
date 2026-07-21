import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const parsePrice = (priceVal: any): number => {
  if (!priceVal) return 0;
  if (typeof priceVal === 'number') return priceVal;
  const cleanStr = String(priceVal).replace(/[^0-9]/g, '');
  return cleanStr ? parseInt(cleanStr, 10) : 0;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('ctc_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from sessionStorage:', e);
    }
  }, []);

  // Save to sessionStorage whenever cart changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      sessionStorage.setItem('ctc_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to sessionStorage:', e);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const productId = product.id || (product as any)._id;
    if (!productId) return;

    const existingIndex = cartItems.findIndex((item) => item.product_id === productId);
    const parsedPrice = parsePrice(product.price);

    let updatedItems = [...cartItems];

    if (existingIndex !== -1) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push({
        product_id: productId,
        product_name: product.name,
        price: parsedPrice,
        quantity,
        image: product.image
      });
    }

    saveCart(updatedItems);

    // Multi-language custom success toast with product name interpolation
    const successMsg = language === 'vi' 
      ? `Đã thêm "${product.name}" vào giỏ hàng thành công!` 
      : language === 'en' 
        ? `Added "${product.name}" to cart successfully!`
        : language === 'ko'
          ? `"${product.name}"을(를) 장바구니에 추가했습니다!`
          : language === 'ja'
            ? `「${product.name}」をカートに追加しました！`
            : `Đã thêm "${product.name}" vào giỏ hàng thành công!`;

    showToast(successMsg, 'success');
  };

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.product_id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) => 
      item.product_id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    try {
      sessionStorage.removeItem('ctc_cart');
    } catch (e) {
      console.error('Error removing cart from sessionStorage:', e);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
