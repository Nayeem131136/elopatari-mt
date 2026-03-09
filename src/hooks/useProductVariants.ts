import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size_label: string;
  price: number;
  sort_order: number;
}

export const useProductVariants = (productId?: string) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setVariants(data as ProductVariant[]);
        setLoading(false);
      });
  }, [productId]);

  const colors = [...new Set(variants.map((v) => v.color))];
  const getSizesForColor = (color: string) =>
    variants.filter((v) => v.color === color);
  const getVariant = (color: string, sizeLabel: string) =>
    variants.find((v) => v.color === color && v.size_label === sizeLabel);

  return { variants, loading, colors, getSizesForColor, getVariant };
};
