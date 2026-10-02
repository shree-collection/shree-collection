import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type ProductSectionProps = {
  title: string;
  subtitle: string;
  categorySlug?: string;
  viewAllHref: string;
  limit?: number;
  sectionId?: string;
  icon?: string;
};

export default async function ProductSection({
  title,
  subtitle,
  categorySlug,
  viewAllHref,
  limit = 8,
  sectionId,
  icon = "🛍️",
}: ProductSectionProps) {
  const supabase = await createClient();

  /* ======================================================
     FIND CATEGORY + SUBCATEGORIES
  ====================================================== */

  let categoryIds: string[] = [];

  if (categorySlug) {
    const {
      data: mainCategory,
      error: categoryError,
    } = await supabase
      .from("categories")
      .select(
        `
          id,
          name,
          slug,
          parent_id
        `
      )
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError) {
      console.error(
        `Category lookup error for "${title}":`,
        categoryError
      );

      return null;
    }

    if (!mainCategory) {
      return null;
    }

    categoryIds.push(mainCategory.id);

    const {
      data: subcategories,
      error: subcategoryError,
    } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", mainCategory.id)
      .eq("is_active", true);

    if (subcategoryError) {
      console.error(
        `Subcategory lookup error for "${title}":`,
        subcategoryError
      );
    }

    if (subcategories?.length) {
      categoryIds.push(
        ...subcategories.map(
          (subcategory) => subcategory.id
        )
      );
    }
  }

  /* ======================================================
     LOAD PRODUCTS
  ====================================================== */

  let query = supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        sku,
        description,
        retail_price,
        compare_at_price,
        stock_quantity,
        image_url,
        created_at,
        categories (
          id,
          name,
          slug,
          parent_id
        )
      `
    )
    .eq("is_active", true)
    .order("stock_quantity", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (categoryIds.length > 0) {
    query = query.in(
      "category_id",
      categoryIds
    );
  }

  const {
    data: products,
    error,
  } = await query;

  if (error) {
    console.error(
      `Product section "${title}" error:`,
      error
    );

    return null;
  }

  if (!products?.length) {
    return null;
  }

  /* ======================================================
     FORMAT PRODUCTS
  ====================================================== */

  const sectionProducts: Product[] =
    products.map((product) => {
      const retailPrice =
        Number(product.retail_price) || 0;

      const compareAtPrice =
        product.compare_at_price !== null &&
        product.compare_at_price !== undefined
          ? Number(
              product.compare_at_price
            )
          : undefined;

      const discount =
        compareAtPrice &&
        compareAtPrice > retailPrice
          ? `${Math.round(
              ((compareAtPrice -
                retailPrice) /
                compareAtPrice) *
                100
            )}% OFF`
          : undefined;

      const categoryData =
        Array.isArray(
          product.categories
        )
          ? product.categories[0]
          : product.categories;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description:
          product.description,
        price: retailPrice,
        oldPrice:
          compareAtPrice,
        discount,
        image:
          product.image_url || "",
        category:
          categoryData?.name ||
          title,
        rating: 0,
        reviews: 0,
        stockQuantity:
          Number(
            product.stock_quantity
          ) || 0,
      };
    });

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <section
      id={sectionId}
      className="border-b border-slate-200 bg-white"
    >
      <div className="container-shop px-4 py-7 sm:py-9 lg:py-10">

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="flex items-end justify-between gap-4">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-base">
                {icon}
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Collection
              </p>

            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">

              <h2 className="text-xl font-black tracking-tight text-[#172554] sm:text-2xl lg:text-[27px]">
                {title}
              </h2>

              <span className="text-xs font-semibold text-slate-400">
                {sectionProducts.length} products
              </span>

            </div>

            <p className="mt-1 line-clamp-1 max-w-2xl text-xs text-slate-500 sm:text-sm">
              {subtitle}
            </p>

          </div>

          {/* Desktop View All */}

          <Link
            href={viewAllHref}
            className="group hidden shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-extrabold text-[#172554] transition hover:bg-rose-50 hover:text-[#f43f5e] sm:inline-flex"
          >
            View All

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>

        {/* =================================================
            PRODUCT GRID
        ================================================= */}

        <div className="mt-5">

          {/* Mobile */}

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:hidden">

            {sectionProducts.map(
              (product) => (
                <div
                  key={product.id}
                  className="w-[175px] shrink-0"
                >
                  <ProductCard
                    product={product}
                  />
                </div>
              )
            )}

          </div>

          {/* Tablet */}

          <div className="hidden grid-cols-2 gap-3 sm:grid md:grid-cols-4 md:gap-4 lg:hidden">

            {sectionProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

          {/* Desktop */}

          <div className="hidden grid-cols-4 gap-4 lg:grid xl:grid-cols-5">

            {sectionProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

        </div>

        {/* =================================================
            MOBILE VIEW ALL
        ================================================= */}

        <div className="mt-4 sm:hidden">

          <Link
            href={viewAllHref}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#172554] transition hover:border-[#f43f5e] hover:text-[#f43f5e]"
          >
            View All {title}

            <span className="ml-1">
              →
            </span>
          </Link>

        </div>

      </div>
    </section>
  );
}