"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { readDemoSession } from "@/features/auth/demoSession";
import { recordPlatformEvent } from "@/lib/analytics/platformEvents";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/apply": "Apply",
  "/join": "Join",
  "/login": "Sign in",
  "/register": "Create account",
  "/admin": "Admin dashboard",
  "/admin/analytics": "Platform analytics",
  "/admin/campaigns": "Admin campaigns",
  "/admin/creators": "Admin creators",
  "/admin/brands": "Admin brands",
  "/admin/submissions": "Admin submissions",
  "/admin/payments": "Admin payments",
  "/brand": "Brand dashboard",
  "/brand/campaigns": "Brand campaigns",
  "/brand/invoices": "Brand invoices",
  "/brand/reports": "Brand contact",
  "/creator": "Creator dashboard",
  "/creator/campaigns": "Creator discover",
  "/creator/tasks": "Creator tasks",
  "/creator/submissions": "Creator submissions",
  "/creator/earnings": "Creator earnings",
  "/creator/applications": "Creator profile",
};

function pageLabel(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const match = Object.keys(pageTitles)
    .filter((path) => path !== "/" && pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? pageTitles[match] : pathname;
}

/** Records every route visited so the admin audit trail sees all activity. */
export function RouteActivityTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;

    const session = readDemoSession();
    const label = pageLabel(pathname);

    recordPlatformEvent({
      actorName: session?.displayName ?? "Guest visitor",
      actorRole: session?.role ?? "guest",
      action: "page_view",
      summary: `Viewed ${label} (${pathname})`,
      targetLabel: label,
      href: pathname,
      source: pathname,
      severity: "info",
    });
  }, [pathname]);

  return null;
}
