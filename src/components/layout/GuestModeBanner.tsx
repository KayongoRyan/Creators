"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types";

export function GuestModeBanner({ role }: { role: Extract<UserRole, "creator" | "brand"> }) {
  const label = role === "creator" ? "creator" : "business";

  return (
    <div
      className="mb-6 flex flex-col gap-3 border border-black/10 bg-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">Guest mode</p>
        <p className="mt-1 text-sm leading-5 text-gray-600">
          You&apos;re previewing the {label} workspace. Join to save your profile and take action
          on campaigns.
        </p>
      </div>
      <Link
        href={`${routes.auth.join}?role=${role}&mode=signup`}
        className="inline-flex shrink-0 items-center justify-center bg-black px-5 py-2.5 text-sm font-semibold text-white"
      >
        Join
      </Link>
    </div>
  );
}
