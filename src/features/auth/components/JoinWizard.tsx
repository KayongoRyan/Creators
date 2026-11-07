"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { creatorNicheGroups } from "@/features/creators/data/creatorNiches";
import { routes } from "@/config/routes";
import { loginWithPassword, signupWithPassword } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import { isValidEmail } from "@/lib/validators";
import type { UserRole } from "@/types";

const STEP_LABELS = {
  creator: ["Profile", "Location", "Creator", "Payout", "Verify"],
  brand: ["Profile", "Location", "Business", "Payout", "Verify"],
} as const;

const inputClass =
  "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

type JoinMode = "signup" | "login";

export function JoinWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "brand" ? "brand" : "creator";
  const initialMode: JoinMode =
    searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<JoinMode>(initialMode);
  const [role, setRole] = useState<Extract<UserRole, "creator" | "brand">>(
    initialRole,
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const stepLabels = STEP_LABELS[role];
  const totalSteps = stepLabels.length;
  const isLogin = mode === "login";

  const sectionTitle = useMemo(() => {
    if (isLogin) return "Welcome back";
    if (role === "brand") {
      return ["Profile details", "Location", "Business information", "Payout details", "Verify account"][step];
    }
    return ["Profile details", "Location", "Creator profile", "Payout details", "Verify account"][step];
  }, [isLogin, role, step]);

  async function completeLogin() {
    if (!isValidEmail(email) || !password) {
      setError("Wrong password");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await loginWithPassword({
        email: email.trim(),
        password,
        role,
      });
      saveDemoSession({
        role: result.role as UserRole,
        displayName: displayName.trim() || email.split("@")[0] || "User",
        email: result.email,
      });
      router.replace(getRoleHome(result.role as UserRole));
    } catch {
      setError("Wrong password");
    } finally {
      setPending(false);
    }
  }

  async function completeSignup() {
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (role === "creator" && selectedNiches.length === 0) {
      setError("Choose at least one niche.");
      return;
    }

    const name =
      role === "brand" ? businessName.trim() || displayName.trim() : displayName.trim();
    setPending(true);
    setError("");
    try {
      const result = await signupWithPassword({
        email: email.trim(),
        password,
        role,
        displayName: name,
      });
      saveDemoSession({
        role: result.role as UserRole,
        displayName: name,
        email: result.email,
        address,
        phone,
        ...(role === "creator" ? { birthDate, niches: selectedNiches } : {}),
      });
      router.replace(getRoleHome(result.role as UserRole));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create that account.");
    } finally {
      setPending(false);
    }
  }

  function validateStep(): boolean {
    setError("");
    if (isLogin) return true;

    if (step === 0) {
      if (!displayName.trim()) {
        setError(role === "brand" ? "Enter your name." : "Enter your full name.");
        return false;
      }
      if (!isValidEmail(email)) {
        setError("Enter a valid email address.");
        return false;
      }
    }
    if (step === 1) {
      if (!address.trim() || !phone.trim()) {
        setError("Complete your location and phone number.");
        return false;
      }
      if (role === "creator" && !birthDate) {
        setError("Enter your date of birth.");
        return false;
      }
    }
    if (step === 2 && role === "brand") {
      if (
        !businessName.trim() ||
        !businessType.trim() ||
        !identificationNumber.trim()
      ) {
        setError("Complete business name, type, and identification number.");
        return false;
      }
    }
    if (step === 2 && role === "creator") {
      if (selectedNiches.length === 0) {
        setError("Choose at least one niche.");
        return false;
      }
    }
    if (step === 3) {
      if (!bankName.trim() || !accountNumber.trim()) {
        setError("Add payout details to continue (demo placeholders are fine).");
        return false;
      }
    }
    return true;
  }

  async function onNext() {
    if (!validateStep()) return;
    if (step >= totalSteps - 1) {
      await completeSignup();
      return;
    }
    setStep((s) => s + 1);
  }

  function onPrevious() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-mkt-bg px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl border border-black/10 bg-white p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Create your profile
          </h1>
          <div className="grid w-full max-w-xs grid-cols-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:w-auto">
            <button
              type="button"
              aria-pressed={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setStep(0);
                setError("");
              }}
              className={cn(
                "min-h-10 px-4 text-sm font-semibold",
                mode === "signup" ? "bg-white text-black" : "bg-transparent text-gray-600",
              )}
            >
              Sign up
            </button>
            <button
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={cn(
                "min-h-10 px-4 text-sm font-semibold",
                mode === "login" ? "bg-black text-white" : "bg-transparent text-gray-600",
              )}
            >
              Log in
            </button>
          </div>
        </div>

        {!isLogin ? (
          <ol className="mt-8 flex justify-between gap-2">
            {stepLabels.map((label, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <li key={label} className="flex flex-1 flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full text-sm font-semibold",
                      active && "border-2 border-black bg-black text-white",
                      done && !active && "bg-black text-white",
                      !done && !active && "bg-gray-200 text-gray-500",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "mt-2 hidden text-xs sm:block",
                      active || done ? "font-medium text-black" : "text-gray-500",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <div className="mt-8 border-t border-black/10 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {sectionTitle}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {isLogin
              ? "Sign in with an existing account. Email and password are checked on the server."
              : "Provide the details below to set up your workspace."}
          </p>

          <div className="mt-6 space-y-5">
            {(isLogin || step === 0) && (
              <>
                <DemoRolePicker
                  value={role}
                  onChange={(next) => {
                    if (next === "creator" || next === "brand") setRole(next);
                  }}
                  excludedRoles={["admin"]}
                />
                {!isLogin ? (
                  <label className="block text-sm font-medium text-gray-700">
                    {role === "brand" ? "Your name" : "Full name"}
                    <input
                      className={inputClass}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={role === "brand" ? "Contact name" : "First and last name"}
                    />
                  </label>
                ) : (
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="font-normal text-gray-500">(optional)</span>
                    <input
                      className={inputClass}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </label>
                )}
                <label className="block text-sm font-medium text-gray-700">
                  Email
                  <input
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </>
            )}

            {!isLogin && step === 1 ? (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                  <input
                    className={inputClass}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, city, country"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Phone number
                  <input
                    type="tel"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                {role === "creator" ? (
                  <label className="block text-sm font-medium text-gray-700">
                    Date of birth
                    <input
                      type="date"
                      className={inputClass}
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </label>
                ) : null}
              </>
            ) : null}

            {!isLogin && step === 2 && role === "brand" ? (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Business name
                  <input
                    className={inputClass}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your company"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Business type
                  <select
                    className={inputClass}
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option value="">Select from list</option>
                    <option value="retail">Retail</option>
                    <option value="saas">SaaS</option>
                    <option value="agency">Agency</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Identification number
                  <input
                    className={inputClass}
                    value={identificationNumber}
                    onChange={(e) => setIdentificationNumber(e.target.value)}
                    placeholder="Registration or tax ID"
                  />
                </label>
              </>
            ) : null}

            {!isLogin && step === 2 && role === "creator" ? (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-gray-700">Your niches</legend>
                <div className="flex flex-wrap gap-2">
                  {creatorNicheGroups.flatMap((g) =>
                    g.niches.map((niche) => {
                      const on = selectedNiches.includes(niche.label);
                      return (
                        <button
                          key={niche.label}
                          type="button"
                          onClick={() =>
                            setSelectedNiches((cur) =>
                              on
                                ? cur.filter((n) => n !== niche.label)
                                : [...cur, niche.label],
                            )
                          }
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium",
                            on ? "bg-black text-white" : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {niche.label}
                        </button>
                      );
                    }),
                  )}
                </div>
              </fieldset>
            ) : null}

            {!isLogin && step === 3 ? (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Bank name
                  <input
                    className={inputClass}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Account number
                  <input
                    className={inputClass}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </label>
              </>
            ) : null}

            {(isLogin || (!isLogin && step === 4)) && (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                  <input
                    type="password"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </label>
                {!isLogin ? (
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm password
                    <input
                      type="password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </label>
                ) : null}
              </>
            )}

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            {!isLogin && step > 0 ? (
              <button
                type="button"
                onClick={onPrevious}
                className="text-sm font-semibold text-black"
              >
                ‹ Previous
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (pending) return;
                if (isLogin) {
                  void completeLogin();
                  return;
                }
                void onNext();
              }}
              className="ml-auto inline-flex min-h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending
                ? "Working…"
                : isLogin
                  ? "Log in ›"
                  : step === totalSteps - 1
                    ? "Finish ›"
                    : "Next ›"}
            </button>
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-500">
            {isLogin
              ? "Demo accounts: admin@ubunifu.dev, brand@ubunifu.dev, creator@ubunifu.dev — password CreatorsDemo1!"
              : "Creates a real account. Email and password are checked on the server."}
          </p>
        </div>
      </div>
    </div>
  );
}
