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
    setSuccessMessage(
      `OTP sent to +91 ${mobile}`
    );
  };

  const verifyOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (otp.length !== 6) {
      setErrorMessage(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    const phone = `+91${mobile}`;

    const { error } =
      await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      "Login successful. Redirecting..."
    );

    window.location.href = "/checkout";
  };

  return (
    <main className="min-h-screen bg-[#FFF9E8] px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Back */}
        <Link
          href="/checkout"
          className="text-sm font-bold text-[#172554]"
        >
          ← Back to Checkout
        </Link>

        {/* Login Card */}
        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFC928] text-3xl">
              🎁
            </div>

            <h1 className="mt-4 text-2xl font-extrabold text-[#172554]">
              Welcome to Shree Collection
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Login using your mobile number.
            </p>
          </div>

          {!otpSent ? (
            <>
              {/* Mobile Number */}
              <div className="mt-7">
                <label
                  htmlFor="mobile"
                  className="text-sm font-bold text-[#172554]"
                >
                  Mobile Number
                </label>

                <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-[#FFC928]">
                  <span className="flex items-center border-r border-gray-200 px-3 text-sm font-semibold text-gray-500">
                    +91
                  </span>

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="Enter mobile number"
                    className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
                  />
                </div>

                {mobile.length > 0 &&
                  mobile.length !== 10 && (
                    <p className="mt-2 text-xs text-red-500">
                      Please enter a valid 10-digit mobile
                      number.
                    </p>
                  )}
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Send OTP */}
              <button
                type="button"
                onClick={sendOtp}
                disabled={
                  mobile.length !== 10 || loading
                }
                className="mt-5 w-full rounded-xl bg-[#FFC928] py-3.5 text-sm font-extrabold text-[#172554] transition hover:bg-[#f5bb00] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              {/* OTP */}
              <div className="mt-7">
                <label
                  htmlFor="otp"
                  className="text-sm font-bold text-[#172554]"
                >
                  Enter OTP
                </label>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit OTP sent to:
                </p>

                <p className="mt-1 text-sm font-bold text-[#172554]">
                  +91 {mobile}
                </p>

                <input
                  id="otp"
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-[#FFC928]"
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">
                  {successMessage}
                </div>
              )}

              {/* Verify OTP */}
              <button
                type="button"
                onClick={verifyOtp}
                disabled={
                  otp.length !== 6 || loading
                }
                className="mt-5 w-full rounded-xl bg-[#FFC928] py-3.5 text-sm font-extrabold text-[#172554] transition hover:bg-[#f5bb00] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
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
                className="mt-4 w-full text-center text-sm font-bold text-[#172554]"
              >
                ← Change Mobile Number
              </button>
            </>
          )}

          {/* Terms */}
          <p className="mt-6 text-center text-[11px] leading-5 text-gray-400">
            By continuing, you agree to Shree Collection's
            Terms & Conditions and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}