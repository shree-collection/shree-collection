"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ShopStatus = "pending" | "approved" | "blocked";

type WholesaleShop = {
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
  access_code_created_at: string | null;
  created_at: string;
  updated_at: string;
};

const statusOptions: {
  value: "all" | ShopStatus;
  label: string;
}[] = [
  { value: "all", label: "All Shops" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "blocked", label: "Blocked" },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status: ShopStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "blocked":
      return "bg-red-50 text-red-700 border-red-100";

    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function getStatusDot(status: ShopStatus) {
  switch (status) {
    case "approved":
      return "bg-emerald-500";

    case "pending":
      return "bg-amber-500";

    case "blocked":
      return "bg-red-500";

    default:
      return "bg-slate-400";
  }
}

export default function WholesaleShopsPage() {
  const [shops, setShops] = useState<WholesaleShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | ShopStatus
  >("all");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [generatedAccessCode, setGeneratedAccessCode] =
    useState<{
      shopName: string;
      phone: string;
      code: string;
    } | null>(null);

  // Access codes loaded from the existing shop-detail API.
  const [accessCodes, setAccessCodes] = useState<
    Record<string, string | null>
  >({});

  const [loadingAccessCodeId, setLoadingAccessCodeId] =
    useState<string | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  async function loadShops() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/wholesale-shops",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load wholesale shops."
        );
      }

      setShops(
        Array.isArray(data.shops)
          ? data.shops
          : []
      );

      // Clear previously loaded codes after a fresh refresh.
      setAccessCodes({});
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wholesale shops."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAccessCode(shop: WholesaleShop) {
    if (accessCodes[shop.id] !== undefined) {
      return;
    }

    try {
      setLoadingAccessCodeId(shop.id);
      setError("");

      const response = await fetch(
        `/api/admin/wholesale-shops/${shop.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load access code."
        );
      }

      const code =
        data.shop?.access_code ||
        null;

      setAccessCodes((current) => ({
        ...current,
        [shop.id]: code,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load access code."
      );
    } finally {
      setLoadingAccessCodeId(null);
    }
  }

  function hideAccessCode(shopId: string) {
    setAccessCodes((current) => {
      const next = { ...current };
      delete next[shopId];
      return next;
    });
  }

  async function updateStatus(
    shop: WholesaleShop,
    status: ShopStatus
  ) {
    const actionText =
      status === "approved"
        ? "approve"
        : status === "blocked"
        ? "block"
        : "move back to pending";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} "${shop.shop_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(shop.id);
      setError("");
      setGeneratedAccessCode(null);

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

      /*
       * When a shop is approved, the API may return
       * a newly generated access code.
       *
       * The code is shown immediately here.
       */
      if (
        status === "approved" &&
        data.accessCode
      ) {
        setGeneratedAccessCode({
          shopName: shop.shop_name,
          phone: shop.phone || "",
          code: data.accessCode,
        });

        setAccessCodes((current) => ({
          ...current,
          [shop.id]: data.accessCode,
        }));
      }

      setShops((current) =>
        current.map((item) =>
          item.id === shop.id
            ? {
                ...item,
                ...data.shop,
                status,
                updated_at:
                  new Date().toISOString(),
              }
            : item
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update wholesale shop."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredShops = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return shops.filter((shop) => {
      const matchesSearch =
        !searchText ||
        shop.shop_name
          .toLowerCase()
          .includes(searchText) ||
        (shop.owner_name || "")
          .toLowerCase()
          .includes(searchText) ||
        (shop.phone || "")
          .toLowerCase()
          .includes(searchText) ||
        (shop.city || "")
          .toLowerCase()
          .includes(searchText) ||
        (shop.state || "")
          .toLowerCase()
          .includes(searchText) ||
        (shop.gst_number || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        shop.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [shops, search, statusFilter]);

  const totalCount = shops.length;

  const pendingCount = shops.filter(
    (shop) => shop.status === "pending"
  ).length;

  const approvedCount = shops.filter(
    (shop) => shop.status === "approved"
  ).length;

  const blockedCount = shops.filter(
    (shop) => shop.status === "blocked"
  ).length;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <section className="overflow-hidden rounded-3xl bg-brand-navy shadow-soft">
          <div className="relative px-5 py-6 sm:px-7 sm:py-7">

            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-gold/10" />

            <div className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-brand-coral/10" />

            <div className="relative">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-gold">
                      Wholesale Management
                    </span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Wholesale Shops
                  </h1>

                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
                    Review registrations, manage shop
                    status and control wholesale login
                    access.
                  </p>
                </div>

                <Link
                  href="/admin"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-brand-navy transition hover:bg-slate-50"
                >
                  <span>←</span>
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Total */}
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/5 text-sm">
                🏪
              </span>

              <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                All
              </span>
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
              Total Shops
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-brand-navy">
              {totalCount}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-sm">
                ⏳
              </span>

              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700">
                  ACTION
                </span>
              )}
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
              Pending
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-amber-600">
              {pendingCount}
            </p>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm">
                ✓
              </span>

              <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                Active
              </span>
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
              Approved
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-emerald-600">
              {approvedCount}
            </p>
          </div>

          {/* Blocked */}
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm">
                !
              </span>

              <span className="hidden text-[9px] font-black uppercase tracking-wide text-text-light sm:block">
                Restricted
              </span>
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-text-light">
              Blocked
            </p>

            <p className="mt-1 text-2xl font-black tracking-tight text-red-600">
              {blockedCount}
            </p>
          </div>
        </section>

        {/* Generated Access Code */}
        {generatedAccessCode && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm">
            <div className="p-5 sm:p-6">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-sm text-white">
                      ✓
                    </span>

                    <p className="text-sm font-black text-emerald-800">
                      Wholesale Shop Approved
                    </p>
                  </div>

                  <h2 className="mt-3 text-xl font-black text-brand-navy">
                    {generatedAccessCode.shopName}
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700">
                    Mobile:{" "}
                    <span className="font-bold">
                      {generatedAccessCode.phone || "—"}
                    </span>
                  </p>

                  <p className="mt-3 max-w-xl text-xs leading-5 text-emerald-800">
                    Give this access code to the shop
                    owner. For security, the code is
                    displayed here after generation.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white p-5 text-center shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted">
                    Wholesale Access Code
                  </p>

                  <p className="mt-2 break-all text-2xl font-black tracking-[0.18em] text-brand-navy sm:text-3xl">
                    {generatedAccessCode.code}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setGeneratedAccessCode(null)
                  }
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm">
                ⚠️
              </span>

              <div>
                <p className="text-xs font-black text-red-700">
                  Something went wrong
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadShops}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <section className="mt-6 rounded-3xl border border-border bg-white p-4 shadow-soft sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            {/* Search */}
            <div className="min-w-0 flex-1">
              <label
                htmlFor="shop-search"
                className="mb-2 block text-[10px] font-black uppercase tracking-wider text-text-light"
              >
                Search Shops
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm">
                  🔍
                </span>

                <input
                  id="shop-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search shop, owner, mobile, city or GST..."
                  className="w-full rounded-xl border border-border bg-surface-soft py-3 pl-10 pr-4 text-sm font-medium text-brand-navy outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                />
              </div>
            </div>

            {/* Status */}
            <div className="lg:w-52">
              <label
                htmlFor="status-filter"
                className="mb-2 block text-[10px] font-black uppercase tracking-wider text-text-light"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | ShopStatus
                  )
                }
                className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm font-bold text-brand-navy outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadShops}
              disabled={loading}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-xs font-black text-brand-navy transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              Refresh
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-text-muted">
              Showing{" "}
              <span className="font-black text-brand-navy">
                {filteredShops.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-brand-navy">
                {shops.length}
              </span>{" "}
              shops
            </p>

            {(search ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="w-fit text-xs font-black text-brand-coral transition hover:text-brand-navy"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Shop List */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-white shadow-soft">

          {/* Section Header */}
          <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" />

                <h2 className="text-sm font-black text-brand-navy">
                  Registered Wholesale Shops
                </h2>
              </div>

              <p className="mt-1 text-[10px] text-text-muted">
                Review registration information, access
                codes and shop access.
              </p>
            </div>

            <span className="w-fit rounded-full bg-surface-muted px-3 py-1.5 text-[10px] font-black text-text-muted">
              {filteredShops.length} Results
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-8">
              <div className="grid gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-surface-muted"
                  />
                ))}
              </div>

              <p className="mt-5 text-center text-xs font-semibold text-text-muted">
                Loading wholesale shops...
              </p>
            </div>
          ) : filteredShops.length === 0 ? (
            /* Empty */
            <div className="p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-2xl">
                🏪
              </span>

              <h3 className="mt-4 text-sm font-black text-brand-navy">
                No wholesale shops found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-text-muted">
                Try changing your search term or status
                filter.
              </p>

              {(search ||
                statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-black text-white transition hover:bg-brand-navy/90"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="divide-y divide-border md:hidden">
                {filteredShops.map((shop) => {
                  const isUpdating =
                    updatingId === shop.id;

                  const accessCode =
                    accessCodes[shop.id];

                  const isLoadingCode =
                    loadingAccessCodeId === shop.id;

                  return (
                    <div
                      key={shop.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-brand-navy">
                            {shop.shop_name}
                          </p>

                          <p className="mt-1 truncate text-xs text-text-muted">
                            {shop.owner_name ||
                              "Owner not provided"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black capitalize ${getStatusClass(
                            shop.status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                              shop.status
                            )}`}
                          />

                          {shop.status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 rounded-2xl bg-surface-soft p-4">

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light">
                            Mobile
                          </span>

                          <span className="text-xs font-bold text-brand-navy">
                            {shop.phone || "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light">
                            Location
                          </span>

                          <span className="text-right text-xs font-bold text-brand-navy">
                            {shop.city || "—"}
                            {shop.state
                              ? `, ${shop.state}`
                              : ""}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light">
                            GST
                          </span>

                          <span className="max-w-[55%] truncate text-right text-xs font-bold text-brand-navy">
                            {shop.gst_number ||
                              "Not provided"}
                          </span>
                        </div>

                        {/* Access Code */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light">
                            Access Code
                          </span>

                          <div className="flex items-center gap-2">
                            {accessCode !== undefined ? (
                              accessCode ? (
                                <>
                                  <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-black tracking-wider text-brand-navy shadow-sm">
                                    {accessCode}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      hideAccessCode(
                                        shop.id
                                      )
                                    }
                                    className="text-[10px] font-black text-brand-coral"
                                  >
                                    Hide
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-semibold text-text-muted">
                                  Not available
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  isLoadingCode
                                }
                                onClick={() =>
                                  loadAccessCode(shop)
                                }
                                className="rounded-lg bg-brand-navy px-3 py-1.5 text-[10px] font-black text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
                              >
                                {isLoadingCode
                                  ? "Loading..."
                                  : "View Code"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-light">
                            Registered
                          </span>

                          <span className="text-xs font-bold text-text-muted">
                            {formatDate(
                              shop.created_at
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {shop.status !==
                          "approved" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateStatus(
                                shop,
                                "approved"
                              )
                            }
                            className="rounded-xl bg-emerald-600 px-3 py-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Approve"}
                          </button>
                        )}

                        {shop.status !==
                          "blocked" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateStatus(
                                shop,
                                "blocked"
                              )
                            }
                            className="rounded-xl bg-red-600 px-3 py-3 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Block"}
                          </button>
                        )}

                        {shop.status ===
                          "blocked" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateStatus(
                                shop,
                                "pending"
                              )
                            }
                            className="col-span-2 rounded-xl bg-amber-500 px-3 py-3 text-xs font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Move to Pending"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1220px] text-left">
                  <thead className="border-b border-border bg-surface-soft">
                    <tr>
                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Shop
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Owner
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Mobile
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Location
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        GST
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Access Code
                      </th>

                      <th className="px-5 py-4 text-[9px] font-black uppercase tracking-wider text-text-light">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-wider text-text-light">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShops.map((shop) => {
                      const isUpdating =
                        updatingId === shop.id;

                      const accessCode =
                        accessCodes[shop.id];

                      const isLoadingCode =
                        loadingAccessCodeId ===
                        shop.id;

                      return (
                        <tr
                          key={shop.id}
                          className="border-b border-border last:border-0 transition hover:bg-surface-soft/60"
                        >
                          {/* Shop */}
                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-xs font-black text-brand-navy">
                              {shop.shop_name}
                            </p>

                            <p className="mt-1 text-[9px] text-text-light">
                              Registered{" "}
                              {formatDate(
                                shop.created_at
                              )}
                            </p>
                          </td>

                          {/* Owner */}
                          <td className="px-5 py-4">
                            <p className="max-w-[150px] truncate text-xs font-semibold text-text-muted">
                              {shop.owner_name ||
                                "—"}
                            </p>
                          </td>

                          {/* Mobile */}
                          <td className="px-5 py-4">
                            <p className="text-xs font-semibold text-text-muted">
                              {shop.phone || "—"}
                            </p>
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate text-xs font-semibold text-text-muted">
                              {shop.city || "—"}
                              {shop.state
                                ? `, ${shop.state}`
                                : ""}
                            </p>

                            {shop.pincode && (
                              <p className="mt-1 text-[9px] text-text-light">
                                {shop.pincode}
                              </p>
                            )}
                          </td>

                          {/* GST */}
                          <td className="px-5 py-4">
                            <p className="max-w-[150px] truncate text-xs font-semibold text-text-muted">
                              {shop.gst_number ||
                                "—"}
                            </p>
                          </td>

                          {/* Access Code */}
                          <td className="px-5 py-4">
                            {accessCode !== undefined ? (
                              accessCode ? (
                                <div className="flex items-center gap-2">
                                  <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-black tracking-wider text-brand-navy ring-1 ring-slate-200">
                                    {accessCode}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      hideAccessCode(
                                        shop.id
                                      )
                                    }
                                    className="text-[9px] font-black text-brand-coral transition hover:text-brand-navy"
                                  >
                                    Hide
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-semibold text-text-muted">
                                  Not available
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  isLoadingCode
                                }
                                onClick={() =>
                                  loadAccessCode(shop)
                                }
                                className="rounded-lg bg-brand-navy px-3 py-2 text-[10px] font-black text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isLoadingCode
                                  ? "Loading..."
                                  : "View Code"}
                              </button>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-black capitalize ${getStatusClass(
                                shop.status
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                  shop.status
                                )}`}
                              />

                              {shop.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {shop.status !==
                                "approved" && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      shop,
                                      "approved"
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Approve"}
                                </button>
                              )}

                              {shop.status !==
                                "blocked" && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      shop,
                                      "blocked"
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Block"}
                                </button>
                              )}

                              {shop.status ===
                                "blocked" && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      shop,
                                      "pending"
                                    )
                                  }
                                  className="rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isUpdating
                                    ? "Updating..."
                                    : "Pending"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="h-6" />
      </div>
    </main>
  );
}