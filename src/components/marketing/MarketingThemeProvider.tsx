"use client";

import { useEffect } from "react";
import { marketingThemeStorageKey } from "@/lib/theme/marketingTheme";

function applyLightTheme() {
  document.documentElement.setAttribute("data-marketing-theme", "light");
  document.documentElement.style.colorScheme = "light";
  localStorage.setItem(marketingThemeStorageKey, "light");
}

export function MarketingThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyLightTheme();
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-mkt-bg text-mkt-fg antialiased selection:bg-mkt-accent selection:text-mkt-on-accent supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]">
      {children}
    </div>
  );
}
