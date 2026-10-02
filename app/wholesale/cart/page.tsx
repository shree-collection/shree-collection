"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartContext";

function formatPrice(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WholesaleCartPage() {
  const {
    wholesaleCart,
    removeFromWholesaleCart,
    updateWholesaleQuantity,
    clearWholesaleCart,
  } = useCart();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const safeCart = wholesaleCart.filter(
    (item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string"
  );

  const safeCartCount = safeCart.reduce((total, item) => {
    const quantity = Number(item.quantity);

    return (
      total +
      (Number.isFinite(quantity) ? quantity : 0)
    );
  }, 0);

  const safeCartTotal = safeCart.reduce((total, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(quantity)
    ) {
      return total;
    }

    return total + price * quantity;
  }, 0);

  const cartValidation = safeCart.map((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const stockQuantity = Number(item.stockQuantity);

    const minimumQuantity = Math.max(
      1,
      Number(item.minQuantity) || 1
    );

    const safeStock =
      Number.isFinite(stockQuantity) &&
      stockQuantity > 0
        ? stockQuantity
        : 0;

    const maxQuantity =
      Math.floor(safeStock / minimumQuantity) *
      minimumQuantity;

    const validQuantity =
      Number.isFinite(quantity) &&
      quantity >= minimumQuantity &&
      quantity <= maxQuantity &&
      quantity % minimumQuantity === 0;

    const validPrice =
      Number.isFinite(price) && price >= 0;

    return {
      id: item.id,
      valid: validQuantity && validPrice,
      minimumQuantity,
      maxQuantity,
      stockQuantity: safeStock,
      quantity: Number.isFinite(quantity)
        ? quantity
        : 0,
    };
  });

  const hasInvalidItems = cartValidation.some(
    (item) => !item.valid
  );

  function getValidation(itemId: string) {
    return cartValidation.find(
      (item) => item.id === itemId
    );
  }

  function handleClearCart() {
    const confirmed = window.confirm(
      "Are you sure you want to clear your wholesale cart?"
    );

    if (!confirmed) {
      return;
    }

    clearWholesaleCart();
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#fffdf7]">
        <div className="container-shop px-4 py-8 sm:px-6">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-7 w-48 rounded bg-slate-100" />
            <div className="mt-4 h-20 rounded-2xl bg-slate-100" />
            <div className="mt-4 h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff1f3] text-sm">
                🛒
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Wholesale
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
              Wholesale Cart
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {safeCartCount}{" "}
              {safeCartCount === 1 ? "piece" : "pieces"}{" "}
              in your cart
            </p>
          </div>

          <Link
            href="/wholesale"
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-[#172554] transition hover:border-[#172554] hover:bg-slate-50"
          >
            ← Products
          </Link>
        </div>

        {/* Empty Cart */}
        {safeCart.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#fff1f3] text-4xl">
              🛒
            </div>

            <h2 className="mt-5 text-xl font-black text-[#172554]">
              Your wholesale cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add products from the wholesale catalogue
              to continue.
            </p>

            <Link
              href="/wholesale"
              className="mt-6 inline-flex rounded-xl bg-[#172554] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0f172a]"
            >
              Browse Wholesale Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {safeCart.map((item) => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const stockQuantity = Number(
                  item.stockQuantity
                );

                const minimumQuantity = Math.max(
                  1,
                  Number(item.minQuantity) || 1
                );

                const safePrice =
                  Number.isFinite(price) ? price : 0;

                const safeStock =
                  Number.isFinite(stockQuantity) &&
                  stockQuantity > 0
                    ? stockQuantity
                    : 0;

                const maxQuantity =
                  Math.floor(
                    safeStock / minimumQuantity
                  ) * minimumQuantity;

                const safeQuantity =
                  Number.isFinite(quantity) &&
                  quantity >= minimumQuantity
                    ? Math.min(
                        maxQuantity || minimumQuantity,
                        Math.floor(
                          quantity / minimumQuantity
                        ) * minimumQuantity
                      )
                    : minimumQuantity;

                const itemTotal =
                  safePrice * safeQuantity;

                const canDecrease =
                  safeQuantity > minimumQuantity;

                const canIncrease =
                  safeQuantity < maxQuantity &&
                  maxQuantity >= minimumQuantity;

                const validation = getValidation(item.id);

                const isValid =
                  validation?.valid ?? false;

                return (
                  <article
                    key={item.id}
                    className={`rounded-3xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                      isValid
                        ? "border-slate-200"
                        : "border-red-200 bg-red-50/30"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/wholesale/products/${item.id}`}
                        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-28 sm:w-28"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="relative z-[1] h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            🎁
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              href={`/wholesale/products/${item.id}`}
                            >
                              <h2 className="line-clamp-2 text-sm font-black leading-5 text-[#172554] transition hover:text-[#f43f5e] sm:text-base">
                                {item.name}
                              </h2>
                            </Link>

                            {item.sku && (
                              <p className="mt-1.5 truncate text-[10px] font-medium text-slate-400">
                                SKU: {item.sku}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-[#172554]">
                                {formatPrice(safePrice)}{" "}
                                <span className="text-[10px] font-bold text-slate-400">
                                  / piece
                                </span>
                              </span>

                              <span className="rounded-full bg-[#fff1f3] px-2.5 py-1 text-[10px] font-black text-[#172554]">
                                MOQ: {minimumQuantity}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Total */}
                          <div className="hidden shrink-0 text-right sm:block">
                            <p className="text-xs font-bold text-slate-400">
                              Item Total
                            </p>

                            <p className="mt-1 text-lg font-black text-[#172554]">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateWholesaleQuantity(
                                  item.id,
                                  Math.max(
                                    minimumQuantity,
                                    safeQuantity -
                                      minimumQuantity
                                  )
                                )
                              }
                              disabled={!canDecrease}
                              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-[#172554] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              −
                            </button>

                            <span className="flex h-10 min-w-16 items-center justify-center border-x border-slate-200 px-3 text-sm font-black text-[#172554]">
                              {safeQuantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateWholesaleQuantity(
                                  item.id,
                                  Math.min(
                                    maxQuantity,
                                    safeQuantity +
                                      minimumQuantity
                                  )
                                )
                              }
                              disabled={!canIncrease}
                              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-[#172554] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              +
                            </button>
                          </div>

                          <span className="text-[11px] font-medium text-slate-400">
                            Step: {minimumQuantity} pcs
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromWholesaleCart(
                                item.id
                              )
                            }
                            className="text-xs font-bold text-red-500 transition hover:text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          Order in multiples of{" "}
                          {minimumQuantity} pcs
                        </p>

                        {/* Mobile Total */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 sm:hidden">
                          <span className="text-xs font-bold text-slate-400">
                            Item Total
                          </span>

                          <span className="text-base font-black text-[#172554]">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>

                        {/* Stock Warnings */}
                        {maxQuantity <
                          minimumQuantity && (
                          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                            Insufficient stock for the
                            minimum order quantity.
                          </p>
                        )}

                        {maxQuantity >=
                          minimumQuantity &&
                          safeQuantity > maxQuantity && (
                            <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                              Quantity exceeds available
                              stock.
                            </p>
                          )}

                        {safeQuantity %
                          minimumQuantity !==
                          0 && (
                          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                            Quantity must be a multiple of{" "}
                            {minimumQuantity}.
                          </p>
                        )}

                        {maxQuantity >=
                          minimumQuantity && (
                          <p className="mt-1.5 text-[11px] text-slate-400">
                            Maximum orderable:{" "}
                            {maxQuantity} pcs
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Clear Cart */}
              <button
                type="button"
                onClick={handleClearCart}
                className="rounded-xl px-1 py-2 text-sm font-bold text-red-500 transition hover:text-red-700 hover:underline"
              >
                Clear Wholesale Cart
              </button>
            </div>

            {/* Order Summary */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-[#172554] px-5 py-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                    Wholesale Order
                  </p>

                  <h2 className="mt-1 text-lg font-black">
                    Order Summary
                  </h2>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {/* Total Pieces */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Total Pieces
                      </span>

                      <span className="font-black text-[#172554]">
                        {safeCartCount}
                      </span>
                    </div>

                    {/* Products */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Products
                      </span>

                      <span className="font-black text-[#172554]">
                        {safeCart.length}
                      </span>
                    </div>

                    {/* Product Total */}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Product Total
                      </span>

                      <span className="font-black text-[#172554]">
                        {formatPrice(safeCartTotal)}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-end justify-between">
                        <span className="font-black text-[#172554]">
                          Total
                        </span>

                        <span className="text-2xl font-black text-[#172554]">
                          {formatPrice(safeCartTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Validation Warning */}
                  {hasInvalidItems && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5">
                      <p className="text-xs font-black text-red-600">
                        Please fix your cart before checkout.
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-red-500">
                        Check the quantity and available
                        stock for the highlighted products.
                      </p>
                    </div>
                  )}

                  {/* Checkout */}
                  {hasInvalidItems ? (
                    <button
                      type="button"
                      disabled
                      className="mt-6 block w-full cursor-not-allowed rounded-xl bg-slate-100 px-5 py-4 text-center text-sm font-black text-slate-400"
                    >
                      Fix Cart to Continue
                    </button>
                  ) : (
                    <Link
                      href="/wholesale/checkout"
                      className="mt-6 block w-full rounded-xl bg-[#f43f5e] px-5 py-4 text-center text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e11d48]"
                    >
                      Proceed to Wholesale Checkout
                      <span className="ml-1">→</span>
                    </Link>
                  )}

                  {/* Continue Shopping */}
                  <Link
                    href="/wholesale"
                    className="mt-3 block w-full rounded-xl border border-[#172554] bg-white px-5 py-3 text-center text-sm font-extrabold text-[#172554] transition hover:bg-[#172554] hover:text-white"
                  >
                    Continue Shopping
                  </Link>

                  <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-center">
                    <p className="text-[11px] leading-5 text-slate-500">
                      Shipping and payment options will be
                      available during checkout.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}