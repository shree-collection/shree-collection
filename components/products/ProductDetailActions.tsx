"use client";

import { useState } from "react";

import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Product } from "@/types/product";

type ProductDetailActionsProps = {
  product: Product;
};

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const stock = Math.max(
    0,
    product.stockQuantity
  );

  const totalPrice = product.price * quantity;

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (current >= stock) {
        return current;
      }

      return current + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  };

  const isOutOfStock = stock <= 0;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      {/* Header */}
      <div className="border-b border-border bg-surface-muted px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-text-primary">
              Quantity
            </p>

            {stock > 0 ? (
              <p className="mt-0.5 text-xs font-medium text-text-muted">
                {stock} available
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-semibold text-danger">
                Currently unavailable
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={
                quantity <= 1 || isOutOfStock
              }
              aria-label="Decrease quantity"
              className="flex h-10 w-10 items-center justify-center text-xl font-bold text-text-primary transition hover:bg-brand-soft-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>

            <span
              aria-live="polite"
              className="flex h-10 min-w-12 items-center justify-center border-x border-border px-3 text-sm font-black text-text-primary"
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={
                quantity >= stock || isOutOfStock
              }
              aria-label="Increase quantity"
              className="flex h-10 w-10 items-center justify-center text-xl font-bold text-text-primary transition hover:bg-brand-soft-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Total */}
        {!isOutOfStock && (
          <div className="flex items-center justify-between rounded-xl border border-brand-gold/30 bg-brand-soft-gold px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-text-secondary">
                Total for {quantity}{" "}
                {quantity === 1 ? "item" : "items"}
              </p>

              <p className="mt-0.5 text-[10px] text-text-muted">
                ₹
                {Number(product.price).toLocaleString(
                  "en-IN"
                )}{" "}
                each
              </p>
            </div>

            <span className="text-xl font-black text-brand-coral">
              ₹
              {totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* Stock Warning */}
        {!isOutOfStock && stock <= 5 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">
            <span aria-hidden="true">🔥</span>

            <p className="text-xs font-bold text-warning">
              Only {stock} left in stock
            </p>
          </div>
        )}

        {/* Add To Cart */}
        <div className="mt-4">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3.5 text-sm font-extrabold text-text-muted"
            >
              <span aria-hidden="true">×</span>
              Out of Stock
            </button>
          ) : (
            <AddToCartButton
              product={product}
              quantity={quantity}
            />
          )}
        </div>

        {/* Delivery Information */}
        {!isOutOfStock && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-surface-muted px-3 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm"
                  aria-hidden="true"
                >
                  🚚
                </span>

                <div>
                  <p className="text-xs font-extrabold text-text-primary">
                    Delivery
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-text-muted">
                    Available
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-muted px-3 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm"
                  aria-hidden="true"
                >
                  🔒
                </span>

                <div>
                  <p className="text-xs font-extrabold text-text-primary">
                    Secure
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-text-muted">
                    Safe checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}