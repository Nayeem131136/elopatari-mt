import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, Users, MessageCircle, ExternalLink } from "lucide-react";

interface Profile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, "");
    const fullNum = num.startsWith("0") ? "88" + num : num;
    return `https://wa.me/${fullNum}`;
  };

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(term) ||
      (c.phone || "").includes(term) ||
      (c.address || "").toLowerCase().includes(term)
    );
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" /> কাস্টমার লিস্ট ({customers.length})
      </h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">কোনো কাস্টমার পাওয়া যায়নি</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const initials = c.full_name ? c.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
            return (
              <div key={c.user_id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={getAvatarUrl(c.avatar_url) || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground text-sm">{c.full_name || "নাম নেই"}</span>
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    {c.phone && <span>📞 {c.phone}</span>}
                    {c.address && <span>📍 {c.address}</span>}
                    <span>{new Date(c.created_at).toLocaleDateString("bn-BD")}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {c.whatsapp && (
                    <a href={getWhatsAppLink(c.whatsapp, c.full_name || "")} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                    </a>
                  )}
                  {c.telegram && (
                    <a href={`https://t.me/${c.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5 text-blue-700" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
