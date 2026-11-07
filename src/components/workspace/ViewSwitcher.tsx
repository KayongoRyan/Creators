"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/config/routes";
import { saveDemoSession } from "@/features/auth/demoSession";
import { loginWithPassword } from "@/lib/api";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

const DEMO_PASSWORD = "CreatorsDemo1!";

const views: { id: UserRole | "apply"; label: string; href: string }[] = [
  { id: "admin", label: "Admin", href: routes.admin.root },
  { id: "brand", label: "Brand view", href: routes.brand.root },
  { id: "creator", label: "Creator view", href: routes.creator.root },
  { id: "apply", label: "Creator apply", href: routes.public.apply },
];

export function ViewSwitcher({ active }: { active: UserRole | "apply" }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function open(id: UserRole | "apply", href: string) {
    if (id === "apply") {
      router.push(href);
      return;
    }
    setError("");
    try {
      const result = await loginWithPassword({
        email: `${id}@ubunifu.dev`,
        password: DEMO_PASSWORD,
        role: id,
      });
      saveDemoSession({
        role: result.role as UserRole,
        displayName: id[0].toUpperCase() + id.slice(1),
        email: result.email,
      });
      router.push(href);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not switch view.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => void open(view.id, view.href)}
          className={cn(
            "rounded-full border border-[rgba(31,30,29,0.15)] px-3 py-[5px] text-xs",
            active === view.id
              ? "border-[#141413] bg-[#141413] text-white"
              : "bg-transparent text-[#3d3d3a]",
          )}
        >
          {view.label}
        </button>
      ))}
      <Link href={routes.public.home} className="sr-only">
        Home
      </Link>
      {error ? <span className="ml-2 text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
