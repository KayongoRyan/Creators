"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import type { UserRole } from "@/types";
import { marketingType } from "@/lib/marketing";
import { isValidEmail } from "@/lib/validators";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("creator");
  const [error, setError] = useState("");

  return (
    <form
      noValidate
      className="mt-8 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const displayName = String(data.get("displayName") ?? "").trim();
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");

        if (!displayName) {
          setError("Enter your name to continue.");
          return;
        }

        if (!isValidEmail(email)) {
          setError("Enter a valid email address.");
          return;
        }

        if (password.length < 8) {
          setError("Use a password with at least 8 characters.");
          return;
        }

        saveDemoSession({ role, displayName, email });
        router.replace(getRoleHome(role));
      }}
    >
      <DemoRolePicker value={role} onChange={setRole} />
      <label className={marketingType.formLabel}>
        Display name
        <input
          name="displayName"
          autoComplete="name"
          placeholder="Your name"
          required
          className={marketingType.formInput}
        />
      </label>
      <label className={marketingType.formLabel}>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={marketingType.formInput}
        />
      </label>
      <label className={marketingType.formLabel}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={marketingType.formInput}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className={`${marketingType.ctaPrimary} w-full`}>
        Create account
      </button>
      <p className="text-xs leading-5 text-gray-500">
        Frontend demo only. Account details stay in this browser; passwords are
        not stored.
      </p>
    </form>
  );
}
