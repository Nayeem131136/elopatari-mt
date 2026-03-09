import React, { createContext, useContext, useState, useCallback } from "react";
import { Product, products as allProducts, giftBoxExtras, giftBoxPackagingCharge } from "@/data/products";

export interface GiftBoxCategoryItem {
  categoryId: string;
  categoryName: string;
  sizeValue: string;
  sizeLabel: string;
  price: number;
}

export interface GiftBoxSelection {
  categories: GiftBoxCategoryItem[];
  crochetProductIds: string[];
  extraIds: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  variantPrice?: number;
  giftBox?: GiftBoxSelection;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, giftBox?: GiftBoxSelection, color?: string, variantPrice?: number) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const getItemKey = (item: CartItem) => {
  if (item.giftBox) {
    const catKey = item.giftBox.categories.map(c => `${c.categoryId}:${c.sizeValue}`).join(",");
    const crochetKey = item.giftBox.crochetProductIds.join(",");
    const extraKey = item.giftBox.extraIds.join(",");
    return `${item.product.id}__gift__${catKey}_${crochetKey}_${extraKey}`;
  }
  const parts = [item.product.id];
  if (item.selectedColor) parts.push(item.selectedColor);
  if (item.selectedSize) parts.push(item.selectedSize);
  return parts.join("__");
};

export const calcGiftBoxPrice = (giftBox: GiftBoxSelection) => {
  return giftBoxPackagingCharge
    + giftBox.categories.reduce((s, c) => s + c.price, 0)
    + giftBox.crochetProductIds.reduce((s, pid) => {
        const p = allProducts.find((pr) => pr.id === pid);
        return s + (p?.price || 0);
      }, 0)
    + giftBox.extraIds.reduce((s, eid) => {
        const e = giftBoxExtras.find((ex) => ex.id === eid);
        return s + (e?.price || 0);
      }, 0);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = useCallback((product: Product, size?: string, giftBox?: GiftBoxSelection, color?: string, variantPrice?: number) => {
    if (giftBox) {
      setItems((prev) => [...prev, { product, quantity: 1, selectedSize: size, giftBox }]);
      return;
    }
    setItems((prev) => {
      const newItem: CartItem = { product, quantity: 1, selectedSize: size, selectedColor: color, variantPrice };
      const key = getItemKey(newItem);
      const existing = prev.find((i) => getItemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, newItem];
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
  const totalPrice = items.reduce((sum, i) => {
    if (i.giftBox) return sum + calcGiftBoxPrice(i.giftBox) * i.quantity;
    const price = i.variantPrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);

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
