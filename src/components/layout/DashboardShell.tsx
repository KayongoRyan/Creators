"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";
import {
  clearDemoSession,
  getRoleHome,
  readDemoSession,
  type DemoSession,
} from "@/features/auth/demoSession";
import type { UserRole } from "@/types";

type NavItem = { href: string; label: string };

type DashboardShellProps = {
  title: string;
  role: UserRole;
  nav: NavItem[];
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  role,
  nav,
  children,
  className,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const currentSession = readDemoSession();

    if (!currentSession) {
      router.replace(routes.auth.login);
      return;
    }

    if (currentSession.role !== role) {
      router.replace(getRoleHome(currentSession.role));
      return;
    }

    setSession(currentSession);
    setIsReady(true);
  }, [role, router]);

  function handleSignOut() {
    clearDemoSession();
    setSession(null);
    router.replace(routes.auth.login);
  }

  if (!isReady || !session) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#f8faf8] px-6 text-sm text-gray-600"
        aria-live="polite"
      >
        Checking demo workspace...
      </main>
    );
  }

  return (
    <div className={cn("min-h-screen bg-[#f8faf8] lg:flex", className)}>
      <aside className="border-b border-black/10 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-7">
          <div>
            <Link
              href={routes.public.home}
              className="text-base font-semibold tracking-tight text-gray-900"
            >
              Creators
            </Link>
            <p className="mt-1 text-xs font-medium uppercase text-gray-500">
              {title} workspace
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 lg:hidden"
          >
            Sign out
          </button>
        </div>
        <nav
          aria-label={`${title} navigation`}
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:px-4 lg:pb-4"
        >
          {nav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== getRoleHome(role) &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${isActive
                  ? "bg-emerald-50 text-emerald-900"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-black/10 px-5 py-4 lg:block">
          <p className="truncate text-sm font-medium text-gray-900">
            {session.displayName}
          </p>
          <p className="truncate text-xs text-gray-500">{session.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
