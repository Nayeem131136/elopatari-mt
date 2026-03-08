import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { wishlist } = useCart();
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishedProducts.length === 0) {
    return (
      <div className="pt-24 pb-16 text-center min-h-screen">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Save your favorite items here!</p>
        <Link to="/shop">
          <Button className="rounded-full px-8">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="section-heading mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
