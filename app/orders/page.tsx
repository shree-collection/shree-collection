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
    .replace(/\_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
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

function getStatusDot(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-500";

    case "processing":
      return "bg-purple-500";

    case "shipped":
      return "bg-orange-500";

    case "delivered":
      return "bg-emerald-500";

    case "cancelled":
      return "bg-red-500";

    default:
      return "bg-slate-400";
  }
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

function formatAmount(amount: number) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export default function OrdersPage() {
  const [searchMode, setSearchMode] =
    useState<SearchMode>("order");

  const [orderNumber, setOrderNumber] =
    useState("");

  const [mobile, setMobile] = useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

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

    const cleanedMobile =
      mobile.replace(/\D/g, "");

    if (cleanedMobile.length !== 10) {
      setError(
        "Please enter the 10-digit mobile number used for the order."
      );
      return;
    }

    if (
      searchMode === "order" &&
      !cleanedOrderNumber
    ) {
      setError("Please enter your order number.");
      return;
    }

    try {
      setLoading(true);

      if (searchMode === "order") {
        const response = await fetch(
          `/api/orders/search?order_number=${encodeURIComponent(
            cleanedOrderNumber
          )}&mobile=${encodeURIComponent(
            cleanedMobile
          )}`,
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

        if (
          !data.orders ||
          data.orders.length === 0
        ) {
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

  const mobileForLink =
    mobile.replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =================================================
          TOP HEADER
          ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-5 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-coral">
                Shree Collection
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Track Your Order
              </h1>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                Track an order using your order number,
                or find all orders using your mobile
                number.
              </p>
            </div>

            <Link
              href="/shop/products"
              className="
                hidden
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4 py-2.5
                text-xs
                font-bold
                text-brand-navy
                transition
                hover:border-brand-coral
                hover:text-brand-coral
                sm:block
              "
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN
          ================================================= */}

      <section className="container-shop px-4 py-5 sm:py-7">
        <div className="mx-auto max-w-4xl">
          {/* =================================================
              SEARCH PANEL
              ================================================= */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Tabs */}

            <div className="border-b border-slate-200 bg-slate-50 p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    switchMode("order")
                  }
                  className={`
                    rounded-lg
                    px-3 py-2.5
                    text-[10px]
                    font-black
                    transition
                    sm:text-xs
                    ${
                      searchMode === "order"
                        ? "bg-brand-navy text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-brand-navy"
                    }
                  `}
                >
                  🔎 Track by Order Number
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("mobile")
                  }
                  className={`
                    rounded-lg
                    px-3 py-2.5
                    text-[10px]
                    font-black
                    transition
                    sm:text-xs
                    ${
                      searchMode === "mobile"
                        ? "bg-brand-navy text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-brand-navy"
                    }
                  `}
                >
                  📱 Find My Orders
                </button>
              </div>
            </div>

            {/* Search content */}

            <div className="p-4 sm:p-6">
              {searchMode === "order" ? (
                <>
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3.5">
                    <span className="text-lg">
                      🔐
                    </span>

                    <div>
                      <p className="text-xs font-black text-brand-navy">
                        Track using your order number
                      </p>

                      <p className="mt-1 text-[10px] leading-4.5 text-slate-500">
                        Enter your order number and the
                        mobile number used during
                        checkout.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Order number */}

                    <div>
                      <label
                        htmlFor="orderNumber"
                        className="mb-1.5 block text-xs font-extrabold text-brand-navy"
                      >
                        Order Number
                      </label>

                      <input
                        id="orderNumber"
                        type="text"
                        value={orderNumber}
                        onChange={(event) =>
                          setOrderNumber(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            findOrder();
                          }
                        }}
                        placeholder="Example: SC-20260927-EB9D"
                        autoComplete="off"
                        className="
                          w-full
                          rounded-lg
                          border border-slate-200
                          bg-white
                          px-3.5 py-3
                          text-xs
                          font-bold
                          uppercase
                          text-brand-navy
                          outline-none
                          transition
                          placeholder:normal-case
                          placeholder:text-slate-400
                          focus:border-brand-coral
                          focus:ring-4
                          focus:ring-brand-coral/10
                        "
                      />
                    </div>

                    {/* Mobile */}

                    <div>
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
                            findOrder();
                          }
                        }}
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        className="
                          w-full
                          rounded-lg
                          border border-slate-200
                          bg-white
                          px-3.5 py-3
                          text-xs
                          font-bold
                          text-brand-navy
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-brand-coral
                          focus:ring-4
                          focus:ring-brand-coral/10
                        "
                      />

                      <p className="mt-1.5 text-[9px] text-slate-400">
                        Mobile number used during checkout.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-brand-coral/15 bg-rose-50 p-3.5">
                    <span className="text-lg">
                      💡
                    </span>

                    <div>
                      <p className="text-xs font-black text-brand-navy">
                        Forgot your order number?
                      </p>

                      <p className="mt-1 text-[10px] leading-4.5 text-slate-500">
                        Enter the mobile number used when
                        placing your order and we'll find
                        your orders.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobileLookup"
                      className="mb-1.5 block text-xs font-extrabold text-brand-navy"
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
                      className="
                        w-full
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-3.5 py-3
                        text-xs
                        font-bold
                        text-brand-navy
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-brand-coral
                        focus:ring-4
                        focus:ring-brand-coral/10
                      "
                    />

                    <p className="mt-1.5 text-[9px] text-slate-400">
                      We'll only show orders associated
                      with this mobile number.
                    </p>
                  </div>
                </>
              )}

              {/* Error */}

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 p-3">
                  <span className="text-sm">
                    ⚠️
                  </span>

                  <p className="text-[11px] font-semibold leading-4.5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Search button */}

              <button
                type="button"
                onClick={findOrder}
                disabled={loading}
                className="
                  mt-4
                  flex w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-brand-coral
                  px-5 py-3
                  text-xs
                  font-black
                  text-white
                  shadow-sm
                  transition
                  hover:bg-rose-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

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
          </section>

          {/* =================================================
              SINGLE ORDER RESULT
              ================================================= */}

          {order && searchMode === "order" && (
            <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Order Number
                    </p>

                    <h2 className="mt-1 break-all text-base font-black text-brand-navy sm:text-lg">
                      {order.order_number}
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Placed on{" "}
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <span
                    className={`
                      inline-flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-2.5 py-1
                      text-[9px]
                      font-black
                      ${getStatusClass(
                        order.status
                      )}
                    `}
                  >
                    <span
                      className={`
                        h-1.5 w-1.5
                        rounded-full
                        ${getStatusDot(
                          order.status
                        )}
                      `}
                    />

                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[9px] font-bold text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-xs font-black text-brand-navy">
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-rose-50 p-3">
                    <p className="text-[9px] font-bold text-slate-400">
                      Total
                    </p>

                    <p className="mt-1 text-xs font-black text-brand-coral">
                      {formatAmount(
                        order.total_amount
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
                  <span className="text-sm">
                    📍
                  </span>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                      Delivery To
                    </p>

                    <p className="mt-1 text-xs font-black text-brand-navy">
                      {order.shipping_name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {order.shipping_city},{" "}
                      {order.shipping_state}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/orders/${order.id}?mobile=${encodeURIComponent(
                    mobileForLink
                  )}`}
                  className="
                    mt-3
                    flex w-full
                    items-center
                    justify-center
                    rounded-lg
                    bg-brand-navy
                    px-4 py-3
                    text-xs
                    font-black
                    text-white
                    transition
                    hover:bg-brand-dark
                  "
                >
                  View Order Details →
                </Link>
              </div>
            </section>
          )}

          {/* =================================================
              MULTIPLE ORDERS
              ================================================= */}

          {orders.length > 0 &&
            searchMode === "mobile" && (
              <section className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-coral">
                      Orders Found
                    </p>

                    <h2 className="mt-0.5 text-lg font-black text-brand-navy">
                      Your Orders
                    </h2>
                  </div>

                  <span className="rounded-full bg-brand-navy px-2.5 py-1 text-[9px] font-black text-white">
                    {orders.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {orders.map((item) => (
                    <article
                      key={item.id}
                      className="
                        overflow-hidden
                        rounded-xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                        transition
                        hover:shadow-md
                      "
                    >
                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                              Order Number
                            </p>

                            <h3 className="mt-0.5 break-all text-sm font-black text-brand-navy">
                              {item.order_number}
                            </h3>

                            <p className="mt-0.5 text-[9px] text-slate-500">
                              {formatDate(
                                item.created_at
                              )}
                            </p>
                          </div>

                          <span
                            className={`
                              inline-flex
                              shrink-0
                              items-center
                              gap-1
                              rounded-full
                              border
                              px-2 py-1
                              text-[8px]
                              font-black
                              ${getStatusClass(
                                item.status
                              )}
                            `}
                          >
                            <span
                              className={`
                                h-1.5 w-1.5
                                rounded-full
                                ${getStatusDot(
                                  item.status
                                )}
                              `}
                            />

                            {formatStatus(
                              item.status
                            )}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[9px] font-semibold text-slate-400">
                              Total Amount
                            </p>

                            <p className="mt-0.5 text-sm font-black text-brand-coral">
                              {formatAmount(
                                item.total_amount
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/orders/${item.id}?mobile=${encodeURIComponent(
                              mobileForLink
                            )}`}
                            className="
                              rounded-lg
                              bg-brand-navy
                              px-3.5 py-2.5
                              text-[10px]
                              font-black
                              text-white
                              transition
                              hover:bg-brand-dark
                            "
                          >
                            Track Order →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <span className="text-sm">
                    🔐
                  </span>

                  <p className="text-[9px] leading-4 text-blue-800">
                    Select an order to view its full
                    details. Your mobile number is used
                    to verify access to the order.
                  </p>
                </div>
              </section>
            )}

          {/* =================================================
              QUICK HELP
              ================================================= */}

          <section className="mt-5 grid gap-2.5 sm:grid-cols-3">
            <Link
              href="/shop/products"
              className="
                rounded-lg
                border border-slate-200
                bg-white
                p-3
                text-center
                transition
                hover:border-brand-coral
              "
            >
              <span className="text-lg">🛍️</span>

              <p className="mt-1 text-[10px] font-black text-brand-navy">
                Shop Products
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Browse our collection
              </p>
            </Link>

            <Link
              href="/contact"
              className="
                rounded-lg
                border border-slate-200
                bg-white
                p-3
                text-center
                transition
                hover:border-brand-coral
              "
            >
              <span className="text-lg">💬</span>

              <p className="mt-1 text-[10px] font-black text-brand-navy">
                Need Help?
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Contact our team
              </p>
            </Link>

            <Link
              href="/"
              className="
                rounded-lg
                border border-slate-200
                bg-white
                p-3
                text-center
                transition
                hover:border-brand-coral
              "
            >
              <span className="text-lg">🏠</span>

              <p className="mt-1 text-[10px] font-black text-brand-navy">
                Go to Home
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Back to Shree Collection
              </p>
            </Link>
          </section>

          <Link
            href="/shop"
            className="
              mt-5
              block
              text-center
              text-xs
              font-bold
              text-slate-500
              transition
              hover:text-brand-coral
            "
          >
            ← Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}