"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRoleHome } from "@/features/auth/demoSession";
import { mktContainer, mktSafeXWide } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

type NavItem = { href: string; label: string };

const navGroupClass =
  "mkt-nav-group inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const navLinkClass =
  "mkt-nav-link inline-flex shrink-0 items-center rounded-full px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition-colors sm:px-5 sm:text-sm";

export function WorkspaceSubNav({
  nav,
  role,
}: {
  nav: NavItem[];
  role: Extract<UserRole, "creator" | "brand">;
}) {
  const pathname = usePathname();
  const home = getRoleHome(role);

  return (
    <div className={cn("border-b border-mkt-border bg-mkt-bg", mktSafeXWide)}>
      <div className={cn(mktContainer, "py-3")}>
        <nav aria-label="Workspace" className={navGroupClass}>
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== home && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  navLinkClass,
                  isActive && "bg-mkt-accent text-mkt-on-accent hover:bg-mkt-accent-hi",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
