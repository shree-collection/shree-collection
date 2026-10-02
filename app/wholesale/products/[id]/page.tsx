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

  const [productId, setProductId] = useState("");
  const [product, setProduct] =
    useState<WholesaleProduct | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [added, setAdded] = useState(false);

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
            data.error || "Unable to load product."
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
              Number(foundProduct.minQuantity) || 1,
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
        product.stockQuantity / minQuantity
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

      description:
        product.description || "",

      category:
        product.category?.name || "",

      rating: 0,
      reviews: 0,

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
      <main className="min-h-screen bg-[#fffdf7]">
        <section className="container-shop px-4 py-6">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="aspect-square animate-pulse rounded-3xl bg-slate-100" />

            <div>
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />

              <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-slate-100" />

              <div className="mt-6 h-28 animate-pulse rounded-2xl bg-slate-100" />

              <div className="mt-6 h-16 animate-pulse rounded-2xl bg-slate-100" />

              <div className="mt-6 h-16 animate-pulse rounded-2xl bg-slate-100" />
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
      <main className="min-h-screen bg-[#fffdf7]">
        <section className="container-shop px-4 py-10">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f3] text-3xl">
              📦
            </div>

            <h1 className="mt-4 text-xl font-black text-[#172554]">
              Product not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "This wholesale product is no longer available."}
            </p>

            <Link
              href="/wholesale"
              className="mt-6 inline-flex rounded-xl bg-[#172554] px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Back to Wholesale Products
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <section className="container-shop px-4 py-5 sm:py-7">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm"
        >
          <Link
            href="/wholesale"
            className="font-bold text-slate-500 transition hover:text-[#f43f5e]"
          >
            Wholesale
          </Link>

          <span className="text-slate-300">
            /
          </span>

          {product.parentCategory && (
            <>
              <span className="text-slate-500">
                {product.parentCategory.name}
              </span>

              <span className="text-slate-300">
                /
              </span>
            </>
          )}

          {product.category && (
            <>
              <span className="text-slate-500">
                {product.category.name}
              </span>

              <span className="text-slate-300">
                /
              </span>
            </>
          )}

          <span className="font-black text-[#172554]">
            {product.name}
          </span>
        </nav>

        {/* Product */}
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* --------------------------------
              Images
          -------------------------------- */}
          <div>
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Wholesale Badge */}
              <div className="absolute left-4 top-4 z-10 rounded-full bg-[#172554] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                Wholesale
              </div>

              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-[#f43f5e] px-3 py-1.5 text-[10px] font-black text-white shadow-sm">
                  Save {savingsPercent}%
                </div>
              )}

              <div className="aspect-square bg-slate-50">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="relative z-[1] h-full w-full object-contain p-6 transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
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
                          ? "border-[#172554] shadow-sm"
                          : "border-slate-200 hover:border-[#f43f5e]"
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
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="text-lg">💰</div>

                <p className="mt-1 text-[10px] font-bold text-slate-600">
                  Wholesale Price
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="text-lg">📦</div>

                <p className="mt-1 text-[10px] font-bold text-slate-600">
                  Bulk Orders
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="text-lg">🛒</div>

                <p className="mt-1 text-[10px] font-bold text-slate-600">
                  Easy Ordering
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------
              Product Information
          -------------------------------- */}
          <div>
            {/* Category / Stock */}
            <div className="mb-3 flex flex-wrap gap-2">
              {product.category && (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-[#172554]">
                  {product.category.name}
                </span>
              )}

              {product.stockQuantity > 0 ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  ✓ In Stock
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black leading-tight tracking-tight text-[#172554] sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="mt-2 text-xs font-medium text-slate-400">
                SKU:{" "}
                <span className="font-bold text-slate-600">
                  {product.sku}
                </span>
              </p>
            )}

            {/* Price */}
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
                  ₹
                  {product.wholesalePrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {product.retailPrice >
                  product.wholesalePrice && (
                  <span className="pb-1 text-sm font-medium text-slate-400 line-through">
                    ₹
                    {product.retailPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}

                {savingsPercent > 0 && (
                  <span className="rounded-full bg-[#f43f5e] px-3 py-1 text-xs font-black text-white">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs font-bold text-slate-500">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Minimum Order
                </p>

                <p className="mt-1 text-lg font-black text-[#172554]">
                  {minQuantity} pcs
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Available Stock
                </p>

                <p className="mt-1 text-lg font-black text-[#172554]">
                  {product.stockQuantity} pcs
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h2 className="text-base font-black text-[#172554]">
                  Product Details
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-black text-[#172554]">
                  Order Quantity
                </label>

                <span className="rounded-full bg-[#fff1f3] px-3 py-1 text-[10px] font-black text-[#f43f5e]">
                  MOQ: {minQuantity}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={
                      quantity <= minQuantity
                    }
                    className="h-12 w-12 text-xl font-bold text-[#172554] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>

                  <div className="flex h-12 min-w-20 items-center justify-center border-x border-slate-200 px-4 text-center text-base font-black text-[#172554]">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >=
                      (maxQuantity ||
                        minQuantity)
                    }
                    className="h-12 w-12 text-xl font-bold text-[#172554] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <span className="text-xs font-medium text-slate-500">
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
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Order Total
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {quantity} × ₹
                  {product.wholesalePrice.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <p className="text-xl font-black text-[#172554]">
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                Boolean(quantityError) ||
                product.stockQuantity <= 0
              }
              className={`mt-4 w-full rounded-2xl px-5 py-4 text-base font-black shadow-sm transition hover:-translate-y-0.5 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#f43f5e] text-white hover:bg-[#e11d48]"
              } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none`}
            >
              {added
                ? "✓ Added to Wholesale Cart"
                : "🛒 Add to Wholesale Cart"}
            </button>

            {/* Cart */}
            <Link
              href="/wholesale/cart"
              className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#172554] bg-white px-5 py-4 text-base font-black text-[#172554] transition hover:bg-[#172554] hover:text-white"
            >
              View Wholesale Cart

              {wholesaleCartCount > 0 && (
                <span className="ml-2 rounded-full bg-[#fff1f3] px-2 py-0.5 text-xs text-[#f43f5e]">
                  {wholesaleCartCount}
                </span>
              )}
            </Link>

            {/* Back */}
            <Link
              href="/wholesale"
              className="mt-5 flex justify-center text-sm font-bold text-slate-500 transition hover:text-[#f43f5e]"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}