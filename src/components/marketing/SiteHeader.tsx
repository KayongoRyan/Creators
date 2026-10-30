"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { marketingJoinCta } from "@/config/navigation";
import { routes } from "@/config/routes";
import {
  clearDemoSession,
  readDemoSession,
  type DemoSession,
} from "@/features/auth/demoSession";
import type { UserRole } from "@/types";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  workspaceRole?: UserRole;
};

const pillNav: NavItem[] = [
  { href: "#", label: "Careers" },
  { href: routes.creator.root, label: "Creators", workspaceRole: "creator" },
  { href: routes.brand.root, label: "Business", workspaceRole: "brand" },
];

const navGroupClass =
  "mkt-nav-group inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const navLinkClass =
  "mkt-nav-link inline-flex shrink-0 items-center rounded-full px-5 py-3 font-mono text-sm font-semibold uppercase tracking-[0.1em] transition-colors";

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

function NavLinks({
  linkClassName,
  onWorkspaceClick,
}: {
  linkClassName: string;
  onWorkspaceClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    role: UserRole,
  ) => void;
}) {
  return (
    <>
      {pillNav.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={(event) => {
            if (item.workspaceRole) {
              onWorkspaceClick(event, item.workspaceRole);
            }
          }}
          className={linkClassName}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    setSession(readDemoSession());
  }, [pathname]);

  function handleWorkspaceClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    role: UserRole,
  ) {
    const currentSession = readDemoSession();
    if (currentSession?.role === role) return;

    event.preventDefault();
    const authRoute = currentSession ? routes.auth.login : routes.auth.register;
    router.push(`${authRoute}?role=${role}`);
  }

  function handleLogOut() {
    clearDemoSession();
    setSession(null);
    router.replace(routes.public.home);
  }

  const shellPadding =
    "px-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:px-8 lg:px-10";

  return (
    <header
      className={cn(
        "left-0 right-0 top-0 z-40",
        onHome ? "fixed" : "sticky",
        "bg-mkt-bg/90 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none",
      )}
    >
      <div className={cn("mx-auto w-full max-w-[90rem]", shellPadding)}>
        <div className="relative flex min-h-[3.75rem] items-center justify-between gap-3 sm:min-h-[4.5rem]">
          <Logo variant="wordmark" className="relative z-20 shrink-0 text-mkt-fg" />

          {/* Desktop: single centered pill (hidden on mobile/tablet) */}
          <nav
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-center lg:flex"
            aria-label="Primary"
          >
            <div className={cn(navGroupClass, "pointer-events-auto")}>
              <NavLinks
                linkClassName={navLinkClass}
                onWorkspaceClick={handleWorkspaceClick}
              />
            </div>
          </nav>

          <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-3">
            {session ? (
              <details className="relative">
                <summary
                  aria-label="Open profile menu"
                  title="Profile"
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
                  <p className="truncate text-sm font-semibold">
                    {session.displayName}
                  </p>
                  <p className="mt-1 break-all text-xs text-mkt-fg-muted">
                    {session.email}
                  </p>
                  {session.role === "creator" && session.niches?.length ? (
                    <p className="mt-3 border-t border-mkt-border pt-3 text-xs leading-5 text-mkt-fg-muted">
                      Niches: {session.niches.join(", ")}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogOut}
                    className="mt-4 w-full rounded-md border border-mkt-border px-3 py-2 text-left text-sm font-medium text-mkt-fg transition hover:bg-mkt-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent"
                  >
                    Log out
                  </button>
                </div>
              </details>
            ) : (
              <>
                <Link
                  href={routes.auth.login}
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-mkt-fg-muted hover:text-mkt-fg sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href={marketingJoinCta.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full bg-mkt-nav-join px-5 py-3 sm:px-7 sm:py-3.5",
                    "font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--m-nav-join-fg)]",
                    "transition hover:bg-mkt-nav-join-hi active:scale-[0.98]",
                  )}
                >
                  {marketingJoinCta.label}
                  <JoinArrowIcon className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile / tablet: one scroll row — never shown at lg+ */}
        <nav
          className={cn("flex w-full pb-2 pt-0.5 lg:hidden", navGroupClass)}
          aria-label="Primary mobile"
        >
          <NavLinks
            linkClassName={cn(navLinkClass, "px-4 py-2.5 text-xs")}
            onWorkspaceClick={handleWorkspaceClick}
          />
        </nav>
      </div>
    </header>
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
