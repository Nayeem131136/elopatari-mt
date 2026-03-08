import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Grid3X3 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

const emptyForm = { slug: "", name: "", name_bn: "", icon: "", image_url: "", sort_order: 0 };

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data);
    setLoading(false);
  };

  const openNew = () => { setEditId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ slug: c.slug, name: c.name, name_bn: c.name_bn || "", icon: c.icon || "", image_url: c.image_url || "", sort_order: c.sort_order });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.name) { toast.error("Slug ও নাম দিন"); return; }
    setSaving(true);
    const payload = {
      slug: form.slug,
      name: form.name,
      name_bn: form.name_bn || null,
      icon: form.icon || null,
      image_url: form.image_url || null,
      sort_order: form.sort_order,
    };
    if (editId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editId);
      if (error) toast.error("আপডেট ব্যর্থ"); else toast.success("ক্যাটাগরি আপডেট হয়েছে ✅");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast.error("যোগ করতে সমস্যা: " + error.message); else toast.success("নতুন ক্যাটাগরি যোগ হয়েছে 🎉");
    }
    setSaving(false);
    setOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই ক্যাটাগরি মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error("মুছতে সমস্যা"); else { toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে"); fetchCategories(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" /> ক্যাটাগরি ({categories.length})
        </h2>
        <Button onClick={openNew} size="sm" className="gap-2"><Plus className="h-4 w-4" /> নতুন ক্যাটাগরি</Button>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
            <span className="text-xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground text-sm">{c.name}</span>
              <div className="text-xs text-muted-foreground">{c.name_bn} • {c.slug}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "ক্যাটাগরি এডিট" : "নতুন ক্যাটাগরি"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Slug (e.g. photo-frame)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="নাম (বাংলা)" value={form.name_bn} onChange={(e) => setForm({ ...form, name_bn: e.target.value })} />
            <Input placeholder="Icon Emoji (e.g. 🖼️)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <Input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
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

export default CategoryManager;
