"use client";

import { marketingType } from "@/lib/marketing";
import { isValidEmail } from "@/lib/validators";

export function LoginForm() {
  return (
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const email = String(data.get("email") ?? "");
        if (!isValidEmail(email)) return;
      }}
    >
      <label className={marketingType.formLabel}>
        Email
        <input
          name="email"
          type="email"
          required
          className={marketingType.formInput}
        />
      </label>
      <label className={marketingType.formLabel}>
        Password
        <input
          name="password"
          type="password"
          required
          className={marketingType.formInput}
        />
      </label>
      <button type="submit" className={`${marketingType.ctaPrimary} w-fit`}>
        Sign in
      </button>
    </form>
  );
}
