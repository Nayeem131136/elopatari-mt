import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type Order = {
  id: string;
  customer_name: string;
  status: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  delivery_area: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_name_bn: string | null;
  selected_size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "অপেক্ষায় আছে", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  confirmed: { label: "কনফার্মড ✅", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: CheckCircle },
  processing: { label: "তৈরি হচ্ছে", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Package },
  shipped: { label: "পাঠানো হয়েছে 🚚", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", icon: Truck },
  delivered: { label: "ডেলিভারি সম্পন্ন 🎉", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  cancelled: { label: "বাতিল হয়েছে", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, (payload) => {
        setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o)));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, customer_name, status, subtotal, delivery_charge, total, payment_method, delivery_area, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from("order_items").select("id, product_name, product_name_bn, selected_size, quantity, unit_price, total_price").eq("order_id", orderId);
    if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data }));
  };

  const toggleExpand = (id: string) => {
    if (expandedOrder === id) { setExpandedOrder(null); return; }
    setExpandedOrder(id);
    fetchItems(id);
  };

  const getStepIndex = (status: string) => statusSteps.indexOf(status);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">আমার অর্ডারসমূহ</h1>
            <p className="text-sm text-muted-foreground">{orders.length}টি অর্ডার</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">কোনো অর্ডার নেই</h2>
            <p className="text-muted-foreground mb-6">আপনি এখনো কোনো অর্ডার দেননি</p>
            <button onClick={() => navigate("/shop")} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              <ShoppingBag className="h-4 w-4" /> শপিং করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = statusMap[order.status] || statusMap.pending;
              const StatusIcon = s.icon;
              const isExpanded = expandedOrder === order.id;
              const items = orderItems[order.id] || [];
              const stepIdx = getStepIndex(order.status);
              const isCancelled = order.status === "cancelled";

              return (
                <div key={order.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md"} ${s.bg}`}>
                  {/* Header */}
                  <div className="p-4 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl bg-white/80 shadow-sm`}>
                          <StatusIcon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${s.color}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground text-lg">৳{order.total}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border/30 bg-white/60 backdrop-blur-sm p-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Progress Steps */}
                      {!isCancelled && (
                        <div className="px-2">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-border/50 z-0" />
                            <div className="absolute top-3 left-0 h-0.5 bg-primary z-0 transition-all duration-500" style={{ width: `${(stepIdx / (statusSteps.length - 1)) * 100}%` }} />
                            {statusSteps.map((step, i) => {
                              const reached = i <= stepIdx;
                              const StepIcon = statusMap[step]?.icon || Clock;
                              return (
                                <div key={step} className="flex flex-col items-center z-10">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${reached ? "bg-primary text-primary-foreground shadow-md scale-110" : "bg-muted text-muted-foreground"}`}>
                                    <StepIcon className="h-3 w-3" />
                                  </div>
                                  <span className={`text-[10px] mt-1.5 font-medium ${reached ? "text-primary" : "text-muted-foreground"}`}>
                                    {statusMap[step]?.label.replace(/[✅🚚🎉]/g, "").trim().split(" ")[0]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      {items.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">অর্ডার আইটেম</p>
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-card/80 rounded-xl p-3 border border-border/30">
                              <div>
                                <p className="font-medium text-sm text-foreground">{item.product_name_bn || item.product_name}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                                  {item.selected_size && <span>📐 {item.selected_size}</span>}
                                  <span>x{item.quantity}</span>
                                  <span>৳{item.unit_price}/পিস</span>
                                </div>
                              </div>
                              <span className="font-bold text-foreground">৳{item.total_price}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Summary */}
                      <div className="bg-card/80 rounded-xl p-3 border border-border/30 space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>সাবটোটাল</span><span>৳{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>ডেলিভারি ({order.delivery_area === "dhaka" ? "ঢাকা" : "ঢাকার বাইরে"})</span><span>৳{order.delivery_charge}</span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground border-t border-border/30 pt-1.5">
                          <span>মোট</span><span className="text-primary">৳{order.total}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                          <span>পেমেন্ট</span><span className="uppercase">{order.payment_method}</span>
                        </div>
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

export default MyOrders;
