"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  marketingThemeStorageKey,
  readStoredMarketingTheme,
  resolveMarketingTheme,
  type MarketingTheme,
} from "@/lib/theme/marketingTheme";

type MarketingThemeContextValue = {
  theme: MarketingTheme;
  setTheme: (theme: MarketingTheme) => void;
  toggleTheme: () => void;
};

const MarketingThemeContext = createContext<MarketingThemeContextValue | null>(
  null,
);

export function MarketingThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<MarketingTheme>("dark");

  useEffect(() => {
    setThemeState(resolveMarketingTheme(readStoredMarketingTheme()));
  }, []);

  const setTheme = useCallback((next: MarketingTheme) => {
    setThemeState(next);
    localStorage.setItem(marketingThemeStorageKey, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(marketingThemeStorageKey, next);
      return next;
    });
  }, []);

  return (
    <MarketingThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        data-marketing-theme={theme}
        className="flex min-h-screen flex-col bg-mkt-bg text-mkt-fg antialiased selection:bg-mkt-accent selection:text-mkt-on-accent"
      >
        {children}
      </div>
    </MarketingThemeContext.Provider>
  );
}

export function useMarketingTheme() {
  const ctx = useContext(MarketingThemeContext);
  if (!ctx) {
    throw new Error("useMarketingTheme must be used within MarketingThemeProvider");
  }
  return ctx;
}
