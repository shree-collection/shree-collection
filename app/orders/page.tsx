"use client";

import Link from "next/link";
import { useState } from "react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  shipping_name: string;
  shipping_city: string;
  shipping_state: string;
  created_at: string;
};

type SearchMode = "order" | "mobile";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function OrdersPage() {
  const [searchMode, setSearchMode] =
    useState<SearchMode>("order");

  const [orderNumber, setOrderNumber] = useState("");
  const [mobile, setMobile] = useState("");

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetResults = () => {
    setOrder(null);
    setOrders([]);
    setError("");
  };

  const switchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    resetResults();
  };

  const findOrder = async () => {
    setError("");
    setOrder(null);
    setOrders([]);

    const cleanedOrderNumber =
      orderNumber.trim().toUpperCase();

    const cleanedMobile = mobile.replace(/\D/g, "");

    if (cleanedMobile.length !== 10) {
      setError(
        "Please enter the 10-digit mobile number used for the order."
      );
      return;
    }

    if (searchMode === "order" && !cleanedOrderNumber) {
      setError("Please enter your order number.");
      return;
    }

    try {
      setLoading(true);

      if (searchMode === "order") {
        const response = await fetch(
          `/api/orders/search?order_number=${encodeURIComponent(
            cleanedOrderNumber
          )}&mobile=${encodeURIComponent(cleanedMobile)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Order not found."
          );
        }

        setOrder(data.order);
      } else {
        const response = await fetch(
          `/api/orders/lookup?mobile=${encodeURIComponent(
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
              "Unable to find orders for this mobile number."
          );
        }

        if (!data.orders || data.orders.length === 0) {
          throw new Error(
            "No orders were found for this mobile number."
          );
        }

        setOrders(data.orders);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to find your order."
      );
    } finally {
      setLoading(false);
    }
  };

  const mobileForLink = mobile.replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172554] text-2xl shadow-sm">
              📦
            </div>

            <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#f43f5e]">
              Shree Collection
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
              Track Your Order
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Check your order status using your order number,
              or find your orders with the mobile number used
              during checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="container-shop px-4 py-7 sm:py-10">
        <div className="mx-auto max-w-3xl">
          {/* Search Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Tabs */}
            <div className="border-b border-slate-200 bg-slate-50 p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchMode("order")}
                  className={`rounded-2xl px-4 py-3 text-xs font-black transition sm:text-sm ${
                    searchMode === "order"
                      ? "bg-[#172554] text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-[#172554]"
                  }`}
                >
                  🔎 Track by Order Number
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("mobile")}
                  className={`rounded-2xl px-4 py-3 text-xs font-black transition sm:text-sm ${
                    searchMode === "mobile"
                      ? "bg-[#172554] text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-[#172554]"
                  }`}
                >
                  📱 Forgot Order Number?
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {searchMode === "order" ? (
                <>
                  <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔐</span>

                      <div>
                        <p className="text-sm font-black text-[#172554]">
                          Track using your order number
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Enter the order number and the mobile
                          number used during checkout.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="orderNumber"
                        className="mb-2 block text-sm font-extrabold text-[#172554]"
                      >
                        Order Number
                      </label>

                      <input
                        id="orderNumber"
                        type="text"
                        value={orderNumber}
                        onChange={(event) =>
                          setOrderNumber(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            findOrder();
                          }
                        }}
                        placeholder="Example: SC-20260927-EB9D"
                        autoComplete="off"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold uppercase text-[#172554] outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                      />
                    </div>

                    <div>
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
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            findOrder();
                          }
                        }}
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-[#172554] outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                      />

                      <p className="mt-2 text-[11px] text-slate-400">
                        Use the mobile number entered when
                        placing your order.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 rounded-2xl border border-[#f43f5e]/15 bg-[#fff1f3] p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💡</span>

                      <div>
                        <p className="text-sm font-black text-[#172554]">
                          Forgot your order number?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          No problem. Enter the mobile number
                          used when placing your order and
                          we&apos;ll find your orders.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobileLookup"
                      className="mb-2 block text-sm font-extrabold text-[#172554]"
                    >
                      Mobile Number
                    </label>

                    <input
                      id="mobileLookup"
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
                          findOrder();
                        }
                      }}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-[#172554] outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                    />

                    <p className="mt-2 text-[11px] text-slate-400">
                      We&apos;ll only show orders associated
                      with this mobile number.
                    </p>
                  </div>
                </>
              )}

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>

                    <p className="text-sm font-semibold leading-5 text-red-600">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={findOrder}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {searchMode === "mobile"
                      ? "Finding Your Orders..."
                      : "Finding Order..."}
                  </>
                ) : (
                  <>
                    {searchMode === "mobile"
                      ? "Find My Orders"
                      : "Track Order"}
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Single Order */}
          {order && searchMode === "order" && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Order Number
                    </p>

                    <h2 className="mt-1 break-all text-xl font-black text-[#172554]">
                      {order.order_number}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-black ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm font-black text-[#172554]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fff1f3] p-4">
                    <p className="text-[10px] font-bold text-slate-400">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-black text-[#f43f5e]">
                      {formatAmount(order.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Delivery To
                  </p>

                  <p className="mt-1 text-sm font-black text-[#172554]">
                    {order.shipping_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {order.shipping_city},{" "}
                    {order.shipping_state}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.id}?mobile=${encodeURIComponent(
                    mobileForLink
                  )}`}
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#f43f5e] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#e11d48]"
                >
                  View Order Details →
                </Link>
              </div>
            </div>
          )}

          {/* Multiple Orders */}
          {orders.length > 0 && searchMode === "mobile" && (
            <div className="mt-7">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f43f5e]">
                    Orders Found
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#172554]">
                    Your Orders
                  </h2>
                </div>

                <span className="rounded-full bg-[#172554] px-3 py-1.5 text-xs font-black text-white">
                  {orders.length}
                </span>
              </div>

              <div className="space-y-3">
                {orders.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Order Number
                          </p>

                          <h3 className="mt-1 break-all text-base font-black text-[#172554]">
                            {item.order_number}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400">
                            Total Amount
                          </p>

                          <p className="mt-0.5 text-base font-black text-[#f43f5e]">
                            {formatAmount(item.total_amount)}
                          </p>
                        </div>

                        <Link
                          href={`/orders/${item.id}?mobile=${encodeURIComponent(
                            mobileForLink
                          )}`}
                          className="rounded-xl bg-[#172554] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0f172a]"
                        >
                          Track Order →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <span>🔐</span>

                  <p className="text-xs leading-5 text-blue-800">
                    Select an order to view its full details.
                    Your mobile number is used to verify access
                    to the order.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/shop"
            className="mt-8 block text-center text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
          >
            ← Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}