"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  summary: {
    totalSales: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    activeProducts: number;
  };

  lowStockProducts: {
    id: string;
    name: string;
    sku: string | null;
    stock_quantity: number;
    retail_price: number;
    is_active: boolean;
  }[];

  recentOrders: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    shipping_name: string | null;
    created_at: string;
  }[];
};

type WholesaleShop = {
  id: string;
  status: "pending" | "approved" | "blocked";
};

type WholesaleOrder = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  total_amount: number;
  payment_status: string;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  created_at: string;
};

type WholesaleSummary = {
  totalShops: number;
  pendingShops: number;
  approvedShops: number;
  blockedShops: number;
  totalOrders: number;
  pendingOrders: number;
  totalSales: number;
};

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [wholesale, setWholesale] =
    useState<WholesaleSummary>({
      totalShops: 0,
      pendingShops: 0,
      approvedShops: 0,
      blockedShops: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalSales: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------
        // Retail dashboard
        // --------------------------------------------------

        const dashboardResponse = await fetch(
          "/api/admin/dashboard",
          {
            cache: "no-store",
          }
        );

        const dashboardResult =
          await dashboardResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardResult.error ||
              "Unable to load dashboard."
          );
        }

        // --------------------------------------------------
        // Wholesale shops
        // --------------------------------------------------

        const shopsResponse = await fetch(
          "/api/admin/wholesale-shops?status=all",
          {
            cache: "no-store",
          }
        );

        const shopsResult =
          await shopsResponse.json();

        if (!shopsResponse.ok) {
          throw new Error(
            shopsResult.error ||
              "Unable to load wholesale shops."
          );
        }

        // --------------------------------------------------
        // Wholesale orders
        // --------------------------------------------------

        const wholesaleOrdersResponse =
          await fetch(
            "/api/admin/wholesale-orders",
            {
              cache: "no-store",
            }
          );

        const wholesaleOrdersResult =
          await wholesaleOrdersResponse.json();

        if (!wholesaleOrdersResponse.ok) {
          throw new Error(
            wholesaleOrdersResult.error ||
              "Unable to load wholesale orders."
          );
        }

        const shops: WholesaleShop[] =
          Array.isArray(shopsResult.shops)
            ? shopsResult.shops
            : [];

        const wholesaleOrders: WholesaleOrder[] =
          Array.isArray(
            wholesaleOrdersResult.orders
          )
            ? wholesaleOrdersResult.orders
            : [];

        // --------------------------------------------------
        // Wholesale summary
        // --------------------------------------------------

        const wholesaleSummary: WholesaleSummary =
          {
            totalShops: shops.length,

            pendingShops: shops.filter(
              (shop) =>
                shop.status === "pending"
            ).length,

            approvedShops: shops.filter(
              (shop) =>
                shop.status === "approved"
            ).length,

            blockedShops: shops.filter(
              (shop) =>
                shop.status === "blocked"
            ).length,

            totalOrders:
              wholesaleOrders.length,

            pendingOrders:
              wholesaleOrders.filter(
                (order) =>
                  order.status === "pending"
              ).length,

            totalSales:
              wholesaleOrders.reduce(
                (total, order) =>
                  total +
                  Number(
                    order.total_amount || 0
                  ),
                0
              ),
          };

        setData(dashboardResult);
        setWholesale(wholesaleSummary);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatCurrency = (
    amount: number
  ) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700";

      case "confirmed":
        return "bg-sky-50 text-sky-700";

      case "processing":
        return "bg-violet-50 text-violet-700";

      case "shipped":
        return "bg-indigo-50 text-indigo-700";

      case "delivered":
        return "bg-emerald-50 text-emerald-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // Loading
  // ======================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="bg-brand-navy px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-32 animate-pulse rounded-xl bg-white/10" />

                <div>
                  <div className="h-7 w-40 animate-pulse rounded-lg bg-white/20" />

                  <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-2xl bg-surface-muted"
                  />
                )
              )}
            </div>

            <div className="px-5 pb-6 sm:px-6">
              <p className="text-center text-xs font-semibold text-text-muted">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ======================================================
  // Error
  // ======================================================

  if (error) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            role="alert"
            className="rounded-3xl border border-red-100 bg-red-50 p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <div>
                <h1 className="text-sm font-black text-red-700">
                  Dashboard could not be loaded
                </h1>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            Header
        =================================================== */}
        <header className="mb-7 overflow-hidden rounded-3xl bg-brand-navy shadow-soft">
          <div className="relative px-5 py-6 sm:px-7 sm:py-7">

            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-gold/10" />

            <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-brand-coral/10" />

            <div className="relative">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                {/* Logo + title */}
                <div className="flex items-center gap-4">

                  <Link
                    href="/admin"
                    aria-label="Shree Collection Admin"
                    className="flex h-14 min-w-[110px] items-center justify-center rounded-2xl bg-white px-3 shadow-sm"
                  >
                    <Image
                      src="/logo.png"
                      alt="Shree Collection"
                      width={150}
                      height={60}
                      priority
                      className="h-10 w-auto object-contain"
                    />
                  </Link>

                  <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-gold">
                      Admin Panel
                    </p>

                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Dashboard
                    </h1>

                    <p className="mt-1.5 max-w-xl text-xs text-slate-300 sm:text-sm">
                      Manage your retail store,
                      wholesale business, products
                      and orders.
                    </p>
                  </div>

                </div>

                {/* Add Product */}
                <Link
                  href="/admin/products/new"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-gold px-4 py-3 text-xs font-black text-brand-navy transition hover:bg-yellow-300"
                >
                  <span className="text-base">
                    +
                  </span>

                  Add Product
                </Link>

              </div>
            </div>
          </div>
        </header>

        {/* ==================================================
            Retail Overview
        =================================================== */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-coral">
                  Retail
                </span>
              </div>

              <h2 className="text-lg font-black text-brand-navy">
                Store Overview
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="hidden text-xs font-black text-brand-coral transition hover:text-brand-navy sm:block"
            >
              View Orders →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {/* Total Sales */}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/15 text-sm">
                  ₹
                </span>

                <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                  Revenue
                </span>
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Total Sales
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-brand-navy sm:text-2xl">
                {formatCurrency(
                  data.summary.totalSales
                )}
              </p>
            </div>

            {/* Total Orders */}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-sm">
                  🛒
                </span>

                <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                  Orders
                </span>
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Total Orders
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-brand-navy sm:text-2xl">
                {data.summary.totalOrders}
              </p>
            </div>

            {/* Pending Orders */}
            <Link
              href="/admin/orders"
              className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-coral/10 text-sm">
                  !
                </span>

                <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                  ACTION
                </span>
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Pending Orders
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-brand-coral sm:text-2xl">
                {data.summary.pendingOrders}
              </p>
            </Link>

            {/* Active Products */}
            <Link
              href="/admin/products"
              className="rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm">
                  ✓
                </span>

                <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                  Catalogue
                </span>
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Active Products
              </p>

              <p className="mt-1 text-xl font-black tracking-tight text-brand-navy sm:text-2xl">
                {data.summary.activeProducts}
              </p>

              <p className="mt-1 text-[10px] text-text-muted">
                {data.summary.totalProducts} total
              </p>
            </Link>
          </div>
        </section>

        {/* ==================================================
            Wholesale Overview
        =================================================== */}
        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-navy">
                  Wholesale
                </span>
              </div>

              <h2 className="text-lg font-black text-brand-navy">
                Wholesale Overview
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Wholesale shops and order activity.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/admin/wholesale-shops"
                className="text-xs font-black text-brand-coral transition hover:text-brand-navy"
              >
                Manage Shops →
              </Link>

              <Link
                href="/admin/wholesale-orders"
                className="text-xs font-black text-brand-coral transition hover:text-brand-navy"
              >
                Manage Orders →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {/* Wholesale Shops */}
            <Link
              href="/admin/wholesale-shops"
              className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-sm text-white">
                🏪
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Wholesale Shops
              </p>

              <p className="mt-1 text-xl font-black text-brand-navy sm:text-2xl">
                {wholesale.totalShops}
              </p>

              <p className="mt-1 text-[10px] text-text-muted">
                {wholesale.approvedShops} approved
              </p>
            </Link>

            {/* Pending Shops */}
            <Link
              href="/admin/wholesale-shops?status=pending"
              className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-sm">
                ⏳
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Pending Shops
              </p>

              <p className="mt-1 text-xl font-black text-amber-600 sm:text-2xl">
                {wholesale.pendingShops}
              </p>

              <p className="mt-1 text-[10px] text-text-muted">
                Awaiting approval
              </p>
            </Link>

            {/* Wholesale Orders */}
            <Link
              href="/admin/wholesale-orders"
              className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral/10 text-sm">
                📦
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Wholesale Orders
              </p>

              <p className="mt-1 text-xl font-black text-brand-navy sm:text-2xl">
                {wholesale.totalOrders}
              </p>

              <p className="mt-1 text-[10px] text-text-muted">
                {wholesale.pendingOrders} pending
              </p>
            </Link>

            {/* Wholesale Sales */}
            <Link
              href="/admin/wholesale-orders"
              className="group rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm">
                ₹
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
                Wholesale Sales
              </p>

              <p className="mt-1 text-xl font-black text-emerald-600 sm:text-2xl">
                {formatCurrency(
                  wholesale.totalSales
                )}
              </p>

              <p className="mt-1 text-[10px] text-text-muted">
                Order total
              </p>
            </Link>

          </div>
        </section>

        {/* ==================================================
            Quick Actions
        =================================================== */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-black text-brand-navy">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Common store management tasks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Add Product */}
            <Link
              href="/admin/products/new"
              className="group rounded-2xl bg-brand-navy p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-lg font-black text-brand-navy">
                +
              </span>

              <p className="mt-4 text-sm font-black text-white">
                Add Product
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-300">
                Add a new product to your store.
              </p>
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-lg">
                🛒
              </span>

              <p className="mt-4 text-sm font-black text-brand-navy">
                View Orders
              </p>

              <p className="mt-1 text-xs leading-5 text-text-muted">
                Manage and update customer orders.
              </p>
            </Link>

            {/* Wholesale */}
            <Link
              href="/admin/wholesale-orders"
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 text-lg">
                📦
              </span>

              <p className="mt-4 text-sm font-black text-brand-navy">
                Wholesale Orders
              </p>

              <p className="mt-1 text-xs leading-5 text-text-muted">
                Manage wholesale customer orders.
              </p>
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral/10 text-lg">
                👥
              </span>

              <p className="mt-4 text-sm font-black text-brand-navy">
                View Customers
              </p>

              <p className="mt-1 text-xs leading-5 text-text-muted">
                View your customer information.
              </p>
            </Link>

          </div>
        </section>

        {/* ==================================================
            Recent Orders + Low Stock
        =================================================== */}
        <section className="mt-8 grid gap-5 lg:grid-cols-2">

          {/* Recent Orders */}
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                  <h2 className="text-sm font-black text-brand-navy">
                    Recent Orders
                  </h2>
                </div>

                <p className="mt-1 text-[10px] text-text-muted">
                  Latest retail customer orders
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="rounded-lg bg-surface-muted px-3 py-2 text-[10px] font-black text-brand-navy transition hover:bg-brand-gold/15"
              >
                View All
              </Link>
            </div>

            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted">
                  🛒
                </span>

                <p className="mt-3 text-xs font-bold text-text-muted">
                  No orders yet.
                </p>
              </div>
            ) : (
              <div>
                {data.recentOrders.map(
                  (order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-0 hover:bg-surface-soft"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-brand-navy">
                          {order.order_number}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-text-muted">
                          {order.shipping_name ||
                            "Guest Customer"}
                        </p>

                        <p className="mt-1 text-[9px] text-text-light">
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-black text-brand-navy">
                          {formatCurrency(
                            Number(
                              order.total_amount
                            )
                          )}
                        </p>

                        <span
                          className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-[9px] font-black capitalize ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                  <h2 className="text-sm font-black text-brand-navy">
                    Low Stock
                  </h2>
                </div>

                <p className="mt-1 text-[10px] text-text-muted">
                  Products with 5 or fewer units
                </p>
              </div>

              <Link
                href="/admin/products"
                className="rounded-lg bg-surface-muted px-3 py-2 text-[10px] font-black text-brand-navy transition hover:bg-brand-gold/15"
              >
                Products
              </Link>
            </div>

            {data.lowStockProducts.length ===
            0 ? (
              <div className="p-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  ✓
                </span>

                <p className="mt-3 text-xs font-bold text-emerald-600">
                  All active products have
                  sufficient stock.
                </p>
              </div>
            ) : (
              <div>
                {data.lowStockProducts
                  .slice(0, 8)
                  .map((product) => (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                      className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-0 hover:bg-surface-soft"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-brand-navy">
                          {product.name}
                        </p>

                        {product.sku && (
                          <p className="mt-1 text-[9px] text-text-light">
                            {product.sku}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-black ${
                            product.stock_quantity ===
                            0
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {product.stock_quantity}
                        </p>

                        <p className="text-[9px] text-text-light">
                          units left
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

        </section>

        <div className="h-4" />
      </div>
    </main>
  );
}