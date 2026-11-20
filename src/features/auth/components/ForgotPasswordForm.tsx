"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/config/routes";
import { writePendingPasswordReset } from "@/features/auth/pendingPasswordReset";
import { passwordForgot } from "@/lib/api";
import { isValidEmail } from "@/lib/validators";

const inputClass =
  "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      setError("Enter a valid email address.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await passwordForgot({ email: cleaned });
      writePendingPasswordReset({
        email: cleaned,
        bypass: Boolean(result.bypass),
        otpIssuedAt: Date.now(),
      });
      const qs = new URLSearchParams({ email: cleaned }).toString();
      router.push(`${routes.auth.resetPassword}?${qs}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send reset code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-mkt-bg px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg border border-black/10 bg-white p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Forgot password
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your account email and we&apos;ll send a 6-digit code to reset your
          password.
        </p>

        <form className="mt-8 space-y-6" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center bg-black px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send reset code"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Remembered it?{" "}
          <Link
            href={`${routes.auth.join}?mode=login`}
            className="font-medium text-black underline underline-offset-2"
          >
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
