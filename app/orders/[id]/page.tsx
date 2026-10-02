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
    label: "Confirmed",
    description: "Order received",
    icon: "✓",
  },
  {
    key: "processing",
    label: "Processing",
    description: "Being prepared",
    icon: "📦",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "On the way",
    icon: "🚚",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Successfully delivered",
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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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
  const mobileFromUrl =
    searchParams.get("mobile") || "";

  const [mobile, setMobile] =
    useState(mobileFromUrl);

  const [orderData, setOrderData] =
    useState<OrderResponse | null>(null);

  const [loading, setLoading] = useState(
    Boolean(mobileFromUrl)
  );

  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] =
    useState(false);

  useEffect(() => {
    if (!orderId || !mobileFromUrl) {
      setLoading(false);
      return;
    }

    const cleanedMobile =
      mobileFromUrl.replace(/\D/g, "");

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
    const cleanedMobile =
      mobile.replace(/\D/g, "");

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

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div
              className="
                mx-auto
                h-12 w-12
                animate-spin
                rounded-full
                border-4
                border-slate-200
                border-t-brand-coral
              "
            />

            <h1 className="mt-5 text-lg font-black text-brand-navy">
              Loading your order
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your order
              details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     VERIFY ORDER
     ===================================================== */

  if (!orderData) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-xl">
          <Link
            href="/orders"
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              font-bold
              text-brand-navy
              transition
              hover:text-brand-coral
            "
          >
            ← Track Another Order
          </Link>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 bg-brand-coral" />

            <div className="bg-brand-navy px-6 py-7 text-center text-white">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-2xl">
                🔐
              </div>

              <h1 className="mt-4 text-2xl font-black">
                Verify Your Order
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-blue-100">
                Enter the mobile number used when
                placing this order to view its details.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Order Number
                </p>

                <p className="mt-1 break-all text-sm font-black text-brand-navy">
                  {orderId}
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="mobile"
                  className="mb-1.5 block text-xs font-extrabold text-brand-navy"
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
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleVerifyOrder();
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  autoComplete="tel"
                  className="
                    w-full
                    rounded-lg
                    border border-slate-200
                    bg-white
                    px-3.5 py-3
                    text-sm
                    font-semibold
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-brand-coral
                    focus:ring-4
                    focus:ring-brand-coral/10
                  "
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="
                    mt-4
                    rounded-lg
                    border border-red-100
                    bg-red-50
                    p-3
                    text-xs
                    font-semibold
                    leading-5
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOrder}
                disabled={isVerifying}
                className="
                  mt-4
                  flex w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-brand-navy
                  py-3
                  text-xs
                  font-extrabold
                  text-white
                  transition
                  hover:bg-brand-dark
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isVerifying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    View Order Details
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">
                Your mobile number is used only to
                verify access to this order.
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

  /* =====================================================
     ORDER DETAILS
     ===================================================== */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 pb-12 sm:py-7">
      <div className="container-shop">
        {/* =================================================
            TOP NAV
            ================================================= */}

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/orders"
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              font-bold
              text-brand-navy
              transition
              hover:text-brand-coral
            "
          >
            ← Track Another Order
          </Link>

          <Link
            href="/shop/products"
            className="
              hidden
              text-xs
              font-bold
              text-slate-500
              transition
              hover:text-brand-coral
              sm:block
            "
          >
            Continue Shopping →
          </Link>
        </div>

        {/* =================================================
            ORDER HEADER
            ================================================= */}

        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 bg-brand-coral" />

          <div className="bg-brand-navy px-4 py-5 text-white sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-200">
                  Order Details
                </p>

                <h1 className="mt-1 break-all text-xl font-black sm:text-2xl">
                  {order.order_number}
                </h1>

                <p className="mt-1.5 text-[10px] text-blue-100 sm:text-xs">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <span
                className={`
                  inline-flex
                  w-fit
                  items-center
                  rounded-full
                  px-3
                  py-1.5
                  text-[10px]
                  font-black
                  ${
                    isCancelled
                      ? "bg-red-500/15 text-red-200"
                      : "bg-emerald-500/15 text-emerald-200"
                  }
                `}
              >
                <span
                  className={`
                    mr-1.5
                    h-1.5 w-1.5
                    rounded-full
                    ${
                      isCancelled
                        ? "bg-red-400"
                        : "bg-emerald-400"
                    }
                  `}
                />

                {formatStatus(order.status)}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            TRACKING
            ================================================= */}

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
                Tracking
              </p>

              <h2 className="mt-0.5 text-lg font-black text-brand-navy">
                Order Status
              </h2>
            </div>

            {!isCancelled && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                {formatStatus(order.status)}
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-black text-red-600">
                  !
                </div>

                <div>
                  <p className="text-sm font-black text-red-700">
                    Order Cancelled
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    This order has been cancelled.
                    Please contact us if you need
                    assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop tracker */}

              <div className="mt-7 hidden sm:block">
                <div className="relative grid grid-cols-4">
                  <div className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 bg-slate-200" />

                  <div
                    className="absolute left-[12.5%] top-4 h-0.5 bg-brand-coral transition-all"
                    style={{
                      width:
                        currentStatusIndex <= 0
                          ? "0%"
                          : `${
                              (currentStatusIndex /
                                3) *
                              75
                            }%`,
                    }}
                  />

                  {statusSteps.map(
                    (step, index) => {
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
                            className={`
                              mx-auto
                              flex h-8 w-8
                              items-center
                              justify-center
                              rounded-full
                              border-4 border-white
                              text-xs
                              font-black
                              shadow-sm
                              ${
                                completed
                                  ? "bg-brand-coral text-white"
                                  : "bg-slate-100 text-slate-400"
                              }
                              ${
                                current
                                  ? "ring-4 ring-brand-coral/10"
                                  : ""
                              }
                            `}
                          >
                            {completed
                              ? "✓"
                              : step.icon}
                          </div>

                          <p
                            className={`
                              mt-2
                              text-[10px]
                              font-black
                              ${
                                completed
                                  ? "text-brand-navy"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {step.label}
                          </p>

                          <p className="mx-auto mt-0.5 max-w-[110px] text-[9px] leading-3.5 text-slate-400">
                            {step.description}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Mobile tracker */}

              <div className="mt-5 sm:hidden">
                {statusSteps.map(
                  (step, index) => {
                    const completed =
                      currentStatusIndex >= index;

                    const current =
                      currentStatusIndex === index;

                    return (
                      <div
                        key={step.key}
                        className="relative flex gap-3"
                      >
                        {index <
                          statusSteps.length - 1 && (
                          <div
                            className={`
                              absolute
                              left-[15px]
                              top-8
                              h-[calc(100%-4px)]
                              w-0.5
                              ${
                                currentStatusIndex >
                                index
                                  ? "bg-brand-coral"
                                  : "bg-slate-200"
                              }
                            `}
                          />
                        )}

                        <div
                          className={`
                            relative
                            z-10
                            flex h-8 w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-xs
                            font-black
                            ${
                              completed
                                ? "bg-brand-coral text-white"
                                : "bg-slate-100 text-slate-400"
                            }
                            ${
                              current
                                ? "ring-4 ring-brand-coral/10"
                                : ""
                            }
                          `}
                        >
                          {completed
                            ? "✓"
                            : step.icon}
                        </div>

                        <div className="pb-6">
                          <p
                            className={`
                              text-xs
                              font-black
                              ${
                                completed
                                  ? "text-brand-navy"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {step.label}
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            ORDER ITEMS
            ================================================= */}

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
                Order Contents
              </p>

              <h2 className="mt-0.5 text-lg font-black text-brand-navy">
                Items
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
              {items.length}{" "}
              {items.length === 1
                ? "product"
                : "products"}
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 sm:h-20 sm:w-20">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🎁
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-black leading-4.5 text-brand-navy sm:text-sm">
                    {item.product_name}
                  </p>

                  {item.sku && (
                    <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                      SKU: {item.sku}
                    </p>
                  )}

                  <p className="mt-1.5 text-[10px] font-medium text-slate-500">
                    {formatCurrency(item.unit_price)} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-brand-navy sm:text-sm">
                    {formatCurrency(item.total_price)}
                  </p>

                  <p className="mt-0.5 text-[9px] font-medium text-slate-400">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            DELIVERY + PAYMENT
            ================================================= */}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Delivery */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
              Delivery
            </p>

            <h2 className="mt-0.5 text-lg font-black text-brand-navy">
              Delivery Address
            </h2>

            <div className="mt-4 rounded-lg bg-slate-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="text-base">📍</span>

                <div className="min-w-0">
                  <p className="text-xs font-black text-brand-navy">
                    {order.shipping_name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {order.shipping_phone}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {order.shipping_address}
                    <br />
                    {order.shipping_city},{" "}
                    {order.shipping_state} -{" "}
                    {order.shipping_pincode}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
              Payment
            </p>

            <h2 className="mt-0.5 text-lg font-black text-brand-navy">
              Payment Details
            </h2>

            <div className="mt-4 rounded-lg bg-emerald-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">💵</span>

                <div>
                  <p className="text-xs font-black text-emerald-700">
                    {order.payment_method ===
                    "cod"
                      ? "Cash on Delivery"
                      : formatStatus(
                          order.payment_method ||
                            "Pending"
                        )}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                    Payment Status:{" "}
                    {formatStatus(
                      order.payment_status
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            ORDER SUMMARY
            ================================================= */}

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
            Billing
          </p>

          <h2 className="mt-0.5 text-lg font-black text-brand-navy">
            Order Summary
          </h2>

          <div className="mt-4 max-w-sm space-y-3 sm:ml-auto">
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-bold text-slate-800">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-xs">
              <span className="text-slate-500">
                Delivery
              </span>

              <span className="font-bold text-slate-800">
                {Number(order.shipping_amount) ===
                0
                  ? "FREE"
                  : formatCurrency(
                      order.shipping_amount
                    )}
              </span>
            </div>

            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-bold text-emerald-600">
                  -
                  {formatCurrency(
                    order.discount_amount
                  )}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-black text-brand-navy">
                  Total
                </span>

                <span className="text-xl font-black text-brand-coral sm:text-2xl">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ACTIONS
            ================================================= */}

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <Link
            href="/shop/products"
            className="
              rounded-lg
              border
              border-brand-navy
              bg-white
              px-4 py-3
              text-center
              text-xs
              font-extrabold
              text-brand-navy
              transition
              hover:bg-brand-navy
              hover:text-white
            "
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="
              rounded-lg
              bg-brand-navy
              px-4 py-3
              text-center
              text-xs
              font-extrabold
              text-white
              transition
              hover:bg-brand-dark
            "
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}