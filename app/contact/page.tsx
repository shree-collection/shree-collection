import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7]">

      {/* Page Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-7 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f3] px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                  Get In Touch
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
                Contact Shree Collection
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Have a question about a product, order or anything
                else? We&apos;re here to help.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#172554] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0f172a] hover:shadow-md"
            >
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shop px-4 py-7 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main Contact Options */}
          <div>
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Contact Options
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172554]">
                How can we help?
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Phone */}
              <a
                href="tel:8796780766"
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#f43f5e]/30 hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-2xl transition group-hover:scale-105">
                    📞
                  </div>

                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                    Quick Response
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-black text-[#172554]">
                  Call Us
                </h3>

                <p className="mt-1.5 text-lg font-black text-[#f43f5e]">
                  8796780766
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Best for urgent product or order questions.
                </p>

                <div className="mt-5 inline-flex rounded-xl bg-[#172554] px-4 py-2.5 text-[11px] font-black text-white transition group-hover:bg-[#0f172a]">
                  Call Now →
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:myshreecollection@gmail.com"
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#f43f5e]/30 hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f3] text-2xl transition group-hover:scale-105">
                    ✉️
                  </div>

                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                    Email Support
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-black text-[#172554]">
                  Email Us
                </h3>

                <p className="mt-1.5 break-all text-sm font-black text-[#f43f5e]">
                  myshreecollection@gmail.com
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Send us your question or product enquiry.
                </p>

                <div className="mt-5 inline-flex rounded-xl bg-[#172554] px-4 py-2.5 text-[11px] font-black text-white transition group-hover:bg-[#0f172a]">
                  Send Email →
                </div>
              </a>
            </div>

            {/* What We Can Help With */}
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                    Need Assistance?
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#172554]">
                    We can help with
                  </h2>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#fff1f3] text-xl sm:flex">
                  💬
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["🎁", "Product Enquiry"],
                  ["📦", "Order Help"],
                  ["🛒", "Shopping Help"],
                  ["🏷️", "Bulk Enquiry"],
                ].map(([icon, title]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-[#f43f5e]/20 hover:bg-[#fff1f3]"
                  >
                    <div className="text-xl" aria-hidden="true">
                      {icon}
                    </div>

                    <p className="mt-2 text-[11px] font-black leading-4 text-[#172554]">
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-5 rounded-3xl bg-[#f43f5e] p-5 text-white shadow-lg sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                    Looking for something?
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Explore our collection
                  </h2>

                  <p className="mt-1 text-xs text-white/75">
                    Browse gifts, toys, party items and more.
                  </p>
                </div>

                <Link
                  href="/shop"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#172554] transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            {/* Store Information */}
            <div className="overflow-hidden rounded-3xl bg-[#172554] p-6 text-white shadow-xl">
              <div className="relative">
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/5"
                  aria-hidden="true"
                />

                <div
                  className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[#f43f5e]/10"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                    🛍️
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#fda4af]">
                    Shree Collection
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    We&apos;d love to hear from you
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/70">
                    For product enquiries, gifting questions, bulk
                    requirements or order assistance, reach out to us.
                  </p>

                  <div className="mt-6 space-y-2.5">
                    <a
                      href="tel:8796780766"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f43f5e] text-sm">
                        📞
                      </span>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">
                          Phone
                        </p>

                        <p className="mt-0.5 text-sm font-black">
                          8796780766
                        </p>
                      </div>
                    </a>

                    <a
                      href="mailto:myshreecollection@gmail.com"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f43f5e] text-sm">
                        ✉️
                      </span>

                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-white/50">
                          Email
                        </p>

                        <p className="mt-0.5 truncate text-xs font-black">
                          myshreecollection@gmail.com
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Quick Links
              </p>

              <h2 className="mt-1 text-lg font-black text-[#172554]">
                Continue exploring
              </h2>

              <div className="mt-4 space-y-2">
                <Link
                  href="/shop"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-[#172554] transition hover:bg-[#fff1f3]"
                >
                  <span>🛍️ Shop Products</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/shop/products"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-[#172554] transition hover:bg-[#fff1f3]"
                >
                  <span>🎁 All Products</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-[#172554] transition hover:bg-[#fff1f3]"
                >
                  <span>📦 Track Order</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/about"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-[#172554] transition hover:bg-[#fff1f3]"
                >
                  <span>ℹ️ About Us</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Service Strip */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f3] text-sm">
                    🚚
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#172554]">
                      PAN India Delivery
                    </p>

                    <p className="text-[10px] font-medium text-slate-500">
                      Shop from anywhere in India
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f3] text-sm">
                    💵
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#172554]">
                      Cash on Delivery
                    </p>

                    <p className="text-[10px] font-medium text-slate-500">
                      Available on eligible orders
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f3] text-sm">
                    🎉
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#172554]">
                      Gifts for Every Occasion
                    </p>

                    <p className="text-[10px] font-medium text-slate-500">
                      Find something special
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}