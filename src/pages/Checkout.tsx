import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getImage } from "@/components/ProductCard";
import { categorySizes, products as allProducts, giftBoxExtras } from "@/data/products";
import { getItemKey, calcGiftBoxPrice } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  User,
  CreditCard,
  PartyPopper,
  Phone,
  MessageCircle,
  MapPin,
  Copy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const deliveryOptions = [
  { id: "dhaka", label: "Inside Dhaka", labelBn: "ঢাকার ভেতরে", charge: 80 },
  { id: "dhaka-sub", label: "Dhaka Sub Area", labelBn: "ঢাকার উপকণ্ঠ", charge: 100 },
  { id: "outside", label: "Outside Dhaka (per kg)", labelBn: "ঢাকার বাইরে (প্রতি কেজি)", charge: 130 },
];

const paymentMethods = [
  { id: "bkash", name: "bKash", number: "01740527078", color: "bg-pink-500" },
  { id: "nagad", name: "Nagad", number: "01740527078", color: "bg-orange-500" },
];

type PaymentType = "delivery-only" | "full";

const steps = [
  { id: 1, label: "Cart Review", labelBn: "কার্ট দেখুন", icon: Package },
  { id: 2, label: "Your Info", labelBn: "আপনার তথ্য", icon: User },
  { id: 3, label: "Payment", labelBn: "পেমেন্ট", icon: CreditCard },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Delivery
  const [delivery, setDelivery] = useState("dhaka");
  const [weight, setWeight] = useState(1);

  // Payment
  const [paymentType, setPaymentType] = useState<PaymentType>("delivery-only");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [senderLast4, setSenderLast4] = useState("");

  // Confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const deliveryCharge = (() => {
    const opt = deliveryOptions.find((d) => d.id === delivery)!;
    if (delivery === "outside") return opt.charge + Math.max(0, weight - 1) * 20;
    return opt.charge;
  })();

  const grandTotal = totalPrice + deliveryCharge;
  const payableAmount = paymentType === "full" ? grandTotal : deliveryCharge;
  const cashOnDelivery = paymentType === "full" ? 0 : totalPrice;

  const validateStep2 = () => {
    if (!name.trim()) { toast.error("নাম লিখুন"); return false; }
    if (!phone.trim() || phone.length < 11) { toast.error("সঠিক ফোন নম্বর দিন"); return false; }
    if (!whatsapp.trim() && !telegram.trim()) { toast.error("WhatsApp অথবা Telegram নম্বর দিন"); return false; }
    if (!address.trim()) { toast.error("ঠিকানা লিখুন"); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!trxId.trim()) { toast.error("Transaction ID দিন"); return false; }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateStep3()) return;
    if (!user) { toast.error("লগইন করুন!"); return; }

    setSubmittingOrder(true);
    try {
      const deliveryOpt = deliveryOptions.find((d) => d.id === delivery);
      const delCharge = delivery === "outside" ? (deliveryOpt?.charge || 130) * weight : (deliveryOpt?.charge || 80);
      const subtotal = totalPrice;
      const total = subtotal + delCharge;
      const amountPaid = paymentType === "full" ? total : delCharge;
      const cod = paymentType === "full" ? 0 : subtotal;

      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: name,
          customer_phone: phone,
          customer_whatsapp: whatsapp || null,
          customer_telegram: telegram || null,
          customer_address: address,
          customer_note: note || null,
          delivery_area: delivery,
          delivery_charge: delCharge,
          subtotal,
          total,
          payment_type: paymentType,
          payment_method: paymentMethod,
          trx_id: `${trxId} (last4: ${senderLast4})`,
          amount_paid: amountPaid,
          cash_on_delivery: cod,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => {
        const price = item.giftBox ? calcGiftBoxPrice(item.giftBox) : (item.variantPrice ?? item.product.price);
        return {
          order_id: orderData.id,
          product_name: item.product.name,
          product_name_bn: item.product.nameBn || null,
          product_category: item.product.category,
          selected_size: item.selectedSize || null,
          unit_price: price,
          quantity: item.quantity,
          total_price: price * item.quantity,
          gift_box_details: item.giftBox ? JSON.parse(JSON.stringify(item.giftBox)) : null,
        };
      });

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setShowConfirmation(true);
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error("অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setSubmittingOrder(false);
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    clearCart();
    navigate("/");
  };

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success("নম্বর কপি হয়েছে!");
  };

  if (items.length === 0 && !showConfirmation) {
    return (
      <div className="pt-24 pb-16 text-center min-h-screen">
        <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">কার্ট খালি!</h2>
        <p className="text-muted-foreground mb-6">পণ্য যোগ করে আবার চেষ্টা করুন</p>
        <Link to="/shop">
          <Button className="rounded-full px-8">Shop এ যান</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10 mt-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  step >= s.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Step 1: Cart Review */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">🛒 কার্ট রিভিউ</h2>
                {items.map((item) => {
                  const { product, quantity, selectedSize, giftBox } = item;
                  const sizeLabel = selectedSize
                    ? categorySizes[product.category]?.find((s) => s.value === selectedSize)?.label
                    : null;
                  const itemPrice = giftBox ? calcGiftBoxPrice(giftBox) : product.price;
                  return (
                    <div key={getItemKey(item)} className="flex gap-4 p-4 bg-card rounded-xl border border-border/50">
                      <img src={getImage(product.image)} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.nameBn}</p>
                        {sizeLabel && (
                          <span className="inline-block text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full mt-0.5">📐 {sizeLabel}</span>
                        )}
                        {giftBox && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {giftBox.categories.map((c) => (
                              <span key={c.categoryId} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">🎁 {c.categoryName} ({c.sizeLabel})</span>
                            ))}
                            {giftBox.crochetProductIds.map((pid) => {
                              const p = allProducts.find((pr) => pr.id === pid);
                              return p ? <span key={pid} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">🧶 {p.name}</span> : null;
                            })}
                            {giftBox.extraIds.map((eid) => {
                              const e = giftBoxExtras.find((ex) => ex.id === eid);
                              return e ? <span key={eid} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{e.emoji} {e.name}</span> : null;
                            })}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">পরিমাণ: {quantity}</p>
                      </div>
                      <p className="font-bold text-foreground whitespace-nowrap">৳{itemPrice * quantity}</p>
                    </div>
                  );
                })}

                {/* Delivery selection */}
                <div className="bg-card rounded-xl border border-border/50 p-5 mt-6">
                  <h3 className="font-display font-semibold text-foreground mb-3">📦 ডেলিভারি এরিয়া</h3>
                  <div className="space-y-2">
                    {deliveryOptions.map((opt) => (
                      <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${delivery === opt.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                        <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="accent-[hsl(var(--primary))]" />
                        <div className="flex-1">
                          <span className="text-foreground font-medium">{opt.labelBn}</span>
                          <span className="text-muted-foreground text-xs ml-2">({opt.label})</span>
                        </div>
                        <span className="font-semibold text-foreground">৳{opt.charge}</span>
                      </label>
                    ))}
                  </div>
                  {delivery === "outside" && (
                    <div className="mt-3 flex items-center gap-2 pl-8">
                      <span className="text-sm text-muted-foreground">ওজন (kg):</span>
                      <Input type="number" min={1} value={weight} onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))} className="w-20 h-9" />
                    </div>
                  )}
                </div>

                <Button className="w-full rounded-full btn-glow mt-4" size="lg" onClick={() => setStep(2)}>
                  পরবর্তী ধাপ <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Customer Info */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">👤 আপনার তথ্য</h2>

                <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
                  <div>
                    <Label className="text-foreground font-semibold mb-1.5 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> নাম <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="আপনার পুরো নাম" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div>
                    <Label className="text-foreground font-semibold mb-1.5 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> ফোন নম্বর <span className="text-destructive">*</span>
                    </Label>
                    <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground font-semibold mb-1.5 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp নম্বর
                      </Label>
                      <Input placeholder="01XXXXXXXXX" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-foreground font-semibold mb-1.5 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-500" /> Telegram নম্বর
                      </Label>
                      <Input placeholder="@username বা নম্বর" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">* WhatsApp অথবা Telegram যেকোনো একটি আবশ্যক</p>

                  <div>
                    <Label className="text-foreground font-semibold mb-1.5 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> সম্পূর্ণ ঠিকানা <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      placeholder="বাসা/ফ্ল্যাট নং, রাস্তা, এলাকা, জেলা"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground font-semibold mb-1.5">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                    <Input placeholder="বিশেষ কোনো নির্দেশনা..." value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> পেছনে
                  </Button>
                  <Button className="rounded-full flex-1 btn-glow" onClick={() => { if (validateStep2()) setStep(3); }}>
                    পরবর্তী ধাপ <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">💳 পেমেন্ট</h2>

                {/* Payment type */}
                <div className="bg-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold text-foreground mb-3">পেমেন্ট অপশন বাছুন</h3>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${paymentType === "delivery-only" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                      <input type="radio" name="payType" checked={paymentType === "delivery-only"} onChange={() => setPaymentType("delivery-only")} className="accent-[hsl(var(--primary))]" />
                      <div className="flex-1">
                        <span className="text-foreground font-medium">শুধু ডেলিভারি চার্জ পে করুন</span>
                        <p className="text-xs text-muted-foreground">বাকি টাকা ক্যাশ অন ডেলিভারিতে দিন</p>
                      </div>
                      <span className="font-bold text-primary">৳{deliveryCharge}</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${paymentType === "full" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                      <input type="radio" name="payType" checked={paymentType === "full"} onChange={() => setPaymentType("full")} className="accent-[hsl(var(--primary))]" />
                      <div className="flex-1">
                        <span className="text-foreground font-medium">সম্পূর্ণ টাকা পে করুন</span>
                        <p className="text-xs text-muted-foreground">এখনই পুরো টাকা পরিশোধ করুন</p>
                      </div>
                      <span className="font-bold text-primary">৳{grandTotal}</span>
                    </label>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold text-foreground mb-3">পেমেন্ট মাধ্যম</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === m.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"}`}
                      >
                        <div className={`w-10 h-10 ${m.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs`}>
                          {m.name[0]}
                        </div>
                        <p className="font-semibold text-foreground">{m.name}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <p className="text-xs text-muted-foreground">{m.number}</p>
                          <button onClick={(e) => { e.stopPropagation(); copyNumber(m.number); }} className="text-primary hover:text-primary/80">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-accent/30 rounded-lg">
                    <p className="text-sm text-foreground font-medium mb-1">📌 পেমেন্ট নির্দেশনা:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>উপরের {paymentMethods.find(m => m.id === paymentMethod)?.name} নম্বরে <strong>৳{payableAmount}</strong> Send Money করুন</li>
                      <li>Transaction ID কপি করুন</li>
                      <li>নিচের বক্সে Transaction ID বসান</li>
                    </ol>
                  </div>

                  <div className="mt-4">
                    <Label className="text-foreground font-semibold mb-1.5">Transaction ID <span className="text-destructive">*</span></Label>
                    <Input placeholder="যেমন: ABC123XYZ" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="font-mono" />
                  </div>

                  <div className="mt-3">
                    <Label className="text-foreground font-semibold mb-1.5">প্রেরকের নম্বরের শেষ ৪ ডিজিট <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="যেমন: 7078"
                      value={senderLast4}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setSenderLast4(val);
                      }}
                      className="font-mono"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full flex-1" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> পেছনে
                  </Button>
                  <Button className="rounded-full flex-1 btn-glow" size="lg" onClick={handleSubmitOrder}>
                    অর্ডার কনফার্ম করুন ✨
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border/50 p-5 sticky top-24">
              <h3 className="font-display font-semibold text-lg text-foreground mb-4">অর্ডার সামারি</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">পণ্যের মূল্য ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-foreground">৳{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-foreground">৳{deliveryCharge}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base">
                  <span className="font-semibold text-foreground">মোট</span>
                  <span className="font-bold text-primary text-lg">৳{grandTotal}</span>
                </div>
                {step === 3 && (
                  <>
                    <div className="border-t border-border pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">এখন পরিশোধ</span>
                        <span className="font-bold text-primary">৳{payableAmount}</span>
                      </div>
                      {cashOnDelivery > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ক্যাশ অন ডেলিভারি</span>
                          <span className="font-semibold text-foreground">৳{cashOnDelivery}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {step >= 2 && name && (
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">নাম:</strong> {name}</p>
                  <p><strong className="text-foreground">ফোন:</strong> {phone}</p>
                  {whatsapp && <p><strong className="text-foreground">WhatsApp:</strong> {whatsapp}</p>}
                  {telegram && <p><strong className="text-foreground">Telegram:</strong> {telegram}</p>}
                  <p><strong className="text-foreground">ঠিকানা:</strong> {address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Order Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
              <PartyPopper className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-display text-foreground">
              অর্ডার সাবমিট হয়েছে! 🎉
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 text-sm leading-relaxed">
              আপনার অর্ডারটি সফলভাবে সাবমিট হয়েছে। আমাদের টিম আপনার Transaction ID যাচাই করবে।
            </DialogDescription>
          </DialogHeader>

          <div className="bg-accent/30 rounded-xl p-4 text-left space-y-3 mt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Transaction যাচাই হচ্ছে</p>
                <p className="text-xs text-muted-foreground">আমরা আপনার TrxID: <span className="font-mono font-bold text-foreground">{trxId}</span> যাচাই করছি</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">আপনাকে যোগাযোগ করা হবে 💬</p>
                <p className="text-xs text-muted-foreground">
                  কনফার্ম হওয়ার পর আপনার {whatsapp ? "WhatsApp" : "Telegram"} নম্বরে যোগাযোগ করা হবে।
                  সেখানে আমরা প্রোডাক্টের জন্য ছবি, নাম, তারিখ, ডিজাইন এবং অন্যান্য তথ্য সংগ্রহ করবো।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">অর্ডার প্রস্তুত হবে</p>
                <p className="text-xs text-muted-foreground">সব তথ্য পাওয়ার পর আমরা আপনার গিফট তৈরি শুরু করবো এবং ডেলিভারি দেবো ❤️</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mt-2">
            <p className="text-xs text-muted-foreground text-center">
              📧 কনফার্মেশন ইমেইল ও মেসেজ পাঠানো হবে। কোনো সমস্যায় আমাদের পেজে মেসেজ করুন।
            </p>
          </div>

          <Button className="w-full rounded-full btn-glow mt-3" onClick={handleConfirmClose}>
            বুঝেছি, ধন্যবাদ! 💖
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
