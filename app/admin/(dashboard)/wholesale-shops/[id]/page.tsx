"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type ShopStatus = "pending" | "approved" | "blocked";

type Shop = {
  id: string;
  user_id: string | null;
  shop_name: string;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_number: string | null;
  status: ShopStatus;
  access_code: string | null;
  access_code_created_at: string | null;
  created_at: string;
  updated_at: string;
};

type WholesaleOrder = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
};

function getStatusClass(status: ShopStatus) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "blocked":
      return "border-red-200 bg-red-50 text-red-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getStatusDot(status: ShopStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-500";

    case "blocked":
      return "bg-red-500";

    case "pending":
      return "bg-amber-500";

    default:
      return "bg-slate-400";
  }
}

function getOrderStatusClass(status: string) {
  const value = status.toLowerCase();

  if (
    value.includes("complete") ||
    value.includes("deliver") ||
    value.includes("approved")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    value.includes("cancel") ||
    value.includes("reject") ||
    value.includes("failed")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    value.includes("process") ||
    value.includes("confirm") ||
    value.includes("pending")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function WholesaleShopDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadShop() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/wholesale-shops/${id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load wholesale shop."
        );
      }

      setShop(data.shop);

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wholesale shop."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, [id]);

  async function updateStatus(status: ShopStatus) {
    if (!shop) return;

    const isGeneratingNewCode =
      status === "approved" &&
      shop.status === "approved";

    const action =
      status === "approved"
        ? isGeneratingNewCode
          ? "generate a new access code for"
          : "approve"
        : status === "blocked"
        ? "block"
        : "move back to pending";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${shop.shop_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/wholesale-shops",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopId: shop.id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update wholesale shop."
        );
      }

      setShop((current) =>
        current
          ? {
              ...current,
              ...data.shop,
              status,
              access_code:
                data.accessCode ||
                data.shop?.access_code ||
                (status !== "approved"
                  ? null
                  : current.access_code),
              access_code_created_at:
                data.shop?.access_code_created_at ||
                (status !== "approved"
                  ? null
                  : current.access_code_created_at),
              updated_at:
                data.shop?.updated_at ||
                new Date().toISOString(),
            }
          : current
      );

      if (status === "approved" && data.accessCode) {
        if (isGeneratingNewCode) {
          setSuccess(
            `New access code generated successfully: ${data.accessCode}`
          );
        } else {
          setSuccess(
            `Shop approved successfully. New access code: ${data.accessCode}`
          );
        }
      } else {
        setSuccess(
          data.message ||
            "Wholesale shop updated successfully."
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update wholesale shop."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-2 animate-pulse bg-slate-100" />

            <div className="p-6 sm:p-8">
              <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded-lg bg-slate-100" />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs font-semibold text-slate-500">
            Loading shop details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !shop) {
    return (
      <main className="min-h-screen bg-[#fffdf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg">
                ⚠️
              </span>

              <div>
                <p className="text-sm font-black text-red-700">
                  Unable to load shop
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {error}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/wholesale-shops"
            className="mt-5 inline-flex items-center gap-2 text-xs font-black text-brand-coral transition hover:text-brand-navy"
          >
            ← Back to Wholesale Shops
          </Link>
        </div>
      </main>
    );
  }

  if (!shop) return null;

  const statusClass = getStatusClass(shop.status);
  const statusDot = getStatusDot(shop.status);

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Back Navigation */}
        <Link
          href="/admin/wholesale-shops"
          className="inline-flex items-center gap-2 text-xs font-black text-brand-coral transition hover:text-brand-navy"
        >
          ← Back to Wholesale Shops
        </Link>

        {/* Header */}
        <section className="mt-4 overflow-hidden rounded-3xl bg-brand-navy shadow-soft">
          <div className="relative px-5 py-6 sm:px-7 sm:py-7">

            <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-coral/10" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-brand-gold/5" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                      Wholesale Shop
                    </span>
                  </div>

                  <h1 className="break-words text-2xl font-black tracking-tight !text-white sm:text-3xl">
                    {shop.shop_name}
                  </h1>

                  <p className="mt-2 text-xs text-slate-300">
                    Registered on{" "}
                    {new Date(
                      shop.created_at
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black capitalize ${statusClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusDot}`}
                    />

                    {shop.status}
                  </span>

                  {shop.status !== "approved" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateStatus("approved")
                      }
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "Approve"}
                    </button>
                  )}

                  {shop.status !== "blocked" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateStatus("blocked")
                      }
                      className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "Block"}
                    </button>
                  )}

                  {shop.status === "blocked" && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        updateStatus("pending")
                      }
                      className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-brand-navy transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating
                        ? "Updating..."
                        : "Move to Pending"}
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              {success && (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
                  <p className="text-xs font-bold !text-emerald-100">
                    ✓ {success}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-bold !text-red-100">
                    ⚠ {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-sm">
              👤
            </span>

            <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Owner
            </p>

            <p className="mt-1 truncate text-sm font-black text-brand-navy">
              {shop.owner_name || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-coral/5 text-sm">
              📱
            </span>

            <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Mobile
            </p>

            <p className="mt-1 truncate text-sm font-black text-brand-navy">
              {shop.phone || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm">
              🧾
            </span>

            <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
              GST
            </p>

            <p className="mt-1 truncate text-sm font-black text-brand-navy">
              {shop.gst_number || "Not provided"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-sm">
              📦
            </span>

            <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
              Orders
            </p>

            <p className="mt-1 text-xl font-black text-brand-navy">
              {orders.length}
            </p>
          </div>
        </section>

        {/* Shop Information */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-sm text-white">
                🏪
              </span>

              <div>
                <h2 className="text-sm font-black text-brand-navy">
                  Shop Information
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Registered business details
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Shop Name
                </p>

                <p className="mt-1 text-sm font-bold text-brand-navy">
                  {shop.shop_name}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Owner
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {shop.owner_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Mobile
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {shop.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  GST Number
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-600">
                  {shop.gst_number ||
                    "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-coral text-sm text-white">
                📍
              </span>

              <div>
                <h2 className="text-sm font-black text-brand-navy">
                  Business Address
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Registered shop location
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {shop.address ||
                  "Address not provided"}
              </p>

              <p className="mt-1 text-sm font-semibold text-brand-navy">
                {shop.city || ""}
                {shop.state
                  ? `, ${shop.state}`
                  : ""}
              </p>

              {shop.pincode && (
                <p className="mt-1 text-xs font-bold text-slate-400">
                  PIN: {shop.pincode}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Wholesale Login / Access Code */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-sm text-white">
                  🔐
                </span>

                <div>
                  <h2 className="text-sm font-black text-brand-navy">
                    Wholesale Login Access
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Manage the login access code for this shop.
                  </p>
                </div>
              </div>

              {shop.status === "approved" && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}
            </div>
          </div>

          {shop.status === "approved" ? (
            <div className="p-5 sm:p-6">

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
                      Current Access Code
                    </p>

                    <p className="mt-3 break-all text-2xl font-black tracking-[0.16em] text-brand-navy sm:text-3xl">
                      {shop.access_code ||
                        "Not available"}
                    </p>

                    {shop.access_code_created_at && (
                      <p className="mt-3 text-[10px] font-medium text-slate-500">
                        Created on{" "}
                        {new Date(
                          shop.access_code_created_at
                        ).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-white p-4 lg:max-w-xs">
                    <p className="text-xs font-black text-brand-navy">
                      Share this code with the shop owner
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      The owner can use their registered
                      mobile number and this access code
                      to log in to the wholesale portal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-[10px] leading-5 text-slate-500">
                  Generating a new code will immediately
                  replace the existing access code.
                </p>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateStatus("approved")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-brand-navy shadow-sm transition hover:border-brand-coral hover:text-brand-coral disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>↻</span>

                  {updating
                    ? "Generating..."
                    : "Generate New Access Code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-sm">
                    🔒
                  </span>

                  <div>
                    <p className="text-sm font-black text-brand-navy">
                      Access code is not active
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      This shop is currently{" "}
                      <span className="font-black capitalize text-brand-navy">
                        {shop.status}
                      </span>
                      .
                    </p>

                    {shop.status === "pending" && (
                      <p className="mt-2 text-[10px] leading-5 text-slate-400">
                        Approve the shop to generate an
                        access code.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Wholesale Orders */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <h2 className="text-sm font-black text-brand-navy">
                  Wholesale Orders
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-slate-400">
                Orders placed by this wholesale shop.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500">
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
                📦
              </span>

              <p className="mt-4 text-sm font-black text-brand-navy">
                No wholesale orders yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Orders from this shop will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Orders */}
              <div className="divide-y divide-slate-100 md:hidden">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/wholesale-orders/${order.id}`}
                    className="block p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-brand-coral">
                          {order.order_number}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-black capitalize ${getOrderStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-sm font-black text-brand-navy">
                          ₹
                          {Number(
                            order.total_amount
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Payment
                        </p>

                        <p className="mt-1 truncate text-xs font-bold capitalize text-slate-600">
                          {order.payment_status}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-right text-[10px] font-black text-brand-coral">
                      View Order →
                    </p>
                  </Link>
                ))}
              </div>

              {/* Desktop Orders */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Order
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Total
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Payment
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-slate-400">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/wholesale-orders/${order.id}`}
                            className="text-xs font-black text-brand-coral transition hover:text-brand-navy"
                          >
                            {order.order_number}
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-4 text-sm font-black text-brand-navy">
                          ₹
                          {Number(
                            order.total_amount
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold capitalize text-slate-500">
                          {order.payment_status}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1.5 text-[9px] font-black capitalize ${getOrderStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/wholesale-orders/${order.id}`}
                            className="inline-flex rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-black text-white transition hover:bg-brand-navy/90"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="h-8" />
      </div>
    </main>
  );
}