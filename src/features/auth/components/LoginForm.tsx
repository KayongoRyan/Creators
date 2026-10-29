"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import type { UserRole } from "@/types";
import { marketingType } from "@/lib/marketing";
import { cn } from "@/lib/utils/cn";
import { isValidEmail } from "@/lib/validators";

type LoginFormProps = {
  initialRole: Exclude<UserRole, "admin">;
};

export function LoginForm({ initialRole }: LoginFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(initialRole);
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
      <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={cn(
            marketingType.formInput,
            "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
          )}
        />
      </label>
      <label className={cn(marketingType.formLabel, "text-mkt-fg")}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={cn(
            marketingType.formInput,
            "border-mkt-border bg-mkt-bg-muted text-mkt-fg placeholder:text-mkt-fg-subtle focus:border-mkt-accent",
          )}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-mkt-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-mkt-accent px-5 text-sm font-semibold text-mkt-on-accent transition-colors hover:bg-mkt-accent-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent"
      >
        Sign in
      </button>
      <p className="text-xs leading-5 text-mkt-fg-muted">
        Frontend demo only. Any password is accepted and is not stored.
      </p>
    </form>
  );
}
