import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        palette: {
          black: "#000000",
          white: "#ffffff",
          gray950: "#0a0a0a",
          gray900: "#171717",
          gray800: "#262626",
          gray600: "#525252",
          gray400: "#a3a3a3",
          gray200: "#e5e5e5",
          gray100: "#f5f5f5",
        },
        mkt: {
          bg: "var(--m-bg)",
          muted: "var(--m-bg-muted)",
          surface: "var(--m-surface)",
          accent: "var(--m-accent)",
          "accent-hi": "var(--m-accent-hi)",
          fg: "var(--m-fg)",
          "fg-muted": "var(--m-fg-muted)",
          error: "var(--m-error)",
          "fg-subtle": "var(--m-fg-subtle)",
          border: "var(--m-border)",
          "on-accent": "var(--m-on-accent)",
          "nav-join": "var(--m-nav-join)",
          "nav-join-hi": "var(--m-nav-join-hi)",
        },
      },
      backgroundColor: {
        "mkt-header": "var(--m-header)",
        "mkt-card": "var(--m-card)",
        "mkt-code": "var(--m-code-bg)",
      },
      textColor: {
        "mkt-code": "var(--m-code-fg)",
      },
      fontFamily: {
        sans: [
          "var(--font-figtree)",
          "Figtree",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
