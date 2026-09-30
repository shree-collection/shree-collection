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

async function getProducts(): Promise<ApiProduct[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    console.error("Unable to load products:", error);
    return [];
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function mapProductToCartProduct(product: ApiProduct): Product {
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.retail_price;

  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.retail_price) /
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
    oldPrice: product.compare_at_price ?? undefined,
    discount: discount > 0 ? `${discount}% OFF` : undefined,
    image: product.image_url || "",
    category: product.categories?.name || "",
    rating: 0,
    reviews: 0,
    stockQuantity: product.stock_quantity,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();

  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | Shree Collection",
      description: "The requested product could not be found.",
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const allProducts = await getProducts();

  const product =
    allProducts.find((item) => item.slug === slug) || null;

  if (!product) {
    notFound();
  }

  const cartProduct = mapProductToCartProduct(product);

  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.retail_price;

  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.retail_price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  const isInStock = product.stock_quantity > 0;

  const isLowStock =
    product.stock_quantity > 0 && product.stock_quantity <= 5;

  const productImages =
    product.images?.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  let relatedProducts: Product[] = [];

  if (product.category_id) {
    const sameSubcategory = allProducts.filter(
      (item) =>
        item.id !== product.id &&
        item.is_active &&
        item.stock_quantity > 0 &&
        item.category_id === product.category_id
    );

    const sameParentCategory = product.categories?.parent_id
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

    const uniqueProducts = combinedProducts.filter(
      (item, index, array) =>
        array.findIndex(
          (other) => other.id === item.id
        ) === index
    );

    relatedProducts = uniqueProducts
      .slice(0, 4)
      .map(mapProductToCartProduct);
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <TrackRecentlyViewed productId={product.id} />

      {/* Breadcrumb */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs"
          >
            <Link
              href="/shop"
              className="font-bold text-slate-500 transition hover:text-[#f43f5e]"
            >
              Shop
            </Link>

            <span className="text-slate-300">/</span>

            {product.categories && (
              <>
                <Link
                  href={`/categories/${product.categories.slug}`}
                  className="font-bold text-slate-500 transition hover:text-[#f43f5e]"
                >
                  {product.categories.name}
                </Link>

                <span className="text-slate-300">/</span>
              </>
            )}

            <span className="max-w-[240px] truncate font-bold text-[#172554]">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* Product */}
      <section className="container-shop px-4 py-6 sm:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              productName={product.name}
              images={productImages}
              discount={discount}
            />

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                <div className="text-lg" aria-hidden="true">
                  🚚
                </div>
                <p className="mt-1 text-[10px] font-extrabold text-slate-500">
                  Easy Delivery
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                <div className="text-lg" aria-hidden="true">
                  🎁
                </div>
                <p className="mt-1 text-[10px] font-extrabold text-slate-500">
                  Great Gifts
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                <div className="text-lg" aria-hidden="true">
                  🛍️
                </div>
                <p className="mt-1 text-[10px] font-extrabold text-slate-500">
                  Easy Shopping
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col">
            {product.categories && (
              <Link
                href={`/categories/${product.categories.slug}`}
                className="w-fit rounded-full border border-[#f43f5e]/15 bg-[#fff1f3] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#f43f5e] transition hover:bg-[#ffe4e8]"
              >
                {product.categories.name}
              </Link>
            )}

            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-[#172554] sm:text-4xl lg:text-[2.75rem]">
              {product.name}
            </h1>

            {product.sku && (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                SKU: {product.sku}
              </p>
            )}

            {/* Product confidence */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-0.5 rounded-lg bg-[#fff4c7] px-2.5 py-1.5 text-sm"
                aria-label="Product quality"
              >
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              <span className="text-xs font-bold text-slate-500">
                Quality you can trust
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black tracking-tight text-[#172554]">
                  {formatPrice(product.retail_price)}
                </span>

                {hasDiscount && (
                  <span className="pb-1 text-base font-semibold text-slate-400 line-through">
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}

                {hasDiscount && (
                  <span className="rounded-full bg-[#f43f5e] px-2.5 py-1 text-[10px] font-black text-white">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {hasDiscount && (
                <p className="mt-2 text-xs font-bold text-emerald-600">
                  You save{" "}
                  {formatPrice(
                    product.compare_at_price! -
                      product.retail_price
                  )}{" "}
                  ({discount}%)
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="mt-5">
              {isInStock ? (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>

                  <div>
                    <p className="text-sm font-extrabold text-emerald-600">
                      In Stock
                    </p>

                    {isLowStock && (
                      <p className="mt-0.5 text-[11px] font-bold text-orange-600">
                        Only {product.stock_quantity} left
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>

                  <p className="text-sm font-extrabold text-red-600">
                    Currently Out of Stock
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <h2 className="text-sm font-black uppercase tracking-wide text-[#172554]">
                  Product Description
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Cart actions */}
            <div className="mt-7">
              <ProductDetailActions product={cartProduct} />
            </div>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/918796780766?text=${encodeURIComponent(
                `Hi Shree Collection, I am interested in ${product.name}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-white px-6 py-3.5 text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-50"
            >
              <span aria-hidden="true">💬</span>
              Ask About This Product on WhatsApp
            </a>

            {/* Benefits */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f3] text-lg"
                  aria-hidden="true"
                >
                  🎁
                </div>

                <p className="mt-3 text-xs font-extrabold text-[#172554]">
                  Perfect for Gifting
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Great choice for special occasions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg"
                  aria-hidden="true"
                >
                  🛒
                </div>

                <p className="mt-3 text-xs font-extrabold text-[#172554]">
                  Easy Ordering
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Add products to your cart easily.
                </p>
              </div>
            </div>

            {/* Wholesale */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-[#172554]">
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                    🏪
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ffc928]">
                      Wholesale Buyers
                    </p>

                    <h3 className="mt-1 text-lg font-black text-white">
                      Buying in bulk?
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  Register as a wholesale buyer to explore wholesale
                  pricing and minimum order quantities.
                </p>

                <Link
                  href="/wholesale/register"
                  className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#172554] transition hover:bg-[#fff4c7]"
                >
                  Register for Wholesale →
                </Link>
              </div>
            </div>

            {/* Continue shopping */}
            <Link
              href="/shop/products"
              className="mt-6 text-center text-sm font-bold text-[#172554] transition hover:text-[#f43f5e]"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <RelatedProducts products={relatedProducts} />

      {/* Recently viewed */}
      <RecentlyViewedProducts currentProductId={product.id} />
    </main>
  );
}