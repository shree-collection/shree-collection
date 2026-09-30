import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7]">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shop px-4 py-10 text-center sm:py-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f3] text-2xl shadow-sm">
            💬
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#f43f5e]">
            Get In Touch
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
            Contact Shree Collection
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Have a question about a product, order or
            anything else? Contact us directly.
          </p>
        </div>
      </section>

      <section className="container-shop px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Contact Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone */}
            <a
              href="tel:8796780766"
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f43f5e]/30 hover:shadow-lg sm:p-7"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f3] text-3xl transition-transform duration-300 group-hover:scale-105">
                📞
              </div>

              <h2 className="mt-4 text-lg font-black text-[#172554]">
                Call Us
              </h2>

              <p className="mt-2 text-lg font-black text-[#f43f5e]">
                8796780766
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500">
                Tap to call
              </p>

              <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black text-[#172554] transition group-hover:border-[#f43f5e]/30 group-hover:bg-[#fff1f3]">
                Call Now →
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:myshreecollection@gmail.com"
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f43f5e]/30 hover:shadow-lg sm:p-7"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f3] text-3xl transition-transform duration-300 group-hover:scale-105">
                ✉️
              </div>

              <h2 className="mt-4 text-lg font-black text-[#172554]">
                Email Us
              </h2>

              <p className="mt-2 break-all text-sm font-black text-[#f43f5e]">
                myshreecollection@gmail.com
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500">
                Tap to send an email
              </p>

              <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black text-[#172554] transition group-hover:border-[#f43f5e]/30 group-hover:bg-[#fff1f3]">
                Send Email →
              </span>
            </a>
          </div>

          {/* Store Information */}
          <div className="relative mt-5 overflow-hidden rounded-3xl bg-[#172554] p-6 text-white shadow-xl sm:p-8">
            {/* Decorative Shapes */}
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/5"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-[#f43f5e]/10"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
                  Shree Collection
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                We&apos;d love to hear from you
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                For product enquiries, bulk requirements,
                gifting questions or order assistance,
                please reach out using the contact details
                above.
              </p>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:8796780766"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f43f5e] px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-lg"
                >
                  📞 Call Now
                </a>

                <a
                  href="mailto:myshreecollection@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  ✉️ Send Email
                </a>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  🛍️ Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Simple Help Strip */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xl" aria-hidden="true">
                🎁
              </div>

              <p className="mt-2 text-[10px] font-black text-[#172554] sm:text-xs">
                Gift Items
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xl" aria-hidden="true">
                🧸
              </div>

              <p className="mt-2 text-[10px] font-black text-[#172554] sm:text-xs">
                Toys & More
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xl" aria-hidden="true">
                🛍️
              </div>

              <p className="mt-2 text-[10px] font-black text-[#172554] sm:text-xs">
                Shop Online
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}