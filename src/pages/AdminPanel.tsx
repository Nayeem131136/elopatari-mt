import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Package, Grid3X3, Settings, Users, Shield } from "lucide-react";
import OrderManager from "@/components/admin/OrderManager";
import ProductManager from "@/components/admin/ProductManager";
import CategoryManager from "@/components/admin/CategoryManager";
import SiteSettingsManager from "@/components/admin/SiteSettingsManager";
import CustomerList from "@/components/admin/CustomerList";
import UserRoleManager from "@/components/admin/UserRoleManager";

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="pt-24 text-center min-h-screen"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="pt-24 pb-16 text-center min-h-screen">
      <AlertTriangle className="h-16 w-16 mx-auto text-destructive/50 mb-4" />
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">অ্যাক্সেস নেই</h2>
      <p className="text-muted-foreground">শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পারবেন।</p>
    </div>
  );

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="section-heading mb-2">🛠️ Admin Panel</h1>
        <p className="text-muted-foreground mb-6">পুরো ওয়েবসাইট ম্যানেজ করুন এখান থেকে</p>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="orders" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <ShoppingBag className="h-3.5 w-3.5" /> অর্ডার
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <Package className="h-3.5 w-3.5" /> প্রোডাক্ট
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <Grid3X3 className="h-3.5 w-3.5" /> ক্যাটাগরি
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <Users className="h-3.5 w-3.5" /> কাস্টমার
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <Settings className="h-3.5 w-3.5" /> সেটিংস
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-card">
              <Shield className="h-3.5 w-3.5" /> রোল
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders"><OrderManager /></TabsContent>
          <TabsContent value="products"><ProductManager /></TabsContent>
          <TabsContent value="categories"><CategoryManager /></TabsContent>
          <TabsContent value="customers"><CustomerList /></TabsContent>
          <TabsContent value="settings"><SiteSettingsManager /></TabsContent>
          <TabsContent value="roles"><UserRoleManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
