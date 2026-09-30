"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/admin/orders");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error("Unable to login.");
      }

      // Check that the logged-in user is actually an admin.
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", data.user.id)
          .single();

      if (profileError) {
        await supabase.auth.signOut();

        throw new Error(
          "Admin profile was not found."
        );
      }

      if (profile.user_type !== "admin") {
        await supabase.auth.signOut();

        throw new Error(
          "You do not have admin access."
        );
      }

      router.replace("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-brand-coral/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-navy/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy shadow-lg">
            <span className="text-3xl" aria-hidden="true">
              🎁
            </span>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
              SHREE COLLECTION
            </h1>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-brand-gold" />

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                Admin Panel
              </p>

              <span className="h-px w-8 bg-brand-gold" />
            </div>
          </div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="mt-8 overflow-hidden rounded-3xl border border-border bg-white shadow-card"
        >
          {/* Card Header */}
          <div className="border-b border-border bg-surface-muted px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
                🔐
              </div>

              <div>
                <h2 className="text-lg font-black text-brand-navy">
                  Admin Login
                </h2>

                <p className="mt-0.5 text-xs text-text-muted">
                  Sign in to manage your store.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {/* Fields */}
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
                >
                  Email Address
                </label>

                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden="true"
                  >
                    ✉️
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter admin email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-border bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-text-muted"
                >
                  Password
                </label>

                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden="true"
                  >
                    🔒
                  </span>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-border bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-light focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm">
                    ⚠️
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-black text-red-700">
                      Login failed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600/80">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span
                    className="animate-spin text-base"
                    aria-hidden="true"
                  >
                    ↻
                  </span>

                  Signing in...
                </>
              ) : (
                <>
                  Login to Admin
                  <span aria-hidden="true">
                    →
                  </span>
                </>
              )}
            </button>

            {/* Store Link */}
            <a
              href="/"
              className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold text-text-muted transition hover:text-brand-navy"
            >
              <span aria-hidden="true">←</span>
              Back to Store
            </a>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold text-text-light">
          <span aria-hidden="true">🔒</span>
          <span>Secure admin access</span>
        </div>

        {/* Brand Footer */}
        <p className="mt-3 text-center text-[10px] font-medium text-text-light">
          © {new Date().getFullYear()} Shree Collection
        </p>
      </div>
    </main>
  );
}