import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import AdminProductsList from "@/components/admin/AdminProductsList";

type Product = {
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

  wholesale_price?: number | null;
  minimum_wholesale_quantity?: number | null;
};

type Category = {
  id: string;
  name: string;
};

type WholesalePrice = {
  product_id: string;
  price: number;
  minimum_quantity: number;
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: categories, error: categoriesError },
    { data: wholesalePrices, error: wholesalePricesError },
  ] = await Promise.all([
    // ----------------------------------------------------
    // Products
    // ----------------------------------------------------
    supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        retail_price,
        compare_at_price,
        stock_quantity,
        image_url,
        is_active,
        category_id,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      }),

    // ----------------------------------------------------
    // Categories
    // ----------------------------------------------------
    supabase
      .from("categories")
      .select("id, name")
      .order("sort_order", {
        ascending: true,
      }),

    // ----------------------------------------------------
    // Wholesale Pricing
    // ----------------------------------------------------
    supabase
      .from("wholesale_prices")
      .select(`
        product_id,
        price,
        minimum_quantity
      `),
  ]);

  // ------------------------------------------------------
  // Combine products + wholesale pricing
  // ------------------------------------------------------

  const wholesaleMap = new Map<
    string,
    WholesalePrice
  >();

  (wholesalePrices || []).forEach(
    (wholesale) => {
      wholesaleMap.set(
        wholesale.product_id,
        wholesale as WholesalePrice
      );
    }
  );

  const productList: Product[] = (
    products || []
  ).map((product) => {
    const wholesale =
      wholesaleMap.get(product.id);

    return {
      ...(product as Product),

      wholesale_price:
        wholesale?.price ?? null,

      minimum_wholesale_quantity:
        wholesale?.minimum_quantity ?? null,
    };
  });

  const categoryList =
    (categories || []) as Category[];

  // ------------------------------------------------------
  // Errors
  // ------------------------------------------------------

  const combinedProductsError =
    productsError?.message ||
    wholesalePricesError?.message ||
    null;

  // ------------------------------------------------------
  // Summary
  // ------------------------------------------------------

  const totalProducts =
    productList.length;

  const activeProducts =
    productList.filter(
      (product) => product.is_active
    ).length;

  const outOfStockProducts =
    productList.filter(
      (product) =>
        product.stock_quantity <= 0
    ).length;

  const wholesaleProducts =
    productList.filter(
      (product) =>
        product.wholesale_price !== null &&
        product.wholesale_price !== undefined
    ).length;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                  Products
                </h1>

                <span className="rounded-full bg-brand-navy px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                  Catalogue
                </span>
              </div>

              <p className="mt-2 text-sm text-text-muted">
                Manage your store products, pricing,
                stock and wholesale settings.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
            >
              <span className="text-base">
                +
              </span>
              Add Product
            </Link>
          </div>
        </header>

        {/* =====================================================
            Summary
        ====================================================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Total Products
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              {totalProducts}
            </p>

            <p className="mt-1 text-[10px] text-text-muted">
              Catalogue items
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Active
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-600">
              {activeProducts}
            </p>

            <p className="mt-1 text-[10px] text-text-muted">
              Visible products
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Out of Stock
            </p>

            <p className="mt-1 text-2xl font-black text-brand-coral">
              {outOfStockProducts}
            </p>

            <p className="mt-1 text-[10px] text-text-muted">
              Need attention
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Wholesale
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              {wholesaleProducts}
            </p>

            <p className="mt-1 text-[10px] text-text-muted">
              Wholesale pricing
            </p>
          </div>
        </div>

        {/* =====================================================
            Database Error
        ====================================================== */}
        {combinedProductsError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <div>
                <p className="text-sm font-black text-red-700">
                  Product data could not be loaded completely
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {combinedProductsError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            Product List
        ====================================================== */}
        <AdminProductsList
          products={productList}
          categories={categoryList}
          productsError={
            combinedProductsError
          }
        />

        {/* =====================================================
            Bottom CTA
        ====================================================== */}
        {totalProducts > 0 && (
          <div className="mt-6 overflow-hidden rounded-3xl bg-brand-navy p-6 text-white sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold text-sm text-brand-navy">
                    +
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-gold">
                    Catalogue
                  </span>
                </div>

                <h2 className="text-lg font-black">
                  Add another product
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
                  Add new gifts, toys, stationery,
                  decorations and other products to your
                  store catalogue.
                </p>
              </div>

              <Link
                href="/admin/products/new"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-black text-brand-navy transition hover:bg-yellow-300"
              >
                <span className="text-base">
                  +
                </span>
                Add Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}