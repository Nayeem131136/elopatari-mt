import { useParams, Link } from "react-router-dom";
import { products, categorySizes, requiresSize, giftBoxExtras, giftBoxPackagingCharge } from "@/data/products";
import { getImage } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Ruler, Package, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Gift box state
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

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
  const needsSize = requiresSize(product.category);
  const sizes = categorySizes[product.category] || [];
  const isGiftBox = product.category === "custom";

  // Products available for gift box (non-custom)
  const boxProducts = products.filter((p) => p.category !== "custom" && p.inStock);

  // Gift box price calculation
  const giftBoxTotal = isGiftBox
    ? giftBoxPackagingCharge
      + selectedProducts.reduce((sum, pid) => {
          const p = products.find((pr) => pr.id === pid);
          return sum + (p?.price || 0);
        }, 0)
      + selectedExtras.reduce((sum, eid) => {
          const e = giftBoxExtras.find((ex) => ex.id === eid);
          return sum + (e?.price || 0);
        }, 0)
    : product.price;

  const toggleProduct = (pid: string) => {
    setSelectedProducts((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const toggleExtra = (eid: string) => {
    setSelectedExtras((prev) =>
      prev.includes(eid) ? prev.filter((id) => id !== eid) : [...prev, eid]
    );
  };

  const handleAdd = () => {
    if (needsSize && !selectedSize) {
      toast.error("সাইজ সিলেক্ট করুন!");
      return;
    }
    if (isGiftBox && selectedProducts.length === 0 && selectedExtras.length === 0) {
      toast.error("অন্তত একটি আইটেম সিলেক্ট করুন!");
      return;
    }

    if (isGiftBox) {
      addToCart(product, undefined, { productIds: selectedProducts, extraIds: selectedExtras });
      toast.success(`Gift Box (${selectedProducts.length + selectedExtras.length} items) added to cart!`);
    } else {
      for (let i = 0; i < qty; i++) addToCart(product, selectedSize || undefined);
      toast.success(`${qty}x ${product.name}${selectedSize ? ` (${sizes.find(s => s.value === selectedSize)?.label})` : ""} added to cart!`);
    }
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
              {isGiftBox ? (
                <>
                  <span className="text-3xl font-bold text-foreground">৳{giftBoxTotal}</span>
                  <span className="text-sm text-muted-foreground">(প্যাকেজিং ৳{giftBoxPackagingCharge} + আইটেম)</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-foreground">৳{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">৳{product.originalPrice}</span>
                  )}
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Size Selection (for frame/embroidery/canvas) */}
            {needsSize && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4 text-primary" /> সাইজ সিলেক্ট করুন <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === size.value
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gift Box Builder */}
            {isGiftBox && (
              <div className="space-y-6 mb-6">
                {/* Select shop products */}
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-primary" /> প্রোডাক্ট বাছুন (শপ থেকে)
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                    {boxProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedProducts.includes(p.id)
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <img src={getImage(p.image)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.nameBn}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground whitespace-nowrap">৳{p.price}</span>
                        {selectedProducts.includes(p.id) && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select extras */}
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    ✨ অতিরিক্ত আইটেম যোগ করুন
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {giftBoxExtras.map((extra) => (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedExtras.includes(extra.id)
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span className="text-lg">{extra.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{extra.name}</p>
                          <p className="text-xs font-bold text-primary">৳{extra.price}</p>
                        </div>
                        {selectedExtras.includes(extra.id) && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                {(selectedProducts.length > 0 || selectedExtras.length > 0) && (
                  <div className="bg-accent/30 rounded-xl p-4 text-sm space-y-1.5">
                    <p className="font-semibold text-foreground mb-2">💰 মূল্য বিবরণ:</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>📦 প্যাকেজিং চার্জ</span>
                      <span className="text-foreground">৳{giftBoxPackagingCharge}</span>
                    </div>
                    {selectedProducts.map((pid) => {
                      const p = products.find((pr) => pr.id === pid);
                      return p ? (
                        <div key={pid} className="flex justify-between text-muted-foreground">
                          <span className="truncate mr-2">🎁 {p.name}</span>
                          <span className="text-foreground whitespace-nowrap">৳{p.price}</span>
                        </div>
                      ) : null;
                    })}
                    {selectedExtras.map((eid) => {
                      const e = giftBoxExtras.find((ex) => ex.id === eid);
                      return e ? (
                        <div key={eid} className="flex justify-between text-muted-foreground">
                          <span>{e.emoji} {e.name}</span>
                          <span className="text-foreground">৳{e.price}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span className="text-foreground">মোট</span>
                      <span className="text-primary text-lg">৳{giftBoxTotal}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity (not for gift box) */}
            {!isGiftBox && (
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

                <span className={`text-sm font-medium ${product.inStock ? "text-accent-foreground" : "text-destructive"}`}>
                  {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-full font-semibold btn-glow"
                disabled={!product.inStock}
                onClick={handleAdd}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isGiftBox ? `Gift Box কার্টে যোগ করুন — ৳${giftBoxTotal}` : "Add to Cart"}
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
