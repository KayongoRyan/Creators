"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { routes } from "@/config/routes";
import {
  clearPendingSignup,
  readPendingSignup,
  writePendingSignup,
  type PendingSignupSession,
} from "@/features/auth/pendingSignup";
import { OTP_LENGTH, OTP_TTL_SECONDS, otpExpiresIn } from "@/features/auth/otp";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { signupResend, signupVerify } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

function remainingOtpSeconds(issuedAt?: number) {
  const start = issuedAt ?? Date.now();
  return Math.max(
    0,
    OTP_TTL_SECONDS - Math.floor((Date.now() - start) / 1000),
  );
}

export function VerifyEmailOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<PendingSignupSession | null>(null);
  const [ready, setReady] = useState(false);
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(OTP_TTL_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const emailFromQuery = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const roleFromQuery = searchParams.get("role");

  useEffect(() => {
    const stored = readPendingSignup();
    if (stored) {
      const next = {
        ...stored,
        otpIssuedAt: stored.otpIssuedAt ?? Date.now(),
      };
      writePendingSignup(next);
      setSession(next);
      setExpiresIn(remainingOtpSeconds(next.otpIssuedAt));
      setReady(true);
      return;
    }
    if (
      emailFromQuery &&
      (roleFromQuery === "creator" || roleFromQuery === "brand")
    ) {
      const fallback: PendingSignupSession = {
        email: emailFromQuery,
        role: roleFromQuery,
        displayName: emailFromQuery.split("@")[0] || "User",
        otpIssuedAt: Date.now(),
      };
      writePendingSignup(fallback);
      setSession(fallback);
      setExpiresIn(OTP_TTL_SECONDS);
    }
    setReady(true);
  }, [emailFromQuery, roleFromQuery]);

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
  const joinHref = session
    ? `${routes.auth.join}?${new URLSearchParams({
        role: session.role,
        mode: "signup",
      }).toString()}`
    : routes.auth.join;

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

  async function onVerify(e?: React.FormEvent) {
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
    setPending(true);
    setError("");
    try {
      const result = await signupVerify({
        email: session.email,
        token: code,
        role: session.role,
      });
      saveDemoSession(
        {
          role: result.role as UserRole,
          displayName: session.displayName,
          email: result.email,
          address: session.address,
          phone: session.phone,
          ...(session.role === "creator"
            ? { birthDate: session.birthDate, niches: session.niches }
            : {}),
        },
        { method: "register" },
      );
      clearPendingSignup();
      const home = getRoleHome(result.role as UserRole);
      if (typeof window !== "undefined") {
        window.location.assign(home);
        return;
      }
      router.replace(home);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid verification code.");
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (!session || expiresIn > 0 || pending) return;
    setPending(true);
    setError("");
    try {
      const result = await signupResend({
        email: session.email,
        role: session.role,
      });
      const next = {
        ...session,
        bypass: Boolean(result.bypass),
        otpIssuedAt: Date.now(),
      };
      writePendingSignup(next);
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
          Verify your email
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          No pending signup found. Start from the join form so we can email you a
          code.
        </p>
        <Link
          href={routes.auth.join}
          className="mt-8 inline-flex min-h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white"
        >
          Back to join
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-mkt-bg px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg border border-black/10 bg-white p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Almost there
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-black">{session.email}</span>. It
          expires in 60 seconds and can only be used once.
        </p>
        <p className="mt-2 text-sm font-medium text-gray-900">
          {expiresIn > 0
            ? `Code expires in ${expiresIn}s`
            : "Code expired — request a new one."}
        </p>

        <form className="mt-8 space-y-6" onSubmit={(e) => void onVerify(e)}>
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
            {pending ? "Verifying…" : "Verify email"}
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
          <Link href={joinHref} className="font-medium text-gray-600 hover:text-black">
            Use a different email
          </Link>
        </div>
      </div>
    </div>
  );
}
