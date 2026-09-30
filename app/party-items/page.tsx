import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const categoryImages: Record<string, string> = {
  birthday:
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",

  anniversary:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",

  "kids-party":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",

  annaprashan:
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80",

  "baby-shower":
    "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&q=80",

  balloons:
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&q=80",

  "party-decoration":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",

  "return-gifts":
    "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&q=80",
};

export default async function PartyItemsPage() {
  const supabase = await createClient();

  // Get Party Items category
  const { data: partyCategory, error: partyError } =
    await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", "party-items")
      .eq("is_active", true)
      .single();

  if (partyError || !partyCategory) {
    return (
      <main className="min-h-screen bg-[#FFFDF5] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-extrabold text-[#172554]">
            Party Items
          </h1>

          <p className="mt-2 text-sm text-red-500">
            Unable to load Party Items.
          </p>
        </div>
      </main>
    );
  }

  // Get Party Items subcategories
  const { data: subcategories, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url
    `)
    .eq("parent_id", partyCategory.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFFDF5] px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-600">
            Unable to load party categories.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF5] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-[#FFFDF5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#172554]"
            aria-label="Back to home"
          >
            ←
          </Link>

          <h1 className="text-lg font-extrabold text-[#172554]">
            Party Items
          </h1>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center text-xl"
            aria-label="Shopping cart"
          >
            🛒
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="mx-auto max-w-7xl px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#FFC928] px-5 py-7">
          <div className="relative z-10 max-w-[250px]">
            <p className="text-sm font-bold uppercase tracking-wider text-[#F43F5E]">
              Celebrate
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#172554]">
              Party Items
            </h2>

            <p className="mt-1 text-lg font-bold text-[#172554]">
              For Every Celebration
            </p>

            <p className="mt-2 text-sm leading-5 text-[#172554]/75">
              Decorations, balloons, return gifts & more.
            </p>
          </div>

          {/* Decorations */}
          <div className="absolute right-5 top-2 text-5xl">
            🎈
          </div>

          <div className="absolute right-16 bottom-2 text-4xl">
            🎁
          </div>

          <div className="absolute right-28 top-8 text-3xl">
            🎉
          </div>
        </div>
      </section>

      {/* Subcategories */}
      <section className="mx-auto max-w-7xl px-4 py-7">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[#F43F5E]">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-[#172554]">
            Choose Your Celebration
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Find everything you need for your special day.
          </p>
        </div>

        {subcategories && subcategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5">
            {subcategories.map((category) => {
              const image =
                category.image_url ||
                categoryImages[category.slug];

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#FFF7E8]">
                    {image ? (
                      <img
                        src={image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🎉
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-center text-sm font-bold text-[#172554]">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">🎈</div>

            <p className="mt-3 font-bold text-[#172554]">
              No categories available
            </p>
          </div>
        )}
      </section>
    </main>
  );
}