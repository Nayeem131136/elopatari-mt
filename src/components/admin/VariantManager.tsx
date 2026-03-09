import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Variant {
  id?: string;
  color: string;
  size_label: string;
  price: number;
  sort_order: number;
}

const predefinedSizes = {
  rectangular: [
    "8/6 inch", "10/8 inch", "10/9 inch", "11/9 inch",
    "12/8 inch", "13/9 inch", "12/10 inch",
  ],
  square: [
    "2.5/2.5 inch", "4/4 inch", "5/5 inch", "6/6 inch",
    "8/8 inch", "10/10 inch", "12/12 inch",
  ],
  embroidery: [
    "5 inch", "6 inch", "7 inch", "8 inch", "9 inch", 
    "10 inch", "11 inch", "12 inch", "13 inch", "14 inch", "15 inch"
  ]
};

const allSizes = [...predefinedSizes.rectangular, ...predefinedSizes.square];

interface Props {
  productId: string;
}

const VariantManager = ({ productId }: Props) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    if (data) setVariants(data as Variant[]);
    setLoading(false);
  };

  const addRow = () => {
    setVariants((prev) => [
      ...prev,
      { color: "black", size_label: "", price: 0, sort_order: prev.length },
    ]);
  };

  const removeRow = async (index: number) => {
    const v = variants[index];
    if (v.id) {
      await supabase.from("product_variants").delete().eq("id", v.id);
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof Variant, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSaveAll = async () => {
    const invalid = variants.find((v) => !v.size_label || v.price <= 0);
    if (invalid) {
      toast.error("সব ভ্যারিয়েন্টে সাইজ ও দাম দিন");
      return;
    }
    setSaving(true);

    // Delete all existing then re-insert
    await supabase.from("product_variants").delete().eq("product_id", productId);

    const rows = variants.map((v, i) => ({
      product_id: productId,
      color: v.color,
      size_label: v.size_label,
      price: v.price,
      sort_order: i,
    }));

    if (rows.length > 0) {
      const { error } = await supabase.from("product_variants").insert(rows);
      if (error) {
        toast.error("ভ্যারিয়েন্ট সেভ করতে সমস্যা");
        console.error(error);
      } else {
        toast.success("ভ্যারিয়েন্ট সেভ হয়েছে ✅");
        fetchVariants();
      }
    } else {
      toast.success("সব ভ্যারিয়েন্ট মুছে ফেলা হয়েছে");
    }
    setSaving(false);
  };

  const addBulkPreset = (color: string, sizeGroup: "rectangular" | "square" | "embroidery") => {
    const sizes = predefinedSizes[sizeGroup];
    const newVariants: Variant[] = sizes
      .filter((s) => !variants.some((v) => v.color === color && v.size_label === s))
      .map((s, i) => ({
        color,
        size_label: s,
        price: 0,
        sort_order: variants.length + i,
      }));
    setVariants((prev) => [...prev, ...newVariants]);
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  return (
    <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">🎨 কালার ও সাইজ ভ্যারিয়েন্ট ({variants.length})</h3>
        <Button onClick={addRow} size="sm" variant="outline" className="gap-1 text-xs">
          <Plus className="h-3 w-3" /> নতুন সারি
        </Button>
      </div>

      {/* Bulk add buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" className="text-xs" onClick={() => addBulkPreset("black", "rectangular")}>
          + Black Rectangular
        </Button>
        <Button size="sm" variant="secondary" className="text-xs" onClick={() => addBulkPreset("white", "rectangular")}>
          + White Rectangular
        </Button>
        <Button size="sm" variant="secondary" className="text-xs" onClick={() => addBulkPreset("black", "square")}>
          + Black Square
        </Button>
        <Button size="sm" variant="secondary" className="text-xs" onClick={() => addBulkPreset("white", "square")}>
          + White Square
        </Button>
        <Button size="sm" variant="secondary" className="text-xs" onClick={() => addBulkPreset("Default", "embroidery")}>
          + Embroidery Sizes
        </Button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">কোনো ভ্যারিয়েন্ট নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {variants.map((v, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/50">
            <Select value={v.color} onValueChange={(val) => updateRow(i, "color", val)}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">⬛ Black</SelectItem>
                <SelectItem value="white">⬜ White</SelectItem>
                <SelectItem value="Default">🎨 Default (No color)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={v.size_label} onValueChange={(val) => updateRow(i, "size_label", val)}>
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="সাইজ বাছুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__separator_rect" disabled>— Rectangular —</SelectItem>
                {predefinedSizes.rectangular.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                <SelectItem value="__separator_sq" disabled>— Square —</SelectItem>
                {predefinedSizes.square.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="৳"
              value={v.price || ""}
              onChange={(e) => updateRow(i, "price", Number(e.target.value))}
              className="w-24 h-8 text-xs"
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 text-destructive p-0" onClick={() => removeRow(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {variants.length > 0 && (
        <Button onClick={handleSaveAll} disabled={saving} className="w-full text-sm" size="sm">
          {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
          সব ভ্যারিয়েন্ট সেভ করুন
        </Button>
      )}
    </div>
  );
};

export default VariantManager;
