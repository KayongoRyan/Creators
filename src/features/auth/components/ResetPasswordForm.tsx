"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { routes } from "@/config/routes";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import {
  clearPendingPasswordReset,
  readPendingPasswordReset,
  writePendingPasswordReset,
  type PendingPasswordResetSession,
} from "@/features/auth/pendingPasswordReset";
import { OTP_LENGTH, OTP_TTL_SECONDS, otpExpiresIn } from "@/features/auth/otp";
import { passwordResend, passwordReset } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import { firstPasswordError } from "@/lib/validators";
import type { UserRole } from "@/types";

const inputClass =
  "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

function remainingOtpSeconds(issuedAt?: number) {
  const start = issuedAt ?? Date.now();
  return Math.max(
    0,
    OTP_TTL_SECONDS - Math.floor((Date.now() - start) / 1000),
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<PendingPasswordResetSession | null>(null);
  const [ready, setReady] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(OTP_TTL_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() ?? "";

  useEffect(() => {
    const stored = readPendingPasswordReset();
    if (stored) {
      const next = {
        ...stored,
        otpIssuedAt: stored.otpIssuedAt ?? Date.now(),
      };
      writePendingPasswordReset(next);
      setSession(next);
      setExpiresIn(remainingOtpSeconds(next.otpIssuedAt));
      setReady(true);
      return;
    }
    if (emailFromQuery) {
      const fallback: PendingPasswordResetSession = {
        email: emailFromQuery,
        otpIssuedAt: Date.now(),
      };
      writePendingPasswordReset(fallback);
      setSession(fallback);
      setExpiresIn(OTP_TTL_SECONDS);
    }
    setReady(true);
  }, [emailFromQuery]);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      setExpiresIn(remainingOtpSeconds(session.otpIssuedAt));
    }, 250);
    return () => window.clearInterval(id);
  }, [session]);

  useEffect(() => {
    if (!ready || !session) return;
    inputsRef.current[0]?.focus();
  }, [ready, session]);

  const code = useMemo(() => digits.join(""), [digits]);

  function setDigitAt(index: number, value: string) {
    const next = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    if (next && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function onKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigits((prev) => {
        const copy = [...prev];
        copy[index - 1] = "";
        return copy;
      });
    }
  }

  function onPaste(raw: string) {
    const cleaned = raw.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!cleaned) return;
    const next = Array(OTP_LENGTH)
      .fill("")
      .map((_, i) => cleaned[i] ?? "");
    setDigits(next);
    const focusAt = Math.min(cleaned.length, OTP_LENGTH - 1);
    inputsRef.current[focusAt]?.focus();
  }

  async function onReset(e?: React.FormEvent) {
    e?.preventDefault();
    if (!session) return;
    if (expiresIn <= 0) {
      setError("Code expired. Request a new one.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    const passwordError = firstPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await passwordReset({
        email: session.email,
        token: code,
        password,
      });
      saveDemoSession({
        role: result.role as UserRole,
        displayName: result.email.split("@")[0] || "User",
        email: result.email,
      });
      clearPendingPasswordReset();
      const home = getRoleHome(result.role as UserRole);
      if (typeof window !== "undefined") {
        window.location.assign(home);
        return;
      }
      router.replace(home);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reset password.");
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (!session || expiresIn > 0 || pending) return;
    setPending(true);
    setError("");
    try {
      const result = await passwordResend({ email: session.email });
      const next = {
        ...session,
        bypass: Boolean(result.bypass),
        otpIssuedAt: Date.now(),
      };
      writePendingPasswordReset(next);
      setSession(next);
      setExpiresIn(otpExpiresIn(result.expiresIn));
      setDigits(Array(OTP_LENGTH).fill(""));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not resend code.");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Reset password
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Start from the forgot password form so we can email you a code.
        </p>
        <Link
          href={routes.auth.forgotPassword}
          className="mt-8 inline-flex min-h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-mkt-bg px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg border border-black/10 bg-white p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Choose a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-black">{session.email}</span>, then set a
          new password. Codes expire in 60 seconds and can only be used once.
        </p>
        <p className="mt-2 text-sm font-medium text-gray-900">
          {expiresIn > 0
            ? `Code expires in ${expiresIn}s`
            : "Code expired — request a new one."}
        </p>

        <form className="mt-8 space-y-6" onSubmit={(e) => void onReset(e)}>
          <fieldset>
            <legend className="sr-only">One-time passcode</legend>
            <div className="flex justify-between gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1}`}
                  maxLength={1}
                  value={digit}
                  disabled={expiresIn <= 0}
                  onChange={(e) => setDigitAt(index, e.target.value)}
                  onKeyDown={(e) => onKeyDown(index, e.key)}
                  onPaste={(e) => {
                    e.preventDefault();
                    onPaste(e.clipboardData.getData("text"));
                  }}
                  className={cn(
                    "h-14 w-full max-w-14 rounded-lg border border-black/15 bg-white text-center text-xl font-semibold text-gray-900 outline-none",
                    "focus:border-black focus:ring-1 focus:ring-black",
                    expiresIn <= 0 && "opacity-50",
                  )}
                />
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-medium text-gray-700">
            New password
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {session.bypass ? (
            <p className="text-xs text-amber-800">
              Dev bypass is on — use code <code>000000</code> within 60s.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || expiresIn <= 0 || code.length !== OTP_LENGTH}
            className="inline-flex min-h-11 w-full items-center justify-center bg-black px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Reset password"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={pending || expiresIn > 0}
            onClick={() => void onResend()}
            className="font-semibold text-black disabled:opacity-50"
          >
            {expiresIn > 0 ? `Resend available in ${expiresIn}s` : "Resend code"}
          </button>
          <Link
            href={routes.auth.forgotPassword}
            className="font-medium text-gray-600 hover:text-black"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}
