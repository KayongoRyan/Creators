"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { loginWithPassword } from "@/lib/api";
import { isValidEmail } from "@/lib/validators";

const inputClass =
  "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!isValidEmail(cleaned) || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = await loginWithPassword({
        email: cleaned,
        password,
        role: "admin",
      });
      if (result.role !== "admin") {
        setError("This account is not an admin.");
        return;
      }
      saveDemoSession({
        role: "admin",
        displayName: result.email.split("@")[0] || "Admin",
        email: result.email,
      });
      const home = getRoleHome("admin");
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

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-mkt-bg px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg border border-black/10 bg-white p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Admin console
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Use the admin email and password for this environment.
        </p>

        <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input
              type="email"
              autoComplete="username"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ubunifu.dev"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
