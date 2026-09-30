import Link from "next/link";

export default function AboutPage() {
  const offerings = [
    ["🎈", "Party Items"],
    ["🎁", "Gift Items"],
    ["🧸", "Toys"],
    ["✏️", "Stationery"],
    ["👜", "Ladies Bags"],
    ["🎀", "Gift Hampers"],
    ["🔑", "Key Chains"],
    ["🖼️", "Divine Frames"],
  ];

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-10 sm:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f43f5e]/15 bg-[#fff1f3] px-3.5 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#172554] sm:text-xs">
                  About Us
                </p>
              </div>

              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-[#172554] sm:text-5xl lg:text-6xl">
                Welcome to{" "}
                <span className="text-[#f43f5e]">
                  Shree Collection
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                Your destination for gifts, toys, party
                essentials, stationery, divine photo frames,
                ladies bags and more.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#172554] px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0f172a] hover:shadow-xl"
                >
                  Explore Collection
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-[#172554] transition hover:border-[#f43f5e]/30 hover:bg-[#fff1f3]"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] bg-[#172554] shadow-xl sm:min-h-[340px]">
              <div
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5"
                aria-hidden="true"
              />

              <div
                className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#f43f5e]/10"
                aria-hidden="true"
              />

              <div
                className="absolute left-7 top-7 grid grid-cols-3 gap-2 opacity-30"
                aria-hidden="true"
              >
                {Array.from({ length: 9 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-white"
                  />
                ))}
              </div>

              <div
                className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-7xl shadow-2xl backdrop-blur-sm sm:h-44 sm:w-44 sm:text-8xl"
                aria-hidden="true"
              >
                🎁
              </div>

              <div
                className="absolute right-8 top-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg"
                aria-hidden="true"
              >
                🎈
              </div>

              <div
                className="absolute bottom-10 left-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f43f5e] text-2xl shadow-lg"
                aria-hidden="true"
              >
                🎉
              </div>

              <div
                className="absolute bottom-8 right-10 text-3xl"
                aria-hidden="true"
              >
                ✨
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm">
                Gifts for Every Occasion
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container-shop px-4 py-8 sm:py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Who We Are */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff1f3] text-xl">
              🏪
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
              Who We Are
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172554]">
              Gifts for every occasion
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Shree Collection brings together a wide
              range of products for celebrations, gifting,
              children, everyday use and home decoration.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              From birthday and party products to toys,
              stationery, ladies bags, gift hampers,
              key chains and divine photo frames, our
              collection is designed to give you plenty
              of options in one place.
            </p>
          </div>

          {/* What We Offer */}
          <div className="rounded-3xl bg-[#172554] p-6 text-white shadow-xl sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
              ✨
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#fda4af]">
              What We Offer
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Something for everyone
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {offerings.map(([icon, name]) => (
                <div
                  key={name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:bg-white/10"
                >
                  <div className="text-2xl">{icon}</div>

                  <p className="mt-2 text-xs font-bold text-white/90">
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="container-shop px-4 pb-8 sm:pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
              Shree Collection
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
              Everything in one place
            </h2>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[#f43f5e]/20 hover:shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-3xl">
                🎁
              </div>

              <h3 className="mt-3 font-black text-[#172554]">
                Wide Collection
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gifts, toys, party products and more.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[#f43f5e]/20 hover:shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-3xl">
                🛍️
              </div>

              <h3 className="mt-3 font-black text-[#172554]">
                Easy Shopping
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Browse categories and order your
                favourite products online.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-[#f43f5e]/20 hover:shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-3xl">
                💛
              </div>

              <h3 className="mt-3 font-black text-[#172554]">
                For Every Occasion
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find something for birthdays,
                celebrations, gifting and everyday needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container-shop px-4 pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#f43f5e] p-6 text-white shadow-xl sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                Need Help?
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Have a question?
              </h2>

              <p className="mt-1 text-sm text-white/80">
                We&apos;d be happy to help.
              </p>
            </div>

            <Link
              href="/contact"
              className="w-fit rounded-xl bg-white px-6 py-3 text-sm font-black text-[#172554] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}