"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import type {
  ShopCategory,
  ShopProduct,
} from "./page";

type Props = {
  categories: ShopCategory[];
  products: ShopProduct[];
};

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AllProductsClient({
  categories,
  products,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [sortBy, setSortBy] =
    useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] =
    useState(false);

  const mainCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.is_active &&
          category.parent_id === null
      ),
    [categories]
  );

  const categoryById = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          category,
        ])
      ),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const result = products.filter((product) => {
      if (!product.is_active) {
        return false;
      }

      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (product.sku || "")
          .toLowerCase()
          .includes(normalizedSearch);

      let matchesCategory = true;

      if (selectedCategory !== "all") {
        const productCategory =
          product.category_id
            ? categoryById.get(
                product.category_id
              )
            : undefined;

        matchesCategory =
          product.category_id ===
            selectedCategory ||
          productCategory?.parent_id ===
            selectedCategory;
      }

      const matchesStock =
        !inStockOnly ||
        product.stock_quantity > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            a.retail_price -
            b.retail_price
          );

        case "price-high":
          return (
            b.retail_price -
            a.retail_price
          );

        case "name":
          return a.name.localeCompare(
            b.name
          );

        default:
          return (
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
          );
      }
    });

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sortBy,
    inStockOnly,
    categoryById,
  ]);

  function resetFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("newest");
    setInStockOnly(false);
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    inStockOnly;

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-brand-navy px-4 py-9 text-white sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand-gold/10"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-brand-coral/10"
          aria-hidden="true"
        />

        <div className="container-shop relative">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/70 transition hover:text-brand-gold"
          >
            ← Back to Shop
          </Link>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-xs font-extrabold text-brand-gold">
            <span aria-hidden="true">🎁</span>
            SHREE COLLECTION
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Explore Our Collection
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Discover gifts, toys, party essentials,
            stationery, divine products and more.
          </p>
        </div>
      </section>

      <div className="container-shop px-4 py-7 sm:py-9">
        {/* Search & Filters */}
        <section className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-5">
          {/* Search */}
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-brand-soft-gold text-base"
              aria-hidden="true"
            >
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search gifts, toys, products..."
              aria-label="Search products"
              className="w-full rounded-xl border border-border bg-surface-muted py-3.5 pl-14 pr-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
            />
          </div>

          {/* Categories */}
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold text-text-primary">
                Shop by Category
              </h2>

              {selectedCategory !== "all" && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory("all")
                  }
                  className="text-[11px] font-bold text-brand-coral hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() =>
                  setSelectedCategory("all")
                }
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition ${
                  selectedCategory === "all"
                    ? "border-brand-navy bg-brand-navy text-white shadow-sm"
                    : "border-border bg-surface-muted text-brand-navy hover:border-brand-gold hover:bg-brand-soft-gold"
                }`}
              >
                All Products
              </button>

              {mainCategories.map(
                (category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition ${
                      selectedCategory ===
                      category.id
                        ? "border-brand-navy bg-brand-navy text-white shadow-sm"
                        : "border-border bg-surface-muted text-brand-navy hover:border-brand-gold hover:bg-brand-soft-gold"
                    }`}
                  >
                    {category.name}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Product Header / Sorting */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
              Collection
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-text-primary">
              Our Products
            </h2>

            <p
              aria-live="polite"
              className="mt-1 text-sm text-text-muted"
            >
              Showing{" "}
              <strong className="text-text-primary">
                {filteredProducts.length}
              </strong>{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Stock Filter */}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-bold text-text-primary shadow-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  setInStockOnly(
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-brand-navy"
              />

              In Stock Only
            </label>

            {/* Sort */}
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as SortOption
                )
              }
              className="rounded-xl border border-border bg-white px-3 py-2.5 text-xs font-bold text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name">
                Name: A to Z
              </option>
            </select>
          </div>
        </div>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-text-muted">
              Filters:
            </span>

            {search.trim() && (
              <span className="rounded-full bg-brand-soft-gold px-3 py-1.5 text-[10px] font-bold text-brand-navy">
                Search: "{search.trim()}"
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="rounded-full bg-brand-soft-gold px-3 py-1.5 text-[10px] font-bold text-brand-navy">
                {categoryById.get(
                  selectedCategory
                )?.name || "Category"}
              </span>
            )}

            {inStockOnly && (
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700">
                In Stock
              </span>
            )}

            {sortBy !== "newest" && (
              <span className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-bold text-text-secondary">
                {sortBy === "price-low"
                  ? "Low to High"
                  : sortBy === "price-high"
                    ? "High to Low"
                    : "Name A–Z"}
              </span>
            )}

            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-extrabold text-brand-coral hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-7 overflow-hidden rounded-3xl border border-border bg-white px-5 py-14 text-center shadow-soft">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft-gold text-4xl">
              🔎
            </div>

            <h3 className="mt-5 text-xl font-black text-text-primary">
              No Products Found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              We couldn't find products matching
              your current search or filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-brand-gold px-6 py-3 text-sm font-extrabold text-brand-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-brand"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {filteredProducts.map(
              (product) => {
                const discount =
                  product.compare_at_price &&
                  product.compare_at_price >
                    product.retail_price
                    ? Math.round(
                        ((product.compare_at_price -
                          product.retail_price) /
                          product.compare_at_price) *
                          100
                      )
                    : 0;

                const category =
                  product.category_id
                    ? categoryById.get(
                        product.category_id
                      )
                    : undefined;

                const isOutOfStock =
                  product.stock_quantity <= 0;

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-card"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-square overflow-hidden bg-surface-soft"
                      aria-label={`View ${product.name}`}
                    >
                      {/* Decorative Circles */}
                      <div
                        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 transition-transform duration-500 group-hover:scale-125"
                        aria-hidden="true"
                      />

                      <div
                        className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-brand-coral/5"
                        aria-hidden="true"
                      />

                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className={`relative z-[1] object-contain p-4 transition duration-500 group-hover:scale-105 ${
                            isOutOfStock
                              ? "opacity-60 grayscale-[20%]"
                              : ""
                          }`}
                        />
                      ) : (
                        <div className="relative z-[1] flex h-full items-center justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft">
                            🎁
                          </div>
                        </div>
                      )}

                      {/* Discount */}
                      {discount > 0 && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-coral px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
                          {discount}% OFF
                        </span>
                      )}

                      {/* Out of Stock */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35">
                          <span className="rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-text-primary shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      {category && (
                        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-text-muted">
                          {category.name}
                        </p>
                      )}

                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-brand-navy transition-colors hover:text-brand-coral sm:text-[15px]">
                          {product.name}
                        </h3>
                      </Link>

                      {product.sku && (
                        <p className="mt-1 truncate text-[10px] font-medium text-text-muted">
                          SKU: {product.sku}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-lg font-black tracking-tight text-brand-navy">
                          {formatPrice(
                            product.retail_price
                          )}
                        </span>

                        {product.compare_at_price &&
                          product.compare_at_price >
                            product.retail_price && (
                            <span className="text-xs font-medium text-text-light line-through">
                              {formatPrice(
                                product.compare_at_price
                              )}
                            </span>
                          )}
                      </div>

                      {/* Stock */}
                      <p
                        className={`mt-2 text-[10px] font-bold ${
                          isOutOfStock
                            ? "text-danger"
                            : product.stock_quantity <=
                                5
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {isOutOfStock
                          ? "● Out of Stock"
                          : product.stock_quantity <=
                              5
                            ? `● Only ${product.stock_quantity} left`
                            : "● In Stock"}
                      </p>

                      {/* View Product */}
                      <div className="mt-auto pt-4">
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-navy bg-white px-3 py-2.5 text-xs font-extrabold text-brand-navy transition hover:bg-brand-navy hover:text-white"
                        >
                          View Product
                          <span aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}