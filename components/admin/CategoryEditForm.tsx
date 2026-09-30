"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

type MainCategory = {
  id: string;
  name: string;
  parent_id: string | null;
};

type Props = {
  category: Category;
  mainCategories: MainCategory[];
};

export default function CategoryEditForm({
  category,
  mainCategories,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [description, setDescription] = useState(
    category.description || ""
  );
  const [imageUrl, setImageUrl] = useState(
    category.image_url || ""
  );
  const [parentId, setParentId] = useState(
    category.parent_id || ""
  );
  const [sortOrder, setSortOrder] = useState(
    String(category.sort_order ?? 0)
  );
  const [isActive, setIsActive] = useState(
    category.is_active
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  async function handleSave(
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

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "PUT",
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
            parent_id: parentId || null,
            is_active: isActive,
            sort_order: Number(sortOrder) || 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update category."
        );
      }

      setSuccess(
        "Category updated successfully."
      );

      router.refresh();

      setTimeout(() => {
        router.push("/admin/categories");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update category."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category? It can only be deleted if no products or subcategories are using it."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete category."
        );
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6"
    >
      {/* =====================================================
          Category Editor
      ====================================================== */}
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
        {/* Header */}
        <div className="border-b border-border bg-surface-muted px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-xl">
              🗂️
            </div>

            <div>
              <h2 className="text-base font-black text-brand-navy sm:text-lg">
                Category Details
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                Update the category information used by
                your store.
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
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                placeholder="Enter category name"
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

                {mainCategories.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-[11px] text-text-light">
                Leave empty if this is a main category.
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
                  value={slug}
                  onChange={(event) =>
                    setSlug(
                      generateSlug(
                        event.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-border bg-white py-3 pl-7 pr-4 text-sm font-medium text-text-primary outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  placeholder="category-slug"
                />
              </div>

              <p className="mt-1.5 text-[11px] text-text-light">
                Used in the category URL.
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
                  setSortOrder(event.target.value)
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
                placeholder="Describe this category..."
                className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </div>

            {/* Image URL */}
            <div className="lg:col-span-2">
              <label
                htmlFor="category-image"
                className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
              >
                Category Image URL
              </label>

              <input
                id="category-image"
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
                      ? "This category is visible in the store."
                      : "This category is hidden from the store."}
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
          Feedback
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
                Unable to save category
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
                Category updated successfully.
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
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={
            isDeleting || isSaving
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">
            {isDeleting ? "⏳" : "🗑️"}
          </span>

          {isDeleting
            ? "Deleting..."
            : "Delete Category"}
        </button>

        {/* Save / Cancel */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/categories"
              )
            }
            disabled={isSaving || isDeleting}
            className="rounded-xl border border-border bg-white px-5 py-3 text-sm font-black text-text-secondary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}