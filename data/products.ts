export type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Happy Birthday Decoration Set",
    price: 199,
    oldPrice: 299,
    discount: "33% OFF",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    category: "Birthday",
    description:
      "Complete decoration set for birthday parties. Perfect for home, kids parties and special celebrations.",
    rating: 4.8,
    reviews: 120,
  },

  {
    id: 2,
    name: "Birthday Balloon Decoration Kit",
    price: 299,
    oldPrice: 399,
    discount: "25% OFF",
    image:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    category: "Birthday",
    description:
      "Colorful balloon decoration kit for birthday parties and celebrations.",
    rating: 4.7,
    reviews: 85,
  },

  {
    id: 3,
    name: "Birthday Return Gift Set",
    price: 349,
    oldPrice: 449,
    discount: "22% OFF",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    category: "Birthday",
    description:
      "Fun return gift set for kids birthday parties and celebrations.",
    rating: 4.6,
    reviews: 64,
  },

  {
    id: 4,
    name: "Birthday Cake Topper",
    price: 99,
    oldPrice: 149,
    discount: "33% OFF",
    image:
      "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80",
    category: "Birthday",
    description:
      "Beautiful cake topper to make your birthday cake extra special.",
    rating: 4.8,
    reviews: 52,
  },
];