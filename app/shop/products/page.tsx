import AllProductsClient from "./AllProductsClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  /*
   * Load categories and products in parallel.
   *
   * Keeping these queries independent avoids waiting for one
   * request to finish before starting the other.
   */
  const [categoriesResult, productsResult] = await Promise.all([
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

  /*
   * Log server-side errors but keep the page usable.
   *
   * This preserves the existing behavior where an empty array
   * is passed to the client if a query fails.
   */
  if (categoriesResult.error) {
    console.error(
      "Unable to load shop categories:",
      categoriesResult.error
    );
  }

  if (productsResult.error) {
    console.error(
      "Unable to load shop products:",
      productsResult.error
    );
  }

  const categories: ShopCategory[] =
    (categoriesResult.data as ShopCategory[] | null) ?? [];

  const products: ShopProduct[] =
    (productsResult.data as ShopProduct[] | null) ?? [];

  return (
    <AllProductsClient
      categories={categories}
      products={products}
    />
  );
}