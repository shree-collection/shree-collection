"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  const deliveryCharge =
    cartTotal >= 499 || cartTotal === 0 ? 0 : 49;

  const grandTotal = cartTotal + deliveryCharge;

  const freeDeliveryRemaining =
    cartTotal < 499 ? 499 - cartTotal : 0;

  const freeDeliveryProgress = Math.min(
    (cartTotal / 499) * 100,
    100
  );

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1.5 bg-[#f43f5e]" />

            <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-5xl">
                🛒
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#f43f5e]">
                Shree Collection
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
                Your Cart is Empty
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Looks like you haven't added anything to
                your cart yet. Explore our collection and
                find something you'll love.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#172554] px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#0f172a]"
              >
                Start Shopping
                <span aria-hidden="true">→</span>
              </Link>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                <span>✓ Trending Gifts</span>
                <span>✓ Toys</span>
                <span>✓ Party Items</span>
                <span>✓ PAN India Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     CART
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-12">
      {/* =================================================
          CART HEADER
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f43f5e]">
                Shree Collection
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                  My Cart
                </h1>

                <span className="rounded-full bg-[#172554] px-3 py-1 text-xs font-extrabold text-white">
                  {cartCount}{" "}
                  {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Review your items before checkout.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
            >
              <span aria-hidden="true">←</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* =================================================
              CART ITEMS
          ================================================= */}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#172554] sm:text-xl">
                  Cart Items
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {cartCount}{" "}
                  {cartCount === 1 ? "product" : "products"}{" "}
                  in your cart
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="rounded-lg px-2 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-3">
              {cart.map((item) => {
                const isOutOfStock =
                  item.stockQuantity <= 0;

                const isAtStockLimit =
                  item.quantity >= item.stockQuantity;

                const itemTotal =
                  item.price * item.quantity;

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.slug}`}
                          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-32"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl">
                              🎁
                            </div>
                          )}

                          <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 shadow-sm">
                            View
                          </span>
                        </Link>

                        {/* Product Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              className="min-w-0"
                            >
                              <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-[#172554] transition hover:text-[#f43f5e] sm:text-base">
                                {item.name}
                              </h3>
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(item.id)
                              }
                              aria-label={`Remove ${item.name}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>

                          <p className="mt-1.5 text-lg font-black text-[#f43f5e]">
                            ₹
                            {item.price.toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          {isOutOfStock ? (
                            <p className="mt-1 text-xs font-bold text-red-500">
                              Out of stock
                            </p>
                          ) : isAtStockLimit ? (
                            <p className="mt-1 text-xs font-bold text-amber-600">
                              Maximum available quantity
                            </p>
                          ) : (
                            <p className="mt-1 text-xs font-semibold text-emerald-600">
                              ✓ In stock
                            </p>
                          )}

                          {/* Quantity */}
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  item.quantity <= 1
                                }
                                aria-label="Decrease quantity"
                                className="flex h-9 w-9 items-center justify-center text-lg font-bold text-[#172554] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                −
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center border-x border-slate-200 px-2 text-sm font-extrabold text-[#172554]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    Math.min(
                                      item.quantity + 1,
                                      item.stockQuantity
                                    )
                                  )
                                }
                                disabled={
                                  isOutOfStock ||
                                  isAtStockLimit
                                }
                                aria-label="Increase quantity"
                                className="flex h-9 w-9 items-center justify-center text-lg font-bold text-[#172554] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-semibold text-slate-400">
                              Qty
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold text-slate-400">
                          Item Total
                        </span>

                        <span className="text-sm font-black text-[#172554]">
                          ₹
                          {itemTotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#172554] transition hover:border-[#172554] hover:bg-slate-50"
            >
              <span aria-hidden="true">←</span>
              Continue Shopping
            </Link>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="mt-6 lg:mt-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md lg:sticky lg:top-24">
              <div className="border-b border-slate-200 bg-[#172554] px-5 py-5 text-white">
                <h2 className="text-lg font-black">
                  Order Summary
                </h2>

                <p className="mt-0.5 text-xs text-blue-100">
                  Your final order amount
                </p>
              </div>

              <div className="p-5">
                {/* Free Delivery Progress */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  {freeDeliveryRemaining > 0 ? (
                    <>
                      <div className="flex items-start gap-2">
                        <span
                          className="text-lg"
                          aria-hidden="true"
                        >
                          🚚
                        </span>

                        <p className="text-xs font-semibold leading-5 text-slate-600">
                          Add{" "}
                          <span className="font-black text-[#172554]">
                            ₹
                            {freeDeliveryRemaining.toLocaleString(
                              "en-IN"
                            )}
                          </span>{" "}
                          more to unlock{" "}
                          <span className="font-black text-emerald-600">
                            FREE delivery
                          </span>
                        </p>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-[#f43f5e] transition-all duration-500"
                          style={{
                            width: `${freeDeliveryProgress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
                        <span>
                          ₹
                          {cartTotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <span>₹499</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm text-white">
                        ✓
                      </span>

                      <p className="text-xs font-extrabold text-emerald-600">
                        You unlocked FREE delivery!
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Items
                    </span>

                    <span className="font-bold text-[#172554]">
                      {cartCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-bold text-[#172554]">
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span
                      className={
                        deliveryCharge === 0
                          ? "font-extrabold text-emerald-600"
                          : "font-bold text-[#172554]"
                      }
                    >
                      {deliveryCharge === 0
                        ? "FREE"
                        : `₹${deliveryCharge}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <span className="block text-sm font-black text-[#172554]">
                          Total
                        </span>

                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          Inclusive of delivery
                        </span>
                      </div>

                      <span className="text-2xl font-black text-[#f43f5e]">
                        ₹
                        {grandTotal.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout */}
                <Link
                  href="/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#172554] py-3.5 text-sm font-extrabold text-white transition hover:bg-[#0f172a]"
                >
                  Proceed to Checkout
                  <span aria-hidden="true">→</span>
                </Link>

                {/* Trust */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 text-center">
                  <div>
                    <div className="text-base">🔒</div>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      Secure
                    </p>
                  </div>

                  <div>
                    <div className="text-base">🚚</div>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      Delivery
                    </p>
                  </div>

                  <div>
                    <div className="text-base">🎁</div>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      Quality
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =================================================
          CLEAR CART CONFIRMATION
      ================================================= */}

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="h-1.5 bg-[#f43f5e]" />

            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
                  🛒
                </div>

                <h2
                  id="clear-cart-title"
                  className="mt-4 text-xl font-black text-[#172554]"
                >
                  Clear your cart?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  All products will be removed from your
                  cart. This action cannot be undone.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowClearConfirm(false)
                  }
                  className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-[#172554] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="rounded-xl bg-red-500 py-3 text-sm font-extrabold text-white transition hover:bg-red-600 active:scale-[0.99]"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}