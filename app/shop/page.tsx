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
   HOMEPAGE
   ========================================================= */

export default async function HomePage() {
  const supabase = await createClient();

  /* =======================================================
     LOAD ACTIVE CATEGORIES
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
      "Unable to load homepage categories:",
      categoryError
    );
  }

  const allCategories: Category[] =
    categoryData || [];

  /* =======================================================
     MAIN CATEGORIES
     ======================================================= */

  const mainCategories =
    allCategories.filter(
      (category) =>
        category.parent_id === null
    );

  /* =======================================================
     LOAD ACTIVE PRODUCTS FOR COUNTS
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
      "Unable to load homepage product counts:",
      productError
    );
  }

  const activeProducts: ProductCategoryRecord[] =
    productData || [];

  /* =======================================================
     DIRECT PRODUCT COUNTS
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
     SUBCATEGORY MAP
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
     CATEGORY PRODUCT COUNTS
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
          (subcategory) =>
            subcategory.id
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
     AVAILABLE CATEGORIES
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

  const totalProducts =
    activeProducts.length;

  const totalCategories =
    availableCategories.length;

  const featuredCategories =
    availableCategories.slice(0, 6);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="min-h-screen bg-white">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden bg-[#172554] text-white">

        {/* Decorative shapes */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-[#f43f5e]/20
            blur-sm
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-20
            h-80
            w-80
            rounded-full
            bg-white/5
          "
          aria-hidden="true"
        />

        <div className="container-shop relative py-9 sm:py-12 lg:py-14">

          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">

            {/* Hero copy */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />
                Shree Collection
              </div>

              <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                Find Something
                <span className="block text-[#fb7185]">
                  Special Today
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Discover gifts, toys, party
                essentials, home décor,
                stationery and more —
                all in one place.
              </p>

              {/* Hero actions */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/shop/products"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#f43f5e]
                    px-6
                    text-sm
                    font-extrabold
                    text-white
                    shadow-lg
                    shadow-black/10
                    transition
                    hover:bg-[#e11d48]
                  "
                >
                  Shop Now
                  <span
                    className="ml-2"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>

                <Link
                  href="/shop"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    px-6
                    text-sm
                    font-bold
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-white/15
                  "
                >
                  Browse Categories
                </Link>

              </div>

              {/* Quick stats */}

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">

                <div>
                  <p className="text-lg font-extrabold">
                    {totalProducts}+
                  </p>
                  <p className="text-[10px] font-medium text-blue-200">
                    Products
                  </p>
                </div>

                <div>
                  <p className="text-lg font-extrabold">
                    {totalCategories}
                  </p>
                  <p className="text-[10px] font-medium text-blue-200">
                    Categories
                  </p>
                </div>

                <div>
                  <p className="text-lg font-extrabold">
                    PAN India
                  </p>
                  <p className="text-[10px] font-medium text-blue-200">
                    Delivery
                  </p>
                </div>

              </div>
            </div>

            {/* Hero shopping panel */}

            <div className="hidden lg:block">

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                      Explore
                    </p>

                    <p className="mt-1 text-lg font-extrabold">
                      Shop by Category
                    </p>
                  </div>

                  <span className="rounded-full bg-[#f43f5e] px-3 py-1 text-[10px] font-extrabold">
                    New
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">

                  {featuredCategories.map(
                    (item, index) => {
                      const category =
                        item.category;

                      return (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="
                            group
                            rounded-2xl
                            border
                            border-white/10
                            bg-white
                            p-3
                            text-center
                            transition
                            hover:-translate-y-0.5
                          "
                        >
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-xl">
                            {getCategoryIcon(
                              category,
                              index
                            )}
                          </div>

                          <p className="mt-2 line-clamp-1 text-[10px] font-extrabold text-[#172554]">
                            {category.name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            {item.productCount}{" "}
                            items
                          </p>
                        </Link>
                      );
                    }
                  )}

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          QUICK SHOP NAV
      ================================================== */}

      <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="container-shop">

          <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">

            <Link
              href="/shop/products"
              className="
                shrink-0
                rounded-lg
                bg-[#172554]
                px-4
                py-2.5
                text-xs
                font-extrabold
                text-white
              "
            >
              All Products
            </Link>

            {featuredCategories.map(
              (item, index) => (
                <Link
                  key={item.category.id}
                  href={`/categories/${item.category.slug}`}
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-[#172554]
                    transition
                    hover:border-[#f43f5e]/30
                    hover:text-[#f43f5e]
                  "
                >
                  <span aria-hidden="true">
                    {getCategoryIcon(
                      item.category,
                      index
                    )}
                  </span>

                  {item.category.name}
                </Link>
              )
            )}

          </div>
        </div>
      </section>

      {/* ==================================================
          SHOP BY CATEGORY
      ================================================== */}

      {availableCategories.length > 0 && (
        <section className="container-shop py-8 sm:py-10">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Explore
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
                Shop by Category
              </h2>

              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Find what you need faster
              </p>
            </div>

            <Link
              href="/shop"
              className="
                hidden
                shrink-0
                items-center
                gap-1
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3.5
                py-2
                text-xs
                font-extrabold
                text-[#172554]
                transition
                hover:border-[#172554]
                hover:bg-[#172554]
                hover:text-white
                sm:inline-flex
              "
            >
              View All
              <span aria-hidden="true">
                →
              </span>
            </Link>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

            {availableCategories.map(
              (item, index) => {
                const category =
                  item.category;

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-3.5
                      shadow-sm
                      transition
                      duration-200
                      hover:-translate-y-1
                      hover:border-[#f43f5e]/30
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-center justify-between">

                      <div className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-50
                        text-2xl
                        transition
                        group-hover:scale-105
                      ">
                        {getCategoryIcon(
                          category,
                          index
                        )}
                      </div>

                      <span className="text-slate-300 transition group-hover:text-[#f43f5e]">
                        →
                      </span>

                    </div>

                    <h3 className="mt-3 line-clamp-1 text-sm font-extrabold text-[#172554]">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-[10px] font-medium text-slate-400">
                      {item.productCount}{" "}
                      {item.productCount === 1
                        ? "product"
                        : "products"}
                    </p>
                  </Link>
                );
              }
            )}

          </div>

          <Link
            href="/shop"
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-xs
              font-extrabold
              text-[#172554]
              sm:hidden
            "
          >
            View All Categories →
          </Link>

        </section>
      )}

      {/* ==================================================
          PROMOTIONAL SHOPPING STRIP
      ================================================== */}

      <section className="container-shop pb-2 sm:pb-4">

        <div className="grid gap-3 sm:grid-cols-3">

          <div className="rounded-2xl bg-[#fff1f3] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                🎁
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#172554]">
                  Gifts for Every Occasion
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Find something special
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                🚚
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#172554]">
                  PAN India Delivery
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Shop from anywhere in India
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                🛒
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#172554]">
                  Easy Shopping
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Simple and secure ordering
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          PRODUCT COLLECTIONS
      ================================================== */}

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

      {/* ==================================================
          SHOP ALL CTA
      ================================================== */}

      <section className="container-shop py-8 sm:py-12">

        <div className="relative overflow-hidden rounded-3xl bg-[#172554] px-5 py-7 text-white sm:px-8 sm:py-9">

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#f43f5e]/15
            "
            aria-hidden="true"
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-28
              -left-20
              h-64
              w-64
              rounded-full
              bg-white/5
            "
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fb7185]">
                Shree Collection
              </p>

              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Explore Everything
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                Browse our complete collection
                of gifts, toys, party items,
                décor and more.
              </p>
            </div>

            <Link
              href="/shop/products"
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                px-5
                py-3
                text-sm
                font-extrabold
                text-[#172554]
                transition
                hover:bg-slate-100
              "
            >
              Shop All Products
              <span
                className="ml-2"
                aria-hidden="true"
              >
                →
              </span>
            </Link>

          </div>
        </div>

      </section>

      {/* ==================================================
          SERVICE STRIP
      ================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 sm:divide-y-0">

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🚚
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554]">
              PAN India Delivery
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Across India
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🎁
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554]">
              Gifts for Every Occasion
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Something Special
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              🛒
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554]">
              Easy Shopping
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Simple Ordering
            </p>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="text-xl">
              💝
            </div>

            <p className="mt-1.5 text-xs font-extrabold text-[#172554]">
              Carefully Selected
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Quality Products
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}