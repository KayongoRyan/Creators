"use client";

import { WorkspaceAppHeader } from "@/components/layout/WorkspaceAppHeader";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";

type NavItem = { href: string; label: string };

type WorkspaceMarketingShellProps = {
  role: Extract<UserRole, "creator" | "brand">;
  nav: NavItem[];
  children: React.ReactNode;
  className?: string;
};

export function WorkspaceMarketingShell({
  role,
  nav,
  children,
  className,
}: WorkspaceMarketingShellProps) {
  return (
    <MarketingThemeProvider>
      <WorkspaceAppHeader nav={nav} role={role} />
      <main
        className={cn(
          "min-h-screen bg-mkt-bg text-mkt-fg",
          "pt-[calc(7.25rem+env(safe-area-inset-top,0px))] lg:pt-[calc(4.5rem+env(safe-area-inset-top,0px))]",
          className,
        )}
      >
        <div className="mx-auto w-full max-w-[90rem] px-[max(1.25rem,env(safe-area-inset-left,0px))] pb-9 pt-2 sm:px-8 sm:pt-4">
          {children}
        </div>
      </main>
    </MarketingThemeProvider>
  );
}
