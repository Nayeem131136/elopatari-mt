import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useProductData";

import productFrame from "@/assets/product-frame.jpg";
import productEmbroidery from "@/assets/product-embroidery.jpg";
import productCanvas from "@/assets/product-canvas.jpg";
import productCrochet from "@/assets/product-crochet.jpg";
import productCustom from "@/assets/product-custom.jpg";

const categoryImages: Record<string, string> = {
  "photo-frame": productFrame,
  embroidery: productEmbroidery,
  canvas: productCanvas,
  crochet: productCrochet,
  custom: productCustom,
};

const CategoriesSection = () => {
  const { categories } = useCategories();

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-heading mb-3">Shop by Category</h2>
          <p className="text-muted-foreground">Find the perfect handmade gift</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="category-card group aspect-square"
            >
              <img
                src={categoryImages[cat.id] || productCustom}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-card">
                <span className="text-2xl mb-1 block">{cat.icon}</span>
                <h3 className="font-display font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs opacity-80">{cat.nameBn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
