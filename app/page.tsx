import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden bg-brand-soft-gold">
        {/* Decorative Shapes */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/40" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-coral/10" />

        <div className="absolute right-[12%] top-24 hidden text-5xl lg:block">
          🎈
        </div>

        <div className="absolute left-[8%] top-32 hidden text-4xl lg:block">
          🎁
        </div>

        <div className="container-shop relative px-4 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-white px-4 py-2 text-xs font-extrabold text-brand-navy shadow-sm">
              ✨ Gifts • Celebrations • Business
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-brand-navy sm:text-6xl lg:text-7xl">
              Make Every
              <span className="block text-brand-coral">
                Moment Special
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-lg">
              Discover beautiful gifts, toys, party essentials,
              stationery, divine frames and more — all from
              Shree Collection.
            </p>

            {/* Hero Buttons */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-brand-navy px-7 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                🛍️ Explore Collection →
              </Link>

              <Link
                href="/wholesale"
                className="inline-flex items-center justify-center rounded-full border-2 border-brand-navy bg-white px-7 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-brand-soft-gold"
              >
                🏪 Wholesale Business
              </Link>
            </div>
          </div>

          {/* Hero Category Cards */}
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-3xl">🎁</div>

              <p className="mt-2 text-xs font-extrabold sm:text-sm">
                Gifts
              </p>

              <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
                For Every Occasion
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-3xl">🧸</div>

              <p className="mt-2 text-xs font-extrabold sm:text-sm">
                Toys
              </p>

              <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
                Fun For Kids
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-3xl">🎈</div>

              <p className="mt-2 text-xs font-extrabold sm:text-sm">
                Party
              </p>

              <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
                Celebrate Better
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-3xl">🪔</div>

              <p className="mt-2 text-xs font-extrabold sm:text-sm">
                Divine
              </p>

              <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
                Frames & Statues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* TRUST FEATURES */}
      {/* ===================================================== */}

      <section className="border-y border-border bg-white">
        <div className="container-shop grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          <div className="p-5 text-center">
            <div className="text-2xl">🚚</div>

            <p className="mt-2 text-xs font-extrabold sm:text-sm">
              PAN India Delivery
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Delivering Across India
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="text-2xl">🎁</div>

            <p className="mt-2 text-xs font-extrabold sm:text-sm">
              Every Occasion
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Gifts Made Special
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="text-2xl">🏪</div>

            <p className="mt-2 text-xs font-extrabold sm:text-sm">
              Retail & Wholesale
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Shop Your Way
            </p>
          </div>

          <div className="p-5 text-center">
            <div className="text-2xl">💝</div>

            <p className="mt-2 text-xs font-extrabold sm:text-sm">
              Carefully Selected
            </p>

            <p className="mt-1 text-[10px] text-text-secondary sm:text-xs">
              Products You'll Love
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* SHOP RETAIL */}
      {/* ===================================================== */}

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="container-shop">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Retail Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-border sm:p-10">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/30" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft-gold text-3xl">
                  🛍️
                </div>

                <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-coral">
                  Shop Online
                </p>

                <h2 className="mt-2 text-3xl font-black text-brand-navy sm:text-4xl">
                  Find Something
                  <span className="block text-brand-gold-dark">
                    You'll Love
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">
                  Explore our collection of gifts, toys,
                  party decorations, stationery, ladies bags,
                  key chains, divine frames and statues.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-soft-gold px-3 py-2 text-xs font-bold">
                    🎁 Gifts
                  </span>

                  <span className="rounded-full bg-brand-soft-gold px-3 py-2 text-xs font-bold">
                    🧸 Toys
                  </span>

                  <span className="rounded-full bg-brand-soft-gold px-3 py-2 text-xs font-bold">
                    🎈 Party
                  </span>

                  <span className="rounded-full bg-brand-soft-gold px-3 py-2 text-xs font-bold">
                    ✏️ Stationery
                  </span>

                  <span className="rounded-full bg-brand-soft-gold px-3 py-2 text-xs font-bold">
                    🪔 Divine
                  </span>
                </div>

                <Link
                  href="/shop"
                  className="mt-7 inline-flex rounded-full bg-brand-gold px-7 py-3.5 text-sm font-extrabold text-brand-navy shadow-sm transition hover:bg-brand-gold-dark"
                >
                  Start Shopping →
                </Link>
              </div>
            </div>

            {/* Quick Browse */}
            <div className="rounded-[2rem] bg-brand-navy p-7 text-white shadow-sm sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-gold">
                Quick Browse
              </p>

              <h2 className="mt-3 text-2xl font-black">
                Shop All Products
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Browse everything currently available in
                the Shree Collection store.
              </p>

              <Link
                href="/shop/products"
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-brand-soft-gold"
              >
                View All Products →
              </Link>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl">🎀</p>

                  <p className="mt-2 text-xs font-bold">
                    Gift Items
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl">🔑</p>

                  <p className="mt-2 text-xs font-bold">
                    Key Chains
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl">🖼️</p>

                  <p className="mt-2 text-xs font-bold">
                    Photo Frames
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl">🗿</p>

                  <p className="mt-2 text-xs font-bold">
                    Statues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* WHOLESALE */}
      {/* ===================================================== */}

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="container-shop">
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-9 sm:px-10 sm:py-12">
            {/* Decorations */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10" />

            <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-brand-coral/10" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex rounded-full bg-green-400/15 px-3 py-1.5 text-xs font-extrabold text-green-300">
                  🏪 FOR BUSINESS
                </div>

                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  Buy More.
                  <span className="block text-brand-gold">
                    Save More.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                  Looking for products in bulk? Create a
                  wholesale business account to access
                  wholesale pricing, minimum order quantities,
                  bulk ordering and order history.
                </p>

                <div className="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                    <p className="text-xl">💰</p>

                    <p className="mt-1 text-[10px] font-bold text-white/90">
                      Wholesale Prices
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                    <p className="text-xl">📦</p>

                    <p className="mt-1 text-[10px] font-bold text-white/90">
                      Bulk Orders
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                    <p className="text-xl">🧾</p>

                    <p className="mt-1 text-[10px] font-bold text-white/90">
                      Order History
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                    <p className="text-xl">🏪</p>

                    <p className="mt-1 text-[10px] font-bold text-white/90">
                      Business Account
                    </p>
                  </div>
                </div>
              </div>

              {/* Wholesale Actions */}
              <div className="w-full lg:w-72">
                <Link
                  href="/wholesale/login"
                  className="flex w-full items-center justify-center rounded-xl bg-brand-gold px-5 py-3.5 text-sm font-extrabold text-brand-navy transition hover:bg-brand-gold-dark"
                >
                  Wholesale Login →
                </Link>

                <Link
                  href="/wholesale/register"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Register Your Business
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* ADMIN */}
      {/* ===================================================== */}

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="container-shop">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted-surface text-xl">
                🔐
              </div>

              <div>
                <p className="text-sm font-extrabold text-brand-navy">
                  Store Administration
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Manage products, orders, customers and wholesale shops.
                </p>
              </div>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-xl border border-brand-navy px-5 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-navy hover:text-white"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
