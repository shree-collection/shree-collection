"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

const orderStatuses = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "all",
  "pending",
  "paid",
  "failed",
  "refunded",
];

function getOrderStatusClass(status: string) {
  switch (status) {
    case "confirmed":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "processing":
      return "border-indigo-100 bg-indigo-50 text-indigo-700";

    case "shipped":
      return "border-purple-100 bg-purple-50 text-purple-700";

    case "delivered":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-amber-100 bg-amber-50 text-amber-700";
  }
}

function getPaymentStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "failed":
      return "border-red-100 bg-red-50 text-red-700";

    case "refunded":
      return "border-purple-100 bg-purple-50 text-purple-700";

    default:
      return "border-amber-100 bg-amber-50 text-amber-700";
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

export default function AdminWholesaleOrdersList() {
  const [orders, setOrders] = useState<
    WholesaleOrder[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [paymentFilter, setPaymentFilter] =
    useState("all");

  async function loadOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/wholesale-orders",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load wholesale orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wholesale orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchText ||
        order.order_number
          .toLowerCase()
          .includes(searchText) ||
        (order.shipping_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (order.shipping_phone || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const processingCount = orders.filter(
    (order) =>
      order.status === "processing" ||
      order.status === "confirmed"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total_amount || 0),
    0
  );

  const hasFilters =
    search ||
    statusFilter !== "all" ||
    paymentFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
        <div className="animate-pulse">
          <div className="h-5 w-48 rounded-lg bg-slate-100" />

          <div className="mt-3 h-3 w-72 max-w-full rounded bg-slate-100" />

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-2xl bg-slate-50"
                />
              )
            )}
          </div>

          <div className="mt-6 h-40 rounded-2xl bg-slate-50" />
        </div>
      </div>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
            ⚠️
          </div>

          <div>
            <p className="text-sm font-black text-red-700">
              Unable to load wholesale orders
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600/80">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadOrders()}
              className="mt-4 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          Summary
      ====================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Orders */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Total Orders
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy text-sm">
              📦
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-brand-navy">
            {orders.length}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Pending
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-sm">
              ⏳
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-amber-600">
            {pendingCount}
          </p>
        </div>

        {/* Processing */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Processing
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-sm">
              ⚙️
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-indigo-600">
            {processingCount}
          </p>
        </div>

        {/* Delivered */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Delivered
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-sm">
              ✓
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-emerald-600">
            {deliveredCount}
          </p>
        </div>
      </div>

      {/* =====================================================
          Wholesale Value
      ====================================================== */}
      <div className="rounded-3xl border border-brand-gold/20 bg-brand-soft-gold p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-navy/60">
              Wholesale Order Value
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy sm:text-3xl">
              ₹{formatAmount(totalValue)}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
            💰
          </div>
        </div>
      </div>

      {/* =====================================================
          Filters
      ====================================================== */}
      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
        <div className="border-b border-border bg-surface-muted px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-brand-navy">
                Wholesale Orders
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Search and manage business customer orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-black text-brand-navy transition hover:border-brand-gold/40 hover:bg-brand-soft-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Search */}
            <div>
              <label
                htmlFor="wholesale-order-search"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Search Orders
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🔎
                </span>

                <input
                  id="wholesale-order-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Order number, shop or mobile..."
                  className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </div>

            {/* Order Status */}
            <div>
              <label
                htmlFor="order-status-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Order Status
              </label>

              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium capitalize text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                {orderStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "all"
                      ? "All Order Status"
                      : formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label
                htmlFor="payment-status-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Payment Status
              </label>

              <select
                id="payment-status-filter"
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium capitalize text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                {paymentStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "all"
                        ? "All Payment Status"
                        : formatStatus(status)}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Result Count */}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-text-muted">
              Showing{" "}
              <span className="font-black text-brand-navy">
                {filteredOrders.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-brand-navy">
                {orders.length}
              </span>{" "}
              orders
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
          Empty State
      ====================================================== */}
      {orders.length === 0 && (
        <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-soft sm:p-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft-gold text-4xl">
            📦
          </div>

          <h2 className="mt-5 text-xl font-black text-brand-navy">
            No Wholesale Orders Yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
            Wholesale orders will appear here once business
            customers place them.
          </p>
        </div>
      )}

      {/* =====================================================
          No Filtered Results
      ====================================================== */}
      {orders.length > 0 &&
        filteredOrders.length === 0 && (
          <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-soft sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-muted text-4xl">
              🔎
            </div>

            <h2 className="mt-5 text-xl font-black text-brand-navy">
              No Matching Orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              Try changing your search or filters to find
              another wholesale order.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </div>
        )}

      {/* =====================================================
          Desktop Orders
      ====================================================== */}
      {filteredOrders.length > 0 && (
        <div className="hidden overflow-hidden rounded-3xl border border-border bg-white shadow-soft md:block">
          <div className="border-b border-border bg-surface-muted px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-brand-navy">
                  Order List
                </h2>

                <p className="mt-0.5 text-xs text-text-muted">
                  Wholesale customer transactions
                </p>
              </div>

              <span className="rounded-full bg-brand-navy px-3 py-1 text-[10px] font-black text-white">
                {filteredOrders.length} Orders
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-border bg-white">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Order
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Location
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Total
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Order Status
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group border-b border-border/70 transition last:border-0 hover:bg-brand-soft-gold/20"
                  >
                    {/* Order */}
                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/wholesale-orders/${order.id}`}
                        className="block"
                      >
                        <p className="font-black text-brand-navy transition group-hover:text-brand-coral">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-[11px] font-bold text-brand-coral">
                          View Order →
                        </p>
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-5">
                      <p className="font-black text-brand-navy">
                        {order.shipping_name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {order.shipping_phone || "—"}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-5 text-sm text-text-secondary">
                      {order.shipping_city || "—"}

                      {order.shipping_state
                        ? `, ${order.shipping_state}`
                        : ""}
                    </td>

                    {/* Total */}
                    <td className="whitespace-nowrap px-5 py-5">
                      <p className="font-black text-brand-navy">
                        ₹
                        {formatAmount(
                          Number(order.total_amount)
                        )}
                      </p>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black capitalize ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black capitalize ${getPaymentStatusClass(
                          order.payment_status
                        )}`}
                      >
                        {formatStatus(
                          order.payment_status
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-5 py-5 text-xs font-semibold text-text-muted">
                      {formatDate(
                        order.created_at
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          Mobile Orders
      ====================================================== */}
      {filteredOrders.length > 0 && (
        <div className="space-y-3 md:hidden">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/wholesale-orders/${order.id}`}
              className="group block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card"
            >
              <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-coral opacity-70" />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-brand-navy">
                      {order.order_number}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold text-text-muted">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <p className="whitespace-nowrap text-lg font-black text-brand-navy">
                    ₹
                    {formatAmount(
                      Number(order.total_amount)
                    )}
                  </p>
                </div>

                {/* Customer */}
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft-gold">
                      🏪
                    </div>

                    <div className="min-w-0">
                      <p className="font-black text-brand-navy">
                        {order.shipping_name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {order.shipping_phone || "—"}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {order.shipping_city || "—"}

                        {order.shipping_state
                          ? `, ${order.shipping_state}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black capitalize ${getOrderStatusClass(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black capitalize ${getPaymentStatusClass(
                      order.payment_status
                    )}`}
                  >
                    Payment:{" "}
                    {formatStatus(
                      order.payment_status
                    )}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] font-bold text-text-muted">
                    Open order details
                  </span>

                  <span className="font-black text-brand-coral transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}