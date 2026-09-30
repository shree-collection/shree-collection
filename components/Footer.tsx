"use client";

import Image from "next/image";
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

/* ============================================================
   Category Icons
============================================================ */

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

/* ============================================================
   Footer
============================================================ */

export default function Footer() {
  const pathname = usePathname();

  const [categories, setCategories] = useState<Category[]>([]);

  /* ==========================================================
     Load categories that currently contain products
  ========================================================== */

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
            .map(
              (product) => product.category_id
            )
            .filter(Boolean)
        );

        const categoriesWithProducts =
          mainCategories.filter((category) => {
            if (!category.is_active) {
              return false;
            }

            if (
              productCategoryIds.has(
                category.id
              )
            ) {
              return true;
            }

            return subcategories.some(
              (subcategory) =>
                subcategory.parent_id ===
                  category.id &&
                productCategoryIds.has(
                  subcategory.id
                )
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

  /* ==========================================================
     Admin has its own layout
  ========================================================== */

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-12 bg-[#0f172a] text-white">

      {/* ======================================================
          Main Footer
      ======================================================= */}

      <div className="container-shop py-10 sm:py-12">

        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_1fr_1.2fr] lg:gap-12">

          {/* ==================================================
              Brand
          =================================================== */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="Shree Collection home"
            >
              <Image
                src="/logo.png"
                alt="Shree Collection"
                width={190}
                height={70}
                className="h-12 w-auto object-contain object-left"
              />
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-5 text-slate-400">
              Trending gifts, toys, party essentials,
              stationery, ladies bags, key chains,
              divine decor and more.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

              <span className="text-[10px] font-semibold text-slate-400">
                Gifts for Every Occasion
              </span>
            </div>
          </div>

          {/* ==================================================
              Quick Links
          =================================================== */}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Quick Links
            </h3>

            <nav className="mt-4 flex flex-col gap-2.5">
              <Link
                href="/shop"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/shop/products"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                All Products
              </Link>

              <Link
                href="/about"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Contact Us
              </Link>

              <Link
                href="/wholesale"
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Wholesale
              </Link>
            </nav>
          </div>

          {/* ==================================================
              Categories
          =================================================== */}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Shop Categories
            </h3>

            <div className="mt-4 flex flex-col gap-2.5">
              {categories.length > 0 ? (
                categories
                  .slice(0, 7)
                  .map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-[11px] transition-colors group-hover:bg-white/10">
                        {categoryIcons[
                          category.slug
                        ] || "•"}
                      </span>

                      <span className="truncate">
                        {category.name}
                      </span>
                    </Link>
                  ))
              ) : (
                <Link
                  href="/shop/products"
                  className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Browse all products →
                </Link>
              )}

              {categories.length > 7 && (
                <Link
                  href="/shop/products"
                  className="mt-0.5 text-[10px] font-bold text-slate-300 transition hover:text-white"
                >
                  View all categories →
                </Link>
              )}
            </div>
          </div>

          {/* ==================================================
              Contact
          =================================================== */}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-white">
              Contact Us
            </h3>

            <div className="mt-4 space-y-4">

              {/* Phone */}
              <a
                href="tel:8796780766"
                className="group flex items-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs transition-colors group-hover:border-white/20 group-hover:bg-white/[0.08]"
                >
                  📞
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    Call Us
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-300 transition-colors group-hover:text-white">
                    8796780766
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:myshreecollection@gmail.com"
                className="group flex items-center gap-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs transition-colors group-hover:border-white/20 group-hover:bg-white/[0.08]"
                >
                  ✉️
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </p>

                  <p className="mt-0.5 truncate text-xs font-bold text-slate-300 transition-colors group-hover:text-white">
                    myshreecollection@gmail.com
                  </p>
                </div>
              </a>

              {/* Wholesale */}
              <Link
                href="/wholesale"
                className="mt-1 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:border-brand-coral/40 hover:bg-brand-coral/10 sm:w-fit"
              >
                🏪 Wholesale Shopping
                <span className="ml-1.5 text-slate-400">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================
            Compact Help Strip
        ===================================================== */}

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Need Help?
                </p>
              </div>

              <p className="mt-1.5 text-sm font-bold text-white">
                Looking for something special?
                <span className="ml-1 font-medium text-slate-500">
                  We are happy to help.
                </span>
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <a
                href="tel:8796780766"
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-black text-brand-navy transition hover:bg-slate-100"
              >
                📞 Call Us
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition hover:border-white/25 hover:bg-white/5"
              >
                Contact Us
                <span className="ml-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          Bottom Bar
      ======================================================= */}

      <div className="border-t border-white/10">
        <div className="container-shop flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] font-medium text-slate-500">
            © {new Date().getFullYear()} Shree Collection.
            All rights reserved.
          </p>

          <p className="text-[10px] font-medium text-slate-600">
            Gifts • Toys • Party • Stationery • Divine • Wholesale
          </p>
        </div>
      </div>
    </footer>
  );
}