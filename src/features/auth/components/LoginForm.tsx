"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { DemoRolePicker } from "@/features/auth/components/DemoRolePicker";
import { getRoleHome, saveDemoSession } from "@/features/auth/demoSession";
import { loginWithPassword } from "@/lib/api";
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
  const [pending, setPending] = useState(false);

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") ?? "");
        const password = String(data.get("password") ?? "");

        if (!isValidEmail(email) || !password) {
          setError("Wrong password");
          return;
        }

        setPending(true);
        setError("");
        void loginWithPassword({ email, password, role })
          .then((result) => {
            saveDemoSession({
              role: result.role as UserRole,
              displayName: email.split("@")[0] || "Creator",
              email: result.email,
            });
            router.replace(getRoleHome(result.role as UserRole));
          })
          .catch((reason) => {
            setError(reason instanceof Error ? reason.message : "Wrong password");
          })
          .finally(() => setPending(false));
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

      <InspiredSubmit disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </InspiredSubmit>

      <p className="text-xs leading-5 text-gray-500">
        Demo: creator@ubunifu.dev / CreatorsDemo1!
      </p>
    </form>
  );
}
