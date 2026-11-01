"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GuestModeBanner } from "@/components/layout/GuestModeBanner";
import { WorkspaceAppHeader } from "@/components/layout/WorkspaceAppHeader";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { cn } from "@/lib/utils/cn";
import {
  getRoleHome,
  readDemoSession,
  type DemoSession,
} from "@/features/auth/demoSession";
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
  const router = useRouter();
  const [guestMode, setGuestMode] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    const currentSession = readDemoSession();

    if (!currentSession) {
      setGuestMode(true);
      setSession(null);
      setIsReady(true);
      return;
    }

    if (currentSession.role !== role) {
      router.replace(getRoleHome(currentSession.role));
      return;
    }

    setGuestMode(false);
    setSession(currentSession);
    setIsReady(true);
  }, [role, router]);

  if (!isReady) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-mkt-bg px-6 text-sm text-mkt-fg-muted"
        aria-live="polite"
      >
        Loading workspace…
      </main>
    );
  }

  return (
    <MarketingThemeProvider>
      <WorkspaceAppHeader nav={nav} role={role} />
      <main className={cn("min-h-[calc(100vh-4.5rem)] bg-mkt-bg text-mkt-fg", className)}>
        {guestMode ? (
          <div className="mx-auto w-full max-w-[90rem] px-[max(1.25rem,env(safe-area-inset-left,0px))] pt-7 sm:px-8">
            <GuestModeBanner role={role} />
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-[90rem] px-[max(1.25rem,env(safe-area-inset-left,0px))] pb-9 pt-4 sm:px-8 sm:pt-6">
          {children}
        </div>
      </main>
    </MarketingThemeProvider>
  );
}
