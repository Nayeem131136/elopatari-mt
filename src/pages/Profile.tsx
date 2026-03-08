import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User, Phone, MapPin, MessageCircle, Send, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  whatsapp: string | null;
  telegram: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    address: "",
    whatsapp: "",
    telegram: "",
    avatar_url: null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, address, whatsapp, telegram, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
        whatsapp: data.whatsapp || "",
        telegram: data.telegram || "",
        avatar_url: data.avatar_url || null,
      });
    }
    setLoading(false);
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ছবির সাইজ ২MB এর কম হতে হবে");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে");
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("user_id", user.id);

    if (updateError) {
      toast.error("প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: filePath }));
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে! ✨");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name || null,
        phone: profile.phone || null,
        address: profile.address || null,
        whatsapp: profile.whatsapp || null,
        telegram: profile.telegram || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("প্রোফাইল সেভ করতে সমস্যা হয়েছে");
    } else {
      toast.success("প্রোফাইল সফলভাবে আপডেট হয়েছে! 🎉");
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block group">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={avatarUrl || undefined} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mt-4">
            {profile.full_name || "আপনার প্রোফাইল"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
        </div>

        {/* Profile Form */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              ব্যক্তিগত তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> পুরো নাম
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="আপনার নাম লিখুন"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> ফোন নম্বর
                </Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> ঠিকানা
              </Label>
              <Textarea
                id="address"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="আপনার সম্পূর্ণ ঠিকানা লিখুন"
                rows={3}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-sm font-medium">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" /> WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={profile.whatsapp || ""}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="WhatsApp নম্বর"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-1.5 text-sm font-medium">
                  <Send className="h-3.5 w-3.5 text-muted-foreground" /> Telegram
                </Label>
                <Input
                  id="telegram"
                  value={profile.telegram || ""}
                  onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
                  placeholder="Telegram username"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/50 rounded-lg p-3">
                <Mail className="h-4 w-4 shrink-0" />
                <span>ইমেইল: {user?.email} (পরিবর্তনযোগ্য নয়)</span>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "সেভ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
