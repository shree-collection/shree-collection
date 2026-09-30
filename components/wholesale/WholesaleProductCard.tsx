"use client";

import { useState } from "react";
import Link from "next/link";

import { useCart } from "@/components/cart/CartContext";

type WholesaleProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  retailPrice: number;
  wholesalePrice: number;
  minQuantity: number;
  stockQuantity: number;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  image: string | null;
  images: string[];
};

export default function WholesaleProductCard({
  product,
}: {
  product: WholesaleProduct;
}) {
  const {
    addToWholesaleCart,
    wholesaleCart,
  } = useCart();

  /* --------------------------------
     Existing cart item
  -------------------------------- */

  const existingItem = wholesaleCart.find(
    (item) => item.id === product.id
  );

  /* --------------------------------
     Minimum quantity
  -------------------------------- */

  const minimumQuantity = Math.max(
    1,
    Number(product.minQuantity) || 1
  );

  /* --------------------------------
     Maximum valid quantity
  -------------------------------- */

  const maxQuantity =
    product.stockQuantity >= minimumQuantity
      ? Math.floor(
          product.stockQuantity /
            minimumQuantity
        ) * minimumQuantity
      : 0;

  /* --------------------------------
     Quantity
  -------------------------------- */

  const [quantity, setQuantity] =
    useState(
      existingItem?.quantity ||
        minimumQuantity
    );

  /* --------------------------------
     Added state
  -------------------------------- */

  const [added, setAdded] = useState(
    Boolean(existingItem)
  );

  /* --------------------------------
     Can add
  -------------------------------- */

  const canAdd =
    product.stockQuantity >=
      minimumQuantity &&
    quantity >= minimumQuantity &&
    quantity <= maxQuantity &&
    quantity % minimumQuantity === 0;

  /* --------------------------------
     Product detail URL
  -------------------------------- */

  const productUrl =
    `/wholesale/products/${product.id}`;

  /* --------------------------------
     Quantity
  -------------------------------- */

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(
        minimumQuantity,
        current - minimumQuantity
      )
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        maxQuantity,
        current + minimumQuantity
      )
    );
  }

  function handleQuantityChange(
    value: string
  ) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    if (parsed <= minimumQuantity) {
      setQuantity(minimumQuantity);
      return;
    }

    const multiples =
      Math.floor(
        parsed / minimumQuantity
      ) * minimumQuantity;

    setQuantity(
      Math.min(
        maxQuantity,
        Math.max(
          minimumQuantity,
          multiples
        )
      )
    );
  }

  /* --------------------------------
     Add to wholesale cart
  -------------------------------- */

  function handleAddToCart() {
    if (!canAdd) {
      return;
    }

    addToWholesaleCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.wholesalePrice,
      image: product.image || "",
      category:
        product.category?.name ?? "",
      rating: 0,
      reviews: 0,
      stockQuantity:
        product.stockQuantity,
      oldPrice: product.retailPrice,
      discount: undefined,
      quantity,
      minQuantity:
        minimumQuantity,
      isWholesale: true,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  /* --------------------------------
     Savings
  -------------------------------- */

  const savings =
    product.retailPrice > 0
      ? Math.round(
          ((product.retailPrice -
            product.wholesalePrice) /
            product.retailPrice) *
            100
        )
      : 0;

  /* --------------------------------
     Total
  -------------------------------- */

  const totalAmount =
    product.wholesalePrice * quantity;

  /* --------------------------------
     Render
  -------------------------------- */

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md">
      {/* --------------------------------
          Product Image
      -------------------------------- */}

      <Link
        href={productUrl}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🎁
            </div>
          )}

          {/* Wholesale Badge */}

          <div className="absolute left-3 top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm">
            WHOLESALE
          </div>

          {/* Savings */}

          {savings > 0 && (
            <div className="absolute right-3 top-3 rounded-full bg-[#FFC928] px-3 py-1 text-xs font-extrabold text-[#172554] shadow-sm">
              Save {savings}%
            </div>
          )}
        </div>
      </Link>

      {/* --------------------------------
          Product Information
      -------------------------------- */}

      <div className="p-4">
        {/* Category */}

        {product.category && (
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}

        <Link
          href={productUrl}
          className="mt-1 block"
        >
          <h3 className="line-clamp-2 min-h-[48px] text-base font-extrabold text-[#172554] hover:text-green-600">
            {product.name}
          </h3>
        </Link>

        {/* SKU */}

        {product.sku && (
          <p className="mt-1 text-[10px] font-semibold text-gray-400">
            SKU: {product.sku}
          </p>
        )}

        {/* --------------------------------
            Price
        -------------------------------- */}

        <div className="mt-3 rounded-xl bg-[#FFF9E8] p-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-400">
                Wholesale Price
              </p>

              <p className="mt-1 text-2xl font-extrabold text-green-600">
                ₹
                {Number(
                  product.wholesalePrice
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">
                Retail
              </p>

              <p className="text-sm font-semibold text-gray-400 line-through">
                ₹
                {Number(
                  product.retailPrice
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {savings > 0 && (
            <p className="mt-2 text-xs font-bold text-green-600">
              Save {savings}% vs retail
            </p>
          )}
        </div>

        {/* --------------------------------
            MOQ + Stock
        -------------------------------- */}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400">
              Minimum Qty
            </p>

            <p className="mt-1 text-sm font-extrabold text-[#172554]">
              {minimumQuantity} pcs
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400">
              Stock
            </p>

            <p
              className={`mt-1 text-sm font-extrabold ${
                product.stockQuantity >=
                minimumQuantity
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {product.stockQuantity} pcs
            </p>
          </div>
        </div>

        {/* --------------------------------
            Quantity
        -------------------------------- */}

        {product.stockQuantity >=
          minimumQuantity && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Quantity
              </p>

              <p className="text-[10px] font-semibold text-gray-400">
                Step: {minimumQuantity}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Minus */}

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <=
                  minimumQuantity
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-extrabold text-[#172554] transition hover:border-[#FFC928] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>

              {/* Quantity Input */}

              <input
                type="number"
                min={minimumQuantity}
                max={maxQuantity}
                step={minimumQuantity}
                value={quantity}
                onChange={(event) =>
                  handleQuantityChange(
                    event.target.value
                  )
                }
                className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white text-center text-sm font-extrabold text-[#172554] outline-none focus:border-green-500"
                aria-label="Wholesale quantity"
              />

              {/* Plus */}

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  quantity >=
                  maxQuantity
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-extrabold text-[#172554] transition hover:border-[#FFC928] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <p className="mt-2 text-[11px] text-gray-400">
              Order in multiples of{" "}
              {minimumQuantity} pcs
            </p>

            {/* Order Total */}

            <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[11px] font-semibold text-gray-500">
                Total
              </span>

              <span className="text-sm font-extrabold text-[#172554]">
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>
        )}

        {/* --------------------------------
            Out of Stock
        -------------------------------- */}

        {product.stockQuantity <
          minimumQuantity && (
          <div className="mt-4 rounded-xl bg-red-50 px-3 py-3 text-center">
            <p className="text-sm font-bold text-red-600">
              Out of Stock
            </p>

            <p className="mt-1 text-[11px] text-red-500">
              Minimum order quantity is{" "}
              {minimumQuantity} pcs.
            </p>
          </div>
        )}

        {/* --------------------------------
            Add to Cart
        -------------------------------- */}

        <button
          type="button"
          disabled={!canAdd}
          onClick={handleAddToCart}
          className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${
            !canAdd
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : added
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-[#FFC928] text-[#172554] hover:bg-[#f5bb00]"
          }`}
        >
          {!canAdd
            ? "Out of Stock"
            : added
            ? "✓ Added to Wholesale Cart"
            : "Add to Wholesale Cart"}
        </button>

        {/* --------------------------------
            View Details
        -------------------------------- */}

        <Link
          href={productUrl}
          className="mt-2 flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#172554] transition hover:border-[#FFC928] hover:bg-[#FFF9E8]"
        >
          View Product Details
        </Link>
      </div>
    </div>
  );
}