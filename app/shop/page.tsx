import Link from "next/link";

import Hero from "@/components/home/Hero";
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

type CategoryWithProducts = {
  category: Category;
  productCount: number;
};

/*
 * ------------------------------------------------------
 * Category Icons
 * ------------------------------------------------------
 *
 * These are visual defaults only.
 * Categories remain fully dynamic.
 */

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

/*
 * ------------------------------------------------------
 * Get category icon
 * ------------------------------------------------------
 */

function getCategoryIcon(
  category: Category,
  index: number
) {
  return (
    categoryIcons[category.slug] ||
    fallbackIcons[index % fallbackIcons.length]
  );
}

export default async function ShopPage() {
  const supabase = await createClient();

  /*
   * ======================================================
   * LOAD ACTIVE MAIN CATEGORIES
   * ======================================================
   */

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
    .is("parent_id", null)
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

  const mainCategories: Category[] =
    categoryData || [];

  /*
   * ======================================================
   * FIND CATEGORIES WITH PRODUCTS
   * ======================================================
   *
   * Products can belong to:
   *
   * 1. Main category
   * 2. Subcategory
   *
   * Both are included.
   * ======================================================
   */

  const categoriesWithProducts: CategoryWithProducts[] =
    await Promise.all(
      mainCategories.map(
        async (category) => {
          /*
           * Get active subcategories.
           */
          const {
            data: subcategories,
          } = await supabase
            .from("categories")
            .select("id")
            .eq("parent_id", category.id)
            .eq("is_active", true);

          const categoryIds = [
            category.id,
            ...(subcategories || []).map(
              (subcategory) =>
                subcategory.id
            ),
          ];

          /*
           * Count active products.
           */
          const {
            count,
            error,
          } = await supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            })
            .in(
              "category_id",
              categoryIds
            )
            .eq("is_active", true);

          if (error) {
            console.error(
              `Unable to count products for ${category.name}:`,
              error
            );
          }

          return {
            category,
            productCount: count || 0,
          };
        }
      )
    );

  /*
   * ======================================================
   * ONLY AVAILABLE CATEGORIES
   * ======================================================
   */

  const availableCategories =
    categoriesWithProducts
      .filter(
        (item) =>
          item.productCount > 0
      )
      .sort((a, b) => {
        /*
         * More products first.
         */
        if (
          b.productCount !==
          a.productCount
        ) {
          return (
            b.productCount -
            a.productCount
          );
        }

        /*
         * Then admin sort order.
         */
        return (
          a.category.sort_order -
          b.category.sort_order
        );
      });

  /*
   * ======================================================
   * CATEGORY SUMMARY
   * ======================================================
   */

  const totalAvailableCategories =
    availableCategories.length;

  const totalProducts = availableCategories.reduce(
    (total, item) =>
      total + item.productCount,
    0
  );

  return (
    <main className="min-h-screen bg-background">
      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <Hero />

      {/* ================================================= */}
      {/* TRUST / SERVICE STRIP */}
      {/* ================================================= */}

      <section className="border-y border-border bg-white">
        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          <div className="p-4 text-center sm:p-5">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft-gold text-xl">
              🚚
            </div>

            <p className="mt-3 text-xs font-extrabold text-brand-navy sm:text-sm">
              PAN India Delivery
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Across India
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft-gold text-xl">
              🎁
            </div>

            <p className="mt-3 text-xs font-extrabold text-brand-navy sm:text-sm">
              Gifts for Every Occasion
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Something Special
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft-gold text-xl">
              🏪
            </div>

            <p className="mt-3 text-xs font-extrabold text-brand-navy sm:text-sm">
              Retail & Wholesale
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              For Everyone
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft-gold text-xl">
              💝
            </div>

            <p className="mt-3 text-xs font-extrabold text-brand-navy sm:text-sm">
              Carefully Selected
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Quality Products
            </p>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SHOP OVERVIEW */}
      {/* ================================================= */}

      <section className="container-shop px-4 pb-4 pt-10 sm:pt-14">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-7 text-white shadow-soft sm:px-8 sm:py-9 lg:px-10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10" />

          <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-brand-coral/10" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold text-brand-gold">
                ✨ SHREE COLLECTION
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Discover Something
                <span className="block text-brand-gold">
                  Special
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Explore gifts, toys, party essentials,
                stationery, divine decor and more.
                Find something special for every occasion.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 sm:flex sm:flex-row lg:flex-col">
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-brand-gold">
                  {totalAvailableCategories}
                </p>

                <p className="mt-1 text-[10px] font-bold text-white/70">
                  Categories
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-brand-gold">
                  {totalProducts}
                </p>

                <p className="mt-1 text-[10px] font-bold text-white/70">
                  Products
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* SHOP BY CATEGORY */}
      {/* ================================================= */}

      {availableCategories.length > 0 && (
        <section className="container-shop px-4 pt-10 sm:pt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Explore
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Explore what is currently available
                at Shree Collection.
              </p>
            </div>

            <Link
              href="/shop/products"
              className="hidden shrink-0 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold sm:inline-flex"
            >
              View All →
            </Link>
          </div>

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
                    className="group relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-medium sm:p-5"
                  >
                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-gold/15 transition group-hover:bg-brand-gold/30" />

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft-gold text-2xl transition group-hover:scale-105">
                      {icon}
                    </div>

                    <h3 className="relative mt-4 line-clamp-1 text-sm font-extrabold text-brand-navy sm:text-base">
                      {category.name}
                    </h3>

                    <p className="relative mt-1 text-xs text-text-secondary">
                      {item.productCount}{" "}
                      {item.productCount === 1
                        ? "product"
                        : "products"}
                    </p>

                    <div className="relative mt-3 text-xs font-extrabold text-brand-coral">
                      Explore →
                    </div>
                  </Link>
                );
              }
            )}
          </div>

          <div className="mt-4 sm:hidden">
            <Link
              href="/shop/products"
              className="flex w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold"
            >
              View All Products →
            </Link>
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* PRODUCT SECTIONS */}
      {/* ================================================= */}

      {availableCategories.map(
        (categoryItem, index) => {
          const category =
            categoryItem.category;

          const title =
            category.name;

          const subtitle =
            category.description ||
            `Explore our ${category.name.toLowerCase()} collection`;

          return (
            <ProductSection
              key={category.id}
              title={title}
              subtitle={subtitle}
              categorySlug={
                category.slug
              }
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

      {/* ================================================= */}
      {/* NO PRODUCTS */}
      {/* ================================================= */}

      {availableCategories.length ===
        0 && (
          <section className="container-shop px-4 py-14 sm:py-16">
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-8 text-center shadow-soft sm:p-12">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/20" />

              <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-coral/10" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft-gold text-4xl">
                  🛍️
                </div>

                <h2 className="mt-5 text-2xl font-black text-brand-navy sm:text-3xl">
                  Our Collection Is Growing
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
                  We are adding exciting products
                  to Shree Collection. Please check
                  back soon.
                </p>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex rounded-full bg-brand-gold px-6 py-3 text-sm font-extrabold text-brand-navy transition hover:bg-brand-gold-dark"
                >
                  Contact Us →
                </Link>
              </div>
            </div>
          </section>
        )}

      {/* ================================================= */}
      {/* SHOP ALL CTA */}
      {/* ================================================= */}

      <section className="container-shop px-4 py-12 sm:py-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-white p-7 shadow-soft sm:p-10">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-gold/25" />

          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-brand-coral/10" />

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft-gold text-3xl">
              🛍️
            </div>

            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
              Shree Collection
            </p>

            <h2 className="mt-2 text-2xl font-black text-brand-navy sm:text-3xl">
              Explore Our Complete Collection
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Browse all products currently available
              and find something perfect for every
              occasion.
            </p>

            <Link
              href="/shop/products"
              className="mt-6 inline-flex rounded-full bg-brand-navy px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-medium"
            >
              Shop All Products →
            </Link>

            <p className="mt-3 text-xs text-text-muted">
              {totalAvailableCategories}{" "}
              {totalAvailableCategories === 1
                ? "category"
                : "categories"}{" "}
              currently available
            </p>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* WHOLESALE CTA */}
      {/* ================================================= */}

      <section className="container-shop px-4 pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10" />

          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-brand-coral/10" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-green-400/15 px-3 py-1.5 text-xs font-extrabold text-green-300">
                🏪 FOR BUSINESS
              </div>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Buying in Bulk?
                <span className="text-brand-gold">
                  {" "}
                  Go Wholesale.
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Get access to wholesale pricing,
                minimum order quantities, bulk orders
                and business account features.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/wholesale/login"
                className="inline-flex items-center justify-center rounded-xl bg-brand-gold px-6 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-brand-gold-dark"
              >
                Wholesale Login →
              </Link>

              <Link
                href="/wholesale/register"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Register Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* CONTACT CTA */}
      {/* ================================================= */}

      <section className="container-shop px-4 pb-12 sm:pb-16">
        <div className="rounded-[2rem] bg-brand-gold p-7 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Need Help?
              </p>

              <h2 className="mt-2 text-2xl font-black text-brand-navy sm:text-3xl">
                Looking for something special?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-brand-navy/70">
                Contact Shree Collection and we will
                be happy to help you find the right
                product.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:8796780766"
                className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-dark"
              >
                📞 Call Us
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-gray-50"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}