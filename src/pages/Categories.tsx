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

const Categories = () => {
  const { categories } = useCategories();

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="section-heading mb-3">Gift Categories</h1>
          <p className="text-muted-foreground">Choose from our handmade collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="category-card group aspect-[4/3]"
            >
              <img
                src={categoryImages[cat.id] || productCustom}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-card">
                <span className="text-4xl mb-2 block">{cat.icon}</span>
                <h3 className="font-display font-bold text-xl">{cat.name}</h3>
                <p className="text-sm opacity-80">{cat.nameBn}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
