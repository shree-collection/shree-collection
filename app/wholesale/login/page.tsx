"use client";

import Link from "next/link";
import { useState } from "react";

export default function WholesaleLoginPage() {
  const [phone, setPhone] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!accessCode.trim()) {
      setError("Please enter your access code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/wholesale/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          accessCode: accessCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to login.");
      }

      window.location.href = "/wholesale";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffdf7]">
      <div className="container-shop flex min-h-screen items-center px-4 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-md">

          {/* Brand Name */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex flex-col items-center"
            >
              <p className="text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                SHREE COLLECTION | श्री कलेक्शन
              </p>
            </Link>

            {/* Heading */}
            <div className="mt-8">
              <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-[#f43f5e]/15 bg-[#fff1f3] px-3 py-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f43f5e]">
                  Wholesale Portal
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#172554] sm:text-4xl">
                Wholesale Login
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Login with your registered mobile number
                and access code to view wholesale pricing.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

            {/* Card Header */}
            <div className="bg-[#172554] px-6 py-5 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">
                  🏪
                </div>

                <div>
                  <p className="text-sm font-black">
                    Wholesale Account
                  </p>

                  <p className="mt-0.5 text-xs text-white/60">
                    Access your business pricing
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Mobile */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Mobile Number
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
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      disabled={loading}
                      className="w-full rounded-r-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/10 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Access Code */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="accessCode"
                      className="text-sm font-bold text-slate-700"
                    >
                      Access Code
                    </label>

                    <span className="rounded-full bg-[#fff1f3] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#172554]">
                      Required
                    </span>
                  </div>

                  <input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(event) =>
                      setAccessCode(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="Example: SC-123456"
                    autoComplete="off"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-900 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/10 disabled:bg-slate-50"
                  />

                  <div className="mt-2 flex items-start gap-2">
                    <span className="mt-0.5 text-xs">
                      🔐
                    </span>

                    <p className="text-xs leading-5 text-slate-500">
                      Enter the access code provided by
                      Shree Collection.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600"
                  >
                    <span className="shrink-0">
                      ⚠️
                    </span>

                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#f43f5e] px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Logging in...
                    </span>
                  ) : (
                    "Login to Wholesale →"
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-7 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have a wholesale account?
                </p>

                <Link
                  href="/wholesale/register"
                  className="mt-2 inline-flex items-center font-black text-[#172554] transition hover:text-[#f43f5e]"
                >
                  Register Your Shop
                  <span className="ml-1.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Points */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="text-lg" aria-hidden="true">
                🔒
              </div>

              <p className="mt-1 text-[10px] font-bold text-slate-600">
                Secure Access
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="text-lg" aria-hidden="true">
                🏷️
              </div>

              <p className="mt-1 text-[10px] font-bold text-slate-600">
                Wholesale Rates
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="text-lg" aria-hidden="true">
                📦
              </div>

              <p className="mt-1 text-[10px] font-bold text-slate-600">
                Bulk Orders
              </p>
            </div>
          </div>

          {/* Back to Store */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-[#172554]"
            >
              <span>←</span>
              Back to Store
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}