import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* ==================================================
          Admin Header
      =================================================== */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-6">

          {/* ==================================================
              Top Header
          =================================================== */}
          <div className="flex min-h-16 items-center justify-between gap-3">

            {/* Logo */}
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-3"
              aria-label="Shree Collection Admin"
            >
              <div className="flex h-11 min-w-[92px] items-center justify-center overflow-hidden rounded-xl border border-border bg-white px-2 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Shree Collection"
                  width={150}
                  height={60}
                  priority
                  className="h-9 w-auto object-contain"
                />
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-black leading-none text-brand-navy">
                  SHREE COLLECTION
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted">
                    Admin Panel
                  </p>
                </div>
              </div>
            </Link>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Retail Store */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-brand-navy transition hover:bg-surface-muted"
              >
                <span>🛍️</span>

                <span className="hidden sm:inline">
                  Store
                </span>
              </Link>

              {/* Main Landing Page */}
              <Link
                href="/"
                className="hidden rounded-xl px-3 py-2 text-xs font-black text-brand-navy transition hover:bg-surface-muted sm:inline-flex"
              >
                Home
              </Link>

              {/* Logout */}
              <form
                action="/api/admin/logout"
                method="POST"
              >
                <button
                  type="submit"
                  className="rounded-xl bg-brand-coral px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>

          {/* ==================================================
              Navigation
          =================================================== */}
          <nav
            className="flex gap-1 overflow-x-auto pb-2 no-scrollbar"
            aria-label="Admin navigation"
          >
            {/* Dashboard */}
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-xl bg-brand-navy px-3 py-2 text-xs font-black text-white transition hover:bg-brand-navy/90"
            >
              📊 Dashboard
            </Link>

            {/* Retail Orders */}
            <Link
              href="/admin/orders"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              📦 Orders
            </Link>

            {/* Wholesale Orders */}
            <Link
              href="/admin/wholesale-orders"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              📦 Wholesale Orders
            </Link>

            {/* Products */}
            <Link
              href="/admin/products"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              🛍️ Products
            </Link>

            {/* Categories */}
            <Link
              href="/admin/categories"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              🗂️ Categories
            </Link>

            {/* Customers */}
            <Link
              href="/admin/customers"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              👥 Customers
            </Link>

            {/* Wholesale Shops */}
            <Link
              href="/admin/wholesale-shops"
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-brand-navy transition hover:bg-surface-muted"
            >
              🏪 Wholesale Shops
            </Link>
          </nav>
        </div>
      </header>

      {/* ==================================================
          Page Content
      =================================================== */}
      <main className="min-h-[calc(100vh-100px)]">
        {children}
      </main>
    </div>
  );
}