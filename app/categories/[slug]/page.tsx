import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/products/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/product";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
};

const categoryIcons: Record<string, string> = {
  "party-items": "🎈",
  "gift-items": "🎁",
  toys: "🧸",
  stationery: "✏️",
  "ladies-bags": "👜",
  "gift-hampers": "🎀",
  "key-chains": "🔑",
  "divine-photo-frames": "🖼️",
  statues: "🛕",

  birthday: "🎂",
  anniversary: "💝",
  "kids-party": "🎉",
  annaprashan: "👶",
  "baby-shower": "🍼",
  balloons: "🎈",
  "party-decoration": "🎊",
  "return-gifts": "🎁",

  "birthday-gifts": "🎁",
  "anniversary-gifts": "💝",
  "couple-gifts": "💑",
  "kids-gifts": "🧸",
  "religious-gifts": "🙏",
  "photo-frames": "🖼️",
  "personalized-gifts": "✨",

  "action-figures": "🦸",
  "educational-toys": "📚",
  "remote-control-toys": "🚗",
  "soft-toys": "🧸",
  "kids-games": "🎮",
  "small-toys": "🪀",
  "keychain-toys": "🔑",

  pens: "🖊️",
  pencils: "✏️",
  erasers: "🧽",
  notebooks: "📓",
  diaries: "📔",
  "school-items": "🎒",
  "art-craft": "🎨",
  "stationery-games": "🎲",

  "hand-bags": "👜",
  "sling-bags": "👛",
  wallets: "💳",
  pouches: "👝",
  "cosmetic-bags": "💄",

  "birthday-hampers": "🎂",
  "kids-hampers": "🧸",
  "couple-hampers": "💝",
  "festival-hampers": "🎁",
  "corporate-hampers": "🎀",

  "anime-key-chains": "🌟",
  "cartoon-key-chains": "🧸",
  "religious-key-chains": "🙏",
  "couple-key-chains": "💑",
  "metal-key-chains": "🔗",
  "acrylic-key-chains": "✨",
  "car-bike-key-chains": "🚗",

  "divine-ganesh": "🐘",
  "divine-krishna": "🦚",
  "divine-radha-krishna": "💙",
  "divine-shiva": "🔱",
  "divine-hanuman": "🙏",
  "divine-ram-darbar": "🏹",
  "divine-lakshmi": "🪷",
  "divine-durga": "🌺",
  "divine-buddha": "🧘",
  "divine-other": "🕉️",

  "ganesh-statues": "🐘",
  "krishna-statues": "🦚",
  "radha-krishna-statues": "💙",
  "shiva-statues": "🔱",
  "hanuman-statues": "🙏",
  "ram-darbar-statues": "🏹",
  "lakshmi-statues": "🪷",
  "durga-statues": "🌺",
  "buddha-statues": "🧘",
  "other-divine-statues": "🕉️",
};

function getCategoryIcon(category: Category) {
  return categoryIcons[category.slug] || "🛍️";
}

