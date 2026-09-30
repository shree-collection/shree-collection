"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartContext";

type Category = {
  id: string;
  name: string;
  slug: string;
};

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
  category: Category | null;
  parentCategory: Category | null;
  image: string | null;
  images: string[];
};

export default function WholesaleProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    wholesaleCartCount,
    addToWholesaleCart,
  } = useCart();

  const [productId, setProductId] =
    useState<string>("");

  const [product, setProduct] =
    useState<WholesaleProduct | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [added, setAdded] =
    useState(false);

  /* --------------------------------
     Get product ID
  -------------------------------- */

  useEffect(() => {
    params.then((value) => {
      setProductId(value.id);
    });
  }, [params]);

  /* --------------------------------
     Load product
  -------------------------------- */

  useEffect(() => {
    if (!productId) {
      return;
    }

    let mounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/wholesale/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load product."
          );
        }

        const foundProduct =
          (data.products || []).find(
            (item: WholesaleProduct) =>
              item.id === productId
          ) || null;

        if (!foundProduct) {
          throw new Error(
            "Wholesale product not found."
          );
        }

        if (mounted) {
          setProduct(foundProduct);

          setSelectedImage(
            foundProduct.image || ""
          );

          setQuantity(
            Math.max(
              Number(foundProduct.minQuantity) ||
                1,
              1
            )
          );
        }
      } catch (error) {
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load product."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  /* --------------------------------
     Product images
  -------------------------------- */

  const productImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const images = [
      product.image,
      ...(product.images || []),
    ].filter(
      (image): image is string =>
        Boolean(image)
    );

    return [...new Set(images)];
  }, [product]);

  /* --------------------------------
     MOQ
  -------------------------------- */

  const minQuantity = Math.max(
    Number(product?.minQuantity) || 1,
    1
  );

  /* --------------------------------
     Maximum quantity
  -------------------------------- */

  const maxQuantity = product
    ? Math.floor(
        product.stockQuantity /
          minQuantity
      ) * minQuantity
    : 0;

  /* --------------------------------
     Quantity validation
  -------------------------------- */

  const quantityError = useMemo(() => {
    if (!product) {
      return "";
    }

    if (quantity < minQuantity) {
      return `Minimum order quantity is ${minQuantity}.`;
    }

    if (quantity % minQuantity !== 0) {
      return `Quantity must be a multiple of ${minQuantity}.`;
    }

    if (quantity > product.stockQuantity) {
      return `Only ${product.stockQuantity} units are available.`;
    }

    return "";
  }, [
    product,
    quantity,
    minQuantity,
  ]);

  /* --------------------------------
     Savings
  -------------------------------- */

  const savingsPerUnit =
    product &&
    product.retailPrice >
      product.wholesalePrice
      ? product.retailPrice -
        product.wholesalePrice
      : 0;

  const savingsPercent =
    product &&
    product.retailPrice > 0
      ? Math.round(
          (savingsPerUnit /
            product.retailPrice) *
            100
        )
      : 0;

  /* --------------------------------
     Total
  -------------------------------- */

  const totalAmount = product
    ? product.wholesalePrice * quantity
    : 0;

  /* --------------------------------
     Quantity handlers
  -------------------------------- */

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(
        minQuantity,
        current - minQuantity
      )
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(
        maxQuantity || minQuantity,
        current + minQuantity
      )
    );
  }

  /* --------------------------------
     Add to cart
  -------------------------------- */

  function handleAddToCart() {
    if (!product || quantityError) {
      return;
    }

    addToWholesaleCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,

      // Required Product fields
      description:
        product.description || "",

      category:
        product.category?.name || "",

      rating: 0,

      reviews: 0,

      // Wholesale cart values
      price: product.wholesalePrice,
      quantity,
      image: product.image || "",
      minQuantity,
      stockQuantity:
        product.stockQuantity,
      isWholesale: true,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  }

  /* --------------------------------
     Loading
  -------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="container-shop px-4 py-6">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-surface-muted" />

            <div>
              <div className="h-8 w-3/4 animate-pulse rounded bg-surface-muted" />

              <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-surface-muted" />

              <div className="mt-6 h-24 animate-pulse rounded-2xl bg-surface-muted" />

              <div className="mt-6 h-14 animate-pulse rounded-2xl bg-surface-muted" />

              <div className="mt-6 h-14 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* --------------------------------
     Error
  -------------------------------- */

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background">
        <section className="container-shop px-4 py-10">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft-gold text-3xl">
              📦
            </div>

            <h1 className="mt-4 text-xl font-black text-brand-navy">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-text-muted">
              {error ||
                "This wholesale product is no longer available."}
            </p>

            <Link
              href="/wholesale"
              className="mt-6 inline-flex rounded-xl bg-brand-navy px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
            >
              Back to Wholesale Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="container-shop px-4 py-5 sm:py-7">
        {/* Breadcrumb */}
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-xs sm:text-sm">
          <Link
            href="/wholesale"
            className="font-bold text-text-muted transition hover:text-brand-coral"
          >
            Wholesale
          </Link>

          <span className="text-text-light">
            /
          </span>

          {product.parentCategory && (
            <>
              <span className="text-text-muted">
                {product.parentCategory.name}
              </span>

              <span className="text-text-light">
                /
              </span>
            </>
          )}

          {product.category && (
            <>
              <span className="text-text-muted">
                {product.category.name}
              </span>

              <span className="text-text-light">
                /
              </span>
            </>
          )}

          <span className="font-extrabold text-brand-navy">
            {product.name}
          </span>
        </div>

        {/* Product */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Images */}
          <div>
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gold/10 transition-transform duration-500 group-hover:scale-125" />

              <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-brand-coral/5" />

              {/* Wholesale Badge */}
              <div className="absolute left-4 top-4 z-10 rounded-full bg-brand-navy px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                Wholesale
              </div>

              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-brand-coral px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
                  Save {savingsPercent}%
                </div>
              )}

              <div className="aspect-square">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="relative z-[1] h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-muted text-4xl">
                      📦
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
                {productImages.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      aria-label={`View product image ${
                        index + 1
                      }`}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                        selectedImage === image
                          ? "border-brand-navy shadow-sm"
                          : "border-border hover:border-brand-gold"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  )
                )}
              </div>
            )}

            {/* Wholesale Benefits */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-border bg-white p-3 text-center">
                <div className="text-lg">
                  💰
                </div>

                <p className="mt-1 text-[10px] font-bold text-text-secondary">
                  Wholesale Price
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-3 text-center">
                <div className="text-lg">
                  📦
                </div>

                <p className="mt-1 text-[10px] font-bold text-text-secondary">
                  Bulk Orders
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-3 text-center">
                <div className="text-lg">
                  🛒
                </div>

                <p className="mt-1 text-[10px] font-bold text-text-secondary">
                  Easy Ordering
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            {/* Category */}
            <div className="mb-3 flex flex-wrap gap-2">
              {product.category && (
                <span className="rounded-full border border-brand-gold/30 bg-brand-soft-gold px-3 py-1 text-xs font-extrabold text-brand-navy">
                  {product.category.name}
                </span>
              )}

              {product.stockQuantity > 0 ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  ✓ In Stock
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black leading-tight tracking-tight text-brand-navy sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="mt-2 text-xs font-medium text-text-muted">
                SKU:{" "}
                <span className="font-bold text-text-secondary">
                  {product.sku}
                </span>
              </p>
            )}

            {/* Price */}
            <div className="mt-6 rounded-3xl border border-border bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black tracking-tight text-brand-navy sm:text-4xl">
                  ₹
                  {product.wholesalePrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {product.retailPrice >
                  product.wholesalePrice && (
                  <span className="pb-1 text-sm font-medium text-text-light line-through">
                    ₹
                    {product.retailPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}

                {savingsPercent > 0 && (
                  <span className="rounded-full bg-brand-coral px-3 py-1 text-xs font-black text-white">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs font-bold text-text-muted">
                Wholesale price per piece
              </p>

              {savingsPerUnit > 0 && (
                <div className="mt-3 inline-flex rounded-xl bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-bold text-emerald-700">
                    You save ₹
                    {savingsPerUnit.toLocaleString(
                      "en-IN"
                    )}{" "}
                    per piece compared with retail.
                  </p>
                </div>
              )}
            </div>

            {/* MOQ / Stock */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                  Minimum Order
                </p>

                <p className="mt-1 text-lg font-black text-brand-navy">
                  {minQuantity} pcs
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                  Available Stock
                </p>

                <p className="mt-1 text-lg font-black text-brand-navy">
                  {product.stockQuantity} pcs
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h2 className="text-base font-black text-brand-navy">
                  Product Details
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-secondary">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 rounded-3xl border border-border bg-white p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-black text-brand-navy">
                  Order Quantity
                </label>

                <span className="rounded-full bg-brand-soft-gold px-3 py-1 text-[10px] font-black text-brand-navy">
                  MOQ: {minQuantity}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-xl border border-border bg-white">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <=
                      minQuantity
                    }
                    className="h-12 w-12 text-xl font-bold text-brand-navy transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>

                  <div className="flex h-12 min-w-20 items-center justify-center border-x border-border px-4 text-center text-base font-black text-brand-navy">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      (maxQuantity ||
                        minQuantity)
                    }
                    className="h-12 w-12 text-xl font-bold text-brand-navy transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs font-medium text-text-muted">
                  Step: {minQuantity}
                </span>
              </div>

              {quantityError && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                  {quantityError}
                </p>
              )}
            </div>

            {/* Order Total */}
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-4">
              <div>
                <p className="text-xs font-bold text-text-muted">
                  Order Total
                </p>

                <p className="mt-0.5 text-xs text-text-light">
                  {quantity} × ₹
                  {product.wholesalePrice.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <p className="text-xl font-black text-brand-navy">
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            {/* Add Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                Boolean(quantityError) ||
                product.stockQuantity <= 0
              }
              className={`mt-4 w-full rounded-2xl px-5 py-4 text-base font-black shadow-lg transition hover:-translate-y-0.5 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-brand-navy text-white hover:bg-slate-800"
              } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-light disabled:shadow-none`}
            >
              {added
                ? "✓ Added to Wholesale Cart"
                : "🛒 Add to Wholesale Cart"}
            </button>

            {/* Cart */}
            <Link
              href="/wholesale/cart"
              className="mt-3 flex w-full items-center justify-center rounded-2xl border border-brand-navy bg-white px-5 py-4 text-base font-black text-brand-navy transition hover:bg-brand-navy hover:text-white"
            >
              View Wholesale Cart

              {wholesaleCartCount > 0 && (
                <span className="ml-2 rounded-full bg-brand-soft-gold px-2 py-0.5 text-xs">
                  {wholesaleCartCount}
                </span>
              )}
            </Link>

            {/* Back */}
            <Link
              href="/wholesale"
              className="mt-5 flex justify-center text-sm font-bold text-text-muted transition hover:text-brand-coral"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}