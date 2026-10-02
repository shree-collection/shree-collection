"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

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
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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

function formatStatus(status: string) {
  return status
    .replace(/\_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatAmount(amount: number) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

export default function WholesaleOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] =
    useState<WholesaleOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadingInvoice, setDownloadingInvoice] =
    useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/wholesale/orders/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load order."
          );
        }

        setOrder(data.order);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  async function downloadInvoice() {
    if (!order) {
      return;
    }

    try {
      setDownloadingInvoice(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/wholesale/orders/${order.id}/invoice`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message = "Unable to download invoice.";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Invoice file is empty.");
      }

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Invoice-${order.order_number}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(
        "Invoice downloaded successfully."
      );
    } catch (error) {
      console.error(
        "Invoice download error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to download invoice."
      );
    } finally {
      setDownloadingInvoice(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f3] text-3xl">
            📦
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            Loading order...
          </p>

          <div className="mx-auto mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#f43f5e]" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                ⚠️
              </span>

              <div>
                <p className="font-black text-red-700">
                  Unable to load order
                </p>

                <p className="mt-1 text-sm text-red-600/80">
                  {error}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/wholesale/orders"
            className="mt-5 inline-flex items-center rounded-xl bg-[#172554] px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            ← Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const currentStatusIndex =
    orderStatuses.indexOf(
      order.status.toLowerCase()
    );

  const isCancelled =
    order.status.toLowerCase() === "cancelled";

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop px-4 py-5 sm:px-6 sm:py-7">
        {/* Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
          <Link
            href="/wholesale"
            className="transition hover:text-[#f43f5e]"
          >
            Wholesale
          </Link>

          <span>/</span>

          <Link
            href="/wholesale/orders"
            className="transition hover:text-[#f43f5e]"
          >
            My Orders
          </Link>

          <span>/</span>

          <span className="text-slate-600">
            {order.order_number}
          </span>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                ✓
              </span>

              <p className="text-sm font-bold text-emerald-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && order && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                ⚠️
              </span>

              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Order Header */}
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
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" />
                    Wholesale Order
                  </span>

                  <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    {order.order_number}
                  </h1>

                  <p className="mt-2 text-sm text-white/60">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-2 text-xs font-black ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>

                  <button
                    type="button"
                    onClick={downloadInvoice}
                    disabled={downloadingInvoice}
                    className="inline-flex items-center justify-center rounded-xl bg-[#f43f5e] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e11d48] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingInvoice
                      ? "Downloading..."
                      : "🧾 Download Invoice"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progress */}
        {!isCancelled && (
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Order Tracking
                </p>

                <h2 className="mt-1 text-lg font-black text-[#172554]">
                  Order Progress
                </h2>
              </div>

              {currentStatusIndex >= 0 && (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">
                  {Math.min(
                    currentStatusIndex + 1,
                    orderStatuses.length
                  )}{" "}
                  / {orderStatuses.length}
                </span>
              )}
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-[560px] items-start">
                {orderStatuses.map(
                  (status, index) => {
                    const completed =
                      currentStatusIndex >= index;

                    return (
                      <div
                        key={status}
                        className="relative flex flex-1 flex-col items-center"
                      >
                        {index > 0 && (
                          <div
                            className={`absolute right-1/2 top-3 h-0.5 w-full ${
                              index <= currentStatusIndex
                                ? "bg-[#172554]"
                                : "bg-slate-200"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                            completed
                              ? "bg-[#172554] text-white"
                              : "border border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <p
                          className={`mt-2 text-center text-[10px] font-bold capitalize sm:text-xs ${
                            completed
                              ? "text-[#172554]"
                              : "text-slate-400"
                          }`}
                        >
                          {formatStatus(status)}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </section>
        )}

        {/* Cancelled */}
        {isCancelled && (
          <section className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                ❌
              </div>

              <div>
                <p className="font-black text-red-700">
                  This order has been cancelled.
                </p>

                <p className="mt-1 text-sm text-red-600/80">
                  Please contact Shree Collection if you
                  need assistance with this order.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Order Items
                </p>

                <h2 className="mt-1 text-lg font-black text-[#172554]">
                  Products
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {order.items.length}{" "}
                {order.items.length === 1
                  ? "item"
                  : "items"}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Product
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Qty
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Price
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#172554]">
                        {item.product_name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.sku || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-8 justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                        {item.quantity}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      ₹{formatAmount(item.unit_price)}
                    </td>

                    <td className="px-5 py-4 text-right font-black text-[#172554]">
                      ₹{formatAmount(item.total_price)}
                    </td>
                  </tr>
                ))}

                {order.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delivery + Payment */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Delivery */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Shipping
            </p>

            <h2 className="mt-1 text-lg font-black text-[#172554]">
              Delivery Address
            </h2>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              <p className="font-black text-[#172554]">
                {order.shipping_name || "—"}
              </p>

              <p>
                {order.shipping_phone || "—"}
              </p>

              <p className="mt-2">
                {order.shipping_address || "—"}
              </p>

              <p>
                {order.shipping_city || ""}
                {order.shipping_state
                  ? `, ${order.shipping_state}`
                  : ""}
              </p>

              <p>
                {order.shipping_pincode || ""}
              </p>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Payment
            </p>

            <h2 className="mt-1 text-lg font-black text-[#172554]">
              Payment Information
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Payment Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${getPaymentStatusClass(
                    order.payment_status
                  )}`}
                >
                  {formatStatus(
                    order.payment_status
                  )}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Payment Method
                </p>

                <p className="mt-2 text-sm font-black capitalize text-[#172554]">
                  {order.payment_method ||
                    "Not provided"}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Payment Summary
              </p>

              <h2 className="mt-1 text-lg font-black text-[#172554]">
                Order Summary
              </h2>
            </div>

            <div className="w-full max-w-md space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-bold text-slate-700">
                  ₹{formatAmount(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Shipping
                </span>

                <span className="font-bold text-slate-700">
                  {Number(order.shipping_amount) === 0
                    ? "FREE"
                    : `₹${formatAmount(
                        order.shipping_amount
                      )}`}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-bold text-slate-700">
                  ₹{formatAmount(order.discount_amount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#172554]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#f43f5e]">
                    ₹{formatAmount(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/wholesale/orders"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#172554] shadow-sm transition hover:border-[#172554] hover:bg-slate-50"
          >
            ← Back to My Orders
          </Link>

          <button
            type="button"
            onClick={downloadInvoice}
            disabled={downloadingInvoice}
            className="inline-flex items-center justify-center rounded-xl bg-[#f43f5e] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloadingInvoice
              ? "Downloading..."
              : "🧾 Download Invoice"}
          </button>
        </div>
      </div>
    </main>
  );
}