"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { saveDemoSession } from "@/features/auth/demoSession";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

const views: { id: UserRole | "apply"; label: string; href: string }[] = [
  { id: "admin", label: "Admin", href: routes.admin.root },
  { id: "brand", label: "Brand view", href: routes.brand.root },
  { id: "creator", label: "Creator view", href: routes.creator.root },
  { id: "apply", label: "Creator apply", href: routes.public.apply },
];

export function ViewSwitcher({ active }: { active: UserRole | "apply" }) {
  const router = useRouter();

  function open(id: UserRole | "apply", href: string) {
    if (id !== "apply") {
      saveDemoSession({
        role: id,
        displayName: id[0].toUpperCase() + id.slice(1),
        email: `${id}@ubunifu.dev`,
      });
      router.push(href);
      return;
    }
    router.push(href);
  }

  return (
    <div className="flex flex-wrap gap-1">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => open(view.id, view.href)}
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
    </div>
  );
}
