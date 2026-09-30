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
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-purple-100 text-purple-700";

    case "shipped":
      return "bg-indigo-100 text-indigo-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getPaymentStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700";

    case "failed":
      return "bg-red-100 text-red-700";

    case "refunded":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function WholesaleOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] =
    useState<WholesaleOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [downloadingInvoice, setDownloadingInvoice] =
    useState(false);

  /* =========================================================
     Load Order
  ========================================================= */

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
            data.error ||
              "Unable to load order."
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

  /* =========================================================
     Download Invoice
  ========================================================= */

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
        let message =
          "Unable to download invoice.";

        try {
          const data =
            await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const blob =
        await response.blob();

      if (blob.size === 0) {
        throw new Error(
          "Invoice file is empty."
        );
      }

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `Invoice-${order.order_number}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(
        downloadUrl
      );

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

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF9E8] p-4 sm:p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            Loading order...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#FFF9E8] p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-bold text-red-600">
              {error}
            </p>
          </div>

          <Link
            href="/wholesale/orders"
            className="mt-4 inline-block text-sm font-bold text-green-600 hover:underline"
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

  return (
    <main className="min-h-screen bg-[#FFF9E8] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            Back
        ===================================================== */}

        <Link
          href="/wholesale/orders"
          className="text-sm font-bold text-green-600 hover:underline"
        >
          ← Back to My Orders
        </Link>

        {/* =====================================================
            Success Message
        ===================================================== */}

        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-bold text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* =====================================================
            Error Message
        ===================================================== */}

        {error && order && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            Header
        ===================================================== */}

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                Wholesale Order
              </p>

              <h1 className="mt-1 text-2xl font-extrabold text-[#172554]">
                {order.order_number}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {new Date(
                  order.created_at
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Invoice + Status */}

            <div className="flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                className="rounded-xl bg-[#FFC928] px-4 py-3 text-sm font-extrabold text-[#172554] shadow-sm transition hover:bg-[#f5bb00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingInvoice
                  ? "Downloading..."
                  : "🧾 Download Invoice"}
              </button>

              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusClass(
                  order.status
                )}`}
              >
                {formatStatus(
                  order.status
                )}
              </span>

            </div>

          </div>

        </section>

        {/* =====================================================
            Order Progress
        ===================================================== */}

        {order.status.toLowerCase() !==
          "cancelled" && (
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#172554]">
              Order Progress
            </h2>

            <div className="mt-6 grid grid-cols-5 gap-2">

              {orderStatuses.map(
                (status, index) => {

                  const completed =
                    currentStatusIndex >=
                    index;

                  return (
                    <div
                      key={status}
                      className="text-center"
                    >

                      <div
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          completed
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {completed
                          ? "✓"
                          : index + 1}
                      </div>

                      <p
                        className={`mt-2 text-[10px] font-bold capitalize sm:text-xs ${
                          completed
                            ? "text-green-700"
                            : "text-gray-400"
                        }`}
                      >
                        {formatStatus(
                          status
                        )}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* =====================================================
            Cancelled
        ===================================================== */}

        {order.status.toLowerCase() ===
          "cancelled" && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <p className="font-bold text-red-700">
              This order has been cancelled.
            </p>

          </section>
        )}

        {/* =====================================================
            Products
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">

            <h2 className="text-lg font-extrabold text-[#172554]">
              Products
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full text-left">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">
                    Qty
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-gray-500">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {order.items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100"
                    >

                      <td className="px-5 py-4 font-bold text-[#172554]">
                        {item.product_name}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {item.sku || "—"}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        ₹
                        {Number(
                          item.unit_price
                        ).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-extrabold text-[#172554]">
                        ₹
                        {Number(
                          item.total_price
                        ).toFixed(2)}
                      </td>

                    </tr>
                  )
                )}

                {order.items.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm text-gray-500"
                    >
                      No products found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================================
            Delivery + Payment
        ===================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Delivery */}

          <section className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#172554]">
              Delivery Address
            </h2>

            <div className="mt-5 text-sm leading-7 text-gray-600">

              <p className="font-bold text-[#172554]">
                {order.shipping_name ||
                  "—"}
              </p>

              <p>
                {order.shipping_phone ||
                  "—"}
              </p>

              <p className="mt-2">
                {order.shipping_address ||
                  "—"}
              </p>

              <p>
                {order.shipping_city ||
                  ""}

                {order.shipping_state
                  ? `, ${order.shipping_state}`
                  : ""}
              </p>

              <p>
                {order.shipping_pincode ||
                  ""}
              </p>

            </div>

          </section>

          {/* Payment */}

          <section className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-lg font-extrabold text-[#172554]">
              Payment
            </h2>

            <div className="mt-5 space-y-4">

              <div>

                <p className="text-xs font-bold uppercase text-gray-400">
                  Payment Status
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${getPaymentStatusClass(
                    order.payment_status
                  )}`}
                >
                  {formatStatus(
                    order.payment_status
                  )}
                </span>

              </div>

              <div>

                <p className="text-xs font-bold uppercase text-gray-400">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-bold capitalize text-[#172554]">
                  {order.payment_method ||
                    "Not provided"}
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            Order Summary
        ===================================================== */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-lg font-extrabold text-[#172554]">
            Order Summary
          </h2>

          <div className="ml-auto mt-5 max-w-md space-y-3">

            <div className="flex justify-between text-sm">

              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-bold">
                ₹
                {Number(
                  order.subtotal
                ).toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-gray-500">
                Shipping
              </span>

              <span className="font-bold">

                {Number(
                  order.shipping_amount
                ) === 0
                  ? "FREE"
                  : `₹${Number(
                      order.shipping_amount
                    ).toFixed(2)}`}

              </span>

            </div>

            <div className="flex justify-between text-sm">

              <span className="text-gray-500">
                Discount
              </span>

              <span className="font-bold">
                ₹
                {Number(
                  order.discount_amount
                ).toFixed(2)}
              </span>

            </div>

            <div className="border-t border-gray-100 pt-3">

              <div className="flex justify-between">

                <span className="font-extrabold text-[#172554]">
                  Total
                </span>

                <span className="text-xl font-extrabold text-green-600">
                  ₹
                  {Number(
                    order.total_amount
                  ).toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            Bottom Actions
        ===================================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

          <Link
            href="/wholesale/orders"
            className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-[#172554] shadow-sm transition hover:bg-gray-50"
          >
            ← Back to My Orders
          </Link>

          <button
            type="button"
            onClick={downloadInvoice}
            disabled={downloadingInvoice}
            className="rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-extrabold text-[#172554] shadow-sm transition hover:bg-[#f5bb00] disabled:cursor-not-allowed disabled:opacity-60"
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