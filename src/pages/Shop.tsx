import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProductData";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const { products } = useProducts();
  const { categories } = useCategories();

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameBn.includes(q) ||
          p.category.includes(q)
      );
    }
    if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [activeCategory, searchQuery, sortBy, products]);

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="section-heading mb-2">Our Collection</h1>
          <p className="text-muted-foreground">Browse all handmade gifts</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-full bg-card" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap" onClick={() => setSearchParams({})}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap" onClick={() => setSearchParams({ category: cat.id })}>
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm bg-transparent border-none outline-none text-muted-foreground">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted-foreground">No products found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
