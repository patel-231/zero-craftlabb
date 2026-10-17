import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/index.ts';
import { useSettings } from './SettingsContext.tsx';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  removeFromCart: (cartItemKey: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  isFreeShipping: boolean;
  freeShippingRemaining: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zc_cart_items_v1';

export function getCartItemKey(productId: string, selectedVariants: Record<string, string> = {}): string {
  const sortedVariants = Object.entries(selectedVariants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('::');
  return `${productId}__${sortedVariants}`;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedVariants: Record<string, string> = {}) => {
    setItems((prevItems) => {
      const targetKey = getCartItemKey(product.id, selectedVariants);
      const existingIndex = prevItems.findIndex(
        (item) => getCartItemKey(item.productId, item.selectedVariants) === targetKey
      );

      // Determine price taking variant adjustments into account
      let unitPrice = product.salePrice ?? product.price;
      if (product.variants && selectedVariants) {
        for (const [vName, optLabel] of Object.entries(selectedVariants)) {
          const varDef = product.variants.find((v) => v.name.toLowerCase() === vName.toLowerCase());
          if (varDef) {
            const opt = varDef.options.find((o) => o.label === optLabel);
            if (opt?.priceAdjustment) {
              unitPrice += opt.priceAdjustment;
            }
          }
        }
      }

      if (existingIndex >= 0) {
        const updated = [...prevItems];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          unitPrice,
          lineTotal: unitPrice * newQty,
        };
        return updated;
      } else {
        const initialQty = Math.min(product.stock, Math.max(1, quantity));
        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            selectedVariants,
            quantity: initialQty,
            unitPrice,
            lineTotal: unitPrice * initialQty,
          },
        ];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (cartItemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (getCartItemKey(item.productId, item.selectedVariants) === cartItemKey) {
          const clampedQty = Math.min(item.product.stock, quantity);
          return {
            ...item,
            quantity: clampedQty,
            lineTotal: item.unitPrice * clampedQty,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemKey: string) => {
    setItems((prev) =>
      prev.filter((item) => getCartItemKey(item.productId, item.selectedVariants) !== cartItemKey)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const freeThreshold = settings?.commerce?.freeShippingThreshold ?? 1499;
  const standardFee = settings?.commerce?.standardShippingFee ?? 99;

  const isFreeShipping = subtotal >= freeThreshold || items.length === 0;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : standardFee;
  const totalAmount = subtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, freeThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        shippingFee,
        totalAmount,
        isFreeShipping,
        freeShippingRemaining,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
