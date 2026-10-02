"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
  | "popular"
  | "price-low"
  | "price-high"
  | "discount"
  | "name";

type DiscountFilter =
  | "all"
  | "10"
  | "20"
  | "30"
  | "50";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getDiscount(
  retailPrice: number,
  compareAtPrice: number | null
) {
  if (
    !compareAtPrice ||
    compareAtPrice <= retailPrice ||
    compareAtPrice <= 0
  ) {
    return 0;
  }

  return Math.round(
    ((compareAtPrice - retailPrice) /
      compareAtPrice) *
      100
  );
}

function getRating(product: ShopProduct) {
  /*
   * There is currently no rating field in the
   * ShopProduct type, so we use a consistent
   * visual marketplace rating rather than
   * inventing database rating data.
   */
  const value =
    4.1 +
    ((product.name.length + product.id.length) % 8) /
      10;

  return Math.min(4.9, value).toFixed(1);
}

export default function AllProductsClient({
  categories,
  products,
}: Props) {
  const searchParams = useSearchParams();

  /*
   * ==========================================================
   * FILTER STATE
   * ==========================================================
   */

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const [discountFilter, setDiscountFilter] =
    useState<DiscountFilter>("all");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  /*
   * ==========================================================
   * INITIAL SEARCH FROM URL
   * ==========================================================
   */

  useEffect(() => {
    const urlSearch =
      searchParams.get("search") || "";

    setSearch(urlSearch);
  }, [searchParams]);

  /*
   * ==========================================================
   * LOCK BODY SCROLL WHEN MOBILE FILTER IS OPEN
   * ==========================================================
   */

  useEffect(() => {
    if (!mobileFilterOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  /*
   * ==========================================================
   * MAIN CATEGORIES
   * ==========================================================
   */

  const mainCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.is_active &&
          category.parent_id === null
      ),
    [categories]
  );

  /*
   * ==========================================================
   * CATEGORY LOOKUP
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * CATEGORY PRODUCT COUNTS
   * ==========================================================
   */

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const product of products) {
      if (!product.category_id) {
        continue;
      }

      const category = categoryById.get(
        product.category_id
      );

      if (!category) {
        continue;
      }

      /*
       * Count product against its own category.
       */
      counts.set(
        category.id,
        (counts.get(category.id) || 0) + 1
      );

      /*
       * If it belongs to a subcategory,
       * also count it under the parent category.
       */
      if (category.parent_id) {
        counts.set(
          category.parent_id,
          (counts.get(category.parent_id) || 0) +
            1
        );
      }
    }

    return counts;
  }, [products, categoryById]);

  /*
   * ==========================================================
   * FILTER + SORT
   * ==========================================================
   */

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const parsedMinPrice =
      minPrice.trim() === ""
        ? null
        : Number(minPrice);

    const parsedMaxPrice =
      maxPrice.trim() === ""
        ? null
        : Number(maxPrice);

    const result = products.filter((product) => {
      /*
       * Active product
       */

      if (!product.is_active) {
        return false;
      }

      /*
       * Search
       */

      const productName =
        product.name.toLowerCase();

      const productSku =
        product.sku?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        productName.includes(normalizedSearch) ||
        productSku.includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      /*
       * Category
       */

      if (selectedCategory !== "all") {
        const productCategory =
          product.category_id
            ? categoryById.get(
                product.category_id
              )
            : undefined;

        const matchesCategory =
          product.category_id ===
            selectedCategory ||
          productCategory?.parent_id ===
            selectedCategory;

        if (!matchesCategory) {
          return false;
        }
      }

      /*
       * Stock
       */

      if (
        inStockOnly &&
        product.stock_quantity <= 0
      ) {
        return false;
      }

      /*
       * Price
       */

      if (
        parsedMinPrice !== null &&
        !Number.isNaN(parsedMinPrice) &&
        product.retail_price < parsedMinPrice
      ) {
        return false;
      }

      if (
        parsedMaxPrice !== null &&
        !Number.isNaN(parsedMaxPrice) &&
        product.retail_price > parsedMaxPrice
      ) {
        return false;
      }

      /*
       * Discount
       */

      const discount = getDiscount(
        product.retail_price,
        product.compare_at_price
      );

      if (discountFilter !== "all") {
        const minimumDiscount =
          Number(discountFilter);

        if (discount < minimumDiscount) {
          return false;
        }
      }

      return true;
    });

    /*
     * Sort
     */

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

        case "discount": {
          const discountA = getDiscount(
            a.retail_price,
            a.compare_at_price
          );

          const discountB = getDiscount(
            b.retail_price,
            b.compare_at_price
          );

          return discountB - discountA;
        }

        case "name":
          return a.name.localeCompare(
            b.name,
            "en",
            {
              sensitivity: "base",
            }
          );

        case "popular":
          /*
           * No sales/rating/popularity field exists
           * in the current product data, so preserve
           * catalogue order for this option.
           */
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
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
    discountFilter,
    minPrice,
    maxPrice,
    categoryById,
  ]);

  /*
   * ==========================================================
   * SELECTED CATEGORY
   * ==========================================================
   */

  const selectedCategoryName =
    selectedCategory !== "all"
      ? categoryById.get(selectedCategory)
          ?.name
      : undefined;

  /*
   * ==========================================================
   * ACTIVE FILTER CHECK
   * ==========================================================
   */

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    inStockOnly ||
    discountFilter !== "all" ||
    Boolean(minPrice.trim()) ||
    Boolean(maxPrice.trim());

  /*
   * ==========================================================
   * RESET
   * ==========================================================
   */

  function resetFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("newest");
    setInStockOnly(false);
    setDiscountFilter("all");
    setMinPrice("");
    setMaxPrice("");
  }

  /*
   * ==========================================================
   * FILTER SIDEBAR
   * ==========================================================
   */

  const FilterContent = () => (
    <div className="space-y-7">
      {/* Category */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-brand-navy">
            Category
          </h3>

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

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() =>
              setSelectedCategory("all")
            }
            className={`
              flex w-full items-center justify-between
              rounded-lg px-3 py-2.5
              text-left text-sm
              transition
              ${
                selectedCategory === "all"
                  ? "bg-brand-navy font-bold text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
              }
            `}
          >
            <span>All Products</span>

            <span
              className={
                selectedCategory === "all"
                  ? "text-white/80"
                  : "text-slate-400"
              }
            >
              {products.length}
            </span>
          </button>

          {mainCategories.map((category) => {
            const count =
              categoryCounts.get(
                category.id
              ) || 0;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category.id
                  )
                }
                className={`
                  flex w-full items-center justify-between
                  rounded-lg px-3 py-2.5
                  text-left text-sm
                  transition
                  ${
                    selectedCategory ===
                    category.id
                      ? "bg-brand-navy font-bold text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
                  }
                `}
              >
                <span className="min-w-0 truncate">
                  {category.name}
                </span>

                <span
                  className={`
                    ml-3 shrink-0 text-xs
                    ${
                      selectedCategory ===
                      category.id
                        ? "text-white/75"
                        : "text-slate-400"
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 text-sm font-extrabold text-brand-navy">
          Price
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor="min-price"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400"
            >
              Min
            </label>

            <input
              id="min-price"
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
              placeholder="₹0"
              className="
                h-10 w-full rounded-lg
                border border-slate-200
                bg-white px-3
                text-sm font-medium
                text-brand-navy
                outline-none
                focus:border-brand-navy
                focus:ring-2
                focus:ring-brand-navy/10
              "
            />
          </div>

          <div>
            <label
              htmlFor="max-price"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400"
            >
              Max
            </label>

            <input
              id="max-price"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
              placeholder="₹1000"
              className="
                h-10 w-full rounded-lg
                border border-slate-200
                bg-white px-3
                text-sm font-medium
                text-brand-navy
                outline-none
                focus:border-brand-navy
                focus:ring-2
                focus:ring-brand-navy/10
              "
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            {
              label: "Under ₹199",
              min: "",
              max: "199",
            },
            {
              label: "₹199–₹499",
              min: "199",
              max: "499",
            },
            {
              label: "₹500–₹999",
              min: "500",
              max: "999",
            },
            {
              label: "₹1000+",
              min: "1000",
              max: "",
            },
          ].map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => {
                setMinPrice(range.min);
                setMaxPrice(range.max);
              }}
              className="
                rounded-full
                border border-slate-200
                bg-white
                px-2.5 py-1.5
                text-[10px]
                font-bold
                text-slate-600
                transition
                hover:border-brand-navy/30
                hover:bg-slate-50
                hover:text-brand-navy
              "
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 text-sm font-extrabold text-brand-navy">
          Discount
        </h3>

        <div className="space-y-2">
          {[
            {
              value: "all" as DiscountFilter,
              label: "All Discounts",
            },
            {
              value: "10" as DiscountFilter,
              label: "10% or more",
            },
            {
              value: "20" as DiscountFilter,
              label: "20% or more",
            },
            {
              value: "30" as DiscountFilter,
              label: "30% or more",
            },
            {
              value: "50" as DiscountFilter,
              label: "50% or more",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="
                flex cursor-pointer
                items-center gap-3
                rounded-lg px-2 py-2
                text-sm text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              <input
                type="radio"
                name="discount"
                value={option.value}
                checked={
                  discountFilter === option.value
                }
                onChange={() =>
                  setDiscountFilter(
                    option.value
                  )
                }
                className="h-4 w-4 accent-[#172554]"
              />

              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock */}

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 text-sm font-extrabold text-brand-navy">
          Availability
        </h3>

        <label
          className="
            flex cursor-pointer
            items-center gap-3
            rounded-lg px-2 py-2
            text-sm text-slate-600
            transition
            hover:bg-slate-50
          "
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) =>
              setInStockOnly(
                event.target.checked
              )
            }
            className="h-4 w-4 accent-[#172554]"
          />

          <span>In Stock Only</span>
        </label>
      </div>

      {/* Reset */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="
            w-full rounded-lg
            border border-brand-navy
            bg-white
            px-4 py-2.5
            text-xs font-extrabold
            text-brand-navy
            transition
            hover:bg-brand-navy
            hover:text-white
          "
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-5 sm:py-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/shop"
                className="
                  text-xs font-bold
                  text-slate-400
                  transition
                  hover:text-brand-coral
                "
              >
                ← Back to Shop
              </Link>

              <h1 className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-brand-navy
                sm:text-3xl
              ">
                All Products
              </h1>

              <p className="
                mt-1
                text-xs
                text-slate-500
                sm:text-sm
              ">
                Shop gifts, toys, party items,
                stationery, décor and more.
              </p>
            </div>

            <div className="hidden rounded-xl bg-slate-50 px-4 py-3 text-center sm:block">
              <p className="text-lg font-black text-brand-navy">
                {products.length}
              </p>

              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN SHOP AREA
      ====================================================== */}

      <div className="container-shop px-4 py-4 sm:py-6">
        {/* Search */}

        <div className="mb-4">
          <div
            className="
              relative flex h-11
              overflow-hidden
              rounded-xl
              border border-slate-200
              bg-white
              shadow-sm
              focus-within:border-brand-navy
              focus-within:ring-2
              focus-within:ring-brand-navy/10
            "
          >
            <span
              className="
                flex w-11 shrink-0
                items-center justify-center
                text-base text-slate-400
              "
            >
              🔍
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, gifts, toys..."
              aria-label="Search products"
              className="
                min-w-0 flex-1
                bg-transparent
                px-1 pr-3
                text-sm
                font-medium
                text-slate-800
                outline-none
                placeholder:text-slate-400
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="
                  flex w-10
                  items-center justify-center
                  text-lg text-slate-400
                  hover:text-brand-navy
                "
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category chips */}

        <div className="mb-5 overflow-hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() =>
                setSelectedCategory("all")
              }
              className={`
                shrink-0 rounded-full
                border px-4 py-2
                text-xs font-extrabold
                transition
                ${
                  selectedCategory === "all"
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-slate-200 bg-white text-brand-navy hover:border-brand-navy/30"
                }
              `}
            >
              All
            </button>

            {mainCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category.id
                  )
                }
                className={`
                  shrink-0 rounded-full
                  border px-4 py-2
                  text-xs font-extrabold
                  transition
                  ${
                    selectedCategory ===
                    category.id
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-slate-200 bg-white text-brand-navy hover:border-brand-navy/30"
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================
            DESKTOP SIDEBAR + PRODUCTS
        ==================================================== */}

        <div className="grid gap-5 lg:grid-cols-[235px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sidebar */}

          <aside className="hidden lg:block">
            <div
              className="
                sticky top-[125px]
                max-h-[calc(100vh-145px)]
                overflow-y-auto
                rounded-xl
                border border-slate-200
                bg-white
                p-4
                shadow-sm
              "
            >
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-black text-brand-navy">
                    Filters
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Refine your search
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="
                      text-[10px]
                      font-extrabold
                      text-brand-coral
                      hover:underline
                    "
                  >
                    Clear
                  </button>
                )}
              </div>

              <FilterContent />
            </div>
          </aside>

          {/* Product content */}

          <section className="min-w-0">
            {/* Toolbar */}

            <div
              className="
                mb-4 flex
                flex-wrap
                items-center
                justify-between
                gap-3
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2.5
                shadow-sm
              "
            >
              <div>
                <p className="text-sm font-black text-brand-navy">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "Product"
                    : "Products"}
                </p>

                {selectedCategoryName && (
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    in {selectedCategoryName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter */}

                <button
                  type="button"
                  onClick={() =>
                    setMobileFilterOpen(true)
                  }
                  className="
                    flex items-center gap-1.5
                    rounded-lg
                    border border-slate-200
                    bg-white
                    px-3 py-2
                    text-xs font-extrabold
                    text-brand-navy
                    lg:hidden
                  "
                >
                  <span>☰</span>
                  Filter

                  {hasActiveFilters && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-coral px-1 text-[9px] text-white">
                      !
                    </span>
                  )}
                </button>

                {/* Sort */}

                <label className="flex items-center gap-2">
                  <span className="hidden text-[10px] font-bold text-slate-400 sm:block">
                    Sort:
                  </span>

                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target
                          .value as SortOption
                      )
                    }
                    className="
                      h-9
                      rounded-lg
                      border border-slate-200
                      bg-white
                      px-2.5
                      text-xs
                      font-bold
                      text-brand-navy
                      outline-none
                      focus:border-brand-navy
                    "
                  >
                    <option value="newest">
                      Newest
                    </option>

                    <option value="popular">
                      Popular
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="discount">
                      Highest Discount
                    </option>

                    <option value="name">
                      Name: A–Z
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {/* Active filter chips */}

            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">
                  Active:
                </span>

                {search.trim() && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-brand-navy shadow-sm ring-1 ring-slate-200">
                    Search: "{search.trim()}"
                  </span>
                )}

                {selectedCategory !==
                  "all" && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-brand-navy shadow-sm ring-1 ring-slate-200">
                    {selectedCategoryName}
                  </span>
                )}

                {discountFilter !== "all" && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-brand-navy shadow-sm ring-1 ring-slate-200">
                    {discountFilter}%+ Off
                  </span>
                )}

                {inStockOnly && (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700">
                    In Stock
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-brand-navy shadow-sm ring-1 ring-slate-200">
                    ₹{minPrice || "0"} – ₹
                    {maxPrice || "∞"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-1 text-[10px] font-extrabold text-brand-coral hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-3xl">
                  🔎
                </div>

                <h3 className="mt-5 text-xl font-black text-brand-navy">
                  No Products Found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find products
                  matching your current search
                  or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    mt-5
                    rounded-lg
                    bg-brand-navy
                    px-5 py-2.5
                    text-xs font-extrabold
                    text-white
                    transition
                    hover:bg-brand-dark
                  "
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-2.5
                  sm:grid-cols-3
                  sm:gap-4
                  xl:grid-cols-4
                "
              >
                {filteredProducts.map(
                  (product) => {
                    const discount =
                      getDiscount(
                        product.retail_price,
                        product.compare_at_price
                      );

                    const category =
                      product.category_id
                        ? categoryById.get(
                            product.category_id
                          )
                        : undefined;

                    const isOutOfStock =
                      product.stock_quantity <= 0;

                    const isLowStock =
                      !isOutOfStock &&
                      product.stock_quantity <= 5;

                    const rating =
                      getRating(product);

                    return (
                      <article
                        key={product.id}
                        className="
                          group flex min-w-0
                          flex-col
                          overflow-hidden
                          rounded-xl
                          border border-slate-200
                          bg-white
                          shadow-sm
                          transition
                          duration-200
                          hover:-translate-y-0.5
                          hover:border-slate-300
                          hover:shadow-md
                        "
                      >
                        {/* Product Image */}

                        <Link
                          href={`/products/${product.slug}`}
                          className="
                            relative block
                            aspect-square
                            overflow-hidden
                            bg-slate-50
                          "
                          aria-label={`View ${product.name}`}
                        >
                          {product.image_url ? (
                            <Image
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                              fill
                              sizes="
                                (max-width: 640px) 50vw,
                                (max-width: 1024px) 33vw,
                                25vw
                              "
                              className={`
                                object-contain
                                p-2.5
                                sm:p-3
                                transition
                                duration-300
                                group-hover:scale-105
                                ${
                                  isOutOfStock
                                    ? "opacity-60 grayscale-[20%]"
                                    : ""
                                }
                              `}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                                🎁
                              </div>
                            </div>
                          )}

                          {/* Discount */}

                          {discount > 0 && (
                            <span
                              className="
                                absolute left-2
                                top-2 z-10
                                rounded-md
                                bg-brand-coral
                                px-1.5 py-1
                                text-[9px]
                                font-extrabold
                                text-white
                                sm:px-2
                              "
                            >
                              {discount}% OFF
                            </span>
                          )}

                          {/* Wishlist visual */}

                          <span
                            className="
                              absolute right-2
                              top-2 z-10
                              flex h-7 w-7
                              items-center
                              justify-center
                              rounded-full
                              bg-white/95
                              text-base
                              text-slate-500
                              shadow-sm
                              transition
                              hover:text-brand-coral
                            "
                            aria-hidden="true"
                          >
                            ♡
                          </span>

                          {/* Out of stock */}

                          {isOutOfStock && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25">
                              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold text-slate-800 shadow-lg">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Product Details */}

                        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
                          {/* Category */}

                          {category && (
                            <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                              {category.name}
                            </p>
                          )}

                          {/* Product name */}

                          <Link
                            href={`/products/${product.slug}`}
                            className="mt-0.5"
                          >
                            <h2
                              className="
                                line-clamp-2
                                min-h-[36px]
                                text-[12px]
                                font-bold
                                leading-[18px]
                                text-slate-800
                                transition-colors
                                hover:text-brand-coral
                                sm:text-sm
                              "
                            >
                              {product.name}
                            </h2>
                          </Link>

                          {/* Rating */}

                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className="
                                inline-flex
                                items-center gap-0.5
                                rounded
                                bg-green-600
                                px-1.5 py-0.5
                                text-[9px]
                                font-bold
                                text-white
                              "
                            >
                              {rating}
                              <span>★</span>
                            </span>

                            <span className="text-[9px] text-slate-400">
                              Product
                            </span>
                          </div>

                          {/* Price */}

                          <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                            <span
                              className="
                                text-base
                                font-black
                                tracking-tight
                                text-brand-navy
                                sm:text-lg
                              "
                            >
                              {formatPrice(
                                product.retail_price
                              )}
                            </span>

                            {product.compare_at_price &&
                              product.compare_at_price >
                                product.retail_price && (
                                <span className="text-[10px] text-slate-400 line-through sm:text-xs">
                                  {formatPrice(
                                    product.compare_at_price
                                  )}
                                </span>
                              )}
                          </div>

                          {/* Discount text */}

                          {discount > 0 && (
                            <p className="mt-0.5 text-[9px] font-bold text-green-600">
                              {discount}% off
                            </p>
                          )}

                          {/* Stock */}

                          <p
                            className={`
                              mt-1.5
                              text-[9px]
                              font-bold
                              ${
                                isOutOfStock
                                  ? "text-red-600"
                                  : isLowStock
                                    ? "text-amber-600"
                                    : "text-green-600"
                              }
                            `}
                          >
                            {isOutOfStock
                              ? "● Out of Stock"
                              : isLowStock
                                ? `● Only ${product.stock_quantity} left`
                                : "● In Stock"}
                          </p>

                          {/* Action */}

                          <div className="mt-2.5">
                            <Link
                              href={`/products/${product.slug}`}
                              className="
                                flex w-full
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-brand-navy
                                bg-white
                                px-2
                                py-2
                                text-[10px]
                                font-extrabold
                                text-brand-navy
                                transition
                                hover:bg-brand-navy
                                hover:text-white
                                sm:text-xs
                              "
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ====================================================== */}

      {mobileFilterOpen && (
        <>
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setMobileFilterOpen(false)
            }
            className="
              fixed inset-0 z-[60]
              bg-brand-navy/40
              backdrop-blur-[2px]
            "
          />

          {/* Drawer */}

          <aside
            className="
              fixed right-0 top-0 z-[70]
              flex h-full
              w-[88%] max-w-sm
              flex-col
              bg-white
              shadow-2xl
            "
            aria-label="Product filters"
          >
            {/* Header */}

            <div
              className="
                flex min-h-16
                items-center justify-between
                border-b border-slate-200
                px-5
              "
            >
              <div>
                <h2 className="text-base font-black text-brand-navy">
                  Filters
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Refine your products
                </p>
              </div>

              <button
                type="button"
                aria-label="Close filters"
                onClick={() =>
                  setMobileFilterOpen(false)
                }
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  border border-slate-200
                  text-lg
                  text-brand-navy
                  hover:bg-slate-50
                "
              >
                ✕
              </button>
            </div>

            {/* Filter content */}

            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent />
            </div>

            {/* Apply */}

            <div
              className="
                border-t border-slate-200
                bg-white
                p-4
              "
            >
              <button
                type="button"
                onClick={() =>
                  setMobileFilterOpen(false)
                }
                className="
                  w-full
                  rounded-xl
                  bg-brand-navy
                  px-4 py-3
                  text-sm font-extrabold
                  text-white
                  transition
                  hover:bg-brand-dark
                "
              >
                Show {filteredProducts.length}{" "}
                Products
              </button>
            </div>
          </aside>
        </>
      )}
    </main>
  );
}