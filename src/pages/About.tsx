import { Heart, Palette, Gift, Truck } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const About = () => {
  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="section-heading mb-4">About এলোপাতাড়ি - MT</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            আমরা হাতে তৈরি উপহার বানাই, ভালোবাসায় গড়া। We are a small creative gift shop from Dhaka, Bangladesh, crafting unique handmade gifts that bring joy and warmth to every occasion.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden mb-16 max-w-4xl mx-auto">
          <img src={heroBanner} alt="Our handmade collection" className="w-full h-64 md:h-96 object-cover" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Heart, title: "Made with Love", desc: "Every piece is crafted by hand with care and attention" },
            { icon: Palette, title: "Unique Designs", desc: "Original creative designs you won't find anywhere else" },
            { icon: Gift, title: "Custom Orders", desc: "Personalize gifts with names, photos, and messages" },
            { icon: Truck, title: "Nationwide Delivery", desc: "We deliver all across Bangladesh" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent flex items-center justify-center mb-3">
                <item.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="https://www.facebook.com/Elopatari.MT143"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
          >
            Follow us on Facebook →
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
