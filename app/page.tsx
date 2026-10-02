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
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      parent_id,
      is_active,
      sort_order
    `)
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
  ======================================================= */

  const categoriesWithProducts: CategoryWithProducts[] =
    await Promise.all(
      mainCategories.map(async (category) => {
        const {
          data: subcategories,
          error: subcategoryError,
        } = await supabase
          .from("categories")
          .select("id")
          .eq("parent_id", category.id)
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
            (subcategory) => subcategory.id
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
          .in("category_id", categoryIds)
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
      })
    );

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

  /*
   * Show a few category collections on the
   * homepage. The complete catalogue remains
   * available through /shop/products.
   */
  const featuredCategories =
    availableCategories.slice(0, 5);

  const quickCategories =
    availableCategories.slice(0, 8);

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* =================================================
          CATEGORY QUICK NAVIGATION
      ================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop overflow-x-auto px-4">
          <div className="flex min-w-max items-center gap-1 py-2">

            <Link
              href="/shop/products"
              className="rounded-lg bg-[#172554] px-4 py-2 text-xs font-extrabold text-white"
            >
              All Products
            </Link>

            {quickCategories.map(
              (item, index) => (
                <Link
                  key={item.category.id}
                  href={`/categories/${item.category.slug}`}
                  className="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#172554]"
                >
                  <span>
                    {getCategoryIcon(
                      item.category,
                      index
                    )}
                  </span>

                  <span>
                    {item.category.name}
                  </span>
                </Link>
              )
            )}

            <Link
              href="/shop/products"
              className="rounded-lg px-3 py-2 text-xs font-extrabold text-[#f43f5e] hover:bg-rose-50"
            >
              Shop All →
            </Link>

          </div>
        </div>
      </section>

      {/* =================================================
          HERO / SHOPPING BANNER
      ================================================= */}

      <section className="bg-white">
        <div className="container-shop px-4 py-5 sm:py-7">

          <div className="relative overflow-hidden rounded-3xl bg-[#172554] px-6 py-8 sm:px-10 sm:py-10 lg:px-14">

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f43f5e]/15" />

            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/5" />

            <div className="absolute right-[12%] top-10 hidden text-5xl opacity-80 lg:block">
              🎁
            </div>

            <div className="absolute bottom-8 right-[22%] hidden text-3xl opacity-70 lg:block">
              ✨
            </div>

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_0.6fr]">

              <div>

                <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-extrabold text-white ring-1 ring-white/15">
                  ✨ Gifts • Toys • Decor • More
                </div>

                <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Make Every
                  <span className="text-[#f43f5e]">
                    {" "}Moment Special
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Discover gifts, toys, party essentials,
                  divine decor, stationery and more —
                  all in one place.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">

                  <Link
                    href="/shop/products"
                    className="inline-flex items-center justify-center rounded-xl bg-[#f43f5e] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#e11d48]"
                  >
                    🛍️ Shop Now
                  </Link>

                  <Link
                    href="/shop/products"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#172554] transition hover:bg-slate-100"
                  >
                    Browse All Products →
                  </Link>

                </div>

              </div>

              {/* Hero highlights */}

              <div className="hidden grid-cols-2 gap-3 lg:grid">

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-2xl">
                    🚚
                  </div>

                  <p className="mt-2 text-sm font-extrabold text-white">
                    PAN India
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    Delivery available
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-2xl">
                    🎁
                  </div>

                  <p className="mt-2 text-sm font-extrabold text-white">
                    Great Gifts
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    For every occasion
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-2xl">
                    🛒
                  </div>

                  <p className="mt-2 text-sm font-extrabold text-white">
                    Easy Shopping
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    Simple ordering
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <div className="text-2xl">
                    💝
                  </div>

                  <p className="mt-2 text-sm font-extrabold text-white">
                    Carefully Selected
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    Products you'll love
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          SHOP BY CATEGORY
      ================================================= */}

      <section className="bg-white">
        <div className="container-shop px-4 py-7 sm:py-9">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Explore
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Find something you love quickly.
              </p>
            </div>

            <Link
              href="/shop/products"
              className="hidden text-sm font-extrabold text-[#172554] hover:text-[#f43f5e] sm:block"
            >
              Shop All Products →
            </Link>

          </div>

          {availableCategories.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">

              {availableCategories
                .slice(0, 8)
                .map((item, index) => {

                  const category =
                    item.category;

                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group flex min-h-[118px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#f43f5e]/30 hover:shadow-md"
                    >

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-2xl transition group-hover:bg-rose-50">
                        {getCategoryIcon(
                          category,
                          index
                        )}
                      </div>

                      <h3 className="mt-2 line-clamp-1 text-xs font-extrabold text-[#172554] sm:text-sm">
                        {category.name}
                      </h3>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {item.productCount}{" "}
                        {item.productCount === 1
                          ? "product"
                          : "products"}
                      </p>

                    </Link>
                  );
                })}

            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center">

              <div className="text-4xl">
                🛍️
              </div>

              <h3 className="mt-3 text-lg font-black text-[#172554]">
                Collection Coming Soon
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                We are adding products to
                the Shree Collection store.
              </p>

            </div>
          )}

          <div className="mt-4 sm:hidden">
            <Link
              href="/shop/products"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#172554]"
            >
              View All Products →
            </Link>
          </div>

        </div>
      </section>

      {/* =================================================
          SHOPPING BENEFITS
      ================================================= */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🚚
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554] sm:text-sm">
              PAN India Delivery
            </p>

            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              Across India
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🎁
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554] sm:text-sm">
              Gifts for Every Occasion
            </p>

            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              Something special
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🛒
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554] sm:text-sm">
              Easy Shopping
            </p>

            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              Simple ordering
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              💝
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554] sm:text-sm">
              Carefully Selected
            </p>

            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
              Products you'll love
            </p>
          </div>

        </div>
      </section>

      {/* =================================================
          FEATURED PRODUCTS
      ================================================= */}

      {featuredCategories.length > 0 && (
        <section className="bg-[#f8fafc]">

          <div className="container-shop px-4 pt-8 sm:pt-10">

            <div className="flex items-end justify-between gap-4">

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                  Popular Now
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                  Explore Our Collections
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Shop our latest collections
                  and popular products.
                </p>
              </div>

              <Link
                href="/shop/products"
                className="hidden text-sm font-extrabold text-[#172554] hover:text-[#f43f5e] sm:block"
              >
                Shop All →
              </Link>

            </div>

          </div>

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

        </section>
      )}

      {/* =================================================
          SHOPPING CTA
      ================================================= */}

      <section className="bg-white px-4 py-8 sm:py-10">
        <div className="container-shop">

          <div className="relative overflow-hidden rounded-3xl bg-[#172554] px-6 py-7 text-white sm:px-10 sm:py-9">

            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#f43f5e]/15" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                  Shree Collection
                </p>

                <h2 className="mt-1.5 text-2xl font-black sm:text-3xl">
                  Explore the Complete Store
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Browse all gifts, toys, party
                  items, stationery, decor and
                  other products currently
                  available.
                </p>

              </div>

              <Link
                href="/shop/products"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#f43f5e] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#e11d48]"
              >
                Shop All Products →
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          WHOLESALE
      ================================================= */}

      <section className="bg-white px-4 pb-8 sm:pb-12">
        <div className="container-shop">

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🏪
              </div>

              <div>

                <p className="text-sm font-extrabold text-[#172554]">
                  Buying for your business?
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Wholesale pricing is available
                  for registered business customers.
                </p>

              </div>

            </div>

            <Link
              href="/wholesale"
              className="inline-flex items-center justify-center rounded-xl border border-[#172554] bg-white px-5 py-3 text-sm font-extrabold text-[#172554] transition hover:bg-[#172554] hover:text-white"
            >
              Wholesale Business →
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}