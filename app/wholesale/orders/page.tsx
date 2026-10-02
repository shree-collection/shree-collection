"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WholesaleOrder = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  created_at: string;
  updated_at: string;
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "processing":
      return "border-purple-100 bg-purple-50 text-purple-700";

    case "shipped":
      return "border-orange-100 bg-orange-50 text-orange-700";

    case "delivered":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getPaymentStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "failed":
      return "border-red-100 bg-red-50 text-red-700";

    case "refunded":
      return "border-purple-100 bg-purple-50 text-purple-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getStatusStep(status: string) {
  return orderStatuses.indexOf(status.toLowerCase());
}

function formatStatus(status: string) {
  return status
    .replace(/\_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function WholesaleOrdersPage() {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/wholesale/orders",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load orders."
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
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const deliveredCount = orders.filter(
    (order) =>
      order.status.toLowerCase() === "delivered"
  ).length;

  const pendingCount = orders.filter(
    (order) =>
      order.status.toLowerCase() === "pending"
  ).length;

  const activeCount = orders.filter(
    (order) => {
      const status = order.status.toLowerCase();

      return (
        status !== "delivered" &&
        status !== "cancelled"
      );
    }
  ).length;

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop px-4 py-5 sm:px-6 sm:py-7">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl bg-[#172554] shadow-sm">
          <div className="relative p-5 text-white sm:p-7">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/5"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#f43f5e]/10"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                      aria-hidden="true"
                    />

                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">
                      Wholesale Portal
                    </span>
                  </div>

                  <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    My Orders
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                    View your wholesale orders, check payment
                    status and track order progress.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/wholesale"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-black text-[#172554] transition hover:bg-slate-100"
                  >
                    Continue Shopping
                  </Link>

                  <Link
                    href="/wholesale/cart"
                    className="inline-flex items-center justify-center rounded-xl bg-[#f43f5e] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e11d48]"
                  >
                    🛒 Cart
                  </Link>

                  <button
                    type="button"
                    onClick={() => loadOrders(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refreshing
                      ? "↻ Refreshing..."
                      : "↻ Refresh"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              {!loading && !error && (
                <div className="relative mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 sm:max-w-2xl sm:gap-3">
                  <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                      Total Orders
                    </p>

                    <p className="mt-1 text-xl font-black sm:text-2xl">
                      {orders.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                      In Progress
                    </p>

                    <p className="mt-1 text-xl font-black text-[#fda4af] sm:text-2xl">
                      {activeCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">
                      Delivered
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-300 sm:text-2xl">
                      {deliveredCount}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm">
                  ⚠️
                </span>

                <div>
                  <p className="text-sm font-black text-red-700">
                    Unable to load orders
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-600/80">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadOrders()}
                className="w-fit rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f3] text-3xl">
              📦
            </div>

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading your orders...
            </p>

            <div className="mx-auto mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#f43f5e]" />
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff1f3] text-4xl">
                📦
              </div>

              <h2 className="mt-5 text-xl font-black text-[#172554] sm:text-2xl">
                No orders yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your wholesale orders will appear here
                after you place your first order.
              </p>

              <Link
                href="/wholesale"
                className="mt-6 inline-flex items-center rounded-xl bg-[#f43f5e] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48]"
              >
                Start Shopping
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}

        {/* Orders */}
        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="mt-5 space-y-5">
              {orders.map((order) => {
                const currentStep = getStatusStep(
                  order.status
                );

                const isCancelled =
                  order.status.toLowerCase() ===
                  "cancelled";

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="border-b border-slate-200 p-5 sm:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                              Order
                            </span>

                            <span className="text-[11px] text-slate-400">
                              {formatDate(
                                order.created_at
                              )}
                            </span>
                          </div>

                          <Link
                            href={`/wholesale/orders/${order.id}`}
                            className="mt-2 inline-block text-lg font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-xl"
                          >
                            {order.order_number}
                          </Link>

                          {order.shipping_name && (
                            <p className="mt-1 text-xs text-slate-500">
                              {order.shipping_name}
                              {order.shipping_phone
                                ? ` • ${order.shipping_phone}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-black ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {formatStatus(
                              order.status
                            )}
                          </span>

                          <span className="text-lg font-black text-[#172554] sm:text-xl">
                            ₹
                            {formatAmount(
                              order.total_amount
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {!isCancelled && (
                      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Order Progress
                          </p>

                          {currentStep >= 0 && (
                            <span className="text-[10px] font-bold text-slate-500">
                              {Math.min(
                                currentStep + 1,
                                orderStatuses.length
                              )}{" "}
                              / {orderStatuses.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 overflow-x-auto pb-2">
                          <div className="flex min-w-[520px] items-start">
                            {[
                              "Pending",
                              "Confirmed",
                              "Processing",
                              "Shipped",
                              "Delivered",
                            ].map((step, index) => {
                              const active =
                                index <= currentStep;

                              return (
                                <div
                                  key={step}
                                  className="relative flex flex-1 flex-col items-center"
                                >
                                  {index > 0 && (
                                    <div
                                      className={`absolute right-1/2 top-3 h-0.5 w-full ${
                                        index <= currentStep
                                          ? "bg-[#172554]"
                                          : "bg-slate-200"
                                      }`}
                                    />
                                  )}

                                  <div
                                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${
                                      active
                                        ? "bg-[#172554] text-white shadow-sm"
                                        : "border border-slate-200 bg-white text-slate-400"
                                    }`}
                                  >
                                    {active
                                      ? "✓"
                                      : index + 1}
                                  </div>

                                  <p
                                    className={`mt-2 text-center text-[10px] font-bold sm:text-xs ${
                                      active
                                        ? "text-[#172554]"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {step}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cancelled */}
                    {isCancelled && (
                      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            ❌
                          </div>

                          <div>
                            <p className="text-sm font-black text-red-700">
                              This order has been cancelled.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-600/80">
                              Please contact Shree Collection
                              if you need assistance with
                              this order.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Subtotal
                        </p>

                        <p className="mt-1.5 text-lg font-black text-[#172554]">
                          ₹
                          {formatAmount(
                            order.subtotal
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Payment
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${getPaymentStatusClass(
                            order.payment_status
                          )}`}
                        >
                          {formatStatus(
                            order.payment_status
                          )}
                        </span>

                        {order.payment_method && (
                          <p className="mt-2 text-[10px] font-semibold text-slate-400">
                            {formatStatus(
                              order.payment_method
                            )}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-[#f43f5e]/10 bg-[#fff1f3] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Total
                        </p>

                        <p className="mt-1.5 text-lg font-black text-[#172554]">
                          ₹
                          {formatAmount(
                            order.total_amount
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid gap-2 border-t border-slate-200 p-5 sm:grid-cols-2 sm:p-6">
                      <Link
                        href={`/wholesale/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#172554] px-4 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                      >
                        View Order Details
                        <span className="ml-2">
                          →
                        </span>
                      </Link>

                      <Link
                        href={`/wholesale/orders/${order.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-[#172554] transition hover:border-[#172554] hover:bg-slate-50"
                      >
                        📄 View Invoice
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}