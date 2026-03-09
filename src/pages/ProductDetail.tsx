import { useParams, Link } from "react-router-dom";
import { categorySizes, requiresSize, giftBoxExtras, giftBoxPackagingCharge } from "@/data/products";
import { getImage } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProductData";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";
import { useCart, GiftBoxCategoryItem, calcGiftBoxPrice } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star, Minus, Plus, ArrowLeft, Ruler, Package, Check, ChevronDown, Palette } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

const sizedCategories = [
  { id: "photo-frame", name: "Photo Frame", nameBn: "ফটো ফ্রেম", emoji: "🖼️" },
  { id: "embroidery", name: "Embroidery Hoop Art", nameBn: "এমব্রয়ডারি হুপ আর্ট", emoji: "🧵" },
  { id: "canvas", name: "Canvas Art", nameBn: "ক্যানভাস আর্ট", emoji: "🎨" },
];

const colorLabels: Record<string, { label: string, labelBn: string, hex: string }> = {
  black: { label: "Black", labelBn: "কালো", hex: "#1a1a1a" },
  white: { label: "White", labelBn: "সাদা", hex: "#f5f5f5" },
};

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const { variants, colors, getSizesForColor, getVariant } = useProductVariants(id);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedShape, setSelectedShape] = useState<string>("");

  // Gift box state
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>({});
  const [selectedCrochetProducts, setSelectedCrochetProducts] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const hasVariants = colors.length > 0;
  const isSingleColor = colors.length === 1;
  const effectiveColor = isSingleColor ? colors[0] : selectedColor;
  const isCanvas = product?.category === "canvas";

  // Detect available shapes for canvas
  const availableShapes = useMemo(() => {
    if (!isCanvas || !hasVariants) return [];
    const allSizes = variants.map((v) => v.size_label);
    const shapes: string[] = [];
    if (allSizes.some((s) => s.includes("(Square)"))) shapes.push("Square");
    if (allSizes.some((s) => s.includes("(Round)"))) shapes.push("Round");
    return shapes;
  }, [isCanvas, hasVariants, variants]);

  // Current variant based on selection
  const currentVariant = useMemo(() => {
    if (!hasVariants || !effectiveColor || !selectedSize) return null;
    return getVariant(effectiveColor, selectedSize);
  }, [hasVariants, effectiveColor, selectedSize, getVariant]);

  // Available sizes for selected color, filtered by shape for canvas
  const colorSizes = useMemo(() => {
    if (!hasVariants) return [];
    const colorToUse = isSingleColor ? colors[0] : selectedColor;
    if (!colorToUse) return [];
    let sizes = getSizesForColor(colorToUse);
    if (isCanvas && selectedShape) {
      sizes = sizes.filter((v) => v.size_label.includes(`(${selectedShape})`));
    }
    return sizes;
  }, [hasVariants, isSingleColor, colors, selectedColor, getSizesForColor, isCanvas, selectedShape]);

  // Display price
  const displayPrice = currentVariant ? currentVariant.price : (product?.price ?? 0);

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

  const crochetProducts = products.filter((p) => p.category === "crochet" && p.inStock);

  const buildGiftBoxSelection = () => {
    const catItems: GiftBoxCategoryItem[] = [];
    for (const cat of sizedCategories) {
      if (enabledCategories[cat.id] && selectedCategories[cat.id]) {
        const sizeVal = selectedCategories[cat.id];
        const sizeObj = categorySizes[cat.id]?.find((s) => s.value === sizeVal);
        const baseProduct = products.find((p) => p.category === cat.id);
        catItems.push({
          categoryId: cat.id,
          categoryName: cat.name,
          sizeValue: sizeVal,
          sizeLabel: sizeObj?.label || sizeVal,
          price: baseProduct?.price || 0,
        });
      }
    }
    return {
      categories: catItems,
      crochetProductIds: selectedCrochetProducts,
      extraIds: selectedExtras,
    };
  };

  const giftBoxSelection = isGiftBox ? buildGiftBoxSelection() : null;
  const giftBoxTotal = giftBoxSelection ? calcGiftBoxPrice(giftBoxSelection) : 0;
  const hasAnySelection = giftBoxSelection
    ? giftBoxSelection.categories.length > 0 || giftBoxSelection.crochetProductIds.length > 0 || giftBoxSelection.extraIds.length > 0
    : false;

  const toggleCategory = (catId: string) => {
    setEnabledCategories((prev) => {
      const next = { ...prev, [catId]: !prev[catId] };
      if (!next[catId]) {
        setSelectedCategories((sc) => { const n = { ...sc }; delete n[catId]; return n; });
      }
      return next;
    });
  };

  const selectCategorySize = (catId: string, sizeVal: string) => {
    setSelectedCategories((prev) => ({ ...prev, [catId]: sizeVal }));
  };

  const toggleCrochet = (pid: string) => {
    setSelectedCrochetProducts((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const toggleExtra = (eid: string) => {
    setSelectedExtras((prev) =>
      prev.includes(eid) ? prev.filter((id) => id !== eid) : [...prev, eid]
    );
  };

  const handleAdd = () => {
    // Variant-based products: must select color and size
    if (hasVariants) {
      if (!isSingleColor && !selectedColor) { toast.error("কালার সিলেক্ট করুন!"); return; }
      if (isCanvas && !selectedShape) { toast.error("শেপ সিলেক্ট করুন (Square / Round)!"); return; }
      if (!selectedSize) { toast.error("সাইজ সিলেক্ট করুন!"); return; }
      if (!currentVariant) { toast.error("এই কম্বিনেশন পাওয়া যায়নি!"); return; }
      const colorToUse = isSingleColor ? colors[0] : selectedColor;
      for (let i = 0; i < qty; i++) {
        addToCart(product, selectedSize, undefined, colorToUse, currentVariant.price);
      }
      const colorInfo = isSingleColor ? "" : ` (${colorLabels[colorToUse]?.labelBn || colorToUse})`;
      toast.success(`${qty}x ${product.name}${colorInfo} ${selectedSize} কার্টে যোগ হয়েছে!`);
      return;
    }

    if (needsSize && !selectedSize) {
      toast.error("সাইজ সিলেক্ট করুন!");
      return;
    }
    if (isGiftBox) {
      for (const cat of sizedCategories) {
        if (enabledCategories[cat.id] && !selectedCategories[cat.id]) {
          toast.error(`${cat.nameBn} এর সাইজ সিলেক্ট করুন!`);
          return;
        }
      }
      if (!hasAnySelection) {
        toast.error("অন্তত একটি আইটেম সিলেক্ট করুন!");
        return;
      }
      addToCart(product, undefined, giftBoxSelection!);
      const totalItems = (giftBoxSelection?.categories.length || 0) + selectedCrochetProducts.length + selectedExtras.length;
      toast.success(`Gift Box (${totalItems} items) কার্টে যোগ হয়েছে!`);
    } else {
      for (let i = 0; i < qty; i++) addToCart(product, selectedSize || undefined);
      toast.success(`${qty}x ${product.name}${selectedSize ? ` (${sizes.find(s => s.value === selectedSize)?.label})` : ""} added to cart!`);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(""); // Reset size when color changes
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
                  <span className="text-3xl font-bold text-foreground">৳{hasAnySelection ? giftBoxTotal : giftBoxPackagingCharge}</span>
                  <span className="text-sm text-muted-foreground">{hasAnySelection ? "(মোট)" : "(প্যাকেজিং থেকে শুরু)"}</span>
                </>
              ) : hasVariants ? (
                <>
                  <span className="text-3xl font-bold text-foreground">৳{displayPrice}</span>
                  {!currentVariant && (
                    <span className="text-sm text-muted-foreground">
                      ({isCanvas ? (selectedShape ? "সাইজ সিলেক্ট করুন" : "শেপ সিলেক্ট করুন") : (isSingleColor ? "সাইজ সিলেক্ট করুন" : "কালার ও সাইজ সিলেক্ট করুন")})
                    </span>
                  )}
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

            {/* Color Selection (when multiple colors exist) */}
            {hasVariants && !isSingleColor && (
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-primary" /> কালার সিলেক্ট করুন <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-3">
                  {colors.map((color) => {
                    const info = colorLabels[color] || { label: color, labelBn: color, hex: "#888" };
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                          style={{
                            backgroundColor: info.hex,
                            borderColor: isSelected ? "hsl(var(--primary))" : color === "white" ? "#ccc" : info.hex,
                          }}
                        />
                        <span>{info.label}</span>
                        <span className="text-xs text-muted-foreground">({info.labelBn})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shape Selection for Canvas */}
            {isCanvas && hasVariants && availableShapes.length > 1 && (
              <div className="mb-5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  🔷 শেপ সিলেক্ট করুন <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-3">
                  {availableShapes.map((shape) => {
                    const isSelected = selectedShape === shape;
                    const emoji = shape === "Square" ? "⬛" : "🔴";
                    const labelBn = shape === "Square" ? "চতুর্ভুজ" : "গোল";
                    return (
                      <button
                        key={shape}
                        onClick={() => { setSelectedShape(shape); setSelectedSize(""); }}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-lg">{emoji}</span>
                        <span>{shape}</span>
                        <span className="text-xs text-muted-foreground">({labelBn})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection (variant-based) */}
            {hasVariants && (isSingleColor || selectedColor) && (isCanvas ? selectedShape : true) && colorSizes.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4 text-primary" /> সাইজ সিলেক্ট করুন <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorSizes.map((v) => (
                    <button
                      key={v.size_label}
                      onClick={() => setSelectedSize(v.size_label)}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedSize === v.size_label
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <span>{v.size_label}</span>
                      <span className="ml-2 font-bold">৳{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection (legacy, for non-variant categories) */}
            {!hasVariants && needsSize && (
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
              <div className="space-y-4 mb-6">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> বক্সে কী কী রাখবেন বাছুন
                </label>

                {sizedCategories.map((cat) => {
                  const catSizes = categorySizes[cat.id] || [];
                  const isEnabled = !!enabledCategories[cat.id];
                  const chosenSize = selectedCategories[cat.id];
                  const baseProduct = products.find((p) => p.category === cat.id);

                  return (
                    <div key={cat.id} className={`rounded-xl border-2 transition-all overflow-hidden ${isEnabled ? "border-primary bg-primary/5" : "border-border"}`}>
                      <button onClick={() => toggleCategory(cat.id)} className="w-full flex items-center gap-3 p-3.5 text-left">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isEnabled ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                          {isEnabled && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-lg">{cat.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.nameBn}</p>
                        </div>
                        {baseProduct && <span className="text-sm font-bold text-foreground">৳{baseProduct.price}</span>}
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isEnabled ? "rotate-180" : ""}`} />
                      </button>
                      {isEnabled && (
                        <div className="px-3.5 pb-3.5 pt-0">
                          <p className="text-xs text-muted-foreground mb-2">সাইজ বাছুন: <span className="text-destructive">*</span></p>
                          <div className="flex flex-wrap gap-2">
                            {catSizes.map((size) => (
                              <button
                                key={size.value}
                                onClick={() => selectCategorySize(cat.id, size.value)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                  chosenSize === size.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border text-foreground hover:border-primary/40"
                                }`}
                              >
                                {size.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {crochetProducts.length > 0 && (
                  <div className="rounded-xl border-2 border-border overflow-hidden">
                    <div className="p-3.5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🧶</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Crochet Items</p>
                          <p className="text-xs text-muted-foreground">ক্রোশে আইটেম</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {crochetProducts.map((cp) => (
                          <button
                            key={cp.id}
                            onClick={() => toggleCrochet(cp.id)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                              selectedCrochetProducts.includes(cp.id)
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedCrochetProducts.includes(cp.id) ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                              {selectedCrochetProducts.includes(cp.id) && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                            </div>
                            <span className="flex-1 text-sm text-foreground">{cp.name}</span>
                            <span className="text-sm font-bold text-foreground">৳{cp.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    ✨ অতিরিক্ত আইটেম
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

                {hasAnySelection && (
                  <div className="bg-accent/30 rounded-xl p-4 text-sm space-y-1.5">
                    <p className="font-semibold text-foreground mb-2">💰 মূল্য বিবরণ:</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>📦 প্যাকেজিং চার্জ</span>
                      <span className="text-foreground">৳{giftBoxPackagingCharge}</span>
                    </div>
                    {giftBoxSelection?.categories.map((c) => (
                      <div key={c.categoryId} className="flex justify-between text-muted-foreground">
                        <span>{c.categoryName} ({c.sizeLabel})</span>
                        <span className="text-foreground">৳{c.price}</span>
                      </div>
                    ))}
                    {selectedCrochetProducts.map((pid) => {
                      const p = products.find((pr) => pr.id === pid);
                      return p ? (
                        <div key={pid} className="flex justify-between text-muted-foreground">
                          <span>🧶 {p.name}</span>
                          <span className="text-foreground">৳{p.price}</span>
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
                {isGiftBox
                  ? `Gift Box কার্টে যোগ করুন${hasAnySelection ? ` — ৳${giftBoxTotal}` : ""}`
                  : hasVariants && currentVariant
                    ? `কার্টে যোগ করুন — ৳${currentVariant.price}`
                    : "Add to Cart"}
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
