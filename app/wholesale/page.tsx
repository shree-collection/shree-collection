import Link from "next/link";
import { redirect } from "next/navigation";

import { getWholesaleSession } from "@/lib/wholesale/session";
import WholesaleProducts from "@/components/wholesale/WholesaleProducts";

export default async function WholesalePage() {
  const shop = await getWholesaleSession();

  if (!shop) {
    redirect("/wholesale/login");
  }

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop px-4 py-5 sm:py-7">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link
              href="/"
              className="transition hover:text-[#f43f5e]"
            >
              Retail Store
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-[#172554]">Wholesale</span>
          </nav>
        </div>

        {/* Wholesale Account Header */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Main Account Header */}
          <div className="relative overflow-hidden bg-[#172554] px-5 py-6 text-white sm:px-7 sm:py-7">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/5"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#f43f5e]/10"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Account Intro */}
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5">
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-black text-[#172554]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">
                      Approved Wholesale Account
                    </span>
                  </div>

                  <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                    Welcome, {shop.shop_name}!{" "}
                    <span aria-hidden="true">🏪</span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                    Your wholesale account is active. Browse products,
                    check bulk pricing and place your wholesale orders.
                  </p>
                </div>

                {/* Navigation */}
                <nav
                  aria-label="Wholesale navigation"
                  className="flex flex-wrap gap-2"
                >
                  <Link
                    href="/wholesale/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white transition hover:bg-white/15 sm:text-sm"
                  >
                    📦 My Orders
                  </Link>

                  <Link
                    href="/wholesale/cart"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f43f5e] px-5 py-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-md sm:text-sm"
                  >
                    🛒 Cart
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-black text-white transition hover:bg-white/15 sm:text-sm"
                  >
                    🏠 Retail Store
                  </Link>

                  <form
                    action="/api/wholesale/logout"
                    method="POST"
                  >
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-xs font-black text-red-200 transition hover:bg-red-400/20 sm:text-sm"
                    >
                      Logout
                    </button>
                  </form>
                </nav>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Shop */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#f43f5e]/20 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-lg">
                    🏪
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Shop Name
                    </p>

                    <p className="mt-1 truncate text-sm font-black text-[#172554] sm:text-base">
                      {shop.shop_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#f43f5e]/20 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172554] text-lg">
                    📱
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Registered Mobile Number
                    </p>

                    <p className="mt-1 text-sm font-black text-[#172554] sm:text-base">
                      +91 {shop.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wholesale Products */}
        <section className="mt-7 sm:mt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f3] px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#f43f5e]">
                  Wholesale Collection
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                Browse Wholesale Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Shop in bulk with wholesale pricing and minimum order
                quantities.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm ring-1 ring-slate-200">
                🏷️
              </span>
              Bulk pricing available
            </div>
          </div>

          <WholesaleProducts />
        </section>

        {/* Wholesale Benefits */}
        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-lg">
                  🏷️
                </div>

                <div>
                  <p className="text-xs font-black text-[#172554]">
                    Wholesale Pricing
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                    Special pricing for approved business accounts.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-lg">
                  📦
                </div>

                <div>
                  <p className="text-xs font-black text-[#172554]">
                    Bulk Orders
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                    Order products in larger quantities for your business.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-lg">
                  📋
                </div>

                <div>
                  <p className="text-xs font-black text-[#172554]">
                    Order Management
                  </p>

                  <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                    View your wholesale orders anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
            <Link
              href="/wholesale/orders"
              className="text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-sm"
            >
              📦 My Orders
            </Link>

            <span className="text-slate-300">•</span>

            <Link
              href="/wholesale/cart"
              className="text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-sm"
            >
              🛒 Wholesale Cart
            </Link>

            <span className="text-slate-300">•</span>

            <Link
              href="/"
              className="text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-sm"
            >
              ← Back to Retail Store
            </Link>
          </div>

          <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
            Wholesale pricing is available to approved Shree Collection
            business accounts.
          </p>
        </div>
      </div>
    </main>
  );
}