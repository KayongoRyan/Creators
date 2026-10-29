/** https://coolors.co/palette/000814-001d3d-003566-ffc300-ffd60a */
export const palette = {
  ink: "#000814",
  navy: "#001d3d",
  blue: "#003566",
  gold: "#ffc300",
  yellow: "#ffd60a",
} as const;

export type MarketingTheme = "light" | "dark";

export const marketingThemeStorageKey = "creators-marketing-theme";

export function readStoredMarketingTheme(): MarketingTheme | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(marketingThemeStorageKey);
  if (value === "light" || value === "dark") return value;
  return null;
}

export function resolveMarketingTheme(stored: MarketingTheme | null): MarketingTheme {
  if (stored) return stored;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}
