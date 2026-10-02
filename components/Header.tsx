"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartContext";

export default function Header() {
  const { cartCount, wholesaleCartCount } = useCart();

  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  /*
   * ==========================================================
   * ADMIN HAS ITS OWN HEADER
   * ==========================================================
   */

  if (pathname.startsWith("/admin")) {
    return null;
  }

  /*
   * ==========================================================
   * WHOLESALE MODE
   * ==========================================================
   */

  const isWholesale = pathname.startsWith("/wholesale");

  const homeHref = isWholesale ? "/wholesale" : "/";

  const cartHref = isWholesale ? "/wholesale/cart" : "/cart";

  const currentCartCount = isWholesale
    ? wholesaleCartCount
    : cartCount;

  /*
   * ==========================================================
   * ACTIVE ROUTE
   * ==========================================================
   */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /*
   * ==========================================================
   * CLOSE MENU WHEN ROUTE CHANGES
   * ==========================================================
   */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /*
   * ==========================================================
   * PREVENT BACKGROUND SCROLL
   * ==========================================================
   */

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /*
   * ==========================================================
   * ESCAPE KEY
   * ==========================================================
   */

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileMenuOpen]);

  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const value = searchValue.trim();

    if (!value) {
      router.push("/shop/products");
      return;
    }

    router.push(
      `/shop/products?search=${encodeURIComponent(value)}`
    );

    setMobileMenuOpen(false);
  };

  /*
   * ==========================================================
   * CLOSE MENU
   * ==========================================================
   */

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  /*
   * ==========================================================
   * DESKTOP NAV LINK
   * ==========================================================
   */

  const desktopLinkClass = (active: boolean) => `
    relative whitespace-nowrap
    py-3 text-sm font-semibold
    transition-colors
    ${
      active
        ? "text-brand-coral"
        : "text-brand-navy hover:text-brand-coral"
    }
  `;

  /*
   * ==========================================================
   * MOBILE MENU LINK
   * ==========================================================
   */

  const menuLinkClass = (active: boolean) => `
    flex min-h-12 items-center
    justify-between rounded-xl
    px-4 text-sm font-semibold
    transition
    ${
      active
        ? "bg-brand-navy text-white"
        : "bg-slate-50 text-brand-navy hover:bg-slate-100"
    }
  `;

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        border-b border-slate-200
        bg-white
        shadow-[0_1px_8px_rgba(15,23,42,0.05)]
      "
    >
      {/* =====================================================
          TOP ANNOUNCEMENT
      ====================================================== */}

      <div className="hidden bg-brand-navy text-white sm:block">
        <div className="container-shop flex min-h-8 items-center justify-center">
          <p className="text-center text-[11px] font-medium tracking-wide text-white/95">
            ✨ Discover Gifts • Toys • Party Essentials • Home Décor
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN HEADER
      ====================================================== */}

      <div className="container-shop">
        <div
          className="
            flex min-h-[64px]
            items-center gap-2
            sm:min-h-[70px] sm:gap-4
          "
        >
          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-menu"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current
              )
            }
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-lg
              border border-slate-200
              bg-white
              text-lg text-brand-navy
              transition
              hover:bg-slate-50
              active:scale-95
              lg:hidden
            "
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* =================================================
              TEXT-ONLY BRAND LOGO
          ================================================= */}

          <Link
            href={homeHref}
            aria-label={
              isWholesale
                ? "Shree Collection Wholesale"
                : "Shree Collection"
            }
            onClick={closeMenu}
            className="
              shrink-0
              leading-none
              text-brand-navy
              transition
              hover:text-brand-coral
            "
          >
            <div
              className="
                whitespace-nowrap
                font-serif
                text-[20px]
                font-bold
                leading-none
                tracking-[-0.02em]
                sm:text-[23px]
              "
            >
              shree collection
            </div>

            <div
              className="
                mt-1.5
                text-[10px]
                font-medium
                leading-none
                tracking-[0.08em]
                text-slate-500
                sm:text-[11px]
              "
            >
              श्री कलेक्शन
            </div>

            {isWholesale && (
              <div
                className="
                  mt-1.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-emerald-600
                "
              >
                Wholesale
              </div>
            )}
          </Link>

          {/* =================================================
              DESKTOP SEARCH
          ================================================= */}

          {!isWholesale && (
            <form
              onSubmit={handleSearch}
              className="
                hidden min-w-0 flex-1
                sm:block
                lg:mx-4
              "
            >
              <div
                className="
                  relative flex h-11
                  w-full
                  overflow-hidden
                  rounded-lg
                  border border-slate-200
                  bg-slate-50
                  transition
                  focus-within:border-brand-coral
                  focus-within:bg-white
                  focus-within:ring-2
                  focus-within:ring-brand-coral/10
                "
              >
                <span
                  className="
                    flex w-11 shrink-0
                    items-center justify-center
                    text-lg text-slate-400
                  "
                  aria-hidden="true"
                >
                  🔍
                </span>

                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="Search for products, gifts, toys and more..."
                  aria-label="Search products"
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    px-1 pr-3
                    text-sm text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                />

                <button
                  type="submit"
                  className="
                    hidden h-full
                    bg-brand-coral
                    px-5
                    text-sm font-bold
                    text-white
                    transition
                    hover:bg-brand-coral/90
                    md:block
                  "
                >
                  Search
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Orders */}

            {!isWholesale && (
              <Link
                href="/orders"
                aria-label="Track order"
                className="
                  hidden h-10
                  items-center gap-2
                  rounded-lg
                  px-3
                  text-sm font-semibold
                  text-brand-navy
                  transition
                  hover:bg-slate-50
                  hover:text-brand-coral
                  md:flex
                "
              >
                <span aria-hidden="true">
                  📦
                </span>

                <span>Orders</span>
              </Link>
            )}

            {/* Wishlist */}

            {!isWholesale && (
              <button
                type="button"
                aria-label="Wishlist"
                className="
                  hidden h-10 w-10
                  items-center justify-center
                  rounded-lg
                  text-xl text-brand-navy
                  transition
                  hover:bg-slate-50
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
                rounded-lg
                border border-slate-200
                bg-white
                text-lg text-brand-navy
                transition
                hover:border-brand-coral/30
                hover:bg-slate-50
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
      </div>

      {/* =====================================================
          MOBILE SEARCH
      ====================================================== */}

      {!isWholesale && (
        <div className="border-t border-slate-100 sm:hidden">
          <div className="container-shop py-2.5">
            <form onSubmit={handleSearch}>
              <div
                className="
                  flex h-10
                  overflow-hidden
                  rounded-lg
                  border border-slate-200
                  bg-slate-50
                  focus-within:border-brand-coral
                  focus-within:bg-white
                "
              >
                <span
                  className="
                    flex w-10 shrink-0
                    items-center justify-center
                    text-base text-slate-400
                  "
                >
                  🔍
                </span>

                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    px-1 pr-3
                    text-sm
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          RETAIL NAVIGATION
      ====================================================== */}

      {!isWholesale && (
        <div className="hidden border-t border-slate-100 lg:block">
          <div className="container-shop">
            <nav
              aria-label="Store navigation"
              className="
                flex min-h-11
                items-center
                gap-7
                overflow-x-auto
                no-scrollbar
              "
            >
              <Link
                href="/"
                className={desktopLinkClass(
                  isActive("/")
                )}
              >
                Home

                {isActive("/") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(
                  isActive("/shop")
                )}
              >
                Categories

                {isActive("/shop") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              <Link
                href="/shop/products"
                className={desktopLinkClass(
                  isActive("/shop/products")
                )}
              >
                All Products

                {isActive("/shop/products") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Gifts
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Toys
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Party
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Stationery
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Home Décor
              </Link>

              <Link
                href="/shop"
                className={desktopLinkClass(false)}
              >
                Divine
              </Link>

              <Link
                href="/orders"
                className={desktopLinkClass(
                  isActive("/orders")
                )}
              >
                Track Order

                {isActive("/orders") && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-coral" />
                )}
              </Link>

              <Link
                href="/wholesale"
                className="
                  ml-auto
                  whitespace-nowrap
                  rounded-full
                  bg-brand-navy
                  px-4 py-1.5
                  text-xs font-bold
                  text-white
                  transition
                  hover:bg-brand-navy/90
                "
              >
                Wholesale Business
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* =====================================================
          WHOLESALE NAVIGATION
      ====================================================== */}

      {isWholesale && (
        <div className="hidden border-t border-slate-100 lg:block">
          <div className="container-shop">
            <nav
              aria-label="Wholesale navigation"
              className="
                flex min-h-11
                items-center
                gap-7
                overflow-x-auto
                no-scrollbar
              "
            >
              <Link
                href="/wholesale"
                className={desktopLinkClass(
                  pathname === "/wholesale"
                )}
              >
                Wholesale Home
              </Link>

              <Link
                href="/wholesale/orders"
                className={desktopLinkClass(
                  pathname.startsWith(
                    "/wholesale/orders"
                  )
                )}
              >
                My Orders
              </Link>

              <Link
                href="/wholesale/cart"
                className={desktopLinkClass(
                  pathname.startsWith(
                    "/wholesale/cart"
                  )
                )}
              >
                Wholesale Cart

                {wholesaleCartCount > 0 && (
                  <span className="ml-1 text-brand-coral">
                    ({wholesaleCartCount})
                  </span>
                )}
              </Link>

              <Link
                href="/"
                className="
                  ml-auto
                  whitespace-nowrap
                  rounded-full
                  border border-brand-navy
                  px-4 py-1.5
                  text-xs font-bold
                  text-brand-navy
                  transition
                  hover:bg-brand-navy
                  hover:text-white
                "
              >
                Retail Store
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      {mobileMenuOpen && (
        <>
          {/* Overlay */}

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="
              fixed inset-0 top-0 z-40
              bg-brand-navy/25
              backdrop-blur-[2px]
              lg:hidden
            "
          />

          {/* Menu */}

          <div
            id="site-mobile-menu"
            className="
              absolute left-0 right-0 top-full
              z-50
              max-h-[calc(100vh-70px)]
              overflow-y-auto
              border-t border-slate-200
              bg-white
              shadow-xl
              lg:hidden
            "
          >
            <div className="container-shop px-4 py-4">
              {/* Search shortcut */}

              {!isWholesale && (
                <Link
                  href="/shop/products"
                  onClick={closeMenu}
                  className="
                    mb-4 flex min-h-11
                    items-center justify-between
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    px-4
                    text-sm font-semibold
                    text-slate-600
                  "
                >
                  <span>
                    🔍 Search Products
                  </span>

                  <span>→</span>
                </Link>
              )}

              {/* Menu Heading */}

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-serif text-sm font-bold text-brand-navy">
                    Shree Collection
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    श्री कलेक्शन
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={closeMenu}
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    border border-slate-200
                    bg-white
                    text-brand-navy
                    hover:bg-slate-50
                  "
                >
                  ✕
                </button>
              </div>

              {/* =================================================
                  RETAIL MENU
              ================================================= */}

              {!isWholesale && (
                <div className="space-y-2">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/")
                    )}
                  >
                    <span>Home</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/shop")
                    )}
                  >
                    <span>Categories</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop/products"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/shop/products")
                    )}
                  >
                    <span>All Products</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/orders")
                    )}
                  >
                    <span>Track Order</span>
                    <span>→</span>
                  </Link>

                  <div className="my-4 border-t border-slate-200" />

                  <p className="px-1 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    Shop
                  </p>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Gifts</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Toys</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Party Items</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Stationery</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Home Décor</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/shop"
                    onClick={closeMenu}
                    className={menuLinkClass(false)}
                  >
                    <span>Divine</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/about")
                    )}
                  >
                    <span>About Us</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      isActive("/contact")
                    )}
                  >
                    <span>Contact</span>
                    <span>→</span>
                  </Link>

                  {/* Business */}

                  <div className="my-4 border-t border-slate-200" />

                  <p className="px-1 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    Business
                  </p>

                  <Link
                    href="/wholesale"
                    onClick={closeMenu}
                    className="
                      flex min-h-12
                      items-center justify-between
                      rounded-xl
                      bg-brand-navy
                      px-4
                      text-sm font-bold
                      text-white
                      transition
                      hover:bg-brand-navy/90
                    "
                  >
                    <span>
                      🏪 Wholesale Business
                    </span>

                    <span>→</span>
                  </Link>

                  <Link
                    href="/wholesale/login"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      pathname.startsWith(
                        "/wholesale/login"
                      )
                    )}
                  >
                    <span>
                      Wholesale Login
                    </span>

                    <span>→</span>
                  </Link>

                  <Link
                    href="/wholesale/register"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      pathname.startsWith(
                        "/wholesale/register"
                      )
                    )}
                  >
                    <span>
                      Register Business
                    </span>

                    <span>→</span>
                  </Link>

                  {/* Admin */}

                  <div className="my-4 border-t border-slate-200" />

                  <p className="px-1 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    Administration
                  </p>

                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="
                      flex min-h-12
                      items-center justify-between
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      px-4
                      text-sm font-bold
                      text-brand-navy
                      transition
                      hover:bg-slate-100
                    "
                  >
                    <span>
                      🔐 Admin Portal
                    </span>

                    <span>→</span>
                  </Link>
                </div>
              )}

              {/* =================================================
                  WHOLESALE MENU
              ================================================= */}

              {isWholesale && (
                <div className="space-y-2">
                  <Link
                    href="/wholesale"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      pathname === "/wholesale"
                    )}
                  >
                    <span>
                      Wholesale Home
                    </span>

                    <span>→</span>
                  </Link>

                  <Link
                    href="/wholesale/orders"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      pathname.startsWith(
                        "/wholesale/orders"
                      )
                    )}
                  >
                    <span>My Orders</span>

                    <span>→</span>
                  </Link>

                  <Link
                    href="/wholesale/cart"
                    onClick={closeMenu}
                    className={menuLinkClass(
                      pathname.startsWith(
                        "/wholesale/cart"
                      )
                    )}
                  >
                    <span>
                      Wholesale Cart
                    </span>

                    <span>
                      {wholesaleCartCount > 0
                        ? `(${wholesaleCartCount})`
                        : "→"}
                    </span>
                  </Link>

                  <div className="my-4 border-t border-slate-200" />

                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="
                      flex min-h-12
                      items-center justify-between
                      rounded-xl
                      border border-brand-navy
                      bg-white
                      px-4
                      text-sm font-bold
                      text-brand-navy
                      transition
                      hover:bg-brand-navy
                      hover:text-white
                    "
                  >
                    <span>
                      🛍️ Retail Store
                    </span>

                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}