function mapProducts(
  productsData: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    retail_price: number | string | null;
    compare_at_price: number | string | null;
    stock_quantity: number | string | null;
    image_url: string | null;
  }>,
  categoryName: string
): Product[] {
  return productsData.map((product) => {
    const retailPrice =
      Number(product.retail_price) || 0;

    const compareAtPrice =
      product.compare_at_price !== null &&
      product.compare_at_price !== undefined
        ? Number(product.compare_at_price)
        : undefined;

    const discount =
      compareAtPrice &&
      compareAtPrice > retailPrice
        ? `${Math.round(
            ((compareAtPrice - retailPrice) /
              compareAtPrice) *
              100
          )}% OFF`
        : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: retailPrice,
      oldPrice: compareAtPrice,
      discount,
      image: product.image_url || "",
      category: categoryName,
      rating: 0,
      reviews: 0,
      stockQuantity:
        Number(product.stock_quantity) || 0,
    };
  });
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  /* =========================================================
     CURRENT CATEGORY
     ========================================================= */

  const {
    data: category,
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
        sort_order
      `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  const currentCategory = category as Category;

  /* =========================================================
     PARENT + SUBCATEGORIES
     ========================================================= */

  const [
    parentResult,
    subcategoriesResult,
  ] = await Promise.all([
    currentCategory.parent_id
      ? supabase
          .from("categories")
          .select(
            `
              id,
              name,
              slug,
              description,
              image_url,
              parent_id,
              sort_order
            `
          )
          .eq(
            "id",
            currentCategory.parent_id
          )
          .eq("is_active", true)
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    supabase
      .from("categories")
      .select(
        `
          id,
          name,
          slug,
          description,
          image_url,
          parent_id,
          sort_order
        `
      )
      .eq(
        "parent_id",
        currentCategory.id
      )
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),
  ]);

  if (parentResult.error) {
    console.error(
      "Parent category query error:",
      parentResult.error
    );
  }

  if (subcategoriesResult.error) {
    console.error(
      "Subcategories query error:",
      subcategoriesResult.error
    );
  }

  const parentCategory =
    (parentResult.data as Category | null) ||
    null;

  const subcategories =
    (subcategoriesResult.data as Category[] | null) ||
    [];

  /* =========================================================
     PRODUCTS
     ========================================================= */

  const productCategoryIds = [
    currentCategory.id,
    ...subcategories.map(
      (subcategory) => subcategory.id
    ),
  ];

  const {
    data: productsData,
    error: productsError,
  } = await supabase
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
        image_url
      `
    )
    .in(
      "category_id",
      productCategoryIds
    )
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (productsError) {
    console.error(
      "Category products query error:",
      productsError
    );

    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="container-shop">
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-600">
            Unable to load products.
          </div>
        </div>
      </main>
    );
  }

  const products = mapProducts(
    productsData || [],
    currentCategory.name
  );

  const categoryIcon =
    getCategoryIcon(currentCategory);

  const isMainCategory =
    currentCategory.parent_id === null;

  const inStockCount = products.filter(
    (product) => product.stockQuantity > 0
  ).length;

  const discountCount = products.filter(
    (product) =>
      Boolean(product.discount) &&
      Boolean(product.oldPrice)
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* =====================================================
          BREADCRUMB
          ===================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-3">
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] text-slate-500 no-scrollbar">
            <Link
              href="/"
              className="font-semibold hover:text-brand-coral"
            >
              Home
            </Link>

            <span>›</span>

            <Link
              href="/shop"
              className="font-semibold hover:text-brand-coral"
            >
              Shop
            </Link>

            {parentCategory && (
              <>
                <span>›</span>

                <Link
                  href={`/categories/${parentCategory.slug}`}
                  className="font-semibold hover:text-brand-coral"
                >
                  {parentCategory.name}
                </Link>
              </>
            )}

            <span>›</span>

            <span className="font-bold text-brand-navy">
              {currentCategory.name}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CATEGORY HEADER
          ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-5 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-3xl sm:h-20 sm:w-20">
              {currentCategory.image_url ? (
                <img
                  src={currentCategory.image_url}
                  alt={currentCategory.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                categoryIcon
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-brand-navy sm:text-2xl">
                  {currentCategory.name}
                </h1>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              {currentCategory.description && (
                <p className="mt-1.5 max-w-3xl line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  {currentCategory.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SUBCATEGORY NAVIGATION
          ===================================================== */}

      {subcategories.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="container-shop px-4 py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <Link
                href={`/categories/${currentCategory.slug}`}
                className="shrink-0 rounded-full bg-brand-navy px-4 py-2 text-xs font-bold text-white"
              >
                All
              </Link>

              {subcategories.map(
                (subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/categories/${subcategory.slug}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-coral/40 hover:text-brand-coral"
                  >
                    <span>
                      {getCategoryIcon(
                        subcategory
                      )}
                    </span>

                    <span>
                      {subcategory.name}
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MAIN MARKETPLACE AREA
          ===================================================== */}

      <section className="container-shop px-4 py-5 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* =================================================
              DESKTOP SIDEBAR
              ================================================= */}

          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-black text-brand-navy">
                  Filters
                </h2>
              </div>

              {/* Category */}

              <div className="border-b border-slate-100 p-4">
                <h3 className="text-xs font-extrabold text-slate-800">
                  Category
                </h3>

                <div className="mt-3 space-y-2">
                  <Link
                    href={`/categories/${currentCategory.slug}`}
                    className="flex items-center justify-between text-xs font-semibold text-brand-coral"
                  >
                    <span>
                      {currentCategory.name}
                    </span>

                    <span>
                      {products.length}
                    </span>
                  </Link>

                  {subcategories.map(
                    (subcategory) => {
                      const count =
                        productsData?.filter(
                          (product) =>
                            false
                        ).length ?? 0;

                      return (
                        <Link
                          key={subcategory.id}
                          href={`/categories/${subcategory.slug}`}
                          className="flex items-center justify-between text-xs font-medium text-slate-600 transition hover:text-brand-coral"
                        >
                          <span className="truncate pr-2">
                            {subcategory.name}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {count > 0
                              ? count
                              : ""}
                          </span>
                        </Link>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Availability */}

              <div className="border-b border-slate-100 p-4">
                <h3 className="text-xs font-extrabold text-slate-800">
                  Availability
                </h3>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      In Stock
                    </span>

                    <span className="font-bold text-slate-800">
                      {inStockCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      Out of Stock
                    </span>

                    <span className="font-bold text-slate-800">
                      {products.length -
                        inStockCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offers */}

              <div className="p-4">
                <h3 className="text-xs font-extrabold text-slate-800">
                  Offers
                </h3>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Discounted
                  </span>

                  <span className="font-bold text-green-600">
                    {discountCount}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              PRODUCTS CONTENT
              ================================================= */}

          <div className="min-w-0 flex-1">
            {/* Toolbar */}

            <div className="mb-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-bold text-slate-800">
                      {products.length}
                    </span>{" "}
                    products
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile filter button */}

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 lg:hidden"
                  >
                    <span>☰</span>
                    Filters
                  </button>

                  {/* Sort */}

                  <label className="flex items-center gap-2">
                    <span className="hidden text-xs font-medium text-slate-500 sm:inline">
                      Sort by
                    </span>

                    <select
                      defaultValue="newest"
                      className="
                        rounded-lg
                        border border-slate-200
                        bg-white
                        px-2.5 py-2
                        text-xs
                        font-semibold
                        text-slate-700
                        outline-none
                        focus:border-brand-navy
                      "
                      aria-label="Sort products"
                    >
                      <option value="newest">
                        Newest
                      </option>

                      <option value="price-low">
                        Price: Low to High
                      </option>

                      <option value="price-high">
                        Price: High to Low
                      </option>

                      <option value="discount">
                        Highest Discount
                      </option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* Products */}

            {products.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                  {categoryIcon}
                </div>

                <h2 className="mt-4 text-lg font-black text-brand-navy">
                  No products found
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  There are currently no products
                  available in this category.
                </p>

                <Link
                  href={
                    parentCategory
                      ? `/categories/${parentCategory.slug}`
                      : "/shop"
                  }
                  className="mt-5 inline-flex rounded-lg bg-brand-navy px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
                >
                  Browse Other Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}