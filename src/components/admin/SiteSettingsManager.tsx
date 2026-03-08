import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Settings, Save } from "lucide-react";
import { toast } from "sonner";

const settingsConfig = [
  { key: "site_name", label: "সাইটের নাম", placeholder: "এলোপাতাড়ি - MT" },
  { key: "site_tagline", label: "ট্যাগলাইন", placeholder: "হাতে তৈরি উপহার, ভালোবাসায় গড়া" },
  { key: "hero_subtitle", label: "হিরো সাবটাইটেল", placeholder: "Hero section subtitle" },
  { key: "phone", label: "ফোন নম্বর", placeholder: "01XXXXXXXXX" },
  { key: "whatsapp", label: "WhatsApp নম্বর", placeholder: "01XXXXXXXXX" },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/..." },
  { key: "instagram_url", label: "Instagram URL", placeholder: "https://instagram.com/..." },
  { key: "address", label: "ঠিকানা", placeholder: "Dhaka, Bangladesh" },
];

const SiteSettingsManager = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((d) => { map[d.key] = d.value || ""; });
      setSettings(map);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = settingsConfig.map((s) =>
      supabase.from("site_settings").upsert(
        { key: s.key, value: settings[s.key] || "" },
        { onConflict: "key" }
      )
    );
    await Promise.all(promises);
    toast.success("সেটিংস সেভ হয়েছে ✅");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" /> সাইট সেটিংস
      </h2>

      <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
        {settingsConfig.map((s) => (
          <div key={s.key}>
            <label className="text-sm font-medium text-foreground mb-1 block">{s.label}</label>
            <Input
              placeholder={s.placeholder}
              value={settings[s.key] || ""}
              onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })}
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          সেভ করুন
        </Button>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
