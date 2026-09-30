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

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
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

  /*
   * ------------------------------------------------------
   * Find the main category
   * ------------------------------------------------------
   */

  let categoryIds: string[] = [];

  if (categorySlug) {
    const {
      data: mainCategory,
      error: categoryError,
    } = await supabase
      .from("categories")
      .select(
        "id, name, slug, parent_id"
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

    /*
     * Include the main category itself.
     */
    categoryIds.push(mainCategory.id);

    /*
     * Find all active subcategories.
     */
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

    if (subcategories) {
      categoryIds.push(
        ...subcategories.map(
          (subcategory) =>
            subcategory.id
        )
      );
    }
  }

  /*
   * ------------------------------------------------------
   * Load products
   * ------------------------------------------------------
   */

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

  /*
   * Filter products belonging to this main category
   * or any of its subcategories.
   */
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

  /*
   * ------------------------------------------------------
   * No products
   *
   * Don't show an empty section.
   * ------------------------------------------------------
   */

  if (
    !products ||
    products.length === 0
  ) {
    return null;
  }

  /*
   * ------------------------------------------------------
   * Convert database products to Product type
   * ------------------------------------------------------
   */

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

  /*
   * ------------------------------------------------------
   * Render
   * ------------------------------------------------------
   */

  return (
    <section
      id={sectionId}
      className="container-shop px-4 py-8 sm:py-10 lg:py-12"
    >
      {/* Section Header */}
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft-gold text-base">
              {icon}
            </span>

            <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-coral">
              Collection
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
            {title}
          </h2>

          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">
            {subtitle}
          </p>
        </div>

        <Link
          href={viewAllHref}
          className="group hidden shrink-0 items-center gap-1 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold sm:inline-flex"
        >
          View All
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {/* Mobile Product Row */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:hidden">
        {sectionProducts.map(
          (product) => (
            <div
              key={product.id}
              className="w-[180px] shrink-0"
            >
              <ProductCard
                product={product}
              />
            </div>
          )
        )}
      </div>

      {/* Mobile View All */}
      <div className="mt-2 sm:hidden">
        <Link
          href={viewAllHref}
          className="flex w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold"
        >
          View All {title} →
        </Link>
      </div>

      {/* Tablet / Desktop Product Grid */}
      <div className="hidden grid-cols-2 gap-4 sm:grid md:grid-cols-4 md:gap-5 lg:gap-6">
        {sectionProducts.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          )
        )}
      </div>
    </section>
  );
}