"use client";

import Link from "next/link";
import { useState } from "react";

type FormData = {
  shopName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const initialForm: FormData = {
  shopName: "",
  ownerName: "",
  phone: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function WholesaleRegisterPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.shopName.trim()) {
      setError("Please enter your shop name.");
      return;
    }

    if (!form.ownerName.trim()) {
      setError("Please enter owner name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your shop address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/wholesale/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopName: form.shopName.trim(),
          ownerName: form.ownerName.trim(),
          phone: form.phone,
          gstNumber: form.gstNumber.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit registration."
        );
      }

      setMessage(
        "Your wholesale registration has been submitted successfully. Our team will review your application."
      );

      setForm(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit registration."
      );
    } finally {
      setLoading(false);
    }
  };

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

            <Link
              href="/wholesale/login"
              className="transition hover:text-[#f43f5e]"
            >
              Wholesale
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-[#172554]">
              Registration
            </span>
          </nav>
        </div>
      </section>

      <section className="container-shop px-4 py-7 sm:py-10">
        <div className="mx-auto max-w-5xl">
          {/* Page Intro */}
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Intro Panel */}
            <div className="relative overflow-hidden rounded-3xl bg-[#172554] p-6 text-white shadow-sm sm:p-8">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#f43f5e]/10"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl">
                    🎁
                  </div>

                  <div>
                    <p className="font-serif text-lg font-black leading-none">
                      Shree Collection
                    </p>

                    <p className="mt-1 text-[9px] font-medium tracking-[0.08em] text-white/60">
                      श्री कलेक्शन
                    </p>
                  </div>
                </Link>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#fda4af]/20 bg-[#f43f5e]/10 px-3 py-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                    aria-hidden="true"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#fda4af]">
                    Wholesale Partner Program
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                  Grow your business with wholesale pricing.
                </h1>

                <p className="mt-4 text-sm leading-6 text-white/65">
                  Register your shop to access wholesale products,
                  bulk pricing and business ordering.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    ["🏷️", "Wholesale Pricing", "Special pricing for approved accounts."],
                    ["📦", "Bulk Ordering", "Order products in larger quantities."],
                    ["🤝", "Business Account", "Dedicated wholesale shopping experience."],
                  ].map(([icon, title, description]) => (
                    <div
                      key={title}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm">
                        {icon}
                      </span>

                      <div>
                        <p className="text-xs font-black">
                          {title}
                        </p>

                        <p className="mt-0.5 text-[10px] leading-4 text-white/50">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Form Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-xl">
                    🏪
                  </div>

                  <div>
                    <h2 className="text-base font-black text-[#172554]">
                      Business Registration
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Tell us about your shop
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-7 p-5 sm:p-7"
              >
                {/* Shop Details */}
                <section>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-base">
                      🏪
                    </div>

                    <div>
                      <h2 className="text-base font-black text-[#172554]">
                        Shop Details
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Enter your business details.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {/* Shop Name */}
                    <div>
                      <label
                        htmlFor="shopName"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        Shop Name *
                      </label>

                      <input
                        id="shopName"
                        type="text"
                        value={form.shopName}
                        onChange={(event) =>
                          updateField(
                            "shopName",
                            event.target.value
                          )
                        }
                        placeholder="Enter shop name"
                        autoComplete="organization"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                      />
                    </div>

                    {/* Owner Name */}
                    <div>
                      <label
                        htmlFor="ownerName"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        Owner Name *
                      </label>

                      <input
                        id="ownerName"
                        type="text"
                        value={form.ownerName}
                        onChange={(event) =>
                          updateField(
                            "ownerName",
                            event.target.value
                          )
                        }
                        placeholder="Enter owner name"
                        autoComplete="name"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </section>

                {/* Contact Details */}
                <section className="border-t border-slate-200 pt-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-base">
                      📱
                    </div>

                    <div>
                      <h2 className="text-base font-black text-[#172554]">
                        Contact Details
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        How we can reach you.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {/* Mobile */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        Mobile Number *
                      </label>

                      <div className="flex">
                        <span className="flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-600">
                          +91
                        </span>

                        <input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={form.phone}
                          onChange={(event) =>
                            updateField(
                              "phone",
                              event.target.value.replace(
                                /\D/g,
                                ""
                              )
                            )
                          }
                          placeholder="10-digit mobile number"
                          autoComplete="tel"
                          disabled={loading}
                          className="w-full rounded-r-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                        />
                      </div>

                      <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
                        Used to identify your wholesale account.
                      </p>
                    </div>

                    {/* GST */}
                    <div>
                      <label
                        htmlFor="gstNumber"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        GST Number{" "}
                        <span className="font-normal text-slate-400">
                          (Optional)
                        </span>
                      </label>

                      <input
                        id="gstNumber"
                        type="text"
                        value={form.gstNumber}
                        onChange={(event) =>
                          updateField(
                            "gstNumber",
                            event.target.value.toUpperCase()
                          )
                        }
                        placeholder="Enter GST number"
                        maxLength={15}
                        autoComplete="off"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="border-t border-slate-200 pt-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1f3] text-base">
                      📍
                    </div>

                    <div>
                      <h2 className="text-base font-black text-[#172554]">
                        Shop Address
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Where your business is located.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {/* Address */}
                    <div>
                      <label
                        htmlFor="address"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        Address *
                      </label>

                      <textarea
                        id="address"
                        rows={3}
                        value={form.address}
                        onChange={(event) =>
                          updateField(
                            "address",
                            event.target.value
                          )
                        }
                        placeholder="Enter complete shop address"
                        autoComplete="street-address"
                        disabled={loading}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                      />
                    </div>

                    {/* City + State */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-1.5 block text-xs font-black text-slate-700"
                        >
                          City *
                        </label>

                        <input
                          id="city"
                          type="text"
                          value={form.city}
                          onChange={(event) =>
                            updateField(
                              "city",
                              event.target.value
                            )
                          }
                          placeholder="City"
                          autoComplete="address-level2"
                          disabled={loading}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="mb-1.5 block text-xs font-black text-slate-700"
                        >
                          State *
                        </label>

                        <input
                          id="state"
                          type="text"
                          value={form.state}
                          onChange={(event) =>
                            updateField(
                              "state",
                              event.target.value
                            )
                          }
                          placeholder="State"
                          autoComplete="address-level1"
                          disabled={loading}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="sm:max-w-[220px]">
                      <label
                        htmlFor="pincode"
                        className="mb-1.5 block text-xs font-black text-slate-700"
                      >
                        Pincode *
                      </label>

                      <input
                        id="pincode"
                        type="tel"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(event) =>
                          updateField(
                            "pincode",
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="6-digit pincode"
                        autoComplete="postal-code"
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10 disabled:bg-slate-50"
                      />
                    </div>
                  </div>
                </section>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600"
                  >
                    <span aria-hidden="true">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div
                    role="status"
                    className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700"
                  >
                    <span aria-hidden="true">✓</span>
                    <span>{message}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="border-t border-slate-200 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f43f5e] px-5 py-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Wholesale Registration
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-[10px] leading-5 text-slate-500">
                    Your wholesale account will remain pending
                    until it is reviewed and approved by Shree
                    Collection.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Back to Store */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-sm"
            >
              ← Back to Store
            </Link>

            <span className="text-slate-300">•</span>

            <Link
              href="/wholesale/login"
              className="text-xs font-black text-[#172554] transition hover:text-[#f43f5e] sm:text-sm"
            >
              Wholesale Login →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}