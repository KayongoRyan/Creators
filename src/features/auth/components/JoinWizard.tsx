"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { isAdminOnlyPortal } from "@/lib/portal/devScope";
import { creatorNicheGroups } from "@/features/creators/data/creatorNiches";
import { routes } from "@/config/routes";
import { writePendingSignup } from "@/features/auth/pendingSignup";
import { loginWithPassword, signupStart, signupWithPassword } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import { firstPasswordError, isValidEmail } from "@/lib/validators";
import type { UserRole } from "@/types";

const STEP_LABELS = {
  creator: ["Profile", "Location", "Creator", "Payout", "Password"],
  brand: ["Profile", "Location", "Business", "Payout", "Password"],
} as const;

const PASSWORD_STEP = 4;

const inputClass =
  "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

type JoinMode = "signup" | "login";

export function JoinWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminPortal = isAdminOnlyPortal();
  const roleParam = searchParams.get("role");
  const initialRole: UserRole = adminPortal
    ? "admin"
    : roleParam === "brand" || roleParam === "admin" || roleParam === "creator"
      ? roleParam
      : "creator";
  const initialMode: JoinMode =
    adminPortal || searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<JoinMode>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
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

<<<<<<< Updated upstream
  const isLogin = mode === "login";
  const signupRole: Extract<UserRole, "creator" | "brand"> =
    role === "brand" ? "brand" : "creator";
  const stepLabels = STEP_LABELS[signupRole];
  const totalSteps = stepLabels.length;
=======
  useEffect(() => {
    if (adminPortal) setRole("admin");
  }, [adminPortal]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "login") setMode("login");
    else if (modeParam === "signup") setMode("signup");
    if (adminPortal) return;
    const rp = searchParams.get("role");
    if (rp === "brand" || rp === "creator") setRole(rp);
  }, [searchParams, adminPortal]);

  const isLogin = mode === "login";
  const signupRole: Extract<UserRole, "creator" | "brand" | "admin"> = adminPortal
    ? "admin"
    : role === "brand"
      ? "brand"
      : "creator";
  const isAdminSignup = adminPortal && !isLogin;
  const stepLabels = STEP_LABELS[adminPortal ? "creator" : signupRole];
>>>>>>> Stashed changes

  const sectionTitle = useMemo(() => {
    if (isLogin) return "Welcome back";
    if (signupRole === "brand") {
      return [
        "Profile details",
        "Location",
        "Business information",
        "Payout details",
        "Choose a password",
      ][step];
    }
<<<<<<< Updated upstream
    return ["Profile details", "Location", "Creator profile", "Payout details", "Verify account"][step];
  }, [isLogin, signupRole, step]);
=======
    return [
      "Profile details",
      "Location",
      "Creator profile",
      "Payout details",
      "Choose a password",
    ][step];
  }, [adminPortal, isLogin, signupRole, step]);
>>>>>>> Stashed changes

  async function completeLogin() {
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setPending(true);
    setError("");
    const loginRole = adminPortal ? "admin" : role;
    try {
      const result = await loginWithPassword({
        email: email.trim(),
        password,
        role: loginRole,
      });
<<<<<<< Updated upstream
      const mockProfile = siteConfig.useMockData
        ? lookupMockCredential(result.email, result.role as UserRole)
        : null;
=======
>>>>>>> Stashed changes
      saveDemoSession({
        role: result.role as UserRole,
        displayName: displayName.trim() || email.split("@")[0] || "User",
        email: result.email,
      });
      const home = getRoleHome(result.role as UserRole);
      if (typeof window !== "undefined") {
        window.location.assign(home);
        return;
      }
      router.replace(home);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wrong password");
    } finally {
      setPending(false);
    }
  }

