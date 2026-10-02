"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useCart } from "@/components/cart/CartContext";
import { createClient } from "@/lib/supabase/client";

type OrderResult = {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
};

const formatPrice = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [orderResult, setOrderResult] =
    useState<OrderResult | null>(null);

  const deliveryCharge =
    cartTotal >= 499 || cartTotal === 0 ? 0 : 49;

  const grandTotal = cartTotal + deliveryCharge;

  const freeDeliveryRemaining =
    cartTotal < 499 ? 499 - cartTotal : 0;

  const freeDeliveryProgress = Math.min(
    (cartTotal / 499) * 100,
    100
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    const cleanedName = customerName.trim();
    const cleanedMobile = mobile.replace(/\D/g, "");
    const cleanedAddress = address.trim();
    const cleanedCity = city.trim();
    const cleanedState = state.trim();
    const cleanedPincode = pincode.replace(/\D/g, "");

    if (cleanedName.length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (cleanedMobile.length !== 10) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (cleanedAddress.length < 5) {
      setErrorMessage(
        "Please enter your complete delivery address."
      );
      return;
    }

    if (!cleanedCity) {
      setErrorMessage("Please enter your city.");
      return;
    }

    if (!cleanedState) {
      setErrorMessage("Please enter your state.");
      return;
    }

    if (!/^\d{6}$/.test(cleanedPincode)) {
      setErrorMessage(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const supabase = createClient();

      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc(
        "create_guest_order",
        {
          p_customer_name: cleanedName,
          p_mobile: cleanedMobile,
          p_address: cleanedAddress,
          p_city: cleanedCity,
          p_state: cleanedState,
          p_pincode: cleanedPincode,
          p_items: items,
        }
      );

      if (error) {
        console.error(
          "Order creation error:",
          error
        );

        throw new Error(
          error.message ||
            "Unable to place your order."
        );
      }

      const result = Array.isArray(data)
        ? data[0]
        : data;

      if (!result) {
        throw new Error(
          "Order was not created. Please try again."
        );
      }

      setOrderResult({
        order_id: result.order_id,
        order_number: result.order_number,
        subtotal: Number(result.subtotal),
        shipping_amount: Number(
          result.shipping_amount
        ),
        total_amount: Number(
          result.total_amount
        ),
      });

      clearCart();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     ORDER SUCCESS
     ========================================================= */

  if (orderResult) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 bg-emerald-500" />

            <div className="p-5 sm:p-8">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl font-black text-emerald-600">
                  ✓
                </div>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>

                <h1 className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                  Order Placed Successfully!
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Thank you for shopping with Shree
                  Collection. Your order has been received
                  successfully.
                </p>
              </div>

              {/* Order number */}

              <div className="mt-6 rounded-xl bg-brand-navy p-4 text-center text-white">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-200">
                  Order Number
                </p>

                <p className="mt-1.5 break-all text-xl font-black sm:text-2xl">
                  {orderResult.order_number}
                </p>
              </div>

              {/* Summary */}

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-brand-navy">
                    {formatPrice(
                      orderResult.subtotal
                    )}
                  </span>
                </div>

                <div className="mt-2.5 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span
                    className={
                      orderResult.shipping_amount === 0
                        ? "font-bold text-emerald-600"
                        : "font-bold text-brand-navy"
                    }
                  >
                    {orderResult.shipping_amount === 0
                      ? "FREE"
                      : formatPrice(
                          orderResult.shipping_amount
                        )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-black text-brand-navy">
                    Total
                  </span>

                  <span className="text-xl font-black text-brand-coral">
                    {formatPrice(
                      orderResult.total_amount
                    )}
                  </span>
                </div>
              </div>

              {/* COD */}

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg">
                    💵
                  </span>

                  <div>
                    <p className="text-sm font-black text-brand-navy">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pay when your order is delivered.
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
                    COD
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-black text-brand-navy">
                    What happens next?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Our team will review your order and
                    contact you on your mobile number for
                    confirmation and delivery details.
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <Link
                  href={`/orders/${orderResult.order_id}?mobile=${encodeURIComponent(
                    mobile
                  )}`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-xs font-black text-white transition hover:bg-brand-dark"
                >
                  View Order
                  <span>→</span>
                </Link>

                <Link
                  href="/shop/products"
                  className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-brand-navy transition hover:border-brand-navy hover:bg-slate-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     EMPTY CART
     ========================================================= */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 bg-brand-coral" />

            <div className="p-8 text-center sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-5xl">
                🛒
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-brand-coral">
                Checkout
              </p>

              <h1 className="mt-2 text-2xl font-black text-brand-navy">
                Your Cart is Empty
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add some products before proceeding to
                checkout.
              </p>

              <Link
                href="/shop/products"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-7 py-3.5 text-sm font-black text-white transition hover:bg-brand-dark"
              >
                Continue Shopping
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     CHECKOUT
     ========================================================= */

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight text-brand-navy sm:text-2xl">
                  Checkout
                </h1>

                <span className="rounded-full bg-brand-navy px-2.5 py-1 text-[10px] font-black text-white">
                  {cartCount}{" "}
                  {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Enter your delivery details to place your
                order.
              </p>
            </div>

            <Link
              href="/cart"
              className="shrink-0 text-xs font-bold text-brand-navy transition hover:text-brand-coral"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </section>

      <div className="container-shop px-4 py-5 sm:py-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
          {/* =================================================
              DELIVERY FORM
              ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            {/* Section heading */}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-base text-white">
                📍
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-coral">
                  Delivery
                </p>

                <h2 className="mt-0.5 text-lg font-black text-brand-navy">
                  Delivery Details
                </h2>

                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                  Enter the address where you want your
                  order delivered.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Name */}

              <div>
                <label
                  htmlFor="customerName"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
                >
                  Full Name
                </label>

                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                />
              </div>

              {/* Mobile */}

              <div>
                <label
                  htmlFor="mobile"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
                >
                  Mobile Number
                </label>

                <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-brand-coral focus-within:ring-4 focus-within:ring-brand-coral/10">
                  <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500">
                    +91
                  </span>

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
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                    className="min-w-0 flex-1 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <p className="mt-1 text-[9px] text-slate-400">
                  Used for order confirmation and tracking.
                </p>
              </div>

              {/* Address */}

              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
                >
                  Full Address
                </label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="House no, street, area, landmark"
                  rows={4}
                  autoComplete="street-address"
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                />
              </div>

              {/* City / State */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    placeholder="City"
                    autoComplete="address-level2"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-1.5 block text-xs font-black text-brand-navy"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(event) =>
                      setState(event.target.value)
                    }
                    placeholder="State"
                    autoComplete="address-level1"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                  />
                </div>
              </div>

              {/* Pincode */}

              <div>
                <label
                  htmlFor="pincode"
                  className="mb-1.5 block text-xs font-black text-brand-navy"
                >
                  Pincode
                </label>

                <input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(event) =>
                    setPincode(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="6-digit pincode"
                  autoComplete="postal-code"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10"
                />
              </div>
            </div>

            {/* Error */}

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-5 text-red-600"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-black">
                  !
                </span>

                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  💵
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-black text-brand-navy">
                    Cash on Delivery
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                    Pay when your order is delivered.
                  </p>
                </div>

                <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black text-emerald-600">
                  Available
                </span>
              </div>
            </div>

            {/* Place order */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-coral py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />

                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <span>•</span>
                  {formatPrice(grandTotal)}
                </>
              )}
            </button>

            <p className="mt-2.5 text-center text-[9px] text-slate-400">
              🔒 Your order details are securely processed.
            </p>
          </form>

          {/* =================================================
              ORDER SUMMARY
              ================================================= */}

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}

              <div className="bg-brand-navy px-4 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black">
                      Order Summary
                    </h2>

                    <p className="mt-0.5 text-[10px] text-blue-100">
                      {cartCount}{" "}
                      {cartCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    🛍️
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Products */}

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-2.5"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">
                            🎁
                          </div>
                        )}

                        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-coral px-1 text-[8px] font-black text-white">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-black leading-4 text-brand-navy">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {formatPrice(item.price)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-xs font-black text-brand-navy">
                        {formatPrice(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Free delivery */}

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {freeDeliveryRemaining > 0 ? (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                          🚚
                        </span>

                        <p className="text-[10px] font-semibold leading-4 text-slate-600">
                          Add{" "}
                          <span className="font-black text-brand-navy">
                            {formatPrice(
                              freeDeliveryRemaining
                            )}
                          </span>{" "}
                          more for{" "}
                          <span className="font-black text-emerald-600">
                            FREE delivery
                          </span>
                        </p>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-brand-coral transition-all duration-500"
                          style={{
                            width: `${freeDeliveryProgress}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-[10px] font-black text-emerald-600">
                      🎉 You have FREE delivery!
                    </p>
                  )}
                </div>

                {/* Totals */}

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-bold text-brand-navy">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <div className="mt-2.5 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span
                      className={
                        deliveryCharge === 0
                          ? "font-bold text-emerald-600"
                          : "font-bold text-brand-navy"
                      }
                    >
                      {deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(deliveryCharge)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <div>
                      <span className="text-sm font-black text-brand-navy">
                        Total
                      </span>

                      <span className="mt-0.5 block text-[9px] text-slate-400">
                        Inclusive of delivery
                      </span>
                    </div>

                    <span className="text-xl font-black text-brand-coral">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Back to cart */}

                <Link
                  href="/cart"
                  className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-navy transition hover:border-brand-navy hover:bg-slate-50"
                >
                  ← Back to Cart
                </Link>

                {/* Trust */}

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                  <div>
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-sm">
                      🔒
                    </div>

                    <p className="mt-1 text-[8px] font-bold text-slate-400">
                      Secure
                    </p>
                  </div>

                  <div>
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-sm">
                      🚚
                    </div>

                    <p className="mt-1 text-[8px] font-bold text-slate-400">
                      Delivery
                    </p>
                  </div>

                  <div>
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-sm">
                      🎁
                    </div>

                    <p className="mt-1 text-[8px] font-bold text-slate-400">
                      Quality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =====================================================
          MOBILE PLACE ORDER BAR
          ===================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Pay on delivery
            </p>

            <p className="truncate text-lg font-black text-brand-navy">
              {formatPrice(grandTotal)}
            </p>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="min-h-11 flex-1 rounded-xl bg-brand-coral px-5 text-sm font-black text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            Place Order →
          </button>
        </div>
      </div>
    </main>
  );
}