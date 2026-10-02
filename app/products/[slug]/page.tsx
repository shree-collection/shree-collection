import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import RelatedProducts from "@/components/products/RelatedProducts";
import TrackRecentlyViewed from "@/components/products/TrackRecentlyViewed";

import type { Product } from "@/types/product";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  retail_price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  category_id: string | null;
  created_at: string;
  description: string | null;
  categories:
    | {
        id: string;
        name: string;
        slug: string;
        parent_id: string | null;
      }
    | null;
};

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   PRODUCTS API
   ========================================================= */

async function getProducts(): Promise<ApiProduct[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/products`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Unable to load products. Status:",
        response.status
      );

      return [];
    }

    const data = await response.json();

    return Array.isArray(data.products)
      ? data.products
      : [];
  } catch (error) {
    console.error(
      "Unable to load products:",
      error
    );

    return [];
  }
}

/* =========================================================
   PRICE
   ========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/* =========================================================
   MAP PRODUCT
   ========================================================= */

function mapProductToCartProduct(
  product: ApiProduct
): Product {
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price >
      product.retail_price;

  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! -
          product.retail_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.retail_price,
    oldPrice:
      product.compare_at_price ?? undefined,
    discount:
      discount > 0
        ? `${discount}% OFF`
        : undefined,
    image: product.image_url || "",
    category:
      product.categories?.name || "",
    rating: 0,
    reviews: 0,
    stockQuantity: product.stock_quantity,
  };
}

/* =========================================================
   METADATA
   ========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const products = await getProducts();

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    return {
      title:
        "Product Not Found | Shree Collection",
      description:
        "The requested product could not be found.",
    };
  }

  const title = `${product.name} | Shree Collection`;

  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} online from Shree Collection. Explore our collection of trending gifts, toys, decor and more.`;

  return {
    title,
    description,

    alternates: {
      canonical: `/products/${product.slug}`,
    },

    openGraph: {
      title,
      description,
      type: "website",

      images: product.image_url
        ? [
            {
              url: product.image_url,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

/* =========================================================
   PRODUCT PAGE
   ========================================================= */

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  /*
   * Keep the existing working API data source.
   *
   * We fetch once and use the returned catalogue for:
   * - Current product
   * - Related products
   */

  const allProducts = await getProducts();

  const product =
    allProducts.find(
      (item) => item.slug === slug
    ) || null;

  if (!product) {
    notFound();
  }

  /* =======================================================
     PRODUCT DATA
     ======================================================= */

  const cartProduct =
    mapProductToCartProduct(product);

  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price >
      product.retail_price;

  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! -
          product.retail_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const isInStock =
    product.stock_quantity > 0;

  const isLowStock =
    product.stock_quantity > 0 &&
    product.stock_quantity <= 5;

  const productImages =
    product.images?.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  /* =======================================================
     RELATED PRODUCTS
     ======================================================= */

  let relatedProducts: Product[] = [];

  if (product.category_id) {
    /*
     * First preference:
     * Products from the same subcategory.
     */

    const sameSubcategory =
      allProducts.filter(
        (item) =>
          item.id !== product.id &&
          item.is_active &&
          item.stock_quantity > 0 &&
          item.category_id ===
            product.category_id
      );

    /*
     * Second preference:
     * Products from the same parent category.
     */

    const sameParentCategory =
      product.categories?.parent_id
        ? allProducts.filter(
            (item) =>
              item.id !== product.id &&
              item.is_active &&
              item.stock_quantity > 0 &&
              item.categories?.parent_id ===
                product.categories?.parent_id
          )
        : [];

    const combinedProducts = [
      ...sameSubcategory,
      ...sameParentCategory,
    ];

    const seenProductIds =
      new Set<string>();

    const uniqueProducts =
      combinedProducts.filter((item) => {
        if (seenProductIds.has(item.id)) {
          return false;
        }

        seenProductIds.add(item.id);

        return true;
      });

    relatedProducts = uniqueProducts
      .slice(0, 4)
      .map(mapProductToCartProduct);
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <TrackRecentlyViewed
        productId={product.id}
      />

      {/* ===================================================
          BREADCRUMB
          =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-3">
          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-2
              overflow-x-auto
              whitespace-nowrap
              text-[11px]
              no-scrollbar
            "
          >
            <Link
              href="/"
              className="font-semibold text-slate-500 transition hover:text-brand-coral"
            >
              Home
            </Link>

            <span className="text-slate-300">
              /
            </span>

            <Link
              href="/shop/products"
              className="font-semibold text-slate-500 transition hover:text-brand-coral"
            >
              Shop
            </Link>

            {product.categories && (
              <>
                <span className="text-slate-300">
                  /
                </span>

                <Link
                  href={`/categories/${product.categories.slug}`}
                  className="font-semibold text-slate-500 transition hover:text-brand-coral"
                >
                  {product.categories.name}
                </Link>
              </>
            )}

            <span className="text-slate-300">
              /
            </span>

            <span className="max-w-[220px] truncate font-bold text-brand-navy">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* ===================================================
          MAIN PRODUCT AREA
          =================================================== */}

      <section className="container-shop px-4 py-4 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-7">
          {/* =================================================
              LEFT — PRODUCT GALLERY
              ================================================= */}

          <div className="min-w-0">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3">
                <ProductImageGallery
                  productName={product.name}
                  images={productImages}
                  discount={discount}
                />
              </div>

              {/* Quick benefits */}

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-center">
                  <div className="text-base">
                    🚚
                  </div>

                  <p className="mt-1 text-[9px] font-bold text-slate-600">
                    Easy Delivery
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-center">
                  <div className="text-base">
                    🎁
                  </div>

                  <p className="mt-1 text-[9px] font-bold text-slate-600">
                    Great Gifts
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-center">
                  <div className="text-base">
                    🛍️
                  </div>

                  <p className="mt-1 text-[9px] font-bold text-slate-600">
                    Easy Shopping
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT — PRODUCT INFORMATION
              ================================================= */}

          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="p-4 sm:p-5">
                {/* Category */}

                {product.categories && (
                  <Link
                    href={`/categories/${product.categories.slug}`}
                    className="
                      inline-flex
                      rounded-md
                      bg-brand-coral/5
                      px-2.5 py-1
                      text-[10px]
                      font-extrabold
                      uppercase
                      tracking-wide
                      text-brand-coral
                      transition
                      hover:bg-brand-coral/10
                    "
                  >
                    {product.categories.name}
                  </Link>
                )}

                {/* Product title */}

                <h1
                  className="
                    mt-3
                    text-xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-brand-navy
                    sm:text-2xl
                    lg:text-3xl
                  "
                >
                  {product.name}
                </h1>

                {/* SKU */}

                {product.sku && (
                  <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                    SKU: {product.sku}
                  </p>
                )}

                {/* Rating / trust */}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                    ★ Product
                  </span>

                  <span className="text-[10px] text-slate-400">
                    Quality checked
                  </span>
                </div>

                {/* =================================================
                    PRICE
                    ================================================= */}

                <div className="mt-4 border-y border-slate-100 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                      {formatPrice(
                        product.retail_price
                      )}
                    </span>

                    {hasDiscount && (
                      <span className="text-sm font-medium text-slate-400 line-through">
                        {formatPrice(
                          product.compare_at_price!
                        )}
                      </span>
                    )}

                    {hasDiscount && (
                      <span className="rounded-md bg-brand-coral px-2 py-1 text-[10px] font-extrabold text-white">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {hasDiscount && (
                    <p className="mt-1.5 text-[11px] font-bold text-emerald-600">
                      You save{" "}
                      {formatPrice(
                        product.compare_at_price! -
                          product.retail_price
                      )}
                    </p>
                  )}
                </div>

                {/* =================================================
                    STOCK
                    ================================================= */}

                <div className="py-4">
                  {isInStock ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </span>

                      <div>
                        <p className="text-xs font-extrabold text-emerald-600">
                          In Stock
                        </p>

                        {isLowStock && (
                          <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                            Only{" "}
                            {product.stock_quantity}{" "}
                            left
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                      </span>

                      <p className="text-xs font-extrabold text-red-600">
                        Currently Out of Stock
                      </p>
                    </div>
                  )}
                </div>

                {/* =================================================
                    DESCRIPTION
                    ================================================= */}

                {product.description && (
                  <div className="border-t border-slate-100 pt-4">
                    <h2 className="text-xs font-black text-brand-navy">
                      Product Details
                    </h2>

                    <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* =================================================
                    CART ACTIONS
                    ================================================= */}

                <div className="mt-5">
                  <ProductDetailActions
                    product={cartProduct}
                  />
                </div>

                {/* =================================================
                    WHATSAPP
                    ================================================= */}

                <a
                  href={`https://wa.me/918796780766?text=${encodeURIComponent(
                    `Hi Shree Collection, I am interested in ${product.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-2.5
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-emerald-500
                    bg-white
                    px-4 py-3
                    text-xs
                    font-extrabold
                    text-emerald-700
                    transition
                    hover:bg-emerald-50
                  "
                >
                  <span aria-hidden="true">
                    💬
                  </span>

                  Ask About This Product
                </a>
              </div>

              {/* =================================================
                  DELIVERY / SHOPPING INFO
                  ================================================= */}

              <div className="grid grid-cols-2 border-t border-slate-200">
                <div className="border-r border-slate-200 px-4 py-3.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base">
                      🚚
                    </span>

                    <div>
                      <p className="text-[10px] font-extrabold text-brand-navy">
                        Easy Ordering
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                        Simple checkout process
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base">
                      🎁
                    </span>

                    <div>
                      <p className="text-[10px] font-extrabold text-brand-navy">
                        Perfect for Gifting
                      </p>

                      <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                        Great for special occasions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                WHOLESALE
                ================================================= */}

            <div className="mt-3 overflow-hidden rounded-xl bg-brand-navy">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
                    🏪
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-brand-coral">
                      Wholesale Buyers
                    </p>

                    <h2 className="mt-0.5 text-sm font-black text-white">
                      Buying in bulk?
                    </h2>

                    <p className="mt-0.5 text-[10px] text-white/60">
                      Get wholesale pricing and MOQ details.
                    </p>
                  </div>
                </div>

                <Link
                  href="/wholesale/register"
                  className="
                    shrink-0
                    rounded-lg
                    bg-white
                    px-3
                    py-2
                    text-[10px]
                    font-extrabold
                    text-brand-navy
                    transition
                    hover:bg-slate-100
                  "
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Continue shopping */}

            <Link
              href="/shop/products"
              className="
                mt-4
                block
                text-center
                text-xs
                font-bold
                text-brand-navy
                transition
                hover:text-brand-coral
              "
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          RELATED PRODUCTS
          ===================================================== */}

      <RelatedProducts
        products={relatedProducts}
      />

      {/* =====================================================
          RECENTLY VIEWED
          ===================================================== */}

      <RecentlyViewedProducts
        currentProductId={product.id}
      />
    </main>
  );
}