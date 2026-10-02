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
    Number(product.stockQuantity) || 0
  );

  const price =
    Number(product.price) || 0;

  const totalPrice =
    price * quantity;

  const isOutOfStock =
    stock <= 0;

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

  return (
    <div
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* =================================================
          QUANTITY HEADER
      ================================================= */}

      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-sm font-black text-slate-900">
              Quantity
            </p>

            {stock > 0 ? (
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {stock}{" "}
                {stock === 1
                  ? "item"
                  : "items"}{" "}
                available
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-bold text-red-600">
                Currently unavailable
              </p>
            )}
          </div>

          {/* Quantity Selector */}

          <div
            className="
              flex
              items-center
              overflow-hidden
              rounded-xl
              border border-slate-200
              bg-white
              shadow-sm
            "
          >
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={
                quantity <= 1 ||
                isOutOfStock
              }
              aria-label="Decrease quantity"
              className="
                flex h-10 w-10
                items-center justify-center
                text-xl font-bold
                text-slate-700
                transition
                hover:bg-rose-50
                hover:text-[#f43f5e]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              −
            </button>

            <span
              aria-live="polite"
              className="
                flex h-10 min-w-12
                items-center justify-center
                border-x border-slate-200
                px-3
                text-sm font-black
                text-[#172554]
              "
            >
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={
                quantity >= stock ||
                isOutOfStock
              }
              aria-label="Increase quantity"
              className="
                flex h-10 w-10
                items-center justify-center
                text-xl font-bold
                text-slate-700
                transition
                hover:bg-rose-50
                hover:text-[#f43f5e]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              +
            </button>
          </div>

        </div>
      </div>

      <div className="p-4 sm:p-5">

        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        {!isOutOfStock && (
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border border-rose-100
              bg-rose-50/60
              px-4 py-3.5
            "
          >
            <div className="min-w-0">

              <p className="text-xs font-bold text-slate-600">
                {quantity}{" "}
                {quantity === 1
                  ? "item"
                  : "items"}{" "}
                total
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                ₹
                {price.toLocaleString(
                  "en-IN"
                )}{" "}
                per item
              </p>

            </div>

            <span
              className="
                shrink-0
                text-xl
                font-black
                tracking-tight
                text-[#172554]
                sm:text-2xl
              "
            >
              ₹
              {totalPrice.toLocaleString(
                "en-IN"
              )}
            </span>

          </div>
        )}

        {/* =================================================
            LOW STOCK WARNING
        ================================================= */}

        {!isOutOfStock &&
          stock <= 5 && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                rounded-xl
                border border-orange-100
                bg-orange-50
                px-3 py-2.5
              "
            >
              <span
                className="text-sm"
                aria-hidden="true"
              >
                🔥
              </span>

              <p className="text-xs font-bold text-orange-700">
                Only {stock}{" "}
                {stock === 1
                  ? "item"
                  : "items"}{" "}
                left in stock
              </p>
            </div>
          )}

        {/* =================================================
            ADD TO CART
        ================================================= */}

        <div className="mt-4">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="
                flex w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border border-slate-200
                bg-slate-100
                px-4 py-3.5
                text-sm font-extrabold
                text-slate-400
              "
            >
              <span aria-hidden="true">
                ×
              </span>

              Out of Stock
            </button>
          ) : (
            <AddToCartButton
              product={product}
              quantity={quantity}
            />
          )}
        </div>

        {/* =================================================
            SHOPPING BENEFITS
        ================================================= */}

        {!isOutOfStock && (
          <div className="mt-4 grid grid-cols-2 gap-2">

            <div
              className="
                rounded-xl
                border border-slate-200
                bg-slate-50
                px-3 py-3
              "
            >
              <div className="flex items-center gap-2">

                <span
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-white
                    text-sm
                    shadow-sm
                  "
                  aria-hidden="true"
                >
                  🚚
                </span>

                <div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Delivery
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                    PAN India
                  </p>
                </div>

              </div>
            </div>

            <div
              className="
                rounded-xl
                border border-slate-200
                bg-slate-50
                px-3 py-3
              "
            >
              <div className="flex items-center gap-2">

                <span
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-white
                    text-sm
                    shadow-sm
                  "
                  aria-hidden="true"
                >
                  🔒
                </span>

                <div>
                  <p className="text-xs font-extrabold text-slate-800">
                    Secure
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-500">
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