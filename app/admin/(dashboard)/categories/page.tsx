import Link from "next/link";
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
  created_at: string;
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      parent_id,
      is_active,
      sort_order,
      created_at
    `)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  const allCategories =
    (categories || []) as Category[];

  const mainCategories =
    allCategories.filter(
      (category) =>
        category.parent_id === null
    );

  const getSubcategories = (
    parentId: string
  ) =>
    allCategories.filter(
      (category) =>
        category.parent_id === parentId
    );

  const activeCount = allCategories.filter(
    (category) => category.is_active
  ).length;

  const inactiveCount =
    allCategories.length - activeCount;

  const subcategoryCount =
    allCategories.filter(
      (category) => category.parent_id !== null
    ).length;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Categories
              </h1>

              <p className="mt-2 text-sm text-text-muted">
                Manage categories and subcategories for
                your store.
              </p>
            </div>

            <Link
              href="/admin/categories/new"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
            >
              <span className="text-base">
                +
              </span>
              Add Category
            </Link>
          </div>
        </header>

        {/* =====================================================
            Overview Stats
        ====================================================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Total
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              {allCategories.length}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              All categories
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Main
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              {mainCategories.length}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              Main categories
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Active
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-600">
              {activeCount}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              Visible in store
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Subcategories
            </p>

            <p className="mt-1 text-2xl font-black text-brand-coral">
              {subcategoryCount}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              {inactiveCount} inactive
            </p>
          </div>
        </div>

        {/* =====================================================
            Error
        ====================================================== */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <div>
                <p className="text-sm font-black text-red-700">
                  Failed to load categories
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            Empty State
        ====================================================== */}
        {mainCategories.length === 0 &&
          !error && (
            <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-soft sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/15 text-3xl">
                🗂️
              </div>

              <h2 className="mt-5 text-lg font-black text-brand-navy">
                No categories found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
                Add your first category to start building
                your product catalogue.
              </p>

              <Link
                href="/admin/categories/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <span>+</span>
                Add Category
              </Link>
            </div>
          )}

        {/* =====================================================
            Category List
        ====================================================== */}
        <div className="space-y-5">
          {mainCategories.map((category) => {
            const subcategories =
              getSubcategories(category.id);

            return (
              <section
                key={category.id}
                className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft"
              >
                {/* Main Category */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {/* Image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-soft">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-black text-brand-navy">
                            {category.name}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              category.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1.5 font-mono text-[10px] text-text-light">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-text-muted">
                            {category.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-text-light">
                          <span>
                            Sort order:{" "}
                            {category.sort_order}
                          </span>

                          <span className="hidden h-1 w-1 self-center rounded-full bg-border sm:block" />

                          <span>
                            {subcategories.length}{" "}
                            {subcategories.length === 1
                              ? "subcategory"
                              : "subcategories"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:shrink-0">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-black text-brand-navy transition hover:bg-surface-muted"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/admin/categories/new?parent=${category.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
                      >
                        <span>+</span>
                        Subcategory
                      </Link>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    Subcategories
                ================================================== */}
                <div className="border-t border-border bg-surface-muted p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-text-light">
                        Subcategories
                      </p>

                      <p className="mt-0.5 text-xs font-bold text-brand-navy">
                        {subcategories.length}{" "}
                        {subcategories.length === 1
                          ? "subcategory"
                          : "subcategories"}
                      </p>
                    </div>

                    {subcategories.length > 0 && (
                      <Link
                        href={`/admin/categories/new?parent=${category.id}`}
                        className="text-[10px] font-black text-brand-coral transition hover:text-brand-navy"
                      >
                        + Add
                      </Link>
                    )}
                  </div>

                  {subcategories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-white p-5 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
                        📁
                      </div>

                      <p className="mt-2 text-xs font-bold text-text-muted">
                        No subcategories yet.
                      </p>

                      <Link
                        href={`/admin/categories/new?parent=${category.id}`}
                        className="mt-3 inline-flex rounded-lg bg-brand-gold/15 px-3 py-2 text-[10px] font-black text-brand-navy transition hover:bg-brand-gold/25"
                      >
                        + Create Subcategory
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {subcategories.map(
                        (subcategory) => (
                          <div
                            key={subcategory.id}
                            className="group rounded-2xl border border-border bg-white p-4 transition hover:border-brand-gold/40 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="truncate text-sm font-black text-brand-navy">
                                    {
                                      subcategory.name
                                    }
                                  </p>

                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black ${
                                      subcategory.is_active
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {subcategory.is_active
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </div>

                                <p className="mt-1.5 truncate font-mono text-[10px] text-text-light">
                                  /{subcategory.slug}
                                </p>
                              </div>

                              <span className="shrink-0 text-sm opacity-40 transition group-hover:opacity-100">
                                ↗
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                              <span className="text-[10px] text-text-light">
                                Order{" "}
                                {
                                  subcategory.sort_order
                                }
                              </span>

                              <Link
                                href={`/admin/categories/${subcategory.id}`}
                                className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-black text-brand-navy transition hover:bg-surface-muted"
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* =====================================================
            Bottom CTA
        ====================================================== */}
        {mainCategories.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-3xl bg-brand-navy p-6 text-white sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gold text-sm text-brand-navy">
                    +
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-gold">
                    Catalogue
                  </span>
                </div>

                <h2 className="text-lg font-black">
                  Add another category
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300">
                  Create categories for new product types
                  and keep your store catalogue organised.
                </p>
              </div>

              <Link
                href="/admin/categories/new"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 py-3 text-xs font-black text-brand-navy transition hover:bg-yellow-300"
              >
                <span className="text-base">
                  +
                </span>
                Add Category
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}