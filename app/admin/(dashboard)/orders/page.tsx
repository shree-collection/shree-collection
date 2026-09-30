import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import AdminOrdersList from "@/components/admin/AdminOrdersList";

type Order = {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  created_at: string;
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      order_type,
      status,
      subtotal,
      shipping_amount,
      total_amount,
      payment_status,
      payment_method,
      shipping_name,
      shipping_phone,
      shipping_city,
      shipping_state,
      created_at
    `)
    .eq("order_type", "retail")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Retail orders fetch error:",
      error
    );
  }

  const orderList = (orders || []) as Order[];

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            Header
        ====================================================== */}
        <header className="mb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-coral">
                  Shree Collection
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
                  Retail Orders
                </h1>

                <span className="rounded-full bg-brand-navy px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                  Retail
                </span>
              </div>

              <p className="mt-2 text-sm text-text-muted">
                Manage customer retail orders and
                order activity.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-black text-brand-navy shadow-sm transition hover:bg-surface-muted"
            >
              <span aria-hidden="true">←</span>
              Store
            </Link>
          </div>
        </header>

        {/* =====================================================
            Quick Summary
        ====================================================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Retail Orders
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              {orderList.length}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              Total orders
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Order Value
            </p>

            <p className="mt-1 text-2xl font-black text-brand-navy">
              ₹
              {orderList
                .reduce(
                  (sum, order) =>
                    sum +
                    Number(
                      order.total_amount || 0
                    ),
                  0
                )
                .toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              Combined retail value
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-border bg-white p-4 shadow-sm sm:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-text-light">
              Latest Order
            </p>

            <p className="mt-1 truncate text-base font-black text-brand-navy">
              {orderList[0]?.order_number ||
                "No orders yet"}
            </p>

            <p className="mt-1 text-[10px] font-medium text-text-muted">
              Most recent retail order
            </p>
          </div>
        </div>

        {/* =====================================================
            Error
        ====================================================== */}
        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </span>

              <div>
                <p className="text-sm font-black text-red-700">
                  Unable to load retail orders
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AdminOrdersList
            orders={orderList}
          />
        )}
      </div>
    </main>
  );
}