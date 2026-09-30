"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Order = {
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
};

type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
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

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;
}

function getStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "processing":
      return "bg-purple-50 text-purple-700 border-purple-100";

    case "shipped":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";

    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "cancelled":
      return "bg-red-50 text-red-700 border-red-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
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
      return "text-orange-600";
  }
}

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-light">
        {label}
      </p>

      <div className="mt-1.5 text-sm font-bold text-brand-navy">
        {children}
      </div>
    </div>
  );
}

function getInitials(name: string | null) {
  if (!name?.trim()) {
    return "C";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const router = useRouter();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] =
    useState<Order | null>(null);

  const [orderItems, setOrderItems] = useState<
    OrderItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  /*
   * Resolve the dynamic route parameter once.
   */
  useEffect(() => {
    let cancelled = false;

    const resolveParams = async () => {
      try {
        const resolvedParams = await params;

        if (!cancelled) {
          setOrderId(resolvedParams.id);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setErrorMessage(
            "Unable to load order information."
          );
          setIsLoading(false);
        }
      }
    };

    resolveParams();

    return () => {
      cancelled = true;
    };
  }, [params]);

  /*
   * Load order after order ID is available.
   */
  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        setMessage("");

        const response = await fetch(
          `/api/admin/orders/${orderId}`,
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

        if (cancelled) {
          return;
        }

        setOrder(data.order);
        setOrderItems(data.items || []);
        setSelectedStatus(data.order.status);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load order."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const updateStatus = async () => {
    if (!order) {
      return;
    }

    if (selectedStatus === order.status) {
      return;
    }

    /*
     * Ask for confirmation before cancellation because
     * cancellation restores product stock.
     */
    if (selectedStatus === "cancelled") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this order? Product stock will be restored."
      );

      if (!confirmed) {
        setSelectedStatus(order.status);
        return;
      }
    }

    setMessage("");
    setErrorMessage("");
    setIsUpdating(true);

    try {
      const response = await fetch(
        "/api/admin/orders/status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            status: selectedStatus,
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

      setOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              status: selectedStatus,
              updated_at:
                data.order?.updated_at ||
                new Date().toISOString(),
            }
          : currentOrder
      );

      setMessage(
        selectedStatus === "cancelled"
          ? "Order cancelled and stock restored successfully."
          : "Order status updated successfully."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setSelectedStatus(order.status);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /* =========================================================
     Loading
  ========================================================== */
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="h-2 bg-brand-navy" />

            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-surface-muted text-3xl">
                📦
              </div>

              <p className="mt-4 text-sm font-bold text-text-muted">
                Loading order...
              </p>

              <div className="mx-auto mt-5 h-2 w-40 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-gold" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     Error
  ========================================================== */
  if (errorMessage && !order) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="h-2 bg-red-500" />

            <div className="p-7 text-center sm:p-9">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                ⚠️
              </div>

              <h1 className="mt-5 text-xl font-black text-brand-navy">
                Unable to Load Order
              </h1>

              <p className="mt-2 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>

              <Link
                href="/admin/orders"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-xs font-black text-white transition hover:bg-slate-800"
              >
                ← Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const customerName =
    order.shipping_name || "Customer";

  const isCancelled =
    order.status === "cancelled";

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-6">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted transition hover:text-brand-navy"
          >
            <span aria-hidden="true">←</span>
            Back to Orders
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Retail Order
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                  {order.order_number}
                </h1>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black capitalize ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-text-muted">
                Order created{" "}
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-wider text-text-light">
                Order Total
              </p>

              <p className="mt-1 text-xl font-black text-brand-navy">
                {formatCurrency(
                  order.total_amount
                )}
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            Status Management
        ====================================================== */}
        <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
          <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
                ↻
              </div>

              <div>
                <h2 className="text-base font-black text-brand-navy">
                  Order Status
                </h2>

                <p className="mt-0.5 text-xs text-text-muted">
                  Update the current status of this
                  order.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Status Progress */}
            {!isCancelled && (
              <div className="mb-6 hidden items-center gap-0 sm:flex">
                {[
                  "pending",
                  "confirmed",
                  "processing",
                  "shipped",
                  "delivered",
                ].map((status, index) => {
                  const currentIndex = [
                    "pending",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                  ].indexOf(order.status);

                  const statusIndex = index;
                  const isComplete =
                    currentIndex >= statusIndex;

                  return (
                    <div
                      key={status}
                      className="flex min-w-0 flex-1 items-center"
                    >
                      <div className="flex min-w-0 flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                            isComplete
                              ? "bg-brand-navy text-white"
                              : "bg-surface-muted text-text-light"
                          }`}
                        >
                          {isComplete
                            ? "✓"
                            : index + 1}
                        </div>

                        <span
                          className={`mt-2 text-[9px] font-bold capitalize ${
                            isComplete
                              ? "text-brand-navy"
                              : "text-text-light"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {index < 4 && (
                        <div
                          className={`mx-2 mt-[-17px] h-0.5 flex-1 ${
                            currentIndex >
                            statusIndex
                              ? "bg-brand-navy"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(
                    event.target.value
                  );
                  setMessage("");
                  setErrorMessage("");
                }}
                disabled={
                  isUpdating || isCancelled
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold capitalize text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 sm:max-w-xs"
              >
                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={updateStatus}
                disabled={
                  isUpdating ||
                  selectedStatus ===
                    order.status ||
                  isCancelled
                }
                className="rounded-xl bg-brand-navy px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating
                  ? "Updating..."
                  : "Update Status"}
              </button>
            </div>

            {isCancelled && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    ⚠️
                  </span>

                  <div>
                    <p className="text-xs font-black text-red-700">
                      Order Cancelled
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600/80">
                      This order has been cancelled.
                      Stock was restored when the
                      cancellation was processed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">
                  ✓ {message}
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            Customer Details
        ====================================================== */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold text-sm font-black text-brand-navy">
                {getInitials(
                  order.shipping_name
                )}
              </div>

              <div>
                <h2 className="text-base font-black text-brand-navy">
                  Customer Details
                </h2>

                <p className="mt-0.5 text-xs text-text-muted">
                  Delivery and contact information
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Customer Name">
                {customerName}
              </InfoItem>

              <InfoItem label="Mobile Number">
                {order.shipping_phone || "-"}
              </InfoItem>

              <div className="sm:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-light">
                  Delivery Address
                </p>

                <div className="mt-2 rounded-2xl bg-surface-muted p-4">
                  <p className="text-sm font-bold leading-6 text-brand-navy">
                    {order.shipping_address ||
                      "-"}
                    <br />

                    {order.shipping_city || ""}

                    {order.shipping_city &&
                    order.shipping_state
                      ? ", "
                      : ""}

                    {order.shipping_state || ""}

                    {order.shipping_pincode
                      ? ` - ${order.shipping_pincode}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Products
        ====================================================== */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-black text-brand-navy">
                Products
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Items included in this order
              </p>
            </div>

            <span className="rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-black text-text-muted">
              {orderItems.length}{" "}
              {orderItems.length !== 1
                ? "products"
                : "product"}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            {orderItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
                <div className="text-2xl">
                  📦
                </div>

                <p className="mt-2 text-xs font-bold text-text-muted">
                  No products found for this order.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-white p-4 transition hover:border-brand-gold/40 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-brand-navy">
                            {item.product_name}
                          </p>

                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-light">
                            <span>
                              SKU:{" "}
                              {item.sku ||
                                "N/A"}
                            </span>

                            {item.product_id && (
                              <span className="break-all">
                                Product ID:{" "}
                                {
                                  item.product_id
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-brand-coral/10 px-2.5 py-1 text-[10px] font-black text-brand-coral">
                          ×{item.quantity}
                        </span>
                      </div>

                      {/* Product Values */}
                      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-text-light">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-black text-brand-navy">
                            {item.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-text-light">
                            Unit Price
                          </p>

                          <p className="mt-1 text-sm font-black text-brand-navy">
                            {formatCurrency(
                              item.unit_price
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-wider text-text-light">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-black text-brand-coral">
                            {formatCurrency(
                              item.total_price
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            Payment + Total
        ====================================================== */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Payment */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-5">
              <h2 className="text-base font-black text-brand-navy">
                Payment
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Payment method and current status
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-text-muted">
                  Method
                </span>

                <span className="text-right text-xs font-black capitalize text-brand-navy">
                  {order.payment_method ===
                  "cod"
                    ? "Cash on Delivery"
                    : order.payment_method ||
                      "-"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-text-muted">
                  Payment Status
                </span>

                <span
                  className={`text-xs font-black capitalize ${getPaymentClass(
                    order.payment_status
                  )}`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
          </section>

          {/* Order Total */}
          <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
            <div className="border-b border-border px-5 py-5">
              <h2 className="text-base font-black text-brand-navy">
                Order Total
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Complete order amount
              </p>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-text-muted">
                  Subtotal
                </span>

                <span className="font-bold text-brand-navy">
                  {formatCurrency(
                    order.subtotal
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-text-muted">
                  Delivery
                </span>

                <span className="font-bold text-brand-navy">
                  {Number(
                    order.shipping_amount
                  ) === 0
                    ? "FREE"
                    : formatCurrency(
                        order.shipping_amount
                      )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-text-muted">
                  Discount
                </span>

                <span className="font-bold text-brand-navy">
                  {formatCurrency(
                    order.discount_amount
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="font-black text-brand-navy">
                  Total
                </span>

                <span className="text-xl font-black text-brand-coral">
                  {formatCurrency(
                    order.total_amount
                  )}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            Order Dates
        ====================================================== */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-2xl bg-surface-muted p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                Order Created
              </p>

              <p className="mt-1.5 text-xs font-bold text-brand-navy">
                {formatDate(
                  order.created_at
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-surface-muted p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-text-light">
                Last Updated
              </p>

              <p className="mt-1.5 text-xs font-bold text-brand-navy">
                {formatDate(
                  order.updated_at
                )}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            Footer Action
        ====================================================== */}
        <div className="mt-5 pb-6">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-xs font-black text-text-secondary shadow-sm transition hover:bg-surface-muted hover:text-brand-navy"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    </main>
  );
}