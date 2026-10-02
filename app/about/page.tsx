import Link from "next/link";

export default function AboutPage() {
  const offerings = [
    ["🎁", "Gift Items"],
    ["🧸", "Toys"],
    ["🎈", "Party Items"],
    ["✏️", "Stationery"],
    ["👜", "Ladies Bags"],
    ["🎀", "Gift Hampers"],
    ["🔑", "Key Chains"],
    ["🖼️", "Divine Frames"],
  ];

  const highlights = [
    {
      icon: "🛍️",
      title: "Wide Collection",
      description: "Gifts, toys, party products and everyday essentials.",
    },
    {
      icon: "🚚",
      title: "PAN India Delivery",
      description: "Shop online and get your products delivered across India.",
    },
    {
      icon: "🎉",
      title: "For Every Occasion",
      description: "Birthday, celebration, gifting, festivals and everyday needs.",
    },
    {
      icon: "💳",
      title: "Easy Shopping",
      description: "Browse categories, compare products and place your order online.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      {/* Breadcrumb */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link
              href="/"
              className="transition hover:text-[#f43f5e]"
            >
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-[#172554]">About Us</span>
          </nav>
        </div>
      </section>

      {/* Marketplace-style intro */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-7 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Main intro */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff1f3] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#f43f5e]">
                  About Shree Collection
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                  Gifts • Toys • More
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight text-[#172554] sm:text-4xl lg:text-5xl">
                Everything you need for{" "}
                <span className="text-[#f43f5e]">
                  gifting & celebrations
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                Shree Collection brings together gifts, toys, party
                essentials, stationery, divine photo frames, ladies bags,
                gift hampers and more in one convenient online store.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#172554] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0f172a] hover:shadow-md"
                >
                  Explore Collection
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#172554] transition hover:border-[#f43f5e]/30 hover:bg-[#fff1f3]"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Store summary */}
            <div className="overflow-hidden rounded-3xl bg-[#172554] shadow-sm">
              <div className="relative p-6 sm:p-7">
                <div
                  className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/5"
                  aria-hidden="true"
                />

                <div
                  className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#f43f5e]/10"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    🎁
                  </div>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#fda4af]">
                    Shree Collection
                  </p>

                  <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                    One place.
                    <br />
                    Many reasons to shop.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Discover products for celebrations, gifting, children,
                    home decoration and everyday needs.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-lg font-black text-white">8+</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-white/60">
                        Product Categories
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-lg font-black text-white">PAN</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-white/60">
                        India Delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop categories */}
      <section className="container-shop px-4 py-7 sm:py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
              What You&apos;ll Find
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
              Shop across categories
            </h2>
          </div>

          <Link
            href="/shop/products"
            className="hidden text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:inline-flex"
          >
            View All Products →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {offerings.map(([icon, name]) => (
            <Link
              key={name}
              href="/shop/products"
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f43f5e]/25 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-2xl transition group-hover:scale-105">
                  {icon}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-[#172554]">
                    {name}
                  </h3>

                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                    Explore products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/shop/products"
          className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-[#172554] transition hover:border-[#f43f5e]/30 hover:bg-[#fff1f3] sm:hidden"
        >
          View All Products →
        </Link>
      </section>

      {/* Who we are + shopping experience */}
      <section className="border-y border-slate-200 bg-white">
        <div className="container-shop px-4 py-8 sm:py-10">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Who we are */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                    Who We Are
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                    Gifts for every occasion
                  </h2>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-xl">
                  🏪
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Shree Collection brings together a wide range of products
                for celebrations, gifting, children, everyday use and home
                decoration.
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                From birthday and party products to toys, stationery, ladies
                bags, gift hampers, key chains and divine photo frames, our
                collection is designed to give you plenty of options in one
                place.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Gifting",
                  "Celebrations",
                  "Kids",
                  "Home Decor",
                  "Everyday Essentials",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Shopping experience */}
            <div className="rounded-3xl bg-[#172554] p-6 text-white shadow-xl sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fda4af]">
                Shopping Experience
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Simple. Convenient. Useful.
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Browse products, explore categories and order what you need
                from the comfort of your home.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  ["01", "Browse products", "Explore categories and discover new items."],
                  ["02", "Choose your favourites", "Check prices, stock and product details."],
                  ["03", "Place your order", "Complete checkout and get your order delivered."],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f43f5e] text-[10px] font-black text-white">
                      {number}
                    </span>

                    <div>
                      <p className="text-sm font-black text-white">
                        {title}
                      </p>

                      <p className="mt-0.5 text-[11px] leading-5 text-white/60">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why shop with us */}
      <section className="container-shop px-4 py-8 sm:py-10">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
            Why Shree Collection
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
            Everything in one place
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            A marketplace-style shopping experience built around products
            people commonly need for gifting, celebrations and everyday use.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#f43f5e]/20 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-2xl">
                {item.icon}
              </div>

              <h3 className="mt-4 text-sm font-black text-[#172554]">
                {item.title}
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Shopping CTA */}
      <section className="container-shop px-4 pb-8 sm:pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#f43f5e] p-6 text-white shadow-xl sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#172554]/10"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                Ready to Shop?
              </p>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Find something you&apos;ll love.
              </h2>

              <p className="mt-1 text-sm text-white/80">
                Explore our latest products and collections.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/shop"
                className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#172554] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start Shopping →
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}