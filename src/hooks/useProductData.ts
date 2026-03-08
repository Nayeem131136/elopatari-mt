import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, categories as fallbackCategories, products as fallbackProducts } from "@/data/products";

export interface DbProduct {
  id: string;
  name: string;
  name_bn: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  rating: number;
  reviews: number;
  description: string | null;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
}

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

// Convert DB product to the Product type used by existing components
export const toProduct = (p: DbProduct): Product => ({
  id: p.id,
  name: p.name,
  nameBn: p.name_bn || "",
  price: p.price,
  originalPrice: p.original_price ?? undefined,
  image: p.image_url || "product-custom",
  category: p.category,
  rating: p.rating,
  reviews: p.reviews,
  description: p.description || "",
  inStock: p.in_stock,
  featured: p.featured,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setProducts(data.map(toProduct));
      setLoading(false);
    });
  }, []);

  return { products, loading };
};

export const useCategories = () => {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) {
        setCategories(data.map((c) => ({
          id: c.slug,
          name: c.name,
          nameBn: c.name_bn || "",
          icon: c.icon || "🎁",
        })));
      }
      setLoading(false);
    });
  }, []);

  return { categories, loading };
};
