import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  MessageCircle,
  ExternalLink,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  customer_telegram: string | null;
  customer_address: string;
  customer_note: string | null;
  delivery_area: string;
  delivery_charge: number;
  subtotal: number;
  total: number;
  payment_type: string;
  payment_method: string;
  trx_id: string;
  amount_paid: number;
  cash_on_delivery: number;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_name_bn: string | null;
  product_category: string | null;
  selected_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  gift_box_details: any;
};

const statusOptions = [
  { value: "pending", label: "Pending", labelBn: "অপেক্ষায়", color: "bg-amber-100 text-amber-800", icon: Clock },
  { value: "confirmed", label: "Confirmed", labelBn: "কনফার্মড", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  { value: "processing", label: "Processing", labelBn: "প্রক্রিয়াধীন", color: "bg-purple-100 text-purple-800", icon: Package },
  { value: "shipped", label: "Shipped", labelBn: "শিপড", color: "bg-indigo-100 text-indigo-800", icon: Package },
  { value: "delivered", label: "Delivered", labelBn: "ডেলিভারড", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", labelBn: "বাতিল", color: "bg-red-100 text-red-800", icon: XCircle },
];

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, revenue: 0 });

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data);
      setStats({
        total: data.length,
        pending: data.filter((o) => o.status === "pending").length,
        confirmed: data.filter((o) => o.status === "confirmed" || o.status === "delivered").length,
        revenue: data.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0),
      });
    }
    setLoadingOrders(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data }));
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error("স্ট্যাটাস আপডেট ব্যর্থ");
    } else {
      toast.success(`অর্ডার ${newStatus} করা হয়েছে`);
      fetchOrders();
    }
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, "");
    const fullNum = num.startsWith("0") ? "88" + num : num;
    const msg = encodeURIComponent(
      `আসসালামু আলাইকুম ${name}! 🎁\n\nএলোপাতাড়ি - MT থেকে জানাচ্ছি, আপনার অর্ডারটি কনফার্ম হয়েছে! ✅\n\nপ্রোডাক্টের জন্য আমাদের কিছু তথ্য দরকার:\n📷 ছবি\n📝 নাম/তারিখ/নোট\n🎨 ডিজাইন পছন্দ\n\nদয়া করে এখানে পাঠিয়ে দিন। ধন্যবাদ! 💖`
    );
    return `https://wa.me/${fullNum}?text=${msg}`;
  };

  const getTelegramLink = (telegram: string) => {
    const cleaned = telegram.replace("@", "");
    return `https://t.me/${cleaned}`;
  };

  if (loading) return <div className="pt-24 text-center min-h-screen"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div className="pt-24 pb-16 text-center min-h-screen">
      <AlertTriangle className="h-16 w-16 mx-auto text-destructive/50 mb-4" />
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">অ্যাক্সেস নেই</h2>
      <p className="text-muted-foreground">শুধুমাত্র অ্যাডমিনরা এই পেজ দেখতে পারবেন।</p>
    </div>
  );

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.trx_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.includes(searchTerm);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="section-heading mb-2">🛠️ Admin Panel</h1>
        <p className="text-muted-foreground mb-8">অর্ডার ম্যানেজমেন্ট ও কাস্টমার কন্ট্যাক্ট</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "মোট অর্ডার", value: stats.total, icon: ShoppingBag, color: "text-primary" },
            { label: "পেন্ডিং", value: stats.pending, icon: Clock, color: "text-amber-500" },
            { label: "কনফার্মড", value: stats.confirmed, icon: CheckCircle, color: "text-emerald-500" },
            { label: "মোট আয়", value: `৳${stats.revenue}`, icon: TrendingUp, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম, ফোন বা TrxID দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              className="rounded-full text-xs"
              onClick={() => setStatusFilter("all")}
            >
              সব ({orders.length})
            </Button>
            {statusOptions.slice(0, 4).map((s) => (
              <Button
                key={s.value}
                size="sm"
                variant={statusFilter === s.value ? "default" : "outline"}
                className="rounded-full text-xs"
                onClick={() => setStatusFilter(s.value)}
              >
                {s.labelBn} ({orders.filter((o) => o.status === s.value).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        {loadingOrders ? (
          <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const statusOpt = statusOptions.find((s) => s.value === order.status) || statusOptions[0];
              const isExpanded = expandedOrder === order.id;
              const items = orderItems[order.id] || [];

              return (
                <div key={order.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  {/* Order header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-foreground">{order.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusOpt.color}`}>
                            {statusOpt.labelBn}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>📞 {order.customer_phone}</span>
                          <span>💳 {order.payment_method.toUpperCase()}: {order.trx_id}</span>
                          <span>৳{order.total}</span>
                          <span>{new Date(order.created_at).toLocaleDateString("bn-BD")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* WhatsApp / Telegram quick contact */}
                        {order.customer_whatsapp && (
                          <a
                            href={getWhatsAppLink(order.customer_whatsapp, order.customer_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 transition-colors"
                            title="WhatsApp এ মেসেজ করুন"
                          >
                            <MessageCircle className="h-4 w-4 text-emerald-700" />
                          </a>
                        )}
                        {order.customer_telegram && (
                          <a
                            href={getTelegramLink(order.customer_telegram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="Telegram এ মেসেজ করুন"
                          >
                            <ExternalLink className="h-4 w-4 text-blue-700" />
                          </a>
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4 bg-muted/20 animate-in fade-in duration-200">
                      {/* Customer info */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm">
                          <h4 className="font-semibold text-foreground">👤 কাস্টমার তথ্য</h4>
                          <p><span className="text-muted-foreground">নাম:</span> {order.customer_name}</p>
                          <p><span className="text-muted-foreground">ফোন:</span> {order.customer_phone}</p>
                          {order.customer_whatsapp && <p><span className="text-muted-foreground">WhatsApp:</span> {order.customer_whatsapp}</p>}
                          {order.customer_telegram && <p><span className="text-muted-foreground">Telegram:</span> {order.customer_telegram}</p>}
                          <p><span className="text-muted-foreground">ঠিকানা:</span> {order.customer_address}</p>
                          {order.customer_note && <p><span className="text-muted-foreground">নোট:</span> {order.customer_note}</p>}
                        </div>

                        <div className="space-y-2 text-sm">
                          <h4 className="font-semibold text-foreground">💰 পেমেন্ট তথ্য</h4>
                          <p><span className="text-muted-foreground">মাধ্যম:</span> {order.payment_method.toUpperCase()}</p>
                          <p><span className="text-muted-foreground">TrxID:</span> <span className="font-mono font-bold">{order.trx_id}</span></p>
                          <p><span className="text-muted-foreground">পরিশোধিত:</span> ৳{order.amount_paid}</p>
                          {Number(order.cash_on_delivery) > 0 && (
                            <p><span className="text-muted-foreground">ক্যাশ অন ডেলিভারি:</span> ৳{order.cash_on_delivery}</p>
                          )}
                          <p><span className="text-muted-foreground">ডেলিভারি এরিয়া:</span> {order.delivery_area}</p>
                          <p><span className="text-muted-foreground">ডেলিভারি চার্জ:</span> ৳{order.delivery_charge}</p>
                          <p className="font-bold"><span className="text-muted-foreground">মোট:</span> <span className="text-primary">৳{order.total}</span></p>
                        </div>
                      </div>

                      {/* Order items */}
                      {items.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground text-sm mb-2">📦 অর্ডার আইটেম</h4>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center bg-card p-3 rounded-lg border border-border/50 text-sm">
                                <div>
                                  <p className="font-medium text-foreground">{item.product_name}</p>
                                  <div className="flex gap-2 text-xs text-muted-foreground">
                                    {item.selected_size && <span>📐 {item.selected_size}</span>}
                                    <span>x{item.quantity}</span>
                                  </div>
                                </div>
                                <span className="font-bold text-foreground">৳{item.total_price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div>
                        <h4 className="font-semibold text-foreground text-sm mb-2">🔄 স্ট্যাটাস পরিবর্তন</h4>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((s) => (
                            <Button
                              key={s.value}
                              size="sm"
                              variant={order.status === s.value ? "default" : "outline"}
                              className="rounded-full text-xs"
                              onClick={() => updateStatus(order.id, s.value)}
                              disabled={order.status === s.value}
                            >
                              {s.labelBn}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Contact buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        {order.customer_whatsapp && (
                          <a
                            href={getWhatsAppLink(order.customer_whatsapp, order.customer_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp এ যোগাযোগ
                            </Button>
                          </a>
                        )}
                        {order.customer_telegram && (
                          <a
                            href={getTelegramLink(order.customer_telegram)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="rounded-full">
                              <ExternalLink className="h-4 w-4 mr-1" /> Telegram এ যোগাযোগ
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
