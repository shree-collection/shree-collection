"use client";

import { useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (mobile.length !== 10) {
      setErrorMessage(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    setLoading(true);

    const phone = `+91${mobile}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setOtpSent(true);
    setSuccessMessage(`OTP sent to +91 ${mobile}`);
  };

  const verifyOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (otp.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    const phone = `+91${mobile}`;

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Login successful. Redirecting...");

    window.location.href = "/checkout";
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
              href="/checkout"
              className="transition hover:text-[#f43f5e]"
            >
              Checkout
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-[#172554]">Login</span>
          </nav>
        </div>
      </section>

      {/* Login Area */}
      <section className="container-shop px-4 py-8 sm:py-12">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left Information Panel */}
          <div className="relative hidden overflow-hidden bg-[#172554] p-8 text-white lg:block">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-[#f43f5e]/10"
              aria-hidden="true"
            />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                🎁
              </div>

              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-[#fda4af]">
                Shree Collection
              </p>

              <h2 className="mt-2 text-3xl font-black leading-tight">
                Welcome back.
                <br />
                Let&apos;s continue shopping.
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/70">
                Login with your mobile number to continue to
                checkout and complete your order.
              </p>

              <div className="mt-auto space-y-3 pt-10">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f43f5e] text-sm">
                    🔐
                  </span>

                  <div>
                    <p className="text-xs font-black">
                      Secure OTP Login
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/50">
                      No password required
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f43f5e] text-sm">
                    🛍️
                  </span>

                  <div>
                    <p className="text-xs font-black">
                      Easy Checkout
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/50">
                      Continue your shopping journey
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="p-5 sm:p-8">
            {/* Mobile Brand */}
            <div className="text-center lg:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f3] text-2xl">
                🎁
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#f43f5e]">
                Shree Collection
              </p>
            </div>

            <div className="mt-5 text-center lg:mt-0 lg:text-left">
              <h1 className="text-2xl font-black tracking-tight text-[#172554] sm:text-3xl">
                {otpSent ? "Enter your OTP" : "Login to continue"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {otpSent
                  ? "Enter the 6-digit OTP sent to your mobile number."
                  : "Login using your mobile number to continue to checkout."}
              </p>
            </div>

            {!otpSent ? (
              <>
                {/* Mobile Number */}
                <div className="mt-7">
                  <label
                    htmlFor="mobile"
                    className="text-xs font-black text-[#172554]"
                  >
                    Mobile Number
                  </label>

                  <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#172554] focus-within:ring-2 focus-within:ring-[#172554]/10">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm font-bold text-slate-500">
                      +91
                    </span>

                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(event) =>
                        setMobile(
                          event.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Enter mobile number"
                      className="min-w-0 flex-1 px-3.5 py-3.5 text-sm font-medium text-[#172554] outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {mobile.length > 0 &&
                    mobile.length !== 10 && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        Please enter a valid 10-digit mobile
                        number.
                      </p>
                    )}
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600">
                    <span aria-hidden="true">⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Send OTP */}
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={mobile.length !== 10 || loading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f43f5e] py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* OTP Information */}
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    OTP sent to
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[#172554]">
                      +91 {mobile}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-[11px] font-black text-[#f43f5e] transition hover:text-[#e11d48]"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                <div className="mt-5">
                  <label
                    htmlFor="otp"
                    className="text-xs font-black text-[#172554]"
                  >
                    Enter 6-digit OTP
                  </label>

                  <input
                    id="otp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="000000"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-4 text-center text-xl font-black tracking-[0.45em] text-[#172554] outline-none transition placeholder:text-slate-300 focus:border-[#172554] focus:ring-2 focus:ring-[#172554]/10"
                  />
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium leading-5 text-red-600">
                    <span aria-hidden="true">⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success */}
                {successMessage && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-xs font-medium leading-5 text-green-600">
                    <span aria-hidden="true">✓</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Verify */}
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otp.length !== 6 || loading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f43f5e] py-3.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e11d48] hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>

                {/* Change Number */}
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="mt-4 w-full text-center text-xs font-black text-[#172554] transition hover:text-[#f43f5e]"
                >
                  ← Change Mobile Number
                </button>
              </>
            )}

            {/* Security Note */}
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <span className="text-sm" aria-hidden="true">
                🔒
              </span>

              <p className="text-[10px] leading-5 text-slate-500">
                Your mobile number is used to securely verify
                your account. No password is required.
              </p>
            </div>

            {/* Terms */}
            <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">
              By continuing, you agree to Shree Collection&apos;s{" "}
              <span className="font-semibold text-slate-500">
                Terms &amp; Conditions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-slate-500">
                Privacy Policy
              </span>
              .
            </p>

            {/* Back to Shopping */}
            <Link
              href="/shop"
              className="mt-5 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-[#172554] transition hover:border-[#f43f5e]/30 hover:bg-[#fff1f3]"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}