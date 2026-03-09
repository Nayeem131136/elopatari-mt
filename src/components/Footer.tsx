import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎁</span>
              <span className="font-display text-xl font-bold text-foreground">
                এলোপাতাড়ি<span className="text-primary"> - MT</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              হাতে তৈরি উপহার, ভালোবাসায় গড়া। We create unique handmade gifts that bring joy and warmth to every occasion.
            </p>
            <a
              href="https://www.facebook.com/Elopatari.MT143"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Follow us on Facebook →
            </a>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Quick Links</h4>
            <div className="space-y-2">
              {[
                { to: "/shop", label: "Shop" },
                { to: "/categories", label: "Categories" },
                { to: "/about", label: "About Us" },
                { to: "/cart", label: "Cart" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📍 Mohammadpur, Dhaka-1207</p>
              <p>📱 Facebook: Elopatari.MT143</p>
              <p>💌 DM us for custom orders</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by এলোপাতাড়ি - MT © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
