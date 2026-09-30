export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  oldPrice?: number;
  discount?: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  stockQuantity: number;
};