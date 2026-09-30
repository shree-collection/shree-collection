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

  const hasDiscount =
    Boolean(product.discount) &&
    Boolean(product.oldPrice) &&
    Number(product.oldPrice) > Number(product.price);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-card">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-soft"
        aria-label={`View ${product.name}`}
      >
        {/* Decorative Background */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 transition-transform duration-500 group-hover:scale-125"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-brand-coral/5"
          aria-hidden="true"
        />

        {/* Discount */}
        {hasDiscount && product.discount && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-coral px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm">
            {product.discount}
          </span>
        )}

        {/* Out of Stock */}
        {isOutOfStock && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-brand-navy/90 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
            Out of Stock
          </span>
        )}

        {/* Product Image */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`relative z-[1] h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105 ${
              isOutOfStock
                ? "opacity-55 grayscale-[20%]"
                : ""
            }`}
          />
        ) : (
          <div className="relative z-[1] flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft">
              🎁
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4">
        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-brand-navy transition-colors hover:text-brand-coral sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* SKU */}
        {product.sku && (
          <p className="mt-1.5 truncate text-[10px] font-medium text-text-muted">
            SKU: {product.sku}
          </p>
        )}

        {/* Price */}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-black tracking-tight text-brand-navy sm:text-xl">
            ₹
            {Number(product.price).toLocaleString(
              "en-IN"
            )}
          </span>

          {hasDiscount &&
            product.oldPrice &&
            product.oldPrice > product.price && (
              <span className="text-xs font-medium text-text-light line-through">
                ₹
                {Number(
                  product.oldPrice
                ).toLocaleString("en-IN")}
              </span>
            )}
        </div>

        {/* Stock Status */}
        {isOutOfStock ? (
          <p className="mt-1.5 text-[10px] font-bold text-danger">
            Currently unavailable
          </p>
        ) : product.stockQuantity <= 5 ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-warning"
              aria-hidden="true"
            />

            <p className="text-[10px] font-bold text-warning">
              Only {product.stockQuantity} left
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-[10px] font-semibold text-success">
            ✓ In stock
          </p>
        )}

        {/* Add to Cart */}
        <div className="mt-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}