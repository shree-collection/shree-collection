import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types/product";

type RelatedProductsProps = {
  products: Product[];
};

export default function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(0, 4);

  return (
    <section className="border-t border-border bg-surface-soft py-10 sm:py-14">
      <div className="container-shop">
        {/* Section Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm shadow-soft"
                aria-hidden="true"
              >
                ✨
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                You May Also Like
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
              Related Products
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              More products you may love
            </p>
          </div>

          <Link
            href="/shop/products"
            className="group hidden shrink-0 items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-xs font-extrabold text-brand-navy shadow-sm transition hover:border-brand-gold hover:bg-brand-soft-gold sm:inline-flex"
          >
            View All
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* Mobile Products */}
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:hidden">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="w-[190px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Desktop Products */}
        <div className="hidden grid-cols-2 gap-4 sm:grid md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* Mobile View All */}
        <Link
          href="/shop/products"
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-navy bg-white px-4 py-3 text-sm font-extrabold text-brand-navy transition hover:bg-brand-navy hover:text-white sm:hidden"
        >
          View All Products
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}