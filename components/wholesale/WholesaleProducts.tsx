"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartContext";
import WholesaleProductCard from "./WholesaleProductCard";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type WholesaleProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  retailPrice: number;
  wholesalePrice: number;
  minQuantity: number;
  stockQuantity: number;
  category: Category | null;
  parentCategory: Category | null;
  image: string | null;
  images: string[];
};

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

const mainCategories = [
  {
    name: "All",
    slug: "all",
    icon: "🛍️",
  },
  {
    name: "Party Items",
    slug: "party-items",
    icon: "🎈",
  },
  {
    name: "Gift Items",
    slug: "gift-items",
    icon: "🎁",
  },
  {
    name: "Toys",
    slug: "toys",
    icon: "🧸",
  },
  {
    name: "Stationery",
    slug: "stationery",
    icon: "✏️",
  },
  {
    name: "Ladies Bags",
    slug: "ladies-bags",
    icon: "👜",
  },
  {
    name: "Gift Hampers",
    slug: "gift-hampers",
    icon: "🎀",
  },
  {
    name: "Key Chains",
    slug: "key-chains",
    icon: "🔑",
  },
];

const subcategoryIcons: Record<string, string> = {
  birthday: "🎂",
  anniversary: "💝",
  "kids-party": "🎉",
  annaprashan: "👶",
  "baby-shower": "🍼",
  balloons: "🎈",
  "party-decoration": "🎊",
  "return-gifts": "🎁",

  "birthday-gifts": "🎁",
  "anniversary-gifts": "💝",
  "couple-gifts": "💑",
  "kids-gifts": "🧸",
  "religious-gifts": "🙏",
  "photo-frames": "🖼️",
  "personalized-gifts": "✨",

  "action-figures": "🦸",
  "educational-toys": "📚",
  "remote-control-toys": "🚗",
  "soft-toys": "🧸",
  "kids-games": "🎮",
  "small-toys": "🪀",
  "keychain-toys": "🔑",

  pens: "🖊️",
  pencils: "✏️",
  erasers: "🧽",
  notebooks: "📓",
  diaries: "📔",
  "school-items": "🎒",
  "art-craft": "🎨",
  "stationery-games": "🎲",

  "hand-bags": "👜",
  "sling-bags": "👛",
  wallets: "💳",
  pouches: "👝",
  "cosmetic-bags": "💄",

  "birthday-hampers": "🎂",
  "kids-hampers": "🧸",
  "couple-hampers": "💝",
  "festival-hampers": "🎁",
  "corporate-hampers": "🎀",

  "anime-key-chains": "🌟",
  "cartoon-key-chains": "🧸",
  "religious-key-chains": "🙏",
  "couple-key-chains": "💑",
  "metal-key-chains": "🔗",
  "acrylic-key-chains": "✨",
  "car-bike-key-chains": "🚗",
};

