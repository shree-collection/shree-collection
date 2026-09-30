"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
  updated_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  image_url: string | null;
};

type OrderResponse = {
  order: Order;
  items: OrderItem[];
};

const statusSteps = [
  {
    key: "confirmed",
    label: "Order Confirmed",
    description: "Your order has been received",
    icon: "✓",
  },
  {
    key: "processing",
    label: "Processing",
    description: "We're preparing your order",
    icon: "📦",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on the way",
    icon: "🚚",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order delivered successfully",
    icon: "✓",
  },
];

function getStatusIndex(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "confirmed") return 0;
  if (normalizedStatus === "processing") return 1;
  if (normalizedStatus === "shipped") return 2;
  if (normalizedStatus === "delivered") return 3;

  return -1;
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = params?.id || "";
  const mobileFromUrl = searchParams.get("mobile") || "";

  const [mobile, setMobile] = useState(mobileFromUrl);
  const [orderData, setOrderData] =
    useState<OrderResponse | null>(null);

  const [loading, setLoading] = useState(
    Boolean(mobileFromUrl)
  );

  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!orderId || !mobileFromUrl) {
      setLoading(false);
      return;
    }

    const cleanedMobile = mobileFromUrl.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanedMobile)) {
      setError("Invalid mobile number.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/orders/${orderId}?mobile=${encodeURIComponent(
            cleanedMobile
          )}`,
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

        setOrderData(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your order."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, mobileFromUrl]);

  const handleVerifyOrder = async () => {
    const cleanedMobile = mobile.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanedMobile)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setIsVerifying(true);
      setError("");

      const response = await fetch(
        `/api/orders/${orderId}?mobile=${encodeURIComponent(
          cleanedMobile
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Order not found or mobile number does not match."
        );
      }

      setOrderData(data);

      router.replace(
        `/orders/${orderId}?mobile=${encodeURIComponent(
          cleanedMobile
        )}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify your order."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-[#f43f5e]" />

            <h1 className="mt-5 text-lg font-black text-[#172554]">
              Loading your order
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your order details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* Verification */
  if (!orderData) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-xl">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
          >
            ← Track Another Order
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[#172554] px-6 py-8 text-center text-white sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                🔐
              </div>

              <h1 className="mt-4 text-2xl font-black">
                Verify Your Order
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-blue-100">
                Enter the mobile number used when placing
                this order to view its details.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Order Number
                </p>

                <p className="mt-1 break-all text-base font-black text-[#172554]">
                  {orderId}
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-extrabold text-[#172554]"
                >
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleVerifyOrder();
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOrder}
                disabled={isVerifying}
                className="mt-5 w-full rounded-xl bg-[#172554] px-4 py-3.5 text-sm font-black text-white transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying
                  ? "Verifying..."
                  : "View Order Details →"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Your mobile number is used only to verify
                access to this order.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { order, items } = orderData;

  const currentStatusIndex =
    getStatusIndex(order.status);

  const isCancelled =
    order.status.toLowerCase() === "cancelled";

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-6 pb-12 sm:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
        >
          ← Track Another Order
        </Link>

        {/* Header */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#172554] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">
                  Order Details
                </p>

                <h1 className="mt-2 break-all text-2xl font-black sm:text-3xl">
                  {order.order_number}
                </h1>

                <p className="mt-2 text-xs text-blue-100 sm:text-sm">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-black ${
                  isCancelled
                    ? "bg-red-500/15 text-red-200"
                    : "bg-emerald-500/15 text-emerald-200"
                }`}
              >
                <span
                  className={`mr-2 h-2 w-2 rounded-full ${
                    isCancelled
                      ? "bg-red-400"
                      : "bg-emerald-400"
                  }`}
                />
                {formatStatus(order.status)}
              </span>
            </div>
          </div>
        </section>

        {/* Tracking */}
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#f43f5e]">
                Tracking
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172554]">
                Order Status
              </h2>
            </div>

            {!isCancelled && (
              <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:block">
                {formatStatus(order.status)}
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-black text-red-600">
                  !
                </div>

                <div>
                  <p className="font-black text-red-700">
                    Order Cancelled
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-600">
                    This order has been cancelled. Please
                    contact us if you need assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="mt-8 hidden sm:block">
                <div className="relative grid grid-cols-4">
                  <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-slate-200" />

                  <div
                    className="absolute left-[12.5%] top-5 h-0.5 bg-[#f43f5e] transition-all"
                    style={{
                      width:
                        currentStatusIndex <= 0
                          ? "0%"
                          : `${(currentStatusIndex / 3) * 75}%`,
                    }}
                  />

                  {statusSteps.map((step, index) => {
                    const completed =
                      currentStatusIndex >= index;

                    const current =
                      currentStatusIndex === index;

                    return (
                      <div
                        key={step.key}
                        className="relative z-10 text-center"
                      >
                        <div
                          className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-black shadow-sm ${
                            completed
                              ? "bg-[#f43f5e] text-white"
                              : "bg-slate-100 text-slate-400"
                          } ${
                            current
                              ? "ring-4 ring-[#f43f5e]/10"
                              : ""
                          }`}
                        >
                          {completed ? "✓" : step.icon}
                        </div>

                        <p
                          className={`mt-3 text-xs font-black ${
                            completed
                              ? "text-[#172554]"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                        <p className="mx-auto mt-1 max-w-[130px] text-[10px] leading-4 text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-6 space-y-0 sm:hidden">
                {statusSteps.map((step, index) => {
                  const completed =
                    currentStatusIndex >= index;

                  const current =
                    currentStatusIndex === index;

                  return (
                    <div
                      key={step.key}
                      className="relative flex gap-4"
                    >
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 h-[calc(100%-4px)] w-0.5 ${
                            currentStatusIndex > index
                              ? "bg-[#f43f5e]"
                              : "bg-slate-200"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          completed
                            ? "bg-[#f43f5e] text-white"
                            : "bg-slate-100 text-slate-400"
                        } ${
                          current
                            ? "ring-4 ring-[#f43f5e]/10"
                            : ""
                        }`}
                      >
                        {completed ? "✓" : step.icon}
                      </div>

                      <div className="pb-7">
                        <p
                          className={`text-sm font-black ${
                            completed
                              ? "text-[#172554]"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Items */}
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#f43f5e]">
                Order Contents
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172554]">
                Items
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              {items.length}{" "}
              {items.length === 1 ? "product" : "products"}
            </span>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-5 first:pt-0 last:pb-0"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-24">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🎁
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-black text-[#172554] sm:text-base">
                    {item.product_name}
                  </p>

                  {item.sku && (
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      SKU: {item.sku}
                    </p>
                  )}

                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {formatCurrency(item.unit_price)} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-[#172554] sm:text-base">
                    {formatCurrency(item.total_price)}
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery + Payment */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#f43f5e]">
              Delivery
            </p>

            <h2 className="mt-1 text-xl font-black text-[#172554]">
              Delivery Address
            </h2>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-[#172554]">
                {order.shipping_name}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {order.shipping_phone}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {order.shipping_address}
                <br />
                {order.shipping_city},{" "}
                {order.shipping_state} -{" "}
                {order.shipping_pincode}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#f43f5e]">
              Payment
            </p>

            <h2 className="mt-1 text-xl font-black text-[#172554]">
              Payment Details
            </h2>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-700">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : formatStatus(
                      order.payment_method || "Pending"
                    )}
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-600">
                Payment Status:{" "}
                {formatStatus(order.payment_status)}
              </p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#f43f5e]">
            Billing
          </p>

          <h2 className="mt-1 text-xl font-black text-[#172554]">
            Order Summary
          </h2>

          <div className="mt-5 max-w-md space-y-4 sm:ml-auto">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Subtotal</span>

              <span className="font-bold text-slate-800">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">Delivery</span>

              <span className="font-bold text-slate-800">
                {Number(order.shipping_amount) === 0
                  ? "FREE"
                  : formatCurrency(order.shipping_amount)}
              </span>
            </div>

            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Discount</span>

                <span className="font-bold text-emerald-600">
                  -{formatCurrency(order.discount_amount)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-black text-[#172554]">
                  Total
                </span>

                <span className="text-2xl font-black text-[#f43f5e]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/shop"
            className="rounded-xl border-2 border-[#172554] bg-white px-4 py-3.5 text-center text-sm font-black text-[#172554] transition hover:bg-[#172554] hover:text-white"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="rounded-xl bg-[#172554] px-4 py-3.5 text-center text-sm font-black text-white transition hover:bg-[#0f172a]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}