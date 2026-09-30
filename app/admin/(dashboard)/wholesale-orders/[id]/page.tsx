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

  shop: {
    id: string;
    shop_name: string;
    owner_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    gst_number: string | null;
    status: string;
  } | null;

  items: OrderItem[];
};

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function getStatusClass(status: string) {
  switch (status) {
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
  switch (status) {
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

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingPayment, setUpdatingPayment] =
    useState(false);

  const [downloadingInvoice, setDownloadingInvoice] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =========================================================
     Load Order
  ========================================================= */

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/wholesale-orders/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load wholesale order."
        );
      }

      setOrder(data.order);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wholesale order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  /* =========================================================
     Update Order Status
  ========================================================= */

  async function updateStatus(status: string) {
    if (!order) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/wholesale-orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update order status."
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              ...data.order,
            }
          : current
      );

      setSuccess(
        "Order status updated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  /* =========================================================
     Update Payment Status
  ========================================================= */

  async function updatePaymentStatus(
    paymentStatus: string
  ) {
    if (!order) {
      return;
    }

    try {
      setUpdatingPayment(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/wholesale-orders/${order.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update payment status."
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              ...data.order,
            }
          : current
      );

      setSuccess(
        "Payment status updated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update payment status."
      );
    } finally {
      setUpdatingPayment(false);
    }
  }

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
        `/api/admin/wholesale-orders/${order.id}/invoice`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message =
          "Unable to generate invoice.";

        try {
          const data = await response.json();

          if (data.error) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `Invoice-${order.order_number}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccess(
        "Invoice downloaded successfully."
      );
    } catch (error) {
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
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            Loading wholesale order...
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
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-bold text-red-600">
              {error}
            </p>
          </div>

          <Link
            href="/admin/wholesale-orders"
            className="mt-4 inline-block text-sm font-bold text-green-600 hover:underline"
          >
            ← Back to Wholesale Orders
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFF9E8] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/admin/wholesale-orders"
          className="text-sm font-bold text-green-600 hover:underline"
        >
          ← Back to Wholesale Orders
        </Link>

        {/* Header */}
        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

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

            {/* Header Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">

              {/* Download Invoice */}
              <button
                type="button"
                onClick={downloadInvoice}
                disabled={
                  downloadingInvoice ||
                  updatingStatus ||
                  updatingPayment
                }
                className="inline-flex items-center justify-center rounded-xl bg-[#172554] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadingInvoice
                  ? "⏳ Generating Invoice..."
                  : "🧾 Download Invoice"}
              </button>

              {/* Order Status */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span
                  className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusClass(
                    order.status
                  )}`}
                >
                  {formatStatus(
                    order.status
                  )}
                </span>

                <select
                  value={order.status}
                  disabled={
                    updatingStatus ||
                    updatingPayment ||
                    downloadingInvoice
                  }
                  onChange={(event) =>
                    updateStatus(
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold capitalize text-[#172554] outline-none focus:border-green-500 disabled:opacity-50"
                >
                  {statuses.map((status) => (
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
          </div>

          {/* Messages */}
          {success && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {error}
            </div>
          )}
        </section>

        {/* Payment Status */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-extrabold text-[#172554]">
                Payment Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the payment status for this order.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${getPaymentStatusClass(
                  order.payment_status
                )}`}
              >
                {formatStatus(
                  order.payment_status
                )}
              </span>

              <select
                value={order.payment_status}
                disabled={
                  updatingStatus ||
                  updatingPayment ||
                  downloadingInvoice
                }
                onChange={(event) =>
                  updatePaymentStatus(
                    event.target.value
                  )
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold capitalize text-[#172554] outline-none focus:border-green-500 disabled:opacity-50"
              >
                {paymentStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatStatus(status)}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* Shop + Delivery */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Wholesale Shop */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#172554]">
              Wholesale Shop
            </h2>

            <div className="mt-5 space-y-4 text-sm">

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  Shop Name
                </p>

                <p className="mt-1 font-bold text-[#172554]">
                  {order.shop?.shop_name ||
                    order.shipping_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  Owner
                </p>

                <p className="mt-1 text-gray-700">
                  {order.shop?.owner_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  Mobile
                </p>

                <p className="mt-1 text-gray-700">
                  {order.shipping_phone ||
                    order.shop?.phone ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  GST Number
                </p>

                <p className="mt-1 text-gray-700">
                  {order.shop?.gst_number ||
                    "Not provided"}
                </p>
              </div>

            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#172554]">
              Delivery Address
            </h2>

            <div className="mt-5 text-sm leading-7 text-gray-600">
              <p className="font-bold text-[#172554]">
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

        </div>

        {/* Products */}
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
                    Unit Price
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
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
                ))}

                {order.items.length === 0 && (
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

        {/* Summary */}
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

        {/* Order Information */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#172554]">
            Order Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs font-bold uppercase text-gray-400">
                Order Number
              </p>

              <p className="mt-1 text-sm font-bold text-[#172554]">
                {order.order_number}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-gray-400">
                Order Status
              </p>

              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                  order.status
                )}`}
              >
                {formatStatus(
                  order.status
                )}
              </span>
            </div>

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
    </main>
  );
}