import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface GiftBoxSelection {
  productIds: string[];   // shop products included
  extraIds: string[];     // extras like chocolate, card etc.
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  giftBox?: GiftBoxSelection;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, giftBox?: GiftBoxSelection) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Unique key: productId + size (gift boxes always unique)
const getCartKey = (productId: string, size?: string, giftBox?: GiftBoxSelection) => {
  if (giftBox) return `${productId}__gift__${Date.now()}__${Math.random()}`;
  return size ? `${productId}__${size}` : productId;
};

export const getItemKey = (item: CartItem) => {
  if (item.giftBox) return `${item.product.id}__gift__${item.giftBox.productIds.join(",")}_${item.giftBox.extraIds.join(",")}`;
  return item.selectedSize ? `${item.product.id}__${item.selectedSize}` : item.product.id;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = useCallback((product: Product, size?: string, giftBox?: GiftBoxSelection) => {
    if (giftBox) {
      // Gift boxes are always added as new items
      setItems((prev) => [...prev, { product, quantity: 1, selectedSize: size, giftBox }]);
      return;
    }
    setItems((prev) => {
      const key = size ? `${product.id}__${size}` : product.id;
      const existing = prev.find((i) => getItemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size }];
    });
  }, []);

  const removeFromCart = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => getItemKey(i) !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getItemKey(i) !== cartKey));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (getItemKey(i) === cartKey ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, wishlist, toggleWishlist }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
