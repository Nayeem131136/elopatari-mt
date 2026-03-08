import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import productFrame from "@/assets/product-frame.jpg";
import productEmbroidery from "@/assets/product-embroidery.jpg";
import productCanvas from "@/assets/product-canvas.jpg";
import productCrochet from "@/assets/product-crochet.jpg";
import productCustom from "@/assets/product-custom.jpg";

const imageMap: Record<string, string> = {
  "product-frame": productFrame,
  "product-embroidery": productEmbroidery,
  "product-canvas": productCanvas,
  "product-crochet": productCrochet,
  "product-custom": productCustom,
};

export const getImage = (key: string) => imageMap[key] || productCustom;

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const isWished = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast(isWished ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card group block">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-secondary">
        <img
          src={getImage(product.image)}
          alt={product.name}
          className="product-image w-full h-full object-cover transition-transform duration-500"
        />
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isWished ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full rounded-full font-semibold btn-glow"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1 capitalize">
          {product.category.replace("-", " ")}
        </p>
        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{product.nameBn}</p>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">৳{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">৳{product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
