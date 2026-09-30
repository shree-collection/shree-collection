"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MainCategory = {
  id: string;
  name: string;
  parent_id: string | null;
};

type Props = {
  mainCategories: MainCategory[];
  initialParentId: string | null;
};

export default function CategoryForm({
  mainCategories,
  initialParentId,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState(
    initialParentId || ""
  );
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!slug || slug === createSlug(name)) {
      setSlug(createSlug(value));
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description:
              description.trim() || null,
            image_url:
              imageUrl.trim() || null,
            parent_id:
              parentId || null,
            is_active: isActive,
            sort_order:
              Number(sortOrder) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create category."
        );
      }

      setSuccess(
        parentId
          ? "Subcategory created successfully."
          : "Category created successfully."
      );

      router.refresh();

      setTimeout(() => {
        router.push("/admin/categories");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =====================================================
          Category Details
      ====================================================== */}
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
        {/* Header */}
        <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-xl">
              {parentId ? "📁" : "🗂️"}
            </div>

            <div>
              <h2 className="text-base font-black text-brand-navy sm:text-lg">
                {parentId
                  ? "Create Subcategory"
                  : "Create Category"}
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Add a new category to your store catalogue.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Category Name */}
            <div>
              <label
                htmlFor="category-name"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Category Name *
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value
                  )
                }
                placeholder="Example: Statues"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>

            {/* Parent Category */}
            <div>
              <label
                htmlFor="parent-category"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Parent Category
              </label>

              <select
                id="parent-category"
                value={parentId}
                onChange={(event) =>
                  setParentId(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="">
                  None — Main Category
                </option>

                {mainCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-[11px] leading-5 text-text-light">
                Leave this as None to create a main
                category. Select a category to create a
                subcategory.
              </p>
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="category-slug"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Slug *
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-light">
                  /
                </span>

                <input
                  id="category-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      createSlug(
                        event.target.value
                      )
                    )
                  }
                  placeholder="example: statues"
                  className="w-full rounded-xl border border-border bg-white py-3 pl-7 pr-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>

              <p className="mt-1.5 text-[11px] text-text-light">
                Used in the store URL.
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="category-sort-order"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Sort Order
              </label>

              <input
                id="category-sort-order"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />

              <p className="mt-1.5 text-[11px] text-text-light">
                Lower numbers appear first.
              </p>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label
                htmlFor="category-description"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Description
              </label>

              <textarea
                id="category-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Short description for this category..."
                className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>

            {/* Image URL */}
            <div className="lg:col-span-2">
              <label
                htmlFor="category-image-url"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Category Image URL
              </label>

              <input
                id="category-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) =>
                  setImageUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />

              <p className="mt-1.5 text-[11px] leading-5 text-text-light">
                Image upload can be added later using the
                same Supabase storage approach as products.
              </p>

              {/* Image Preview */}
              {imageUrl.trim() && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface-soft p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black text-brand-navy">
                        Image Preview
                      </p>

                      <p className="mt-1 truncate text-[10px] text-text-light">
                        {imageUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-emerald-50"
                      : "bg-slate-100"
                  }`}
                >
                  {isActive ? "✓" : "○"}
                </div>

                <div>
                  <p className="text-sm font-black text-brand-navy">
                    Active Category
                  </p>

                  <p className="mt-1 max-w-md text-xs leading-5 text-text-muted">
                    {isActive
                      ? "This category will be visible in the store."
                      : "This category will be hidden from the store."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                aria-label="Toggle category active status"
                onClick={() =>
                  setIsActive(!isActive)
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  isActive
                    ? "bg-emerald-500"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    isActive
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Messages
      ====================================================== */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              ⚠️
            </span>

            <div>
              <p className="text-sm font-black text-red-700">
                Unable to create category
              </p>

              <p className="mt-1 text-xs leading-5 text-red-600/80">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              ✓
            </span>

            <div>
              <p className="text-sm font-black text-emerald-700">
                {success}
              </p>

              <p className="mt-0.5 text-xs text-emerald-600/80">
                Returning to categories...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          Actions
      ====================================================== */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/categories"
            )
          }
          disabled={loading}
          className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-black text-text-secondary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="animate-spin">
                ↻
              </span>
              Saving...
            </>
          ) : (
            <>
              <span aria-hidden="true">
                ✓
              </span>
              {parentId
                ? "Create Subcategory"
                : "Create Category"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}