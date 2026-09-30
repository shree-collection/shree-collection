"use client";

import { useState } from "react";
import Link from "next/link";

import type { Product } from "@/types/product";
import { useCart } from "./CartContext";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
};

export default function AddToCartButton({
  product,
  quantity = 1,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const isOutOfStock =
    product.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || adding) {
      return;
    }

    try {
      setAdding(true);

      addToCart(product, quantity);

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Add to cart failed:",
        error
      );
    } finally {
      setAdding(false);
    }
  };

  /* ===================================================== */
  /* OUT OF STOCK */
  /* ===================================================== */

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-extrabold text-text-muted"
      >
        <span>×</span>
        Out of Stock
      </button>
    );
  }

  /* ===================================================== */
  /* ADD TO CART */
  /* ===================================================== */

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding}
        aria-live="polite"
        className={[
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-gold focus-visible:ring-offset-2",
          added
            ? "bg-success text-white"
            : adding
              ? "cursor-wait bg-brand-gold-soft text-brand-navy"
              : "bg-brand-gold text-brand-navy hover:-translate-y-0.5 hover:bg-brand-gold-dark hover:shadow-brand active:translate-y-0",
        ].join(" ")}
      >
        {adding ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-brand-navy/30 border-t-brand-navy"
              aria-hidden="true"
            />
            Adding...
          </>
        ) : added ? (
          <>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20"
              aria-hidden="true"
            >
              ✓
            </span>
            Added to Cart
          </>
        ) : (
          <>
            <span aria-hidden="true">🛒</span>
            Add to Cart
            {quantity > 1
              ? ` (${quantity})`
              : ""}
          </>
        )}
      </button>

      {/* ================================================= */}
      {/* VIEW CART */}
      {/* ================================================= */}

      {added && (
        <Link
          href="/cart"
          className="flex w-full items-center justify-center rounded-xl border border-brand-gold bg-white px-4 py-2.5 text-sm font-extrabold text-brand-navy transition hover:bg-brand-soft-gold"
        >
          View Cart →
        </Link>
      )}
    </div>
  );
}