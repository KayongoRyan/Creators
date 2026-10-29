"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { marketingJoinCta } from "@/config/navigation";
import { routes } from "@/config/routes";
import { readDemoSession } from "@/features/auth/demoSession";
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
  "mkt-nav-group inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5";

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

  return (
    <header
      className={cn(
        "left-0 right-0 top-0 z-40 bg-transparent",
        onHome ? "fixed" : "sticky",
      )}
    >
      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[90rem] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Logo variant="wordmark" className="text-mkt-fg" />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav
            className={cn("hidden lg:inline-flex", navGroupClass)}
            aria-label="Primary"
          >
            <NavLinks
              linkClassName={navLinkClass}
              onWorkspaceClick={handleWorkspaceClick}
            />
          </nav>

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
        </div>
      </div>

      <nav
        className={cn("mx-5 mb-2 lg:hidden", navGroupClass)}
        aria-label="Primary mobile"
      >
        <NavLinks
          linkClassName={cn(navLinkClass, "text-xs px-4 py-2.5")}
          onWorkspaceClick={handleWorkspaceClick}
        />
      </nav>
    </header>
  );
}
