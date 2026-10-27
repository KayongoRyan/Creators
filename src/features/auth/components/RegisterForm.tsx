"use client";

import { Button } from "@/components/ui/Button";
import { isValidEmail } from "@/lib/validators";

export function RegisterForm() {
  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") ?? "");
        if (!isValidEmail(email)) return;
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Display name
        <input
          name="displayName"
          required
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <Button type="submit">Create account</Button>
    </form>
  );
}
