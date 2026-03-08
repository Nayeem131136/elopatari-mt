import { useProducts } from "@/hooks/useProductData";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedProducts = () => {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-heading mb-2">Featured Gifts</h2>
            <p className="text-muted-foreground">Handpicked favorites, made with love</p>
          </div>
          <Link to="/shop" className="hidden md:flex">
            <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full px-8">
              View All Products <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
