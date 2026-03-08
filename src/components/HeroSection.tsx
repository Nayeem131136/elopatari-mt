import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Handmade gifts collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 right-20 text-4xl animate-float opacity-40 hidden lg:block">✨</div>
      <div className="absolute top-40 right-40 text-3xl animate-float-delay opacity-30 hidden lg:block">💕</div>
      <div className="absolute bottom-32 right-24 text-2xl animate-float opacity-30 hidden lg:block">🌸</div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-block bg-accent/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
            <span className="text-sm font-medium text-accent-foreground">
              🎨 Handmade with Love
            </span>
          </div>

          <h1
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
            style={{ animationDelay: "0.1s" }}
          >
            এলোপাতাড়ি
            <span className="text-primary"> - MT</span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground mb-3 max-w-lg animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            হাতে তৈরি উপহার, ভালোবাসায় গড়া
          </p>
          <p
            className="text-base text-muted-foreground mb-8 max-w-lg animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Unique handmade gifts — photo frames, embroidery art, canvas paintings, crochet items & custom gifts for your loved ones.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/shop">
              <Button size="lg" className="btn-glow rounded-full px-8 font-semibold text-base">
                Shop Now
              </Button>
            </Link>
            <Link to="/categories">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 font-semibold text-base border-primary/30 hover:bg-accent"
              >
                Explore Gifts ✨
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            {[
              { num: "500+", label: "Happy Customers" },
              { num: "100+", label: "Unique Products" },
              { num: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-foreground">{stat.num}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
