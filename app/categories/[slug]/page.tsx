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
  /* Main Categories */
  "party-items": "🎈",
  "gift-items": "🎁",
  toys: "🧸",
  stationery: "✏️",
  "ladies-bags": "👜",
  "gift-hampers": "🎀",
  "key-chains": "🔑",
  "divine-photo-frames": "🖼️",
  statues: "🛕",

  /* Party */
  birthday: "🎂",
  anniversary: "💝",
  "kids-party": "🎉",
  annaprashan: "👶",
  "baby-shower": "🍼",
  balloons: "🎈",
  "party-decoration": "🎊",
  "return-gifts": "🎁",

  /* Gifts */
  "birthday-gifts": "🎁",
  "anniversary-gifts": "💝",
  "couple-gifts": "💑",
  "kids-gifts": "🧸",
  "religious-gifts": "🙏",
  "photo-frames": "🖼️",
  "personalized-gifts": "✨",

  /* Toys */
  "action-figures": "🦸",
  "educational-toys": "📚",
  "remote-control-toys": "🚗",
  "soft-toys": "🧸",
  "kids-games": "🎮",
  "small-toys": "🪀",
  "keychain-toys": "🔑",

  /* Stationery */
  pens: "🖊️",
  pencils: "✏️",
  erasers: "🧽",
  notebooks: "📓",
  diaries: "📔",
  "school-items": "🎒",
  "art-craft": "🎨",
  "stationery-games": "🎲",

  /* Ladies Bags */
  "hand-bags": "👜",
  "sling-bags": "👛",
  wallets: "💳",
  pouches: "👝",
  "cosmetic-bags": "💄",

  /* Gift Hampers */
  "birthday-hampers": "🎂",
  "kids-hampers": "🧸",
  "couple-hampers": "💝",
  "festival-hampers": "🎁",
  "corporate-hampers": "🎀",

  /* Key Chains */
  "anime-key-chains": "🌟",
  "cartoon-key-chains": "🧸",
  "religious-key-chains": "🙏",
  "couple-key-chains": "💑",
  "metal-key-chains": "🔗",
  "acrylic-key-chains": "✨",
  "car-bike-key-chains": "🚗",

  /* Divine Photo Frames */
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

  /* Statues */
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

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // --------------------------------------------------------
  // Get current category
  // --------------------------------------------------------

  const { data: category, error: categoryError } =
    await supabase
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

  // --------------------------------------------------------
  // Get parent category
  // --------------------------------------------------------

  let parentCategory: Category | null = null;

  if (currentCategory.parent_id) {
    const { data: parent } = await supabase
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
      .eq("id", currentCategory.parent_id)
      .eq("is_active", true)
      .maybeSingle();

    parentCategory = parent as Category | null;
  }

  // --------------------------------------------------------
  // Get subcategories
  // --------------------------------------------------------

  const {
    data: subcategoriesData,
    error: subcategoriesError,
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
    .eq("parent_id", currentCategory.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (subcategoriesError) {
    console.error(
      "Subcategories query error:",
      subcategoriesError
    );
  }

  const subcategories: Category[] =
    (subcategoriesData as Category[]) || [];

  // --------------------------------------------------------
  // Get products
  //
  // For a main category:
  // Include products assigned directly to the main category
  // OR to any of its subcategories.
  //
  // For a subcategory:
  // Only products assigned to that subcategory are returned.
  // --------------------------------------------------------

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
      image_url,
      created_at
      `
    )
    .in("category_id", productCategoryIds)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error(
      "Category products query error:",
      productsError
    );

    return (
      <main className="min-h-screen bg-[#FFFDF5] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
            Unable to load products.
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------
  // Convert database products to Product type
  // --------------------------------------------------------

  const products: Product[] =
    productsData?.map((product) => {
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
        category: currentCategory.name,
        rating: 0,
        reviews: 0,
        stockQuantity:
          Number(product.stock_quantity) || 0,
      };
    }) ?? [];

  // --------------------------------------------------------
  // Category icon
  // --------------------------------------------------------

  const categoryIcon =
    categoryIcons[currentCategory.slug] || "🛍️";

  // --------------------------------------------------------
  // Page
  // --------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#FFFDF5] pb-10">

      {/* Breadcrumb */}
      <section className="mx-auto max-w-7xl px-4 pt-5">
        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">

          <Link
            href="/shop"
            className="font-semibold transition hover:text-[#F43F5E]"
          >
            Shop
          </Link>

          <span>›</span>

          {parentCategory && (
            <>
              <Link
                href={`/categories/${parentCategory.slug}`}
                className="font-semibold transition hover:text-[#F43F5E]"
              >
                {parentCategory.name}
              </Link>

              <span>›</span>
            </>
          )}

          <span className="font-semibold text-[#172554]">
            {currentCategory.name}
          </span>

        </div>
      </section>

      {/* Category Banner */}
      <section className="mx-auto max-w-7xl px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#FFC928] px-5 py-7 sm:px-8 sm:py-9">

          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/20" />

          <div className="relative flex items-start gap-4">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/80 text-4xl sm:h-20 sm:w-20">

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

            <div className="min-w-0">

              <p className="text-xs font-extrabold uppercase tracking-widest text-[#F43F5E]">
                Shop Collection
              </p>

              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-[#172554] sm:text-3xl">
                {currentCategory.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#172554]/75">
                {currentCategory.description ||
                  `Explore our ${currentCategory.name.toLowerCase()} collection.`}
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-7">

          <div className="mb-4">

            <p className="text-xs font-extrabold uppercase tracking-widest text-[#F43F5E]">
              Explore Collection
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#172554] sm:text-2xl">
              Shop by Subcategory
            </h2>

          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">

            {subcategories.map((subcategory) => {
              const icon =
                categoryIcons[subcategory.slug] ||
                "🛍️";

              return (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="group rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
                >

                  <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#FFF7E8] text-2xl transition group-hover:scale-105">

                    {subcategory.image_url ? (
                      <img
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      icon
                    )}

                  </div>

                  <h3 className="mt-2 min-h-[32px] text-xs font-bold leading-4 text-[#172554]">
                    {subcategory.name}
                  </h3>

                  <p className="mt-1 text-[10px] font-bold text-[#F43F5E]">
                    Shop →
                  </p>

                </Link>
              );
            })}

          </div>

        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-extrabold uppercase tracking-widest text-[#F43F5E]">
              Collection
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#172554] sm:text-3xl">
              {currentCategory.name} Products
            </h2>

          </div>

          <span className="shrink-0 rounded-full bg-[#FFF0B8] px-3 py-1 text-xs font-bold text-[#172554]">
            {products.length}{" "}
            {products.length === 1
              ? "Item"
              : "Items"}
          </span>

        </div>

        {products.length === 0 ? (

          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">

            <div className="text-5xl">
              {categoryIcon}
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-[#172554]">
              No products yet
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              We are adding products to this category soon.
            </p>

            <Link
              href={
                parentCategory
                  ? `/categories/${parentCategory.slug}`
                  : "/shop"
              }
              className="mt-5 inline-flex rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-bold text-[#172554] transition hover:bg-[#F5B900]"
            >
              Browse Other Categories
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        )}

      </section>

      {/* Back to Shop */}
      <div className="mx-auto max-w-7xl px-4">

        <Link
          href="/shop"
          className="inline-flex rounded-full border border-[#172554]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#172554] transition hover:bg-[#FFF7E8]"
        >
          ← Continue Shopping
        </Link>

      </div>

    </main>
  );
}