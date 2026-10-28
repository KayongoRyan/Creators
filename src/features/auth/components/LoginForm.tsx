"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import type { UserRole } from "@/types";
import { marketingType } from "@/lib/marketing";
import { isValidEmail } from "@/lib/validators";

export function LoginForm() {
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
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");

        if (!isValidEmail(email)) {
          setError("Enter a valid email address.");
          return;
        }

        if (!password) {
          setError("Enter a password to continue.");
          return;
        }

        saveDemoSession({
          role,
          displayName: email.split("@")[0] || "Creator",
          email,
        });
        router.replace(getRoleHome(role));
      }}
    >
      <DemoRolePicker
        value={role}
        onChange={setRole}
        excludedRoles={["admin"]}
      />
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
          autoComplete="current-password"
          required
          className={marketingType.formInput}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className={`${marketingType.ctaPrimary} w-full`}>
        Sign in
      </button>
      <p className="text-xs leading-5 text-gray-500">
        Frontend demo only. Any password is accepted and is not stored.
      </p>
    </form>
  );
}
