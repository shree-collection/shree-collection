"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
};

type Product = {
  category_id: string | null;
};

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

export default function Footer() {
  const pathname = usePathname();

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const [
          categoriesResponse,
          productsResponse,
        ] = await Promise.all([
          fetch("/api/categories", {
            cache: "no-store",
          }),
          fetch("/api/products", {
            cache: "no-store",
          }),
        ]);

        if (
          !categoriesResponse.ok ||
          !productsResponse.ok
        ) {
          return;
        }

        const categoryData =
          await categoriesResponse.json();

        const productData =
          await productsResponse.json();

        const mainCategories: Category[] =
          Array.isArray(categoryData.mainCategories)
            ? categoryData.mainCategories
            : [];

        const subcategories: Category[] =
          Array.isArray(categoryData.subcategories)
            ? categoryData.subcategories
            : [];

        const products: Product[] =
          Array.isArray(productData.products)
            ? productData.products
            : [];

        const productCategoryIds = new Set(
          products
            .map((product) => product.category_id)
            .filter(Boolean)
        );

        const categoriesWithProducts =
          mainCategories.filter((category) => {
            if (!category.is_active) {
              return false;
            }

            if (
              productCategoryIds.has(category.id)
            ) {
              return true;
            }

            return subcategories.some(
              (subcategory) =>
                subcategory.parent_id === category.id &&
                productCategoryIds.has(subcategory.id)
            );
          });

        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error(
          "Unable to load footer categories:",
          error
        );
      }
    }

    loadCategories();
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-10 bg-[#0f172a] text-white sm:mt-14">
      {/* =====================================================
          TOP FOOTER
          ===================================================== */}

      <div className="container-shop px-4 py-9 sm:py-11">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.75fr_1fr_1.1fr] lg:gap-10">
          {/* =================================================
              BRAND
              ================================================= */}

          <div>
            <Link
              href="/"
              aria-label="Shree Collection home"
              className="inline-block leading-none"
            >
              <div className="font-serif text-xl font-black tracking-tight text-white sm:text-2xl">
                Shree Collection
              </div>

              <div className="mt-1.5 text-[10px] font-medium tracking-[0.08em] text-slate-400 sm:text-[11px]">
                श्री कलेक्शन
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-5 text-slate-400">
              Discover trending gifts, toys, party essentials,
              stationery, accessories, divine décor and unique
              products for every occasion.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-slate-400">
                🎁 Gifts
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-slate-400">
                🧸 Toys
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-slate-400">
                🎉 Party
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-bold text-slate-400">
                🚚 PAN India
              </span>
            </div>
          </div>

          {/* =================================================
              QUICK LINKS
              ================================================= */}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Quick Links
            </h3>

            <nav className="mt-4 flex flex-col gap-2.5">
              {[
                ["Shop", "/shop"],
                ["All Products", "/shop/products"],
                ["Track Order", "/orders"],
                ["About Us", "/about"],
                ["Contact Us", "/contact"],
                ["Wholesale", "/wholesale"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs font-medium text-slate-400 transition hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* =================================================
              CATEGORIES
              ================================================= */}

          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
                Shop Categories
              </h3>

              <Link
                href="/shop/products"
                className="text-[9px] font-bold text-slate-500 transition hover:text-white"
              >
                View All
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories.length > 0 ? (
                categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[11px] transition group-hover:bg-brand-coral/10">
                      {categoryIcons[category.slug] || "•"}
                    </span>

                    <span className="truncate">
                      {category.name}
                    </span>
                  </Link>
                ))
              ) : (
                <Link
                  href="/shop/products"
                  className="col-span-2 text-xs font-medium text-slate-400 transition hover:text-white"
                >
                  Browse all products →
                </Link>
              )}
            </div>
          </div>

          {/* =================================================
              CONTACT
              ================================================= */}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Contact Us
            </h3>

            <div className="mt-4 space-y-3">
              {/* Phone */}

              <a
                href="tel:8796780766"
                className="group flex items-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs transition group-hover:border-brand-coral/30 group-hover:bg-brand-coral/10">
                  📞
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    Call Us
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-300 transition group-hover:text-white">
                    8796780766
                  </p>
                </div>
              </a>

              {/* Email */}

              <a
                href="mailto:myshreecollection@gmail.com"
                className="group flex items-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs transition group-hover:border-brand-coral/30 group-hover:bg-brand-coral/10">
                  ✉️
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </p>

                  <p className="mt-0.5 truncate text-xs font-bold text-slate-300 transition group-hover:text-white">
                    myshreecollection@gmail.com
                  </p>
                </div>
              </a>

              {/* Wholesale */}

              <Link
                href="/wholesale"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:border-brand-coral/30 hover:bg-brand-coral/10 sm:w-fit"
              >
                🏪 Wholesale Shopping
                <span className="ml-1.5 text-slate-500">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ===================================================
            SERVICE STRIP
            =================================================== */}

        <div className="mt-9 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:border-b-0 sm:border-r">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm">
              🚚
            </span>

            <div>
              <p className="text-xs font-black text-white">
                PAN India Delivery
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                We deliver across India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:border-b-0 sm:border-r">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm">
              💵
            </span>

            <div>
              <p className="text-xs font-black text-white">
                Cash on Delivery
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                Pay when delivered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm">
              🎁
            </span>

            <div>
              <p className="text-xs font-black text-white">
                Gifts for Every Occasion
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                Find something special
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            HELP STRIP
            =================================================== */}

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-black text-white">
              Looking for something special?
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Need help finding a product? Contact our team.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="tel:8796780766"
              className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-black text-brand-navy transition hover:bg-slate-100"
            >
              📞 Call Us
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/5"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
          ===================================================== */}

      <div className="border-t border-white/10">
        <div className="container-shop flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-medium text-slate-500">
            © {new Date().getFullYear()} Shree Collection.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-medium text-slate-600">
            <Link
              href="/shop/products"
              className="transition hover:text-slate-300"
            >
              Gifts
            </Link>

            <span>•</span>

            <Link
              href="/shop/products"
              className="transition hover:text-slate-300"
            >
              Toys
            </Link>

            <span>•</span>

            <Link
              href="/shop/products"
              className="transition hover:text-slate-300"
            >
              Party
            </Link>

            <span>•</span>

            <Link
              href="/shop/products"
              className="transition hover:text-slate-300"
            >
              Stationery
            </Link>

            <span>•</span>

            <Link
              href="/wholesale"
              className="transition hover:text-slate-300"
            >
              Wholesale
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}