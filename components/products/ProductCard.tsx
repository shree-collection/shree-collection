import Link from "next/link";

import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const stockQuantity =
    Number(product.stockQuantity) || 0;

  const isOutOfStock =
    stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock &&
    stockQuantity <= 5;

  const price =
    Number(product.price) || 0;

  const oldPrice =
    product.oldPrice !== undefined &&
    product.oldPrice !== null
      ? Number(product.oldPrice)
      : 0;

  const hasDiscount =
    oldPrice > price;

  const discountPercentage =
    hasDiscount
      ? Math.round(
          ((oldPrice - price) /
            oldPrice) *
            100
        )
      : 0;

  return (
    <article
      className="
        group flex min-w-0 flex-col
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-lg
      "
    >
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <Link
        href={`/products/${product.slug}`}
        className="
          relative block
          aspect-square
          overflow-hidden
          bg-slate-50
        "
        aria-label={`View ${product.name}`}
      >
        {/* Discount Badge */}

        {hasDiscount && (
          <span
            className="
              absolute left-2.5 top-2.5 z-10
              rounded-md
              bg-[#f43f5e]
              px-2 py-1
              text-[9px]
              font-black
              tracking-wide
              text-white
              shadow-sm
              sm:text-[10px]
            "
          >
            {discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist */}

        <span
          className="
            absolute right-2.5 top-2.5 z-10
            flex h-8 w-8
            items-center justify-center
            rounded-full
            bg-white
            text-base
            text-slate-500
            shadow-sm
            transition
            group-hover:text-[#f43f5e]
          "
          aria-hidden="true"
        >
          ♡
        </span>

        {/* Out of Stock */}

        {isOutOfStock && (
          <div
            className="
              absolute inset-0 z-20
              flex items-center justify-center
              bg-slate-900/20
            "
          >
            <span
              className="
                rounded-full
                bg-white
                px-3 py-1.5
                text-[10px]
                font-black
                text-slate-800
                shadow-lg
              "
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image */}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`
              h-full
              w-full
              object-contain
              p-3
              transition-transform
              duration-300
              group-hover:scale-[1.04]
              sm:p-4
              ${
                isOutOfStock
                  ? "opacity-60 grayscale-[20%]"
                  : ""
              }
            `}
          />
        ) : (
          <div
            className="
              flex h-full w-full
              items-center justify-center
            "
          >
            <div
              className="
                flex h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-white
                text-3xl
                shadow-sm
              "
            >
              🎁
            </div>
          </div>
        )}

        {/* Image Hover Overlay */}

        {!isOutOfStock && (
          <div
            className="
              pointer-events-none
              absolute inset-x-0 bottom-0
              h-16
              bg-gradient-to-t
              from-black/10
              to-transparent
              opacity-0
              transition-opacity
              duration-200
              group-hover:opacity-100
            "
          />
        )}
      </Link>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <div
        className="
          flex flex-1
          flex-col
          p-3
          sm:p-3.5
        "
      >
        {/* Product Name */}

        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[38px]
              text-[12px]
              font-bold
              leading-[18px]
              text-slate-800
              transition-colors
              group-hover:text-[#f43f5e]
              sm:text-sm
              sm:leading-5
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* SKU */}

        {product.sku && (
          <p
            className="
              mt-1
              truncate
              text-[9px]
              font-medium
              text-slate-400
            "
          >
            SKU: {product.sku}
          </p>
        )}

        {/* =================================================
            PRICE
        ================================================= */}

        <div
          className="
            mt-2.5
            flex flex-wrap
            items-baseline
            gap-x-2
            gap-y-0.5
          "
        >
          <span
            className="
              text-lg
              font-black
              tracking-tight
              text-[#172554]
              sm:text-xl
            "
          >
            ₹{price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span
              className="
                text-[10px]
                font-medium
                text-slate-400
                line-through
                sm:text-xs
              "
            >
              ₹{oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Savings */}

        {hasDiscount && (
          <p
            className="
              mt-0.5
              text-[9px]
              font-bold
              text-green-600
            "
          >
            Save ₹
            {(
              oldPrice - price
            ).toLocaleString("en-IN")}
          </p>
        )}

        {/* =================================================
            STOCK STATUS
        ================================================= */}

        <div className="mt-2 min-h-[16px]">
          {isOutOfStock ? (
            <p
              className="
                text-[9px]
                font-bold
                text-red-600
              "
            >
              Currently unavailable
            </p>
          ) : isLowStock ? (
            <p
              className="
                text-[9px]
                font-bold
                text-orange-600
              "
            >
              Only {stockQuantity} left
            </p>
          ) : (
            <p
              className="
                text-[9px]
                font-semibold
                text-green-600
              "
            >
              In stock
            </p>
          )}
        </div>

        {/* =================================================
            ADD TO CART
        ================================================= */}

        <div className="mt-3">
          <AddToCartButton
            product={product}
          />
        </div>
      </div>
    </article>
  );
}