import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { getImage } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const deliveryOptions = [
  { id: "dhaka", label: "Inside Dhaka", labelBn: "ঢাকার ভেতরে", charge: 80 },
  { id: "dhaka-sub", label: "Dhaka Sub Area", labelBn: "ঢাকার উপকণ্ঠ", charge: 100 },
  { id: "outside", label: "Outside Dhaka (per kg)", labelBn: "ঢাকার বাইরে (প্রতি কেজি)", charge: 130 },
];

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [delivery, setDelivery] = useState("dhaka");
  const [weight, setWeight] = useState(1);

  const deliveryCharge = (() => {
    const opt = deliveryOptions.find((d) => d.id === delivery)!;
    if (delivery === "outside") {
      return opt.charge + Math.max(0, weight - 1) * 20;
    }
    return opt.charge;
  })();

  const grandTotal = totalPrice + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 text-center min-h-screen">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some handmade gifts to get started!</p>
        <Link to="/shop">
          <Button className="rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="section-heading mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border/50">
                <img
                  src={getImage(product.image)}
                  alt={product.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.nameBn}</p>
                  <p className="font-bold text-foreground mt-1">৳{product.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded-full">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(product.id, quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(product.id, quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        removeFromCart(product.id);
                        toast("Item removed from cart");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">৳{product.price * quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border/50 p-6 h-fit sticky top-24">
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">৳{totalPrice}</span>
              </div>

              {/* Delivery */}
              <div>
                <p className="text-muted-foreground mb-2">Delivery Area</p>
                <div className="space-y-2">
                  {deliveryOptions.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={delivery === opt.id}
                        onChange={() => setDelivery(opt.id)}
                        className="accent-[hsl(var(--primary))]"
                      />
                      <span className="text-foreground">{opt.label}</span>
                      <span className="text-muted-foreground ml-auto">৳{opt.charge}</span>
                    </label>
                  ))}
                </div>
                {delivery === "outside" && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Weight (kg):</span>
                    <input
                      type="number"
                      min={1}
                      value={weight}
                      onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                      className="w-16 border border-border rounded-md px-2 py-1 text-sm bg-transparent text-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-semibold text-foreground">৳{deliveryCharge}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">৳{grandTotal}</span>
              </div>
            </div>

            <Button
              className="w-full mt-6 rounded-full font-semibold btn-glow"
              size="lg"
              onClick={() => toast.info("Checkout requires authentication. Please connect Lovable Cloud to enable payments.")}
            >
              Proceed to Checkout
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Pay via bKash or Nagad to confirm your order
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
