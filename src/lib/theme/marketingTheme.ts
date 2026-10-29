/** Marketing palette: black & white (+ neutral grays for surfaces). */
export const palette = {
  black: "#000000",
  white: "#ffffff",
  gray950: "#0a0a0a",
  gray900: "#171717",
  gray800: "#262626",
  gray600: "#525252",
  gray400: "#a3a3a3",
  gray200: "#e5e5e5",
  gray100: "#f5f5f5",
} as const;

export type MarketingTheme = "light";

export const marketingThemeStorageKey = "creators-marketing-theme";

export const marketingTheme: MarketingTheme = "light";
