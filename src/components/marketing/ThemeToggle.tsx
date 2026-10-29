"use client";

import { useMarketingTheme } from "@/components/marketing/MarketingThemeProvider";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useMarketingTheme();

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-mkt-border bg-mkt-muted p-0.5",
        className,
      )}
      role="group"
      aria-label="Color theme"
    >
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => setTheme(option)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition",
            theme === option
              ? "bg-mkt-accent text-mkt-on-accent shadow-sm"
              : "text-mkt-muted hover:text-mkt-fg",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
