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
        className="mx-auto max-w-7xl px-4 py-8"
      >
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
          Unable to load birthday products.
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
      className="mx-auto max-w-7xl px-4 py-8"
    >
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#F43F5E]">
            Celebrate
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-[#172554] sm:text-3xl">
            Birthday & Party
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Decorations, balloons, return gifts & more
          </p>
        </div>

        {/* FIXED VIEW ALL */}
        <Link
          href="/categories/birthday"
          className="shrink-0 text-sm font-extrabold text-[#172554] transition hover:text-[#F43F5E]"
        >
          View All →
        </Link>
      </div>

      {/* Products */}
      {birthdayProducts.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <div className="text-4xl">🎂</div>

          <p className="mt-3 text-lg font-bold text-[#172554]">
            Birthday products coming soon
          </p>

          <p className="mt-1 text-sm text-gray-500">
            We're adding more birthday products.
          </p>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-full bg-[#FFC928] px-5 py-2.5 text-sm font-bold text-[#172554]"
          >
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile horizontal product row */}
          <div className="flex gap-3 overflow-x-auto pb-3 sm:hidden">
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
          <div className="hidden grid-cols-2 gap-3 sm:grid md:grid-cols-4 md:gap-5">
            {birthdayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}