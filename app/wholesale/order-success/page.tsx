import Link from "next/link";

type PageProps = {
  searchParams: Promise<{
    orderId?: string;
    orderNumber?: string;
  }>;
};

export default async function WholesaleOrderSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const orderNumber =
    params.orderNumber || "Wholesale Order";

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-2xl">
          {/* Success Card */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Brand Accent */}
            <div className="h-1.5 bg-[#f43f5e]" />

            <div className="p-6 sm:p-10">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl font-black text-white shadow-sm">
                    ✓
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="mt-7 text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#f43f5e]/15 bg-[#fff1f3] px-3 py-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                    aria-hidden="true"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f43f5e]">
                    Wholesale Order
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                  Order Created Successfully
                </h1>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Thank you for placing your wholesale
                  order with Shree Collection. Your order
                  has been received and is waiting for
                  confirmation.
                </p>
              </div>

              {/* Order Number */}
              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm"
                    aria-hidden="true"
                  >
                    🧾
                  </span>

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Order Number
                  </p>
                </div>

                <p className="mt-3 break-all text-xl font-black tracking-wide text-[#172554] sm:text-2xl">
                  {orderNumber}
                </p>
              </div>

              {/* Pending Status */}
              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <span
                      className="text-sm"
                      aria-hidden="true"
                    >
                      ⏳
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-black text-blue-800">
                      Order Status: Pending
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700/80">
                      Our team will review your order and
                      contact you regarding shipping and
                      payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mx-auto mt-5 max-w-md">
                <p className="mb-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  What happens next
                </p>

                <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">
                      📋
                    </div>

                    <p className="mt-3 text-xs font-black text-[#172554]">
                      Order Received
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Your order is recorded.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">
                      🔍
                    </div>

                    <p className="mt-3 text-xs font-black text-[#172554]">
                      Order Review
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Our team will review it.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base">
                      📞
                    </div>

                    <p className="mt-3 text-xs font-black text-[#172554]">
                      Confirmation
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      We will contact you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center justify-center rounded-xl bg-[#f43f5e] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e11d48]"
                >
                  Continue Shopping
                  <span className="ml-2">→</span>
                </Link>

                <Link
                  href="/wholesale/orders"
                  className="inline-flex items-center justify-center rounded-xl bg-[#172554] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0f172a]"
                >
                  View My Orders
                  <span className="ml-2">→</span>
                </Link>
              </div>

              {/* Retail Store */}
              <div className="mt-3 text-center">
                <Link
                  href="/"
                  className="text-xs font-bold text-slate-500 transition hover:text-[#f43f5e]"
                >
                  Visit Retail Store
                </Link>
              </div>

              {/* Reference Note */}
              <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
                <span aria-hidden="true">🔖</span>

                <span>
                  Please keep your order number for future
                  reference.
                </span>
              </div>
            </div>
          </section>

          {/* Brand Footer */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex flex-col items-center transition"
            >
              <span className="font-serif text-sm font-black tracking-tight text-[#172554]">
                Shree Collection
              </span>

              <span className="mt-1 text-[10px] font-bold tracking-[0.15em] text-slate-400">
                श्री कलेक्शन
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}