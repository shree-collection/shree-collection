"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

  // Wholesale fields
  wholesale_price?: number | null;
  minimum_wholesale_quantity?: number | null;
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  products: Product[];
  categories: Category[];
  productsError: string | null;
};

export default function AdminProductsList({
  products,
  categories,
  productsError,
}: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [stockFilter, setStockFilter] =
    useState("all");

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          category.name,
        ])
      ),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryName = product.category_id
        ? categoryMap.get(product.category_id) || ""
        : "";

      const matchesSearch =
        !searchText ||
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.slug
          .toLowerCase()
          .includes(searchText) ||
        (product.sku || "")
          .toLowerCase()
          .includes(searchText) ||
        categoryName
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        categoryFilter === "all" ||
        product.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          product.is_active) ||
        (statusFilter === "inactive" &&
          !product.is_active);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out" &&
          product.stock_quantity <= 0) ||
        (stockFilter === "low" &&
          product.stock_quantity > 0 &&
          product.stock_quantity <= 10) ||
        (stockFilter === "available" &&
          product.stock_quantity > 10);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [
    products,
    categoryMap,
    search,
    categoryFilter,
    statusFilter,
    stockFilter,
  ]);

  const activeCount = products.filter(
    (product) => product.is_active
  ).length;

  const inactiveCount = products.filter(
    (product) => !product.is_active
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock_quantity <= 0
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.stock_quantity > 0 &&
      product.stock_quantity <= 10
  ).length;

  const wholesaleCount = products.filter(
    (product) =>
      product.wholesale_price !== null &&
      product.wholesale_price !== undefined &&
      Number(product.wholesale_price) > 0
  ).length;

  const hasFilters =
    search ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
  }

  return (
    <>
      {/* =====================================================
          Error
      ====================================================== */}
      {productsError && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              ⚠️
            </span>

            <div>
              <p className="text-sm font-black text-red-700">
                Unable to load products.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600/80">
                {productsError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Summary
      ====================================================== */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Total Products
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy text-sm">
              📦
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-brand-navy">
            {products.length}
          </p>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Active
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm">
              ✓
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-emerald-600">
            {activeCount}
          </p>
        </div>

        {/* Inactive */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Inactive
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-sm">
              ○
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-slate-500">
            {inactiveCount}
          </p>
        </div>

        {/* Wholesale */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Wholesale
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft-gold text-sm">
              🏷️
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-brand-navy">
            {wholesaleCount}
          </p>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Low Stock
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-sm">
              ⚠️
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-orange-600">
            {lowStockCount}
          </p>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Out of Stock
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-sm">
              ⛔
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-red-600">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* =====================================================
          Search + Filters
      ====================================================== */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
        <div className="border-b border-border bg-surface-muted px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-brand-navy">
                Product Management
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Search, filter and manage your product
                catalogue.
              </p>
            </div>

            <span className="w-fit rounded-full bg-brand-navy px-3 py-1 text-[10px] font-black text-white">
              {filteredProducts.length} Results
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label
                htmlFor="product-search"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Search
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🔎
                </span>

                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Product, SKU, category..."
                  className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="product-category-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Category
              </label>

              <select
                id="product-category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="product-status-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Status
              </label>

              <select
                id="product-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="product-stock-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Stock
              </label>

              <select
                id="product-stock-filter"
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="available">
                  Available
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>
              </select>
            </div>
          </div>

          {/* Filter Footer */}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-text-muted">
              Showing{" "}
              <span className="font-black text-brand-navy">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-brand-navy">
                {products.length}
              </span>{" "}
              products
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-fit text-xs font-black text-brand-coral transition hover:text-red-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          Products
      ====================================================== */}
      <div className="mt-6">
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-soft sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft-gold text-4xl">
              🔍
            </div>

            <h2 className="mt-5 text-xl font-black text-brand-navy">
              No Products Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              No products match your current search or
              filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const categoryName = product.category_id
                ? categoryMap.get(
                    product.category_id
                  ) || "Category"
                : "No category";

              const hasWholesale =
                product.wholesale_price !==
                  null &&
                product.wholesale_price !==
                  undefined &&
                Number(
                  product.wholesale_price
                ) > 0;

              const stockLabel =
                product.stock_quantity <= 0
                  ? "Out of Stock"
                  : product.stock_quantity <= 10
                  ? "Low Stock"
                  : "In Stock";

              const stockClass =
                product.stock_quantity <= 0
                  ? "border-red-100 bg-red-50 text-red-700"
                  : product.stock_quantity <= 10
                  ? "border-orange-100 bg-orange-50 text-orange-700"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700";

              return (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="group block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card"
                >
                  {/* Accent */}
                  <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-coral opacity-70" />

                  <div className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-soft sm:h-28 sm:w-28">
                        <div className="pointer-events-none absolute -right-5 -top-5 h-14 w-14 rounded-full bg-brand-gold/10" />

                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="relative z-[1] h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="relative z-[1] flex h-full items-center justify-center text-3xl">
                            🎁
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="line-clamp-2 text-base font-black text-brand-navy transition group-hover:text-brand-coral sm:text-lg">
                              {product.name}
                            </h2>

                            <p className="mt-1 text-[11px] text-text-muted">
                              {product.sku
                                ? `SKU: ${product.sku}`
                                : "No SKU"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${
                              product.is_active
                                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-text-muted">
                            {categoryName}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              hasWholesale
                                ? "bg-brand-soft-gold text-brand-navy"
                                : "bg-surface-muted text-text-muted"
                            }`}
                          >
                            {hasWholesale
                              ? "Wholesale"
                              : "Retail Only"}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${stockClass}`}
                          >
                            {stockLabel}
                          </span>
                        </div>

                        {/* Pricing / Stock */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {/* Retail */}
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                              Retail
                            </p>

                            <p className="mt-1 text-base font-black text-brand-navy">
                              ₹
                              {Number(
                                product.retail_price
                              ).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </p>
                          </div>

                          {/* Wholesale */}
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                              Wholesale
                            </p>

                            {hasWholesale ? (
                              <p className="mt-1 text-base font-black text-emerald-600">
                                ₹
                                {Number(
                                  product.wholesale_price
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    maximumFractionDigits: 0,
                                  }
                                )}
                              </p>
                            ) : (
                              <p className="mt-1 text-base font-black text-text-light">
                                —
                              </p>
                            )}
                          </div>

                          {/* MOQ */}
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                              MOQ
                            </p>

                            {hasWholesale ? (
                              <p className="mt-1 text-base font-black text-brand-navy">
                                {product.minimum_wholesale_quantity ||
                                  0}
                              </p>
                            ) : (
                              <p className="mt-1 text-base font-black text-text-light">
                                —
                              </p>
                            )}
                          </div>

                          {/* Stock */}
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                              Stock
                            </p>

                            <p
                              className={`mt-1 text-base font-black ${
                                product.stock_quantity <=
                                0
                                  ? "text-red-600"
                                  : product.stock_quantity <=
                                    10
                                  ? "text-orange-600"
                                  : "text-emerald-600"
                              }`}
                            >
                              {product.stock_quantity}
                            </p>
                          </div>
                        </div>

                        {/* Wholesale Information */}
                        {hasWholesale && (
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-brand-gold/20 bg-brand-soft-gold px-3 py-2">
                            <span className="text-xs">
                              🏷️
                            </span>

                            <p className="text-[11px] font-bold text-brand-navy">
                              Wholesale enabled
                            </p>

                            <span className="text-[10px] text-brand-navy/40">
                              •
                            </span>

                            <p className="text-[11px] font-semibold text-brand-navy/70">
                              MOQ{" "}
                              {product.minimum_wholesale_quantity ||
                                0}
                            </p>

                            <span className="text-[10px] text-brand-navy/40">
                              •
                            </span>

                            <p className="text-[11px] font-semibold text-brand-navy/70">
                              ₹
                              {Number(
                                product.wholesale_price
                              ).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}{" "}
                              / unit
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="hidden shrink-0 items-center text-xl text-text-light transition group-hover:text-brand-navy sm:flex">
                        →
                      </div>
                    </div>

                    {/* Mobile Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 sm:hidden">
                      <span className="text-[11px] font-bold text-text-muted">
                        Open product details
                      </span>

                      <span className="font-black text-brand-navy">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}