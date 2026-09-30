import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-4 pt-4 sm:pt-5">
      <div className="mx-auto max-w-7xl">
        {/* Search Bar */}
        <div className="group flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 shadow-soft transition focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft-gold text-base"
            aria-hidden="true"
          >
            🔍
          </span>

          <input
            type="text"
            placeholder="Search gifts, toys, party items..."
            aria-label="Search products"
            className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        {/* Hero */}
        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-border bg-white shadow-card sm:mt-5">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* Content */}
            <div className="relative overflow-hidden px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              {/* Subtle Decorative Shapes */}
              <div
                className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/10"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-brand-coral/5"
                aria-hidden="true"
              />

              <div className="relative z-10 max-w-2xl">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-soft-gold px-3.5 py-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-coral"
                    aria-hidden="true"
                  />

                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-navy sm:text-xs">
                    Shree Collection
                  </p>
                </div>

                {/* Heading */}
                <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight text-brand-navy sm:text-5xl lg:text-[3.8rem]">
                  Gifts, Toys &
                  <br />
                  <span className="text-brand-coral">
                    Party Essentials
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-text-secondary sm:text-base sm:leading-7">
                  Discover birthday decorations, gifts,
                  toys, stationery, ladies bags and more —
                  all in one place.
                </p>

                {/* Quick Categories */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold">
                    🎂 Birthday
                  </span>

                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold">
                    🎁 Gifts
                  </span>

                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold">
                    🧸 Toys
                  </span>

                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-extrabold text-brand-navy transition hover:border-brand-gold hover:bg-brand-soft-gold">
                    ✏️ Stationery
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-7">
                  <Link
                    href="/shop/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:translate-y-0 sm:px-7"
                  >
                    Shop Products
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {/* Trust Points */}
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-text-secondary sm:text-xs">
                  <span>✓ Trending Gifts</span>
                  <span>✓ PAN India Delivery</span>
                  <span>
                    ✓ Perfect for Every Occasion
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="relative min-h-[280px] overflow-hidden bg-brand-navy sm:min-h-[340px] lg:min-h-full">
              {/* Background Shapes */}
              <div
                className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/15"
                aria-hidden="true"
              />

              <div
                className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-coral/15"
                aria-hidden="true"
              />

              <div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5"
                aria-hidden="true"
              />

              {/* Decorative Dots */}
              <div
                className="absolute left-8 top-8 grid grid-cols-3 gap-2 opacity-40"
                aria-hidden="true"
              >
                {Array.from({ length: 9 }).map(
                  (_, index) => (
                    <span
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-brand-gold"
                    />
                  )
                )}
              </div>

              {/* Main Gift */}
              <div
                className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/10 text-8xl shadow-2xl backdrop-blur-sm transition-transform duration-500 hover:scale-105 sm:h-48 sm:w-48 sm:text-9xl"
                aria-hidden="true"
              >
                🎁
              </div>

              {/* Floating Elements */}
              <div
                className="absolute right-8 top-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg sm:right-12 sm:top-12"
                aria-hidden="true"
              >
                🎈
              </div>

              <div
                className="absolute bottom-10 left-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold text-2xl shadow-lg sm:bottom-12 sm:left-12"
                aria-hidden="true"
              >
                🎉
              </div>

              <div
                className="absolute bottom-8 right-10 text-3xl sm:right-16"
                aria-hidden="true"
              >
                ✨
              </div>

              {/* Visual Label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm">
                Perfect for Every Occasion
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}