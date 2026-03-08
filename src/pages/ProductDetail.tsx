import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { getImage } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="pt-24 pb-16 text-center min-h-screen">
        <p className="text-4xl mb-4">😢</p>
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/shop">
          <Button variant="outline" className="mt-4 rounded-full">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={getImage(product.image)} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground capitalize mb-2">{product.category.replace("-", " ")}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">{product.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{product.nameBn}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">৳{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice}</span>
              )}
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-full">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <span className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-destructive"}`}>
                {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full font-semibold btn-glow"
                disabled={!product.inStock}
                onClick={handleAdd}
              >
                <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(isWished ? "Removed from wishlist" : "Added to wishlist ❤️");
                }}
              >
                <Heart className={`h-5 w-5 ${isWished ? "fill-primary text-primary" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="section-heading mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
