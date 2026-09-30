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
      <div className="container-shop px-4 py-6 sm:py-8">

        {/* =====================================================
            Wholesale Account Header
        ====================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          {/* Main Header */}
          <div className="relative overflow-hidden bg-[#172554] px-5 py-6 text-white sm:px-7 sm:py-8">

            {/* Decorative Shapes */}
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/5"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#f43f5e]/10"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-white/[0.03]"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* Account Intro */}
              <div className="max-w-2xl">
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

                <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Welcome, {shop.shop_name}!{" "}
                  <span aria-hidden="true">🏪</span>
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  Your wholesale account is active. Browse
                  products, check bulk pricing and place your
                  wholesale orders.
                </p>
              </div>

              {/* Navigation */}
              <nav
                aria-label="Wholesale navigation"
                className="flex flex-wrap gap-2"
              >
                <Link
                  href="/wholesale/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
                >
                  📦 My Orders
                </Link>

                <Link
                  href="/wholesale/cart"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f43f5e] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48]"
                >
                  🛒 Cart
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
                >
                  🏠 Retail Store
                </Link>

                <form
                  action="/api/wholesale/logout"
                  method="POST"
                >
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-extrabold text-red-200 transition hover:bg-red-400/20"
                  >
                    Logout
                  </button>
                </form>
              </nav>
            </div>
          </div>

          {/* ===================================================
              Account Information
          ==================================================== */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">

              {/* Shop */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#f43f5e]/20 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-lg">
                    🏪
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Shop Name
                    </p>

                    <p className="mt-1.5 truncate text-sm font-black text-[#172554] sm:text-base">
                      {shop.shop_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#f43f5e]/20 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172554] text-lg">
                    📱
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Registered Mobile Number
                    </p>

                    <p className="mt-1.5 text-sm font-black text-[#172554] sm:text-base">
                      +91 {shop.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            Wholesale Products
        ====================================================== */}
        <section className="mt-7 sm:mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f43f5e]/15 bg-[#fff1f3] px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#f43f5e]">
                  Wholesale Collection
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black tracking-tight text-[#172554] sm:text-2xl">
                Browse Wholesale Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Shop in bulk with wholesale pricing and
                minimum order quantities.
              </p>
            </div>
          </div>

          <WholesaleProducts />
        </section>

        {/* =====================================================
            Bottom Navigation
        ====================================================== */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap sm:gap-4">

            <Link
              href="/wholesale/orders"
              className="text-sm font-extrabold text-[#172554] transition hover:text-[#f43f5e]"
            >
              📦 My Orders
            </Link>

            <span className="hidden text-slate-300 sm:block">
              •
            </span>

            <Link
              href="/wholesale/cart"
              className="text-sm font-extrabold text-[#172554] transition hover:text-[#f43f5e]"
            >
              🛒 Wholesale Cart
            </Link>

            <span className="hidden text-slate-300 sm:block">
              •
            </span>

            <Link
              href="/"
              className="text-sm font-extrabold text-[#172554] transition hover:text-[#f43f5e]"
            >
              ← Back to Retail Store
            </Link>
          </div>

          <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
            Wholesale pricing is available to approved
            Shree Collection business accounts.
          </p>
        </div>
      </div>
    </main>
  );
}