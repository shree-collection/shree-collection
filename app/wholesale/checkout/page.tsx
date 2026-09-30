"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/CartContext";

export default function WholesaleCheckoutPage() {
  const router = useRouter();

  const {
    wholesaleCart,
    wholesaleCartCount,
    wholesaleCartTotal,
    clearWholesaleCart,
  } = useCart();

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
  });

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /* --------------------------------
     Validate wholesale cart
  -------------------------------- */

  function validateWholesaleCart() {
    if (wholesaleCart.length === 0) {
      return "Your wholesale cart is empty.";
    }

    for (const item of wholesaleCart) {
      const minimumQuantity = Math.max(
        1,
        Number(item.minQuantity) || 1
      );

      const stockQuantity = Math.max(
        0,
        Number(item.stockQuantity) || 0
      );

      const quantity = Math.max(
        0,
        Number(item.quantity) || 0
      );

      if (
        stockQuantity <
        minimumQuantity
      ) {
        return `${item.name}: minimum order is ${minimumQuantity} pcs, but only ${stockQuantity} pcs are available.`;
      }

      if (quantity < minimumQuantity) {
        return `${item.name}: minimum order quantity is ${minimumQuantity} pcs.`;
      }

      if (
        quantity % minimumQuantity !==
        0
      ) {
        return `${item.name}: please order in multiples of ${minimumQuantity} pcs.`;
      }

      if (quantity > stockQuantity) {
        return `${item.name}: only ${stockQuantity} pcs are available.`;
      }
    }

    return "";
  }

  /* --------------------------------
     Submit order
  -------------------------------- */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    // Validate cart before customer details.
    const cartError =
      validateWholesaleCart();

    if (cartError) {
      setError(cartError);
      return;
    }

    if (!form.shopName.trim()) {
      setError(
        "Please enter your shop name."
      );
      return;
    }

    if (!form.ownerName.trim()) {
      setError(
        "Please enter the owner name."
      );
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        form.phone.trim()
      )
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!form.address.trim()) {
      setError(
        "Please enter your delivery address."
      );
      return;
    }

    if (!form.city.trim()) {
      setError(
        "Please enter your city."
      );
      return;
    }

    if (!form.state.trim()) {
      setError(
        "Please enter your state."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        form.pincode.trim()
      )
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/wholesale/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            shopName:
              form.shopName.trim(),
            ownerName:
              form.ownerName.trim(),
            phone:
              form.phone.trim(),
            address:
              form.address.trim(),
            city:
              form.city.trim(),
            state:
              form.state.trim(),
            pincode:
              form.pincode.trim(),
            gstNumber:
              form.gstNumber
                .trim()
                .toUpperCase(),

            items: wholesaleCart.map(
              (item) => ({
                productId: item.id,
                quantity: item.quantity,
              })
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create wholesale order."
        );
      }

      if (!data.order?.id) {
        throw new Error(
          "Order was created but order details were not returned."
        );
      }

      /*
       * Clear cart only after successful
       * order creation.
       */
      clearWholesaleCart();

      /*
       * Redirect to existing confirmation page.
       */
      router.push(
        `/wholesale/order-success?orderId=${encodeURIComponent(
          data.order.id
        )}&orderNumber=${encodeURIComponent(
          data.order.orderNumber
        )}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create wholesale order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* --------------------------------
     Empty cart
  -------------------------------- */

  if (wholesaleCart.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-shop px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-soft">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft-gold text-4xl">
                🛒
              </div>

              <h1 className="mt-5 text-2xl font-black text-brand-navy">
                Your wholesale cart is empty
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                Add wholesale products before
                proceeding to checkout.
              </p>

              <Link
                href="/wholesale"
                className="mt-6 inline-flex rounded-xl bg-brand-navy px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Browse Wholesale Products
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container-shop px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft-gold text-sm">
                📦
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                Wholesale
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
              Wholesale Checkout
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Enter your delivery details to place
              your wholesale order.
            </p>
          </div>

          <Link
            href="/wholesale/cart"
            className="inline-flex w-fit shrink-0 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-extrabold text-brand-navy shadow-sm transition hover:border-brand-gold hover:bg-brand-soft-gold"
          >
            ← Cart
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Checkout Form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft"
          >
            {/* Form Header */}
            <div className="bg-brand-navy px-5 py-5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-xl">
                  📍
                </div>

                <div>
                  <h2 className="text-base font-black">
                    Delivery Information
                  </h2>

                  <p className="mt-0.5 text-xs text-white/60">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-600"
                >
                  <span aria-hidden="true">
                    ⚠️
                  </span>

                  <span>{error}</span>
                </div>
              )}

              <div
                className={`grid gap-5 sm:grid-cols-2 ${
                  error ? "mt-5" : ""
                }`}
              >
                {/* Shop Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shopName"
                    className="text-sm font-bold text-text-secondary"
                  >
                    Shop Name *
                  </label>

                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    value={form.shopName}
                    onChange={handleChange}
                    placeholder="Enter shop name"
                    disabled={submitting}
                    autoComplete="organization"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label
                    htmlFor="ownerName"
                    className="text-sm font-bold text-text-secondary"
                  >
                    Owner Name *
                  </label>

                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                    disabled={submitting}
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-bold text-text-secondary"
                  >
                    Mobile Number *
                  </label>

                  <div className="mt-2 flex">
                    <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-surface-muted px-3 text-sm font-black text-text-secondary">
                      +91
                    </span>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            phone:
                              event.target.value.replace(
                                /\D/g,
                                ""
                              ),
                          })
                        )
                      }
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      disabled={submitting}
                      autoComplete="tel"
                      className="w-full rounded-r-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-bold text-text-secondary"
                  >
                    Delivery Address *
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={4}
                    placeholder="House / shop number, street, area..."
                    disabled={submitting}
                    autoComplete="street-address"
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-bold text-text-secondary"
                  >
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    disabled={submitting}
                    autoComplete="address-level2"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="text-sm font-bold text-text-secondary"
                  >
                    State *
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    disabled={submitting}
                    autoComplete="address-level1"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label
                    htmlFor="pincode"
                    className="text-sm font-bold text-text-secondary"
                  >
                    Pincode *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="tel"
                    value={form.pincode}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          pincode:
                            event.target.value.replace(
                              /\D/g,
                              ""
                            ),
                        })
                      )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit pincode"
                    disabled={submitting}
                    autoComplete="postal-code"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>

                {/* GST */}
                <div>
                  <label
                    htmlFor="gstNumber"
                    className="text-sm font-bold text-text-secondary"
                  >
                    GST Number
                    <span className="ml-1 font-normal text-text-light">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="gstNumber"
                    name="gstNumber"
                    type="text"
                    value={form.gstNumber}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          gstNumber:
                            event.target.value.toUpperCase(),
                        })
                      )
                    }
                    placeholder="Optional"
                    maxLength={15}
                    disabled={submitting}
                    autoComplete="off"
                    className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm uppercase text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:bg-surface-muted"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-7 border-t border-border pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-brand-navy px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating Wholesale Order..."
                    : "Place Wholesale Order →"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-text-muted">
                  Your wholesale order will be created
                  after cart and customer details are
                  validated.
                </p>
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
              <div className="bg-brand-navy px-5 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-gold">
                  Your Order
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Order Summary
                </h2>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {wholesaleCart.map(
                    (item) => {
                      const minimumQuantity =
                        Math.max(
                          1,
                          Number(
                            item.minQuantity
                          ) || 1
                        );

                      const stockQuantity =
                        Math.max(
                          0,
                          Number(
                            item.stockQuantity
                          ) || 0
                        );

                      return (
                        <div
                          key={item.id}
                          className="border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex gap-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted">
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
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-black leading-5 text-brand-navy">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs text-text-muted">
                                ₹
                                {Number(
                                  item.price
                                ).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                ×{" "}
                                {item.quantity}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <span className="rounded-full bg-brand-soft-gold px-2 py-0.5 text-[9px] font-black text-brand-navy">
                                  MOQ:{" "}
                                  {
                                    minimumQuantity
                                  }
                                </span>

                                {stockQuantity >
                                  0 && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                    Stock:{" "}
                                    {
                                      stockQuantity
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="shrink-0 text-sm font-black text-brand-navy">
                              ₹
                              {(
                                Number(
                                  item.price
                                ) *
                                Number(
                                  item.quantity
                                )
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Totals */}
                <div className="mt-5 space-y-3 border-t border-border pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">
                      Total Items
                    </span>

                    <span className="font-black text-brand-navy">
                      {wholesaleCartCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">
                      Product Total
                    </span>

                    <span className="font-black text-brand-navy">
                      ₹
                      {Number(
                        wholesaleCartTotal
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-end justify-between border-t border-border pt-4">
                    <span className="font-black text-brand-navy">
                      Total
                    </span>

                    <span className="text-2xl font-black text-brand-navy">
                      ₹
                      {Number(
                        wholesaleCartTotal
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Wholesale Notice */}
                <div className="mt-5 rounded-2xl border border-brand-gold/20 bg-brand-soft-gold p-4">
                  <div className="flex gap-3">
                    <span className="text-lg">
                      🏪
                    </span>

                    <div>
                      <p className="text-xs font-black text-brand-navy">
                        Wholesale Order
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-text-secondary">
                        Wholesale pricing has already
                        been applied. Products must be
                        ordered according to the minimum
                        quantity and available stock.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back to Cart */}
                <Link
                  href="/wholesale/cart"
                  className="mt-4 block w-full rounded-xl border border-brand-navy bg-white px-5 py-3 text-center text-sm font-extrabold text-brand-navy transition hover:bg-brand-navy hover:text-white"
                >
                  ← Back to Wholesale Cart
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}