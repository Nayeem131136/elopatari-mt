export interface Product {
  id: string;
  name: string;
  nameBn: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  featured: boolean;
}

export interface CustomizationField {
  key: string;
  label: string;
  labelBn: string;
  type: "text" | "textarea" | "date" | "file" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  customizationFields: CustomizationField[];
}

const commonFields: CustomizationField[] = [
  { key: "customerName", label: "Name on Product", labelBn: "প্রোডাক্টে নাম", type: "text", required: true, placeholder: "e.g. Rahima" },
  { key: "date", label: "Date / Occasion", labelBn: "তারিখ / উপলক্ষ", type: "text", placeholder: "e.g. 14 Feb, Birthday" },
  { key: "design", label: "Design Preference", labelBn: "ডিজাইন পছন্দ", type: "select", options: ["Floral", "Minimal", "Vintage", "Cute/Cartoon", "Custom (describe in notes)"] },
  { key: "note", label: "Special Note / Message", labelBn: "বিশেষ নোট / মেসেজ", type: "textarea", placeholder: "Any message or instruction..." },
];

export const categories: Category[] = [
  {
    id: "photo-frame",
    name: "Photo Frame",
    nameBn: "ফটো ফ্রেম",
    icon: "🖼️",
    customizationFields: [
      { key: "photo", label: "Your Photo", labelBn: "আপনার ছবি", type: "file", required: true },
      ...commonFields,
    ],
  },
  {
    id: "embroidery",
    name: "Embroidery Hoop Art",
    nameBn: "এমব্রয়ডারি হুপ আর্ট",
    icon: "🧵",
    customizationFields: [...commonFields],
  },
  {
    id: "canvas",
    name: "Canvas Art",
    nameBn: "ক্যানভাস আর্ট",
    icon: "🎨",
    customizationFields: [
      { key: "photo", label: "Reference Photo (optional)", labelBn: "রেফারেন্স ছবি (ঐচ্ছিক)", type: "file" },
      ...commonFields,
    ],
  },
  {
    id: "crochet",
    name: "Crochet",
    nameBn: "ক্রোশে",
    icon: "🧶",
    customizationFields: [
      { key: "color", label: "Preferred Color", labelBn: "পছন্দের রঙ", type: "text", placeholder: "e.g. Pink, Blue" },
      ...commonFields,
    ],
  },
  {
    id: "custom",
    name: "Custom Gifts",
    nameBn: "কাস্টম গিফট",
    icon: "🎁",
    customizationFields: [
      { key: "photo", label: "Your Photo", labelBn: "আপনার ছবি", type: "file" },
      ...commonFields,
    ],
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Floral Photo Frame",
    nameBn: "ফুলের ফটো ফ্রেম",
    price: 450,
    originalPrice: 550,
    image: "product-frame",
    category: "photo-frame",
    rating: 4.8,
    reviews: 24,
    description: "Beautiful handmade photo frame decorated with dried flowers and lace. Perfect for preserving your precious memories.",
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Floral Embroidery Hoop",
    nameBn: "ফুলের এমব্রয়ডারি হুপ",
    price: 650,
    image: "product-embroidery",
    category: "embroidery",
    rating: 4.9,
    reviews: 31,
    description: "Hand-stitched floral embroidery hoop art with delicate flower patterns. A stunning wall decoration.",
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Flower Canvas Painting",
    nameBn: "ফুলের ক্যানভাস পেইন্টিং",
    price: 800,
    originalPrice: 950,
    image: "product-canvas",
    category: "canvas",
    rating: 4.7,
    reviews: 18,
    description: "Handpainted canvas art featuring beautiful pink flowers. Each piece is unique and made with love.",
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Crochet Teddy Bear",
    nameBn: "ক্রোশে টেডি বিয়ার",
    price: 550,
    image: "product-crochet",
    category: "crochet",
    rating: 5.0,
    reviews: 42,
    description: "Adorable handmade crochet amigurumi teddy bear. Soft, safe, and perfect as a gift for loved ones.",
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Custom Gift Box",
    nameBn: "কাস্টম গিফট বক্স",
    price: 1200,
    originalPrice: 1400,
    image: "product-custom",
    category: "custom",
    rating: 4.6,
    reviews: 15,
    description: "Curated gift box with handmade items, personalized with your message. Perfect for any occasion.",
    inStock: true,
    featured: true,
  },
  {
    id: "6",
    name: "Mini Embroidery Art",
    nameBn: "মিনি এমব্রয়ডারি আর্ট",
    price: 350,
    image: "product-embroidery",
    category: "embroidery",
    rating: 4.5,
    reviews: 12,
    description: "Small embroidery hoop perfect for desk decoration or gifting.",
    inStock: true,
    featured: false,
  },
  {
    id: "7",
    name: "Crochet Flower Bouquet",
    nameBn: "ক্রোশে ফুলের তোড়া",
    price: 750,
    image: "product-crochet",
    category: "crochet",
    rating: 4.8,
    reviews: 20,
    description: "Everlasting crochet flower bouquet that never wilts. A unique handmade gift.",
    inStock: true,
    featured: false,
  },
  {
    id: "8",
    name: "Personalized Canvas",
    nameBn: "পার্সোনালাইজড ক্যানভাস",
    price: 900,
    image: "product-canvas",
    category: "canvas",
    rating: 4.9,
    reviews: 28,
    description: "Custom canvas painting with your name or message. Hand-lettered and beautifully designed.",
    inStock: false,
    featured: false,
  },
];

export const getProductImage = (imageKey: string) => {
  const images: Record<string, string> = {
    "product-frame": "/src/assets/product-frame.jpg",
    "product-embroidery": "/src/assets/product-embroidery.jpg",
    "product-canvas": "/src/assets/product-canvas.jpg",
    "product-crochet": "/src/assets/product-crochet.jpg",
    "product-custom": "/src/assets/product-custom.jpg",
  };
  return images[imageKey] || images["product-custom"];
};
