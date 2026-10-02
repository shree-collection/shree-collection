import Link from "next/link";

import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const isOutOfStock =
    product.stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock &&
    product.stockQuantity <= 5;

  const hasDiscount =
    Boolean(product.discount) &&
    Boolean(product.oldPrice) &&
    Number(product.oldPrice) >
      Number(product.price);

  /*
   * Extract numeric discount percentage if the
   * existing discount value contains a number.
   *
   * Example:
   * "20% OFF" -> 20
   */
  const discountPercentage = product.discount
    ? Number(
        String(product.discount).replace(
          /[^0-9.]/g,
          ""
        )
      )
    : 0;

  return (
    <article
      className="
        group flex min-w-0 flex-col
        overflow-hidden
        rounded-xl
        border border-slate-200
        bg-white
        shadow-sm
        transition
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-md
      "
    >
      {/* =====================================================
          PRODUCT IMAGE
          ===================================================== */}

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
        {/* Discount */}

        {hasDiscount && product.discount && (
          <span
            className="
              absolute left-2 top-2 z-10
              rounded-md
              bg-brand-coral
              px-1.5 py-1
              text-[9px]
              font-extrabold
              text-white
              shadow-sm
              sm:left-2.5
              sm:top-2.5
              sm:px-2
            "
          >
            {product.discount}
          </span>
        )}

        {/* Wishlist */}

        <span
          className="
            absolute right-2 top-2 z-10
            flex h-7 w-7
            items-center justify-center
            rounded-full
            bg-white/95
            text-base
            text-slate-500
            shadow-sm
            backdrop-blur-sm
            transition
            group-hover:text-brand-coral
            sm:right-2.5
            sm:top-2.5
          "
          aria-hidden="true"
        >
          ♡
        </span>

        {/* Out of stock */}

        {isOutOfStock && (
          <div
            className="
              absolute inset-0 z-20
              flex items-center justify-center
              bg-black/25
            "
          >
            <span
              className="
                rounded-full
                bg-white
                px-3 py-1.5
                text-[10px]
                font-extrabold
                text-slate-800
                shadow-lg
              "
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Product image */}

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`
              h-full w-full
              object-contain
              p-2.5
              transition
              duration-300
              group-hover:scale-105
              sm:p-3
              ${
                isOutOfStock
                  ? "opacity-60 grayscale-[20%]"
                  : ""
              }
            `}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-xl
                bg-white
                text-2xl
                shadow-sm
              "
            >
              🎁
            </div>
          </div>
        )}

        {/* Bottom image gradient */}

        <div
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0
            h-12
            bg-gradient-to-t
            from-black/5
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
          aria-hidden="true"
        />
      </Link>

      {/* =====================================================
          PRODUCT INFORMATION
          ===================================================== */}

      <div
        className="
          flex flex-1
          flex-col
          p-2.5
          sm:p-3
        "
      >
        {/* Product name */}

        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[36px]
              text-[12px]
              font-bold
              leading-[18px]
              text-slate-800
              transition-colors
              hover:text-brand-coral
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
            RATING AREA
            ================================================= */}

        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="
              inline-flex
              items-center gap-0.5
              rounded
              bg-green-600
              px-1.5 py-0.5
              text-[9px]
              font-bold
              text-white
            "
          >
            <span>★</span>
            <span>4.5</span>
          </span>

          <span className="text-[9px] text-slate-400">
            Product
          </span>
        </div>

        {/* =================================================
            PRICE
            ================================================= */}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span
            className="
              text-base
              font-black
              tracking-tight
              text-brand-navy
              sm:text-lg
            "
          >
            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}
          </span>

          {hasDiscount &&
            product.oldPrice &&
            Number(product.oldPrice) >
              Number(product.price) && (
              <span
                className="
                  text-[10px]
                  font-medium
                  text-slate-400
                  line-through
                  sm:text-xs
                "
              >
                ₹
                {Number(
                  product.oldPrice
                ).toLocaleString("en-IN")}
              </span>
            )}
        </div>

        {/* Discount percentage */}

        {hasDiscount &&
          discountPercentage > 0 && (
            <p
              className="
                mt-0.5
                text-[9px]
                font-bold
                text-green-600
              "
            >
              {Math.round(
                discountPercentage
              )}
              % off
            </p>
          )}

        {/* =================================================
            STOCK STATUS
            ================================================= */}

        {isOutOfStock ? (
          <p
            className="
              mt-1.5
              text-[9px]
              font-bold
              text-red-600
            "
          >
            ● Currently unavailable
          </p>
        ) : isLowStock ? (
          <p
            className="
              mt-1.5
              text-[9px]
              font-bold
              text-amber-600
            "
          >
            ● Only {product.stockQuantity} left
          </p>
        ) : (
          <p
            className="
              mt-1.5
              text-[9px]
              font-bold
              text-green-600
            "
          >
            ● In stock
          </p>
        )}

        {/* =================================================
            ADD TO CART
            ================================================= */}

        <div className="mt-2.5">
          <AddToCartButton
            product={product}
          />
        </div>
      </div>
    </article>
  );
}