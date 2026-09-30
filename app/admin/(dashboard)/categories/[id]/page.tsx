import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CategoryEditForm from "@/components/admin/CategoryEditForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const [
    { data: category, error: categoryError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
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
      .eq("id", id)
      .single(),

    supabase
      .from("categories")
      .select(
        "id, name, parent_id"
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),
  ]);

  if (categoryError || !category) {
    notFound();
  }

  if (categoriesError) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted transition hover:text-brand-navy"
          >
            <span aria-hidden="true">←</span>
            Back to Categories
          </Link>

          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <div>
                <p className="text-sm font-black text-red-700">
                  Failed to load categories
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {categoriesError.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const mainCategories = (
    categories || []
  ).filter(
    (item) =>
      item.parent_id === null &&
      item.id !== category.id
  );

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-7">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 rounded-lg text-xs font-bold text-text-muted transition hover:text-brand-navy"
          >
            <span aria-hidden="true">←</span>
            Back to Categories
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                Edit Category
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                Update category or subcategory details,
                visibility, ordering and store information.
              </p>
            </div>

            {/* Category Status */}
            <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 shadow-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  category.is_active
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              <span className="text-[11px] font-black text-brand-navy">
                {category.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            Current Category Context
        ====================================================== */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            {/* Icon */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
                category.parent_id
                  ? "bg-brand-gold/15"
                  : "bg-brand-navy"
              }`}
            >
              {category.parent_id
                ? "📁"
                : "🗂️"}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-black text-brand-navy sm:text-base">
                  {category.name}
                </h2>

                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-text-muted">
                  {category.parent_id
                    ? "Subcategory"
                    : "Main Category"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-text-light">
                <span>
                  /{category.slug}
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />

                <span>
                  Sort order:{" "}
                  {category.sort_order}
                </span>
              </div>
            </div>

            {/* ID */}
            <div className="hidden rounded-xl bg-surface-muted px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-black uppercase tracking-wider text-text-light">
                Category ID
              </p>

              <p className="mt-0.5 max-w-[170px] truncate font-mono text-[9px] text-text-muted">
                {category.id}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            Form
        ====================================================== */}
        <CategoryEditForm
          category={category}
          mainCategories={mainCategories}
        />

        {/* =====================================================
            Bottom Helper
        ====================================================== */}
        <div className="mt-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
              💡
            </div>

            <div>
              <p className="text-xs font-black text-brand-navy">
                Category management tip
              </p>

              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                Keep category names clear and slugs
                simple. Changing a slug may affect the
                public store URL associated with this
                category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}