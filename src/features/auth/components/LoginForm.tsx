"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { saveDemoSession } from "@/features/auth/demoSession";
import type { UserRole } from "@/types";
import {
  InspiredField,
  InspiredSubmit,
  underlineInputClassName,
} from "@/components/shared/inspiredForm";
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
      className="flex flex-col gap-6"
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
        router.replace(routes.public.home);
      }}
    >
      <DemoRolePicker value={role} onChange={setRole} excludedRoles={["admin"]} />

      <InspiredField id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={underlineInputClassName}
        />
      </InspiredField>

      <InspiredField id="password" label="Password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={underlineInputClassName}
        />
      </InspiredField>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <InspiredSubmit>Sign in</InspiredSubmit>

      <p className="text-xs leading-5 text-gray-500">
        Frontend demo only. Any password is accepted and is not stored.
      </p>
    </form>
  );
}
