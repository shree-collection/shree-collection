import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    parent?: string;
  }>;
}) {
  const params = await searchParams;
  const parentId = params.parent || null;

  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      parent_id
    `)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  const mainCategories = (
    categories || []
  ).filter(
    (category) =>
      category.parent_id === null
  );

  const selectedParent = mainCategories.find(
    (category) =>
      category.id === parentId
  );

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-7">
          {/* Back */}
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 rounded-lg text-xs font-bold text-text-muted transition hover:text-brand-navy"
          >
            <span aria-hidden="true">←</span>
            Back to Categories
          </Link>

          {/* Heading */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                {selectedParent
                  ? "Add Subcategory"
                  : "Add Category"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                {selectedParent
                  ? `Add a new subcategory under ${selectedParent.name}.`
                  : "Create a new main category or subcategory for your store."}
              </p>
            </div>

            {/* Context Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 shadow-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${
                  selectedParent
                    ? "bg-brand-gold/15"
                    : "bg-brand-navy"
                }`}
              >
                {selectedParent
                  ? "📁"
                  : "🗂️"}
              </span>

              <span className="text-[11px] font-black text-brand-navy">
                {selectedParent
                  ? "Subcategory"
                  : "Main Category"}
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            Parent Context
        ====================================================== */}
        {selectedParent && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-brand-gold/30 bg-brand-gold/10">
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                📁
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
                  Parent Category
                </p>

                <p className="mt-0.5 truncate text-sm font-black text-brand-navy">
                  {selectedParent.name}
                </p>
              </div>

              <Link
                href="/admin/categories/new"
                className="ml-auto shrink-0 text-[11px] font-bold text-text-muted transition hover:text-brand-navy"
              >
                Change
              </Link>
            </div>
          </div>
        )}

        {/* =====================================================
            Database Error
        ====================================================== */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4"
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
            Form
        ====================================================== */}
        <CategoryForm
          mainCategories={mainCategories}
          initialParentId={parentId}
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
                Category tip
              </p>

              <p className="mt-1 text-[11px] leading-5 text-text-muted">
                Use clear category names and simple URL
                slugs so customers can easily understand
                and navigate your store.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}