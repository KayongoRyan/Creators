"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { marketingJoinCta } from "@/config/navigation";
import { routes } from "@/config/routes";
import {
  clearDemoSession,
  getRoleHome,
  readDemoSession,
  type DemoSession,
} from "@/features/auth/demoSession";
import { Logo } from "@/components/marketing/Logo";
import {
  marketingHeaderShellPadding,
  marketingNavGroupClass,
  marketingNavLinkClass,
  marketingWorkspaceHeaderClass,
} from "@/components/marketing/pillNavClasses";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

type NavItem = { href: string; label: string };

function JoinArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspaceAppHeader({
  nav,
  role,
}: {
  nav: NavItem[];
  role: Extract<UserRole, "creator" | "brand">;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const home = getRoleHome(role);

  useEffect(() => {
    setSession(readDemoSession());
  }, [pathname]);

  function handleLogOut() {
    clearDemoSession();
    setSession(null);
    router.replace(routes.public.home);
  }

  const joinHref = `${routes.auth.join}?role=${role}&mode=signup`;
  const compactNav = nav.length > 4;
  const workspaceLinkClass = cn(
    marketingNavLinkClass,
    compactNav && "lg:px-3.5 lg:text-xs lg:tracking-[0.08em]",
  );

  return (
    <header className={marketingWorkspaceHeaderClass}>
      <div className={cn("mx-auto w-full max-w-[90rem]", marketingHeaderShellPadding)}>
        <div className="relative flex min-h-[3.75rem] items-center justify-between gap-3 sm:min-h-[4.5rem]">
          <Logo variant="wordmark" className="relative z-20 shrink-0 text-mkt-fg" />

          <nav
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-center lg:flex"
            aria-label="Workspace"
          >
            <div
              className={cn(
                marketingNavGroupClass,
                "workspace-nav pointer-events-auto transition-[background-color] duration-300",
              )}
            >
              {nav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== home && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={workspaceLinkClass}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-3">
            {session ? (
              <details className="relative">
                <summary
                  aria-label="Open profile menu"
                  className="grid size-11 cursor-pointer list-none place-items-center overflow-hidden rounded-full border border-mkt-border bg-mkt-surface text-sm font-bold text-mkt-fg [&::-webkit-details-marker]:hidden"
                >
                  {session.avatarDataUrl ? (
                    <Image
                      src={session.avatarDataUrl}
                      alt=""
                      width={44}
                      height={44}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    getInitials(session.displayName)
                  )}
                </summary>
                <div className="absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-mkt-border bg-mkt-bg p-4 text-mkt-fg shadow-xl">
                  <p className="truncate text-sm font-semibold">{session.displayName}</p>
                  <p className="mt-1 break-all text-xs text-mkt-fg-muted">{session.email}</p>
                  <button
                    type="button"
                    onClick={handleLogOut}
                    className="mt-4 w-full rounded-md border border-mkt-border px-3 py-2 text-left text-sm font-medium text-mkt-fg transition hover:bg-mkt-muted"
                  >
                    Log out
                  </button>
                </div>
              </details>
            ) : (
              <Link
                href={joinHref}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full bg-mkt-nav-join px-5 py-3 sm:px-7 sm:py-3.5",
                  "font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--m-nav-join-fg)] hover:bg-mkt-nav-join-hi",
                )}
              >
                {marketingJoinCta.label}
                <JoinArrowIcon className="size-4" />
              </Link>
            )}
          </div>
        </div>

        <nav
          className={cn(
            "workspace-nav flex w-full pb-2 pt-0.5 transition-[background-color] duration-300 lg:hidden",
            marketingNavGroupClass,
          )}
          aria-label="Workspace mobile"
        >
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== home && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(workspaceLinkClass, "px-4 py-2.5 text-xs")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
