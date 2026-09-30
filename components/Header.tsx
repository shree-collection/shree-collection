"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart/CartContext";

export default function Header() {
  const {
    cartCount,
    wholesaleCartCount,
  } = useCart();

  const pathname = usePathname();

  /* ==========================================================
     Admin has its own layout/header
  ========================================================== */

  if (pathname.startsWith("/admin")) {
    return null;
  }

  /* ==========================================================
     Wholesale pages use separate navigation/cart
  ========================================================== */

  const isWholesale =
    pathname.startsWith("/wholesale");

  const cartHref = isWholesale
    ? "/wholesale/cart"
    : "/cart";

  const currentCartCount = isWholesale
    ? wholesaleCartCount
    : cartCount;

  /* ==========================================================
     Logo destination
  ========================================================== */

  const homeHref = isWholesale
    ? "/wholesale"
    : "/";

  /* ==========================================================
     Active navigation helper
  ========================================================== */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const desktopLinkClass = (
    active: boolean
  ) =>
    `
      relative py-2 text-sm font-semibold
      transition-colors
      ${
        active
          ? "text-brand-coral"
          : "text-text-primary hover:text-brand-coral"
      }
    `;

  const mobileLinkClass = (
    active: boolean
  ) =>
    `
      shrink-0 rounded-full px-4 py-2
      text-xs font-semibold
      transition
      ${
        active
          ? "bg-brand-navy text-white"
          : "border border-border bg-white text-brand-navy hover:bg-surface-muted"
      }
    `;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur-xl">

      {/* ======================================================
          Announcement Bar
      ======================================================= */}

      <div className="hidden bg-brand-navy text-white sm:block">
        <div className="container-shop flex min-h-8 items-center justify-center">
          <p className="text-center text-[11px] font-medium tracking-wide text-white/95">
            ✨ Trending Gifts • Toys • Party Essentials • PAN India Delivery
          </p>
        </div>
      </div>

      {/* ======================================================
          Main Header
      ======================================================= */}

      <div className="container-shop">
        <div className="flex min-h-[72px] items-center gap-3 sm:gap-4">

          {/* ==================================================
              Mobile Menu
          =================================================== */}

          <button
            type="button"
            aria-label="Open navigation menu"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl border border-border
              bg-white text-brand-navy
              transition hover:bg-surface-muted
              lg:hidden
            "
          >
            <span className="text-xl leading-none">
              ☰
            </span>
          </button>

          {/* ==================================================
              Logo
          =================================================== */}

          <Link
            href={homeHref}
            aria-label={
              isWholesale
                ? "Shree Collection Wholesale"
                : "Shree Collection"
            }
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <div
              className="
                relative h-11 w-11 shrink-0
                overflow-hidden rounded-xl
                bg-white
                ring-1 ring-brand-gold/40
              "
            >
              <Image
                src="/logo.png"
                alt="Shree Collection"
                fill
                priority
                sizes="44px"
                className="object-contain p-0.5"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[17px] font-extrabold leading-none tracking-tight text-brand-navy sm:text-lg">
                SHREE
              </div>

              <div className="mt-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-text-secondary sm:text-[10px]">
                COLLECTION
                <span className="mx-1 text-brand-gold">
                  |
                </span>
                श्री कलेक्शन
              </div>

              {isWholesale && (
                <div className="mt-1 text-[8px] font-extrabold uppercase tracking-wider text-success">
                  Wholesale
                </div>
              )}
            </div>
          </Link>

          {/* ==================================================
              Desktop Navigation
          =================================================== */}

          {!isWholesale && (
            <nav
              aria-label="Main navigation"
              className="ml-5 hidden items-center gap-6 lg:flex xl:ml-7 xl:gap-7"
            >
              {/* Shop */}
              <Link
                href="/shop"
                className={desktopLinkClass(
                  isActive("/shop")
                )}
              >
                Shop

                {isActive("/shop") && (
                  <span className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              {/* Products */}
              <Link
                href="/shop/products"
                className={desktopLinkClass(
                  isActive("/shop/products")
                )}
              >
                Products

                {isActive("/shop/products") && (
                  <span className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              {/* Track Order */}
              <Link
                href="/orders"
                className={desktopLinkClass(
                  isActive("/orders")
                )}
              >
                Track Order

                {isActive("/orders") && (
                  <span className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              {/* About */}
              <Link
                href="/about"
                className={desktopLinkClass(
                  isActive("/about")
                )}
              >
                About

                {isActive("/about") && (
                  <span className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={desktopLinkClass(
                  isActive("/contact")
                )}
              >
                Contact

                {isActive("/contact") && (
                  <span className="absolute -bottom-1 left-0 right-0 mx-auto h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>
            </nav>
          )}

          {/* ==================================================
              Right Actions
          =================================================== */}

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

            {/* Search */}
            {!isWholesale && (
              <Link
                href="/shop/products"
                aria-label="Search products"
                className="
                  hidden h-10 items-center gap-2
                  rounded-xl border border-border
                  bg-surface-muted px-3.5
                  text-sm text-text-muted
                  transition
                  hover:border-brand-coral/30
                  hover:bg-white
                  sm:flex
                  lg:min-w-[145px]
                  xl:min-w-[165px]
                "
              >
                <span className="text-base">
                  ⌕
                </span>

                <span className="hidden xl:inline">
                  Search products
                </span>

                <span className="xl:hidden">
                  Search
                </span>
              </Link>
            )}

            {/* Wishlist */}
            {!isWholesale && (
              <button
                type="button"
                aria-label="Wishlist"
                className="
                  hidden h-10 w-10 items-center justify-center
                  rounded-xl border border-transparent
                  text-xl text-brand-navy
                  transition
                  hover:border-border
                  hover:bg-surface-muted
                  hover:text-brand-coral
                  sm:flex
                "
              >
                ♡
              </button>
            )}

            {/* Cart */}
            <Link
              href={cartHref}
              aria-label={
                isWholesale
                  ? "Wholesale shopping cart"
                  : "Shopping cart"
              }
              className="
                relative flex h-10 w-10
                items-center justify-center
                rounded-xl border border-border
                bg-white text-lg text-brand-navy
                transition
                hover:border-brand-coral/30
                hover:bg-surface-muted
              "
            >
              <span aria-hidden="true">
                🛒
              </span>

              {currentCartCount > 0 && (
                <span
                  className="
                    absolute -right-1.5 -top-1.5
                    flex h-5 min-w-5
                    items-center justify-center
                    rounded-full
                    bg-brand-coral
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                    ring-2 ring-white
                  "
                >
                  {currentCartCount > 99
                    ? "99+"
                    : currentCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ====================================================
            Mobile Navigation
        ===================================================== */}

        {!isWholesale && (
          <nav
            aria-label="Mobile navigation"
            className="
              -mx-1 flex gap-2
              overflow-x-auto px-1 pb-3
              lg:hidden
              no-scrollbar
            "
          >
            {/* Shop */}
            <Link
              href="/shop"
              className={mobileLinkClass(
                isActive("/shop")
              )}
            >
              Shop
            </Link>

            {/* Categories */}
            <Link
              href="/shop"
              className={mobileLinkClass(
                false
              )}
            >
              Categories
            </Link>

            {/* Shop All */}
            <Link
              href="/shop/products"
              className={mobileLinkClass(
                isActive("/shop/products")
              )}
            >
              Shop All
            </Link>

            {/* Track Order */}
            <Link
              href="/orders"
              className={mobileLinkClass(
                isActive("/orders")
              )}
            >
              Track Order
            </Link>

            {/* About */}
            <Link
              href="/about"
              className={mobileLinkClass(
                isActive("/about")
              )}
            >
              About
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={mobileLinkClass(
                isActive("/contact")
              )}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}