import AllProductsClient from "./AllProductsClient";
import { createClient } from "@/lib/supabase/server";

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  retail_price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
};

export default async function AllProductsPage() {
  const supabase = await createClient();

  const [
    categoriesResult,
    productsResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id,name,slug,parent_id,is_active,sort_order"
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("products")
      .select(
        "id,name,slug,sku,retail_price,compare_at_price,stock_quantity,image_url,is_active,category_id,created_at"
      )
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (categoriesResult.error) {
    console.error(
      "Unable to load categories:",
      categoriesResult.error
    );
  }

  if (productsResult.error) {
    console.error(
      "Unable to load products:",
      productsResult.error
    );
  }

  return (
    <AllProductsClient
      categories={
        (categoriesResult.data ||
          []) as ShopCategory[]
      }
      products={
        (productsResult.data ||
          []) as ShopProduct[]
      }
    />
  );
}