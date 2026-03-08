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
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Unique key: productId + size
const getCartKey = (productId: string, size?: string) => size ? `${productId}__${size}` : productId;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = useCallback((product: Product, size?: string) => {
    setItems((prev) => {
      const key = getCartKey(product.id, size);
      const existing = prev.find((i) => getCartKey(i.product.id, i.selectedSize) === key);
      if (existing) {
        return prev.map((i) =>
          getCartKey(i.product.id, i.selectedSize) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size }];
    });
  }, []);

  const removeFromCart = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => getCartKey(i.product.id, i.selectedSize) !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getCartKey(i.product.id, i.selectedSize) !== cartKey));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (getCartKey(i.product.id, i.selectedSize) === cartKey ? { ...i, quantity } : i))
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
