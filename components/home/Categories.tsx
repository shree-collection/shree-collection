import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

export default async function BirthdayProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      sku,
      description,
      retail_price,
      compare_at_price,
      stock_quantity,
      image_url,
      categories (
        name,
        slug
      )
    `)
    .eq("is_active", true)
    .eq("categories.slug", "birthday")
    .order("created_at", {
      ascending: false,
    })
    .limit(8);

  if (error) {
    return (
      <section
        id="products"
        className="container-shop px-4 py-8 sm:py-10"
      >
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-danger"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black"
            aria-hidden="true"
          >
            !
          </span>

          <span>
            Unable to load birthday products.
          </span>
        </div>
      </section>
    );
  }

  const birthdayProducts: Product[] =
    products?.map((product) => {
      const discount =
        product.compare_at_price &&
        product.compare_at_price >
          product.retail_price
          ? `${Math.round(
              ((product.compare_at_price -
                product.retail_price) /
                product.compare_at_price) *
                100
            )}% OFF`
          : undefined;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: Number(product.retail_price),
        oldPrice: product.compare_at_price
          ? Number(product.compare_at_price)
          : undefined,
        discount,
        image: product.image_url || "",
        category: "Birthday",
        rating: 0,
        reviews: 0,
        stockQuantity:
          Number(product.stock_quantity) || 0,
      };
    }) ?? [];

  return (
    <section
      id="products"
      className="container-shop px-4 py-8 sm:py-10 lg:py-12"
    >
      {/* Section Header */}
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft-gold text-lg shadow-sm"
              aria-hidden="true"
            >
              🎂
            </span>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-coral sm:text-xs">
                Celebrate
              </p>

              <h2 className="mt-0.5 text-xl font-black tracking-tight text-text-primary sm:text-2xl lg:text-3xl">
                Birthday & Party
              </h2>
            </div>
          </div>

          <p className="mt-2 pl-11 text-xs leading-5 text-text-secondary sm:text-sm">
            Decorations, balloons, return gifts & more
          </p>
        </div>

        <Link
          href="/categories/birthday"
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold sm:px-4 sm:text-sm"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Products */}
      {birthdayProducts.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-white p-8 text-center shadow-soft sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft-gold text-3xl">
            🎂
          </div>

          <p className="mt-4 text-lg font-black text-text-primary">
            Birthday products coming soon
          </p>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-secondary">
            We're adding more birthday products.
            Please check back soon.
          </p>

          <Link
            href="/shop"
            className="btn-primary mt-5 inline-flex px-5 py-2.5"
          >
            Continue Shopping
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile horizontal product row */}
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:hidden">
            {birthdayProducts.map((product) => (
              <div
                key={product.id}
                className="w-[180px] shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="hidden grid-cols-2 gap-4 sm:grid md:grid-cols-4 lg:gap-5">
            {birthdayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-4 sm:hidden">
            <Link
              href="/categories/birthday"
              className="flex w-full items-center justify-center rounded-xl border border-brand-gold bg-white px-4 py-3 text-sm font-extrabold text-brand-navy transition hover:bg-brand-soft-gold"
            >
              View All Birthday Products
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}