export default function WholesaleProducts() {
  const { wholesaleCartCount } = useCart();

  const [products, setProducts] = useState<WholesaleProduct[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --------------------------------
     Load wholesale products
  -------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/wholesale/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load wholesale products."
          );
        }

        if (mounted) {
          setProducts(data.products || []);
        }
      } catch (error) {
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load wholesale products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* --------------------------------
     Get subcategories for
     selected main category
  -------------------------------- */

  const availableSubcategories = useMemo(() => {
    if (selectedCategory === "all") {
      return [];
    }

    const subcategoryMap = new Map<
      string,
      Category
    >();

    products.forEach((product) => {
      const parentCategory =
        product.parentCategory;

      const category = product.category;

      if (
        parentCategory?.slug ===
          selectedCategory &&
        category &&
        category.slug !== selectedCategory
      ) {
        subcategoryMap.set(
          category.id,
          category
        );
      }
    });

    return Array.from(
      subcategoryMap.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products, selectedCategory]);

  /* --------------------------------
     Category counts
  -------------------------------- */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: products.length,
    };

    products.forEach((product) => {
      const categorySlug =
        product.parentCategory?.slug ||
        product.category?.slug;

      if (!categorySlug) {
        return;
      }

      if (
        mainCategories.some(
          (category) =>
            category.slug === categorySlug
        )
      ) {
        counts[categorySlug] =
          (counts[categorySlug] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  /* --------------------------------
     Subcategory counts
  -------------------------------- */

  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    products.forEach((product) => {
      const parentCategorySlug =
        product.parentCategory?.slug;

      const categorySlug =
        product.category?.slug;

      if (
        parentCategorySlug ===
          selectedCategory &&
        categorySlug
      ) {
        counts[categorySlug] =
          (counts[categorySlug] || 0) + 1;
      }
    });

    return counts;
  }, [products, selectedCategory]);

  /* --------------------------------
     Filter products by category
  -------------------------------- */

  const categoryFilteredProducts = useMemo(() => {
    /*
     * All categories
     */
    if (selectedCategory === "all") {
      return products;
    }

    /*
     * Specific subcategory
     */
    if (selectedSubcategory !== "all") {
      return products.filter(
        (product) =>
          product.category?.slug ===
          selectedSubcategory
      );
    }

    /*
     * Main category
     */
    return products.filter((product) => {
      const categorySlug =
        product.parentCategory?.slug ||
        product.category?.slug;

      return categorySlug === selectedCategory;
    });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
  ]);

  /* --------------------------------
     Search + Sort
  -------------------------------- */

  const filteredProducts = useMemo(() => {
    let result = [
      ...categoryFilteredProducts,
    ];

    /*
     * Search by product name or SKU
     */
    const search =
      searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const sku =
          product.sku?.toLowerCase() || "";

        return (
          name.includes(search) ||
          sku.includes(search)
        );
      });
    }

    /*
     * Sorting
     */
    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            a.wholesalePrice -
            b.wholesalePrice
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            b.wholesalePrice -
            a.wholesalePrice
        );
        break;

      case "name":
        result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "newest":
      default:
        /*
         * API already returns products
         * in created_at descending order.
         */
        break;
    }

    return result;
  }, [
    categoryFilteredProducts,
    searchTerm,
    sortBy,
  ]);

  /* --------------------------------
     Selected main category
  -------------------------------- */

  const selectedCategoryInfo = useMemo(() => {
    return (
      mainCategories.find(
        (category) =>
          category.slug === selectedCategory
      ) || mainCategories[0]
    );
  }, [selectedCategory]);

  /* --------------------------------
     Selected subcategory
  -------------------------------- */

  const selectedSubcategoryInfo =
    useMemo(() => {
      if (selectedSubcategory === "all") {
        return null;
      }

      return (
        availableSubcategories.find(
          (category) =>
            category.slug ===
            selectedSubcategory
        ) || null
      );
    }, [
      availableSubcategories,
      selectedSubcategory,
    ]);

  /* --------------------------------
     Select main category
  -------------------------------- */

  function handleCategoryChange(
    categorySlug: string
  ) {
    setSelectedCategory(categorySlug);
    setSelectedSubcategory("all");
  }

  /* --------------------------------
     Select subcategory
  -------------------------------- */

  function handleSubcategoryChange(
    subcategorySlug: string
  ) {
    setSelectedSubcategory(
      subcategorySlug
    );
  }

  /* --------------------------------
     Clear filters
  -------------------------------- */

  function clearFilters() {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSearchTerm("");
    setSortBy("newest");
  }

  /* --------------------------------
     Clear search only
  -------------------------------- */

  function clearSearch() {
    setSearchTerm("");
  }

  /* --------------------------------
     Loading state
  -------------------------------- */

  if (loading) {
    return (
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="h-11 w-28 animate-pulse rounded-xl bg-gray-200" />
        </div>

        {/* Main category skeleton */}

        <div className="mb-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-gray-200"
              />
            )
          )}
        </div>

        {/* Search skeleton */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-200" />

          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 sm:w-52" />
        </div>

        {/* Product skeleton */}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="aspect-square rounded-xl bg-gray-200" />

                <div className="mt-3 h-3 w-1/3 rounded bg-gray-200" />

                <div className="mt-2 h-4 rounded bg-gray-200" />

                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />

                <div className="mt-4 h-10 rounded-xl bg-gray-200" />
              </div>
            )
          )}
        </div>
      </section>
    );
  }

  /* --------------------------------
     Error state
  -------------------------------- */

  if (error) {
    return (
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-[#172554]">
              Wholesale Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Special pricing available for your shop.
            </p>
          </div>

          <Link
            href="/wholesale/cart"
            className="shrink-0 rounded-xl bg-[#FFC928] px-4 py-3 text-sm font-extrabold text-[#172554]"
          >
            🛒 Cart ({wholesaleCartCount})
          </Link>
        </div>

        <div className="rounded-2xl bg-red-50 p-6 text-center">
          <div className="text-3xl">
            ⚠️
          </div>

          <h3 className="mt-2 text-lg font-extrabold text-red-700">
            Unable to load products
          </h3>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  /* --------------------------------
     Empty database state
  -------------------------------- */

  if (products.length === 0) {
    return (
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-[#172554]">
              Wholesale Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Special pricing available for your shop.
            </p>
          </div>

          <Link
            href="/wholesale/cart"
            className="shrink-0 rounded-xl bg-[#FFC928] px-4 py-3 text-sm font-extrabold text-[#172554]"
          >
            🛒 Cart ({wholesaleCartCount})
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">
            📦
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-[#172554]">
            No wholesale products available
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Wholesale products will appear here
            once wholesale pricing is configured.
          </p>
        </div>
      </section>
    );
  }

  /* --------------------------------
     Products
  -------------------------------- */

  return (
    <section>
      {/* --------------------------------
          Catalogue Header
      -------------------------------- */}

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[#172554]">
            Wholesale Products
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Special pricing available for your shop.
          </p>
        </div>

        <Link
          href="/wholesale/cart"
          className="relative shrink-0 rounded-xl bg-[#FFC928] px-4 py-3 text-sm font-extrabold text-[#172554] shadow-sm transition hover:bg-[#f5bb00]"
        >
          🛒 Cart

          {wholesaleCartCount > 0 && (
            <span className="ml-1">
              ({wholesaleCartCount})
            </span>
          )}
        </Link>
      </div>

      {/* --------------------------------
          Main Category Filter
      -------------------------------- */}

      <div className="mb-3">
        <div className="-mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-w-max gap-2">
            {mainCategories.map(
              (category) => {
                const isSelected =
                  selectedCategory ===
                  category.slug;

                const count =
                  categoryCounts[
                    category.slug
                  ] || 0;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(
                        category.slug
                      )
                    }
                    className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                      isSelected
                        ? "border-[#172554] bg-[#172554] text-white shadow-sm"
                        : "border-gray-200 bg-white text-[#172554] hover:border-[#FFC928] hover:bg-[#FFF9E8]"
                    }`}
                  >
                    <span className="text-base">
                      {category.icon}
                    </span>

                    <span>
                      {category.name}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------
          Subcategory Filter
      -------------------------------- */}

      {selectedCategory !== "all" &&
        availableSubcategories.length >
          0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              {selectedCategoryInfo.name} Categories
            </p>

            <div className="-mx-1 overflow-x-auto px-1 pb-2">
              <div className="flex min-w-max gap-2">
                {/* All subcategories */}

                <button
                  type="button"
                  onClick={() =>
                    handleSubcategoryChange(
                      "all"
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    selectedSubcategory ===
                    "all"
                      ? "border-[#FFC928] bg-[#FFF9E8] text-[#172554]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#FFC928]"
                  }`}
                >
                  <span>📦</span>

                  <span>All</span>

                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    {categoryCounts[
                      selectedCategory
                    ] || 0}
                  </span>
                </button>

                {/* Subcategories */}

                {availableSubcategories.map(
                  (subcategory) => {
                    const isSelected =
                      selectedSubcategory ===
                      subcategory.slug;

                    const count =
                      subcategoryCounts[
                        subcategory.slug
                      ] || 0;

                    const icon =
                      subcategoryIcons[
                        subcategory.slug
                      ] || "📦";

                    return (
                      <button
                        key={
                          subcategory.id
                        }
                        type="button"
                        onClick={() =>
                          handleSubcategoryChange(
                            subcategory.slug
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          isSelected
                            ? "border-[#FFC928] bg-[#FFF9E8] text-[#172554] shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-[#FFC928]"
                        }`}
                      >
                        <span>
                          {icon}
                        </span>

                        <span>
                          {subcategory.name}
                        </span>

                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                          {count}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

      {/* --------------------------------
          Search + Sort
      -------------------------------- */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        {/* Search */}

        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
            🔎
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search product name or SKU..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#172554] outline-none transition placeholder:text-gray-400 focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/20"
            aria-label="Search wholesale products"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none text-gray-400 transition hover:text-gray-700"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort */}

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value as SortOption
            )
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#172554] outline-none transition focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/20 sm:w-56"
          aria-label="Sort wholesale products"
        >
          <option value="newest">
            Newest
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

      {/* --------------------------------
          Selected Filter Header
      -------------------------------- */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#172554]">
            {selectedSubcategoryInfo
              ? selectedSubcategoryInfo.name
              : selectedCategoryInfo.name}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {filteredProducts.length} product
            {filteredProducts.length !== 1
              ? "s"
              : ""}{" "}
            available

            {searchTerm && (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-[#172554]">
                  "{searchTerm}"
                </span>
              </>
            )}
          </p>
        </div>

        {(selectedCategory !== "all" ||
          selectedSubcategory !== "all" ||
          searchTerm ||
          sortBy !== "newest") && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 text-sm font-bold text-[#F43F5E]"
          >
            Clear All
          </button>
        )}
      </div>

      {/* --------------------------------
          Product Grid
      -------------------------------- */}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(
            (product) => (
              <WholesaleProductCard
                key={product.id}
                product={product}
              />
            )
          )}
        </div>
      ) : (
        /* --------------------------------
           No Search Results
        -------------------------------- */

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <div className="text-5xl">
            {searchTerm
              ? "🔎"
              : "📦"}
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-[#172554]">
            {searchTerm
              ? "No products found"
              : "No products in this category"}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? `We couldn't find any products matching "${searchTerm}".`
              : "There are currently no wholesale products available in this category."}
          </p>

          {searchTerm ? (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-extrabold text-[#172554]"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-extrabold text-[#172554]"
            >
              View All Products
            </button>
          )}
        </div>
      )}
    </section>
  );
}