<<<<<<< Updated upstream
  async function completeSignup() {
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
=======
  async function completeAdminSignup() {
    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const passwordIssue = firstPasswordError(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const name = displayName.trim();
    setPending(true);
    setError("");
    try {
      const result = await signupWithPassword({
        email: email.trim(),
        password,
        role: "admin",
        displayName: name,
      });
      saveDemoSession(
        {
          role: "admin",
          displayName: name,
          email: result.email,
        },
        { method: "register" },
      );
      router.replace(getRoleHome("admin"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create that account.");
    } finally {
      setPending(false);
    }
  }

  function signupDisplayName() {
    return signupRole === "brand"
      ? businessName.trim() || displayName.trim()
      : displayName.trim();
  }

  async function startEmailVerification() {
    const passwordIssueSignup = firstPasswordError(password);
    if (passwordIssueSignup) {
      setError(passwordIssueSignup);
>>>>>>> Stashed changes
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (signupRole === "creator" && selectedNiches.length === 0) {
      setError("Choose at least one niche.");
      return;
    }

    const name = signupDisplayName();
    setPending(true);
    setError("");
    try {
      const result = await signupStart({
        email: email.trim(),
        password,
        role: signupRole,
        displayName: name,
        onboarding: {
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          birthDate: birthDate || undefined,
          niches: signupRole === "creator" ? selectedNiches : undefined,
          businessName: businessName.trim() || undefined,
          businessType: businessType.trim() || undefined,
          identificationNumber: identificationNumber.trim() || undefined,
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
        },
      });
      writePendingSignup({
        email: result.email,
        role: signupRole,
        displayName: name,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
        niches: signupRole === "creator" ? selectedNiches : undefined,
        bypass: Boolean(result.bypass),
      });
      const verifyUrl = `${routes.auth.verify}?${new URLSearchParams({
        email: result.email,
        role: signupRole,
      }).toString()}`;
      if (typeof window !== "undefined") {
        window.location.assign(verifyUrl);
        return;
      }
      router.push(verifyUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start signup.");
    } finally {
      setPending(false);
    }
  }

  function validateStep(): boolean {
    setError("");
    if (isLogin) return true;

    if (step === 0) {
      if (!displayName.trim()) {
        setError(signupRole === "brand" ? "Enter your name." : "Enter your full name.");
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
      if (signupRole === "creator" && !birthDate) {
        setError("Enter your date of birth.");
        return false;
      }
    }
    if (step === 2 && signupRole === "brand") {
      if (
        !businessName.trim() ||
        !businessType.trim() ||
        !identificationNumber.trim()
      ) {
        setError("Complete business name, type, and identification number.");
        return false;
      }
    }
    if (step === 2 && signupRole === "creator") {
      if (selectedNiches.length === 0) {
        setError("Choose at least one niche.");
        return false;
      }
    }
    // Payout details are optional at signup — can be completed later in the portal.
    if (step === PASSWORD_STEP) {
      const passwordIssueSignup = firstPasswordError(password);
      if (passwordIssueSignup) {
        setError(passwordIssueSignup);
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    return true;
  }

  async function onNext() {
    if (!validateStep()) return;
    if (step === PASSWORD_STEP) {
      await startEmailVerification();
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
            {adminPortal ? "Admin access" : "Create your profile"}
          </h1>
          {!adminPortal ? (
            <div className="grid w-full max-w-xs grid-cols-2 overflow-hidden rounded-full bg-[#e8e8e8] sm:w-auto">
              <button
                type="button"
                aria-pressed={mode === "signup"}
                onClick={() => {
                  setMode("signup");
                  setStep(0);
                  setError("");
                  if (role === "admin") setRole("creator");
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
          ) : null}
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
            {adminPortal
              ? "Platform staff only. Use your admin email and password."
              : isLogin
                ? "Sign in with an existing account. Email and password are checked on the server."
                : "Provide the details below to set up your workspace."}
          </p>

          <div className="mt-6 space-y-5">
            {(isLogin || step === 0) && (
              <>
                {!adminPortal ? (
                  <DemoRolePicker
                    value={role}
                    onChange={setRole}
                    excludedRoles={["admin"]}
                  />
                ) : null}
                {!isLogin ? (
                  <label className="block text-sm font-medium text-gray-700">
                    {signupRole === "brand" ? "Your name" : "Full name"}
                    <input
                      className={inputClass}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={
                        signupRole === "brand" ? "Contact name" : "First and last name"
                      }
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
                {signupRole === "creator" ? (
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

            {!isLogin && step === 2 && signupRole === "brand" ? (
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

            {!isLogin && step === 2 && signupRole === "creator" ? (
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

<<<<<<< Updated upstream
            {(isLogin || step === 4) && (
=======
            {(isLogin || isAdminSignup || (!isLogin && step === PASSWORD_STEP)) && (
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                  : step === totalSteps - 1
                    ? "Finish ›"
                    : "Next ›"}
=======
                  : isAdminSignup
                    ? "Create account ›"
                    : step === PASSWORD_STEP
                      ? "Send code ›"
                      : "Next ›"}
>>>>>>> Stashed changes
            </button>
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-500">
            {adminPortal
<<<<<<< Updated upstream
              ? siteConfig.useMockData
                ? "Mock: admin@ubunifu.dev / CreatorsDemo1! — or use your existing admin account."
                : "Demo: admin@ubunifu.dev — password CreatorsDemo1!"
=======
              ? isLogin
                ? "Use the admin email and password provisioned for this environment."
                : "Creates an admin account on the server when API signup allows the admin role."
>>>>>>> Stashed changes
              : isLogin
                ? "Use the email and password from creator signup. Pick Creator vs Brand above to match your account."
                : "Creates a real account. After the password step we email a 6-digit code to verify."}
          </p>
        </div>
      </div>
    </div>
  );
}
