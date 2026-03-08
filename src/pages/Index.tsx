import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";

const Index = () => {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />

      {/* Trust banner */}
      <section className="py-16 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: "🎨", title: "Handmade", desc: "Every item crafted with care" },
              { icon: "🚚", title: "Fast Delivery", desc: "All over Bangladesh" },
              { icon: "💝", title: "Gift Wrapping", desc: "Beautiful packaging included" },
              { icon: "⭐", title: "5-Star Reviews", desc: "Loved by our customers" },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-display font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
