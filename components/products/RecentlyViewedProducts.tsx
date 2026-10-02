"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types/product";

const STORAGE_KEY = "shree-recently-viewed";
const MAX_PRODUCTS = 6;

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  retail_price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
};

type RecentlyViewedProductsProps = {
  currentProductId: string;
};

function mapApiProduct(
  product: ApiProduct
): Product {
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price >
      product.retail_price;

  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! -
          product.retail_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.retail_price,
    oldPrice:
      product.compare_at_price ??
      undefined,
    discount:
      discount > 0
        ? `${discount}% OFF`
        : undefined,
    image: product.image_url || "",
    category: "",
    rating: 0,
    reviews: 0,
    stockQuantity:
      product.stock_quantity,
  };
}

export default function RecentlyViewedProducts({
  currentProductId,
}: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRecentlyViewed() {
      try {
        const stored =
          localStorage.getItem(
            STORAGE_KEY
          );

        if (!stored) {
          if (mounted) {
            setIsLoaded(true);
          }

          return;
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (
          !Array.isArray(parsed) ||
          parsed.length === 0
        ) {
          if (mounted) {
            setIsLoaded(true);
          }

          return;
        }

        const ids = parsed.filter(
          (id): id is string =>
            typeof id === "string" &&
            id.length > 0
        );

        if (ids.length === 0) {
          if (mounted) {
            setIsLoaded(true);
          }

          return;
        }

        const response = await fetch(
          "/api/products",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (mounted) {
            setIsLoaded(true);
          }

          return;
        }

        const data = await response.json();

        const allProducts: ApiProduct[] =
          Array.isArray(data.products)
            ? data.products
            : [];

        const recentProducts: Product[] = [];

        for (const id of ids) {
          if (
            id === currentProductId
          ) {
            continue;
          }

          const product =
            allProducts.find(
              (item) => item.id === id
            );

          if (!product) {
            continue;
          }

          if (!product.is_active) {
            continue;
          }

          if (product.stock_quantity <= 0) {
            continue;
          }

          recentProducts.push(
            mapApiProduct(product)
          );

          if (
            recentProducts.length >=
            MAX_PRODUCTS
          ) {
            break;
          }
        }

        if (mounted) {
          setProducts(recentProducts);
        }
      } catch (error) {
        console.error(
          "Unable to load recently viewed products:",
          error
        );
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    loadRecentlyViewed();

    return () => {
      mounted = false;
    };
  }, [currentProductId]);

  if (
    !isLoaded ||
    products.length === 0
  ) {
    return null;
  }

  const visibleProducts =
    products.slice(0, 4);

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
                👀
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Browsing History
              </p>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-[#172554] sm:text-2xl">
              Recently Viewed
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Products you viewed recently
            </p>
          </div>

          <span
            className="
              hidden
              shrink-0
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-1.5
              text-[11px]
              font-bold
              text-slate-500
              sm:inline-flex
            "
          >
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1
              ? "item"
              : "items"}
          </span>
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
      </div>
    </section>
  );
}