"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  created_at: string;
};

type Props = {
  orders: Order[];
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_OPTIONS = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "confirmed":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "processing":
      return "border-purple-100 bg-purple-50 text-purple-700";

    case "shipped":
      return "border-indigo-100 bg-indigo-50 text-indigo-700";

    case "delivered":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-border bg-surface-muted text-text-muted";
  }
}

function getPaymentClass(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
      return "text-emerald-600";

    case "failed":
      return "text-red-600";

    case "refunded":
      return "text-orange-600";

    default:
      return "text-amber-600";
  }
}

export default function AdminOrdersList({
  orders,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

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
          .includes(searchText) ||
        (order.shipping_city || "")
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

  const confirmedCount = orders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const hasFilters =
    search ||
    statusFilter !== "all" ||
    paymentFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  return (
    <>
      {/* =====================================================
          Summary
      ====================================================== */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total */}
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

        {/* Confirmed */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
              Confirmed
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-sm">
              ✓
            </span>
          </div>

          <p className="mt-3 text-2xl font-black text-blue-600">
            {confirmedCount}
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
          Search & Filters
      ====================================================== */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
        <div className="border-b border-border bg-surface-muted px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-black text-brand-navy">
                Find Orders
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Search and filter your customer orders.
              </p>
            </div>

            <span className="w-fit rounded-full bg-brand-navy px-3 py-1 text-[10px] font-black text-white">
              {filteredOrders.length} Results
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label
                htmlFor="order-search"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Search Order
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🔎
                </span>

                <input
                  id="order-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Order no, customer, phone..."
                  className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Order Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="all">
                  All Status
                </option>

                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div>
              <label
                htmlFor="payment-filter"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Payment Status
              </label>

              <select
                id="payment-filter"
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="all">
                  All Payments
                </option>

                {PAYMENT_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Footer */}
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
          Orders
      ====================================================== */}
      <div className="mt-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-soft sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft-gold text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-black text-brand-navy">
              No Orders Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              No orders match your current search or
              filters. Try changing the filters and search
              again.
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
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="group block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card"
              >
                {/* Top Accent */}
                <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-coral opacity-70" />

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    {/* Order Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-brand-navy transition group-hover:text-brand-coral sm:text-lg">
                          {order.order_number}
                        </h2>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-black text-text-secondary">
                          {order.shipping_name ||
                            "Customer"}
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          {order.shipping_phone ||
                            "No phone number"}
                        </p>

                        <p className="mt-1 text-[11px] text-text-light">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="border-t border-border pt-4 lg:min-w-[180px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-light">
                        Delivery
                      </p>

                      <p className="mt-2 text-sm font-bold text-text-secondary">
                        {order.shipping_city || ""}
                        {order.shipping_city &&
                        order.shipping_state
                          ? ", "
                          : ""}
                        {order.shipping_state || ""}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-xs">
                          {order.payment_method ===
                          "cod"
                            ? "💵"
                            : "💳"}
                        </span>

                        <p className="text-[11px] font-semibold text-text-muted">
                          {order.payment_method ===
                          "cod"
                            ? "Cash on Delivery"
                            : order.payment_method ||
                              "Payment pending"}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="border-t border-border pt-4 lg:min-w-[150px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 lg:text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-light">
                        Payment
                      </p>

                      <p
                        className={`mt-1.5 text-xs font-black capitalize ${getPaymentClass(
                          order.payment_status
                        )}`}
                      >
                        {formatStatus(
                          order.payment_status
                        )}
                      </p>

                      <p className="mt-2 text-xl font-black text-brand-navy">
                        ₹
                        {Number(
                          order.total_amount
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-lg text-text-light transition group-hover:bg-brand-soft-gold group-hover:text-brand-navy sm:flex">
                      →
                    </div>
                  </div>

                  {/* Mobile Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 sm:hidden">
                    <span className="text-xs font-bold text-text-muted">
                      Open order details
                    </span>

                    <span className="font-black text-brand-navy">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}