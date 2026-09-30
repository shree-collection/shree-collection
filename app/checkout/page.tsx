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

    if (isSubmitting) {
      return;
    }

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

  /* =====================================================
     ORDER SUCCESS
  ===================================================== */

  if (orderResult) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-emerald-500" />

            <div className="p-6 text-center sm:p-8">
              {/* Success Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl text-emerald-600">
                ✓
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-[#f43f5e]">
                Shree Collection
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                Order Placed Successfully!
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Thank you for shopping with Shree
                Collection. Your order has been received
                successfully.
              </p>

              {/* Order Number */}
              <div className="mt-6 rounded-2xl bg-[#172554] p-5 text-white">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-200">
                  Order Number
                </p>

                <p className="mt-2 break-all text-2xl font-black text-white">
                  {orderResult.order_number}
                </p>
              </div>

              {/* Order Summary */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-[#172554]">
                    ₹
                    {orderResult.subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="mt-3 flex justify-between">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span
                    className={
                      orderResult.shipping_amount === 0
                        ? "font-bold text-emerald-600"
                        : "font-bold text-[#172554]"
                    }
                  >
                    {orderResult.shipping_amount === 0
                      ? "FREE"
                      : `₹${orderResult.shipping_amount.toLocaleString(
                          "en-IN"
                        )}`}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-black text-[#172554]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#f43f5e]">
                    ₹
                    {orderResult.total_amount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
                    aria-hidden="true"
                  >
                    💵
                  </span>

                  <div>
                    <p className="text-sm font-extrabold text-[#172554]">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pay when your order is delivered.
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-sm font-extrabold text-[#172554]">
                    What happens next?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Our team will review your order and
                    contact you on your mobile number for
                    confirmation and delivery details.
                  </p>
                </div>
              </div>

              {/* Order Actions */}
              <div className="mt-6 grid gap-3">
                <Link
                  href={`/orders/${orderResult.order_id}?mobile=${encodeURIComponent(
                    mobile
                  )}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#0f172a]"
                >
                  View Order Details
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/shop"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-extrabold text-[#172554] transition hover:border-[#172554] hover:bg-slate-50"
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

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-[#f43f5e]" />

            <div className="p-8 text-center sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-5xl">
                🛒
              </div>

              <h1 className="mt-5 text-2xl font-black text-[#172554]">
                Your Cart is Empty
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add some products before proceeding to
                checkout.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#172554] px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#0f172a]"
              >
                Continue Shopping
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     CHECKOUT
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 pb-12 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f43f5e]">
                Shree Collection
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                Checkout
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Enter your delivery details to place your
                order.
              </p>
            </div>

            <Link
              href="/cart"
              className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
            >
              <span aria-hidden="true">←</span>
              Back to Cart
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* =================================================
              DELIVERY FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172554] text-lg text-white">
                📍
              </div>

              <div>
                <h2 className="text-lg font-black text-[#172554]">
                  Delivery Details
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Enter the address where you want your
                  order delivered.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                />
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                />

                <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
                  Used for order confirmation and tracking.
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                  rows={3}
                  autoComplete="street-address"
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label
                  htmlFor="pincode"
                  className="mb-1.5 block text-sm font-extrabold text-[#172554]"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-4 focus:ring-[#f43f5e]/10"
                />
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black"
                  aria-hidden="true"
                >
                  !
                </span>

                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Method */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
                  aria-hidden="true"
                >
                  💵
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#172554]">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Pay when your order is delivered.
                  </p>
                </div>

                <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-extrabold text-emerald-600">
                  Available
                </span>
              </div>
            </div>

            {/* Place Order */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] py-4 text-sm font-extrabold text-white transition hover:bg-[#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
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
                  <span aria-hidden="true">•</span>
                  ₹
                  {grandTotal.toLocaleString("en-IN")}
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              🔒 Your order details are securely processed.
            </p>
          </form>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md lg:sticky lg:top-24">
            <div className="border-b border-slate-200 bg-[#172554] px-5 py-5 text-white">
              <h2 className="text-lg font-black">
                Order Summary
              </h2>

              <p className="mt-0.5 text-xs text-blue-100">
                {cartCount} item
                {cartCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-5">
              {/* Products */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          🎁
                        </div>
                      )}

                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#172554]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}{" "}
                        × {item.quantity}
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm font-black text-[#172554]">
                      ₹
                      {(
                        item.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Free Delivery Progress */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {freeDeliveryRemaining > 0 ? (
                  <>
                    <p className="text-xs font-semibold leading-5 text-slate-600">
                      Add{" "}
                      <span className="font-black text-[#172554]">
                        ₹
                        {freeDeliveryRemaining.toLocaleString(
                          "en-IN"
                        )}
                      </span>{" "}
                      more for{" "}
                      <span className="font-black text-emerald-600">
                        FREE delivery
                      </span>
                    </p>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#f43f5e] transition-all duration-500"
                        style={{
                          width: `${freeDeliveryProgress}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-center text-xs font-extrabold text-emerald-600">
                    🎉 You have FREE delivery!
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-[#172554]">
                    ₹
                    {cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span
                    className={
                      deliveryCharge === 0
                        ? "font-bold text-emerald-600"
                        : "font-bold text-[#172554]"
                    }
                  >
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-black text-[#172554]">
                    Total
                  </span>

                  <span className="text-xl font-black text-[#f43f5e]">
                    ₹
                    {grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Back to Cart */}
              <Link
                href="/cart"
                className="mt-5 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#172554] transition hover:border-[#172554] hover:bg-slate-50"
              >
                ← Back to Cart
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}