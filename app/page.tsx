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

type CategoryWithProducts = {
  category: Category;
  productCount: number;
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
   HOME PAGE
   Retail storefront
   ========================================================= */

export default async function Home() {
  const supabase = await createClient();

  /* =======================================================
     LOAD ACTIVE MAIN CATEGORIES
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
    .is("parent_id", null)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (categoryError) {
    console.error(
      "Unable to load homepage categories:",
      categoryError
    );
  }

  const mainCategories: Category[] =
    categoryData || [];

  /* =======================================================
     FIND CATEGORIES THAT HAVE PRODUCTS

     Products can belong directly to a main category
     or to one of its subcategories.
     ======================================================= */

  const categoriesWithProducts: CategoryWithProducts[] =
    await Promise.all(
      mainCategories.map(
        async (category) => {
          const {
            data: subcategories,
            error: subcategoryError,
          } = await supabase
            .from("categories")
            .select("id")
            .eq(
              "parent_id",
              category.id
            )
            .eq("is_active", true);

          if (subcategoryError) {
            console.error(
              `Unable to load subcategories for ${category.name}:`,
              subcategoryError
            );
          }

          const categoryIds = [
            category.id,
            ...(subcategories || []).map(
              (subcategory) =>
                subcategory.id
            ),
          ];

          const {
            count,
            error: productCountError,
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

          if (productCountError) {
            console.error(
              `Unable to count products for ${category.name}:`,
              productCountError
            );
          }

          return {
            category,
            productCount: count || 0,
          };
        }
      )
    );

  /* =======================================================
     AVAILABLE CATEGORIES
     ======================================================= */

  const availableCategories =
    categoriesWithProducts
      .filter(
        (item) =>
          item.productCount > 0
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

  /*
   * Only show the first few category product sections
   * on the homepage.
   *
   * The complete catalogue remains available through
   * /shop/products.
   */
  const featuredCategories =
    availableCategories.slice(0, 4);

  return (
    <main className="min-h-screen bg-background">

      {/* =================================================
          RETAIL HERO
          ================================================= */}

      <section className="relative overflow-hidden bg-white">

        {/* Decorative shapes */}

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-soft-gold" />

        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-coral/5" />

        <div className="absolute right-[12%] top-20 hidden text-5xl lg:block">
          🎈
        </div>

        <div className="absolute left-[8%] top-32 hidden text-4xl lg:block">
          🎁
        </div>

        <div className="container-shop relative px-4 py-12 sm:py-16 lg:py-20">

          <div className="mx-auto max-w-4xl text-center">

            {/* Small badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-extrabold text-brand-navy shadow-sm">
              ✨ Everything You Love, All in One Place
            </div>

            {/* Main heading */}

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-brand-navy sm:text-6xl lg:text-7xl">
              Make Every
              <span className="block text-brand-coral">
                Moment Special
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-lg">
              Explore a beautiful collection of gifts, toys, party essentials, divine décor, home décor, accessories, keychains, statues, showpieces and more.

            </p>

            {/* Main shopping CTA */}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <Link
                href="/shop/products"
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-navy px-8 py-4 text-sm font-extrabold text-white shadow-medium transition hover:-translate-y-0.5 hover:bg-brand-dark sm:w-auto"
              >
                🛍️ Shop Now
              </Link>

              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-brand-navy bg-white px-8 py-4 text-sm font-extrabold text-brand-navy transition hover:bg-muted-surface sm:w-auto"
              >
                Browse Categories →
              </Link>

            </div>

          </div>

          {/* Quick category highlights */}

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">

            <Link
              href="/shop"
              className="group rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="text-3xl">
                🎁
              </div>

              <p className="mt-2 text-sm font-extrabold text-brand-navy">
                Gifts
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                For Every Occasion
              </p>
            </Link>

            <Link
              href="/shop"
              className="group rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="text-3xl">
                🧸
              </div>

              <p className="mt-2 text-sm font-extrabold text-brand-navy">
                Toys
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                Fun For Kids
              </p>
            </Link>

            <Link
              href="/shop"
              className="group rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="text-3xl">
                🎈
              </div>

              <p className="mt-2 text-sm font-extrabold text-brand-navy">
                Party Items
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                Celebrate Better
              </p>
            </Link>

            <Link
              href="/shop"
              className="group rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-medium"
            >
              <div className="text-3xl">
                🪔
              </div>

              <p className="mt-2 text-sm font-extrabold text-brand-navy">
                Divine
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                Frames & Decor
              </p>
            </Link>

          </div>

        </div>
      </section>


      {/* =================================================
          RETAIL BENEFITS
          ================================================= */}

      <section className="border-y border-border bg-white">

        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">

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

          <div className="p-4 text-center sm:p-5">
            <div className="text-2xl">
              💝
            </div>

            <p className="mt-2 text-xs font-extrabold text-brand-navy sm:text-sm">
              Carefully Selected
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Products You'll Love
            </p>
          </div>

        </div>

      </section>


      {/* =================================================
          SHOP BY CATEGORY
          ================================================= */}

      <section className="container-shop px-4 py-10 sm:py-14">

        <div className="flex items-end justify-between gap-4">

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-black text-brand-navy sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              Find something perfect for
              every occasion.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden shrink-0 text-sm font-extrabold text-brand-navy transition hover:text-brand-coral sm:block"
          >
            View All →
          </Link>

        </div>


        {availableCategories.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            {availableCategories
              .slice(0, 8)
              .map(
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
                      className="group relative overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-brand-coral/30 hover:shadow-medium sm:p-5"
                    >

                      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-brand-soft-gold transition group-hover:scale-110" />

                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-surface text-2xl">
                        {icon}
                      </div>

                      <h3 className="relative mt-4 line-clamp-1 text-sm font-extrabold text-brand-navy sm:text-base">
                        {category.name}
                      </h3>

                      <p className="relative mt-1 text-xs text-text-secondary">
                        {item.productCount}{" "}
                        {item.productCount ===
                        1
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
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-white p-8 text-center">
            <div className="text-4xl">
              🛍️
            </div>

            <h3 className="mt-4 text-xl font-black text-brand-navy">
              Collection Coming Soon
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
              We are adding products to
              the Shree Collection store.
            </p>
          </div>
        )}

        <div className="mt-5 sm:hidden">
          <Link
            href="/shop"
            className="flex w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-sm font-extrabold text-brand-navy"
          >
            View All Categories →
          </Link>
        </div>

      </section>


      {/* =================================================
          PRODUCT COLLECTIONS
          ================================================= */}

      {featuredCategories.map(
        (categoryItem, index) => {
          const category =
            categoryItem.category;

          return (
            <ProductSection
              key={category.id}
              title={category.name}
              subtitle={
                category.description ||
                `Explore our ${category.name.toLowerCase()} collection`
              }
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


      {/* =================================================
          SHOP ALL
          ================================================= */}

      <section className="container-shop px-4 py-10 sm:py-14">

        <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-8 text-white sm:px-10 sm:py-10">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-coral/10" />

          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-brand-gold/10" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                Shree Collection
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Explore the Complete Store
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Browse all gifts, toys, party
                items, stationery, decor and
                other products currently
                available.
              </p>

            </div>

            <Link
              href="/shop/products"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-muted-surface"
            >
              Shop All Products →
            </Link>

          </div>

        </div>

      </section>


      {/* =================================================
          SMALL BUSINESS LINK
          =================================================
          
          Wholesale is intentionally NOT a major homepage
          section. It remains available through the menu.
          This small link is only an additional navigation
          path for business customers.
          ================================================= */}

      <section className="container-shop px-4 pb-10 sm:pb-14">

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted-surface text-xl">
              🏪
            </div>

            <div>

              <p className="text-sm font-extrabold text-brand-navy">
                Buying for your business?
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                Wholesale pricing is available for
                registered business customers.
              </p>

            </div>

          </div>

          <Link
            href="/wholesale"
            className="inline-flex items-center justify-center rounded-xl border border-brand-navy px-5 py-3 text-sm font-extrabold text-brand-navy transition hover:bg-brand-navy hover:text-white"
          >
            Wholesale Business →
          </Link>

        </div>

      </section>

    </main>
  );
}