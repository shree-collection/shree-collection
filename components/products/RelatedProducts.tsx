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
    <section className="border-t border-slate-200 bg-slate-50 py-8 sm:py-10">
      <div className="container-shop">

        {/* Section Header */}

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-sm
                  shadow-sm
                  ring-1
                  ring-slate-200
                "
                aria-hidden="true"
              >
                ✨
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                You May Also Like
              </p>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-[#172554] sm:text-2xl">
              Related Products
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              More products you may love
            </p>
          </div>

          {/* Desktop View All */}

          <Link
            href="/shop/products"
            className="
              group
              hidden
              shrink-0
              items-center
              gap-1.5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3.5
              py-2
              text-xs
              font-extrabold
              text-[#172554]
              shadow-sm
              transition
              hover:border-[#172554]
              hover:bg-[#172554]
              hover:text-white
              sm:inline-flex
            "
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

        <div
          className="
            no-scrollbar
            -mx-4
            flex
            gap-3
            overflow-x-auto
            px-4
            pb-2
            sm:hidden
          "
        >
          {visibleProducts.map(
            (product) => (
              <div
                key={product.id}
                className="w-[180px] shrink-0"
              >
                <ProductCard
                  product={product}
                />
              </div>
            )
          )}
        </div>

        {/* Desktop Products */}

        <div
          className="
            hidden
            grid-cols-2
            gap-4
            sm:grid
            md:grid-cols-3
            lg:grid-cols-4
            sm:gap-5
          "
        >
          {visibleProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>

        {/* Mobile View All */}

        <Link
          href="/shop/products"
          className="
            mt-5
            flex
            w-full
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-[#172554]
            bg-white
            px-4
            py-3
            text-sm
            font-extrabold
            text-[#172554]
            transition
            hover:bg-[#172554]
            hover:text-white
            sm:hidden
          "
        >
          View All Products

          <span aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}