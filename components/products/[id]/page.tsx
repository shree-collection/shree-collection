import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailActions from "@/components/products/ProductDetailActions";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import RelatedProducts from "@/components/products/RelatedProducts";
import RecentlyViewedProducts from "@/components/products/RecentlyViewedProducts";
import TrackRecentlyViewed from "@/components/products/TrackRecentlyViewed";

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /* ======================================================
     GET PRODUCT
  ====================================================== */

  const { data: productData, error } =
    await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        description,
        retail_price,
        compare_at_price,
        stock_quantity,
        image_url,
        category_id
      `)
      .eq("id", id)
      .eq("is_active", true)
      .single();

  if (error || !productData) {
    notFound();
  }

  /* ======================================================
     GET CATEGORY
  ====================================================== */

  let categoryName = "Product";

  if (productData.category_id) {
    const { data: category } =
      await supabase
        .from("categories")
        .select("name")
        .eq(
          "id",
          productData.category_id
        )
        .single();

    if (category) {
      categoryName = category.name;
    }
  }

  /* ======================================================
     DISCOUNT
  ====================================================== */

  const discount =
    productData.compare_at_price &&
    productData.compare_at_price >
      productData.retail_price
      ? Math.round(
          ((productData.compare_at_price -
            productData.retail_price) /
            productData.compare_at_price) *
            100
        )
      : 0;

  /* ======================================================
     FRONTEND PRODUCT
  ====================================================== */

  const product: Product = {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    sku: productData.sku,
    description: productData.description,
    price: Number(
      productData.retail_price
    ),
    oldPrice:
      productData.compare_at_price
        ? Number(
            productData.compare_at_price
          )
        : undefined,
    discount:
      discount > 0
        ? `${discount}% OFF`
        : undefined,
    image:
      productData.image_url || "",
    category: categoryName,
    rating: 0,
    reviews: 0,
    stockQuantity:
      productData.stock_quantity,
  };

  /* ======================================================
     PRODUCT IMAGES
  ====================================================== */

  const productImages = product.image
    ? [product.image]
    : [];

  /* ======================================================
     RELATED PRODUCTS
  ====================================================== */

  let relatedProducts: Product[] = [];

  if (productData.category_id) {
    const { data: relatedData } =
      await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          sku,
          description,
          retail_price,
          compare_at_price,
          stock_quantity,
          image_url,
          category_id
        `)
        .eq(
          "category_id",
          productData.category_id
        )
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .neq("id", productData.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(4);

    relatedProducts = (relatedData ?? []).map(
      (item) => {
        const itemDiscount =
          item.compare_at_price &&
          item.compare_at_price >
            item.retail_price
            ? Math.round(
                ((item.compare_at_price -
                  item.retail_price) /
                  item.compare_at_price) *
                  100
              )
            : 0;

        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          description: item.description,
          price: Number(
            item.retail_price
          ),
          oldPrice:
            item.compare_at_price
              ? Number(
                  item.compare_at_price
                )
              : undefined,
          discount:
            itemDiscount > 0
              ? `${itemDiscount}% OFF`
              : undefined,
          image:
            item.image_url || "",
          category: categoryName,
          rating: 0,
          reviews: 0,
          stockQuantity:
            item.stock_quantity,
        };
      }
    );
  }

  return (
    <main className="min-h-screen bg-white">

      {/* ==================================================
          TRACK RECENTLY VIEWED
      ================================================== */}

      <TrackRecentlyViewed
        productId={product.id}
      />

      {/* ==================================================
          BREADCRUMB
      ================================================== */}

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="container-shop py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 overflow-hidden text-xs"
          >
            <Link
              href="/"
              className="shrink-0 font-semibold text-slate-500 transition hover:text-[#f43f5e]"
            >
              Home
            </Link>

            <span
              className="text-slate-300"
              aria-hidden="true"
            >
              /
            </span>

            <Link
              href="/shop/products"
              className="shrink-0 font-semibold text-slate-500 transition hover:text-[#f43f5e]"
            >
              Shop
            </Link>

            <span
              className="text-slate-300"
              aria-hidden="true"
            >
              /
            </span>

            <span className="truncate font-semibold text-[#172554]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ==================================================
          PRODUCT
      ================================================== */}

      <div className="container-shop py-5 sm:py-8">

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-10">

          {/* =================================================
              LEFT — IMAGE
          ================================================= */}

          <div className="min-w-0">
            <ProductImageGallery
              productName={product.name}
              images={productImages}
              discount={discount}
            />
          </div>

          {/* =================================================
              RIGHT — PRODUCT INFORMATION
          ================================================= */}

          <div className="min-w-0">

            {/* Category */}

            <Link
              href="/shop/products"
              className="
                inline-flex
                rounded-full
                bg-[#fff1f2]
                px-3
                py-1
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#f43f5e]
                transition
                hover:bg-[#ffe4e6]
              "
            >
              {product.category}
            </Link>

            {/* Product Name */}

            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#172554] sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* SKU */}

            {product.sku && (
              <p className="mt-2 text-xs font-medium text-slate-400">
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}

            <div className="mt-5 border-y border-slate-200 py-4">

              <div className="flex flex-wrap items-center gap-3">

                <span className="text-3xl font-black text-[#f43f5e] sm:text-4xl">
                  ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {product.oldPrice && (
                  <span className="text-base font-medium text-slate-400 line-through">
                    ₹
                    {product.oldPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                )}

                {product.discount && (
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                    {product.discount}
                  </span>
                )}
              </div>

              {product.oldPrice &&
                product.oldPrice >
                  product.price && (
                  <p className="mt-1.5 text-xs font-semibold text-emerald-600">
                    You save ₹
                    {(
                      product.oldPrice -
                      product.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                )}
            </div>

            {/* No fake rating */}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {product.stockQuantity > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden="true"
                  />
                  Out of Stock
                </span>
              )}

              {product.stockQuantity > 0 &&
                product.stockQuantity <=
                  5 && (
                  <span className="text-xs font-semibold text-orange-600">
                    Only{" "}
                    {product.stockQuantity}{" "}
                    left
                  </span>
                )}
            </div>

            {/* Description */}

            {product.description && (
              <div className="mt-5">
                <h2 className="text-sm font-black text-[#172554]">
                  Product Details
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Shopping Benefits */}

            <div className="mt-5 grid grid-cols-3 gap-2">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div
                  className="text-lg"
                  aria-hidden="true"
                >
                  🚚
                </div>

                <p className="mt-1 text-[10px] font-extrabold text-[#172554]">
                  Delivery
                </p>

                <p className="mt-0.5 text-[9px] text-slate-500">
                  Available
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div
                  className="text-lg"
                  aria-hidden="true"
                >
                  🔒
                </div>

                <p className="mt-1 text-[10px] font-extrabold text-[#172554]">
                  Secure
                </p>

                <p className="mt-0.5 text-[9px] text-slate-500">
                  Safe checkout
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div
                  className="text-lg"
                  aria-hidden="true"
                >
                  ↩️
                </div>

                <p className="mt-1 text-[10px] font-extrabold text-[#172554]">
                  Easy
                </p>

                <p className="mt-0.5 text-[9px] text-slate-500">
                  Shopping
                </p>
              </div>

            </div>

            {/* Quantity + Add To Cart */}

            <ProductDetailActions
              product={product}
            />

          </div>
        </div>
      </div>

      {/* ==================================================
          RELATED PRODUCTS
      ================================================== */}

      <RelatedProducts
        products={relatedProducts}
      />

      {/* ==================================================
          RECENTLY VIEWED
      ================================================== */}

      <RecentlyViewedProducts
        currentProductId={product.id}
      />

    </main>
  );
}