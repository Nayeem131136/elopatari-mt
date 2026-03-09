import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import VariantManager from "./VariantManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Product {
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

interface Category {
  slug: string;
  name: string;
}

const emptyProduct = {
  name: "",
  name_bn: "",
  price: 0,
  original_price: null as number | null,
  image_url: "",
  category: "",
  rating: 0,
  reviews: 0,
  description: "",
  in_stock: true,
  featured: false,
  sort_order: 0,
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("categories").select("slug, name").order("sort_order"),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyProduct);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      name_bn: p.name_bn || "",
      price: p.price,
      original_price: p.original_price,
      image_url: p.image_url || "",
      category: p.category,
      rating: p.rating,
      reviews: p.reviews,
      description: p.description || "",
      in_stock: p.in_stock,
      featured: p.featured,
      sort_order: p.sort_order,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category) {
      toast.error("নাম ও ক্যাটাগরি দিন");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      name_bn: form.name_bn || null,
      price: form.price,
      original_price: form.original_price || null,
      image_url: form.image_url || null,
      category: form.category,
      rating: form.rating,
      reviews: form.reviews,
      description: form.description || null,
      in_stock: form.in_stock,
      featured: form.featured,
      sort_order: form.sort_order,
    };

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) toast.error("আপডেট ব্যর্থ"); else toast.success("প্রোডাক্ট আপডেট হয়েছে ✅");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error("যোগ করতে সমস্যা"); else toast.success("নতুন প্রোডাক্ট যোগ হয়েছে 🎉");
    }
    setSaving(false);
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই প্রোডাক্ট মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("মুছতে সমস্যা"); else { toast.success("প্রোডাক্ট মুছে ফেলা হয়েছে"); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> প্রোডাক্ট ({products.length})
        </h2>
        <Button onClick={openNew} size="sm" className="gap-2"><Plus className="h-4 w-4" /> নতুন প্রোডাক্ট</Button>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground text-sm">{p.name}</span>
                {p.featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Featured</span>}
                {!p.in_stock && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Out of Stock</span>}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>৳{p.price}</span>
                <span>{p.category}</span>
                <span>⭐ {p.rating}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "প্রোডাক্ট এডিট" : "নতুন প্রোডাক্ট"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="প্রোডাক্টের নাম (বাংলা)" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="মূল্য" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <Input type="number" placeholder="আগের মূল্য (optional)" value={form.original_price ?? ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="ক্যাটাগরি বাছুন" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Image key (e.g. product-frame)" value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              <Input type="number" placeholder="Reviews" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })} />
            </div>
            <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} /> In Stock</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Featured</label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editId ? "আপডেট করুন" : "যোগ করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManager;
