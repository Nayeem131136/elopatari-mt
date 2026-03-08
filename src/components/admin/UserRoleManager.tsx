import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, ShieldOff, Loader2, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

const UserRoleManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  // Add role by email
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("admin");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, avatar_url, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (profilesRes.data) setUsers(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data as UserRole[]);
    setLoading(false);
  };

  const isAdmin = (userId: string) => roles.some((r) => r.user_id === userId && r.role === "admin");

  const toggleAdmin = async (userId: string) => {
    setTogglingUser(userId);
    if (isAdmin(userId)) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) {
        toast.error("রোল রিমুভ করতে সমস্যা হয়েছে");
      } else {
        setRoles((prev) => prev.filter((r) => !(r.user_id === userId && r.role === "admin")));
        toast.success("অ্যাডমিন রোল রিমুভ করা হয়েছে");
      }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) {
        toast.error("রোল যোগ করতে সমস্যা হয়েছে");
      } else {
        setRoles((prev) => [...prev, { user_id: userId, role: "admin" }]);
        toast.success("অ্যাডমিন রোল যোগ করা হয়েছে! 🛡️");
      }
    }
    setTogglingUser(null);
  };

  const handleAddRoleByEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("ইমেইল দিন");
      return;
    }
    setAdding(true);

    // Find user by email from profiles — we need an edge function or lookup.
    // Since we can't query auth.users, we'll use a server function.
    // For now, search profiles by matching — but profiles don't have email.
    // We need to use the Supabase admin API via edge function.
    
    // Call edge function to find user by email and assign role
    const { data, error } = await supabase.functions.invoke("assign-role", {
      body: { email: newEmail.trim(), role: newRole },
    });

    if (error || data?.error) {
      toast.error(data?.error || "রোল অ্যাসাইন করতে সমস্যা হয়েছে");
    } else {
      toast.success(`${newEmail} কে ${newRole === "admin" ? "অ্যাডমিন" : "ইউজার"} করা হয়েছে! 🎉`);
      setNewEmail("");
      fetchUsersAndRoles();
    }
    setAdding(false);
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(term) ||
      (u.phone || "").includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          ইউজার ম্যানেজমেন্ট ({users.length})
        </h2>
      </div>

      {/* Add Role by Email */}
      <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <UserPlus className="h-4 w-4 text-primary" />
          ইমেইল দিয়ে রোল দিন
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="ইমেইল লিখুন (e.g. user@gmail.com)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
            type="email"
          />
          <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "user")}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </span>
              </SelectItem>
              <SelectItem value="user">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> User
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRoleByEmail} disabled={adding} className="gap-2">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {adding ? "অ্যাসাইন হচ্ছে..." : "রোল দিন"}
          </Button>
        </div>
      </div>

      {/* Search existing users */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">কোনো ইউজার পাওয়া যায়নি</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const userIsAdmin = isAdmin(user.user_id);
            const initials = user.full_name
              ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              : "U";

            return (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={getAvatarUrl(user.avatar_url) || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm truncate">
                      {user.full_name || "নাম নেই"}
                    </span>
                    {userIsAdmin && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/90">
                        <Shield className="h-3 w-3 mr-0.5" /> Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {user.phone && <span>📞 {user.phone}</span>}
                    <span>{new Date(user.created_at).toLocaleDateString("bn-BD")}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={userIsAdmin ? "destructive" : "outline"}
                  className="rounded-full text-xs shrink-0"
                  onClick={() => toggleAdmin(user.user_id)}
                  disabled={togglingUser === user.user_id}
                >
                  {togglingUser === user.user_id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : userIsAdmin ? (
                    <><ShieldOff className="h-3 w-3 mr-1" /> রিমুভ</>
                  ) : (
                    <><Shield className="h-3 w-3 mr-1" /> অ্যাডমিন করুন</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserRoleManager;
