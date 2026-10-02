import Link from "next/link";

import ProductSection from "@/components/home/ProductSection";
import { createClient } from "@/lib/supabase/server";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
};

type ProductCategoryRecord = {
  id: string;
  category_id: string | null;
  is_active: boolean;
};

/* =========================================================
   CATEGORY ICONS
   ========================================================= */

const categoryIcons: Record<string, string> = {
  "party-items": "🎉",
  "gift-items": "🎁",
  toys: "🧸",
  stationery: "✏️",
  "ladies-bags": "👜",
  "gift-hampers": "🎀",
  "key-chains": "🔑",
  "divine-photo-frames": "🖼️",
  statues: "🛕",
};

const fallbackIcons = [
  "🎁",
  "🎀",
  "✨",
  "🛍️",
  "💝",
  "🌟",
];

function getCategoryIcon(
  category: Category,
  index: number
) {
  return (
    categoryIcons[category.slug] ||
    fallbackIcons[index % fallbackIcons.length]
  );
}

/* =========================================================
   SHOP PAGE
   ========================================================= */

export default async function ShopPage() {
  const supabase = await createClient();

  /* =======================================================
     LOAD ALL ACTIVE CATEGORIES IN ONE QUERY
     ======================================================= */

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        description,
        image_url,
        parent_id,
        is_active,
        sort_order
      `
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (categoryError) {
    console.error(
      "Unable to load shop categories:",
      categoryError
    );
  }

  const allCategories: Category[] =
    categoryData || [];

  /* =======================================================
     MAIN CATEGORIES
     ======================================================= */

  const mainCategories = allCategories.filter(
    (category) => category.parent_id === null
  );

  /* =======================================================
     LOAD ACTIVE PRODUCTS ONCE

     We only load the fields required to calculate
     category product counts.
     ======================================================= */

  const {
    data: productData,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        category_id,
        is_active
      `
    )
    .eq("is_active", true);

  if (productError) {
    console.error(
      "Unable to load shop product counts:",
      productError
    );
  }

  const activeProducts: ProductCategoryRecord[] =
    productData || [];

  /* =======================================================
     BUILD DIRECT PRODUCT COUNT BY CATEGORY
     ======================================================= */

  const directProductCounts =
    new Map<string, number>();

  for (const product of activeProducts) {
    if (!product.category_id) {
      continue;
    }

    directProductCounts.set(
      product.category_id,
      (directProductCounts.get(
        product.category_id
      ) || 0) + 1
    );
  }

  /* =======================================================
     BUILD SUBCATEGORY MAP
     ======================================================= */

  const subcategoriesByParent =
    new Map<string, Category[]>();

  for (const category of allCategories) {
    if (!category.parent_id) {
      continue;
    }

    const existing =
      subcategoriesByParent.get(
        category.parent_id
      ) || [];

    existing.push(category);

    subcategoriesByParent.set(
      category.parent_id,
      existing
    );
  }

  /* =======================================================
     CALCULATE PRODUCT COUNTS

     A main category includes:
     - products directly assigned to it
     - products assigned to its subcategories
     ======================================================= */

  const categoriesWithProducts =
    mainCategories.map((category) => {
      const subcategories =
        subcategoriesByParent.get(
          category.id
        ) || [];

      const categoryIds = [
        category.id,
        ...subcategories.map(
          (subcategory) => subcategory.id
        ),
      ];

      const productCount =
        categoryIds.reduce(
          (total, categoryId) =>
            total +
            (directProductCounts.get(
              categoryId
            ) || 0),
          0
        );

      return {
        category,
        productCount,
      };
    });

  /* =======================================================
     ONLY CATEGORIES THAT HAVE PRODUCTS
     ======================================================= */

  const availableCategories =
    categoriesWithProducts
      .filter(
        (item) => item.productCount > 0
      )
      .sort((a, b) => {
        if (
          b.productCount !==
          a.productCount
        ) {
          return (
            b.productCount -
            a.productCount
          );
        }

        return (
          a.category.sort_order -
          b.category.sort_order
        );
      });

  const totalAvailableCategories =
    availableCategories.length;

  const totalProducts =
    activeProducts.length;

  return (
    <main className="min-h-screen bg-background">

      {/* =================================================
          SHOP HEADER
          ================================================= */}

      <section className="border-b border-border bg-white">
        <div className="container-shop px-4 py-9 sm:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Shree Collection
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
                Shop Our Collection
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Discover gifts, toys, party
                essentials, stationery, decor,
                ladies bags and more.
              </p>
            </div>

            {/* Shop statistics */}

            <div className="grid grid-cols-2 gap-3 sm:flex">

              <div className="rounded-2xl border border-border bg-muted-surface px-5 py-4 text-center">
                <p className="text-2xl font-black text-brand-navy">
                  {totalAvailableCategories}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                  Categories
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted-surface px-5 py-4 text-center">
                <p className="text-2xl font-black text-brand-navy">
                  {totalProducts}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                  Products
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          QUICK SHOP ACTIONS
          ================================================= */}

      <section className="border-b border-border bg-white">
        <div className="container-shop px-4 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">

            <Link
              href="/shop"
              className="shrink-0 rounded-full bg-brand-navy px-5 py-2.5 text-xs font-extrabold text-white"
            >
              All Categories
            </Link>

            <Link
              href="/shop/products"
              className="shrink-0 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-coral/30 hover:bg-muted-surface"
            >
              All Products
            </Link>

            <Link
              href="/orders"
              className="shrink-0 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-coral/30 hover:bg-muted-surface"
            >
              Track Order
            </Link>

          </div>
        </div>
      </section>

      {/* =================================================
          SHOP BY CATEGORY
          ================================================= */}

      {availableCategories.length > 0 && (
        <section className="container-shop px-4 py-9 sm:py-12">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Browse
              </p>

              <h2 className="mt-1 text-2xl font-black text-brand-navy sm:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Choose a category to explore
                products.
              </p>
            </div>

            <Link
              href="/shop/products"
              className="hidden shrink-0 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-coral/30 hover:bg-muted-surface sm:inline-flex"
            >
              View All Products →
            </Link>

          </div>

          {/* Category grid */}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">

            {availableCategories.map(
              (item, index) => {
                const category =
                  item.category;

                const icon =
                  getCategoryIcon(
                    category,
                    index
                  );

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-coral/30 hover:shadow-medium sm:p-5"
                  >

                    {/* Decorative shape */}

                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-soft-gold opacity-60 transition group-hover:scale-125" />

                    {/* Category icon */}

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-surface text-2xl transition group-hover:scale-105">
                      {icon}
                    </div>

                    {/* Category name */}

                    <h3 className="relative mt-4 line-clamp-1 text-sm font-extrabold text-brand-navy sm:text-base">
                      {category.name}
                    </h3>

                    {/* Product count */}

                    <p className="relative mt-1 text-xs text-text-secondary">
                      {item.productCount}{" "}
                      {item.productCount === 1
                        ? "product"
                        : "products"}
                    </p>

                    {/* Explore */}

                    <div className="relative mt-3 text-xs font-extrabold text-brand-coral">
                      Explore →
                    </div>

                  </Link>
                );
              }
            )}

          </div>

          {/* Mobile all products */}

          <div className="mt-5 sm:hidden">
            <Link
              href="/shop/products"
              className="flex w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-extrabold text-brand-navy"
            >
              View All Products →
            </Link>
          </div>

        </section>
      )}

      {/* =================================================
          PRODUCT COLLECTIONS
          ================================================= */}

      {availableCategories.map(
        (categoryItem, index) => {
          const category =
            categoryItem.category;

          const subtitle =
            category.description ||
            `Explore our ${category.name.toLowerCase()} collection`;

          return (
            <ProductSection
              key={category.id}
              title={category.name}
              subtitle={subtitle}
              categorySlug={category.slug}
              viewAllHref={`/categories/${category.slug}`}
              limit={8}
              icon={getCategoryIcon(
                category,
                index
              )}
            />
          );
        }
      )}

      {/* =================================================
          NO PRODUCTS STATE
          ================================================= */}

      {availableCategories.length === 0 && (
        <section className="container-shop px-4 py-12 sm:py-16">

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-8 text-center shadow-soft sm:p-12">

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-soft-gold" />

            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-coral/5" />

            <div className="relative">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted-surface text-4xl">
                🛍️
              </div>

              <h2 className="mt-5 text-2xl font-black text-brand-navy sm:text-3xl">
                Our Collection Is Growing
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                We are adding exciting
                products to Shree Collection.
                Please check back soon.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex rounded-full bg-brand-navy px-6 py-3 text-sm font-extrabold text-white transition hover:bg-brand-dark"
              >
                Contact Us →
              </Link>

            </div>

          </div>

        </section>
      )}

      {/* =================================================
          SHOP ALL CTA
          ================================================= */}

      <section className="container-shop px-4 py-10 sm:py-14">

        <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-8 text-white sm:px-10 sm:py-10">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-coral/10" />

          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Shree Collection
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Explore All Products
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Browse our complete collection
                and find something special for
                every occasion.
              </p>

            </div>

            <Link
              href="/shop/products"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-slate-100"
            >
              Shop All Products →
            </Link>

          </div>

        </div>

      </section>

      {/* =================================================
          RETAIL SERVICE STRIP
          ================================================= */}

      <section className="border-t border-border bg-white">

        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">

          {/* Delivery */}

          <div className="p-4 text-center sm:p-5">

            <div className="text-2xl">
              🚚
            </div>

            <p className="mt-2 text-xs font-extrabold text-brand-navy sm:text-sm">
              PAN India Delivery
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Across India
            </p>

          </div>

          {/* Gifts */}

          <div className="p-4 text-center sm:p-5">

            <div className="text-2xl">
              🎁
            </div>

            <p className="mt-2 text-xs font-extrabold text-brand-navy sm:text-sm">
              Gifts for Every Occasion
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Something Special
            </p>

          </div>

          {/* Shopping */}

          <div className="p-4 text-center sm:p-5">

            <div className="text-2xl">
              🛒
            </div>

            <p className="mt-2 text-xs font-extrabold text-brand-navy sm:text-sm">
              Easy Shopping
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Simple Ordering
            </p>

          </div>

          {/* Quality */}

          <div className="p-4 text-center sm:p-5">

            <div className="text-2xl">
              💝
            </div>

            <p className="mt-2 text-xs font-extrabold text-brand-navy sm:text-sm">
              Carefully Selected
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Quality Products
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}