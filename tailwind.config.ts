import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        palette: {
          ink: "#000814",
          navy: "#001d3d",
          blue: "#003566",
          gold: "#ffc300",
          yellow: "#ffd60a",
        },
        mkt: {
          bg: "var(--m-bg)",
          muted: "var(--m-bg-muted)",
          surface: "var(--m-surface)",
          accent: "var(--m-accent)",
          "accent-hi": "var(--m-accent-hi)",
          fg: "var(--m-fg)",
          "fg-muted": "var(--m-fg-muted)",
          "fg-subtle": "var(--m-fg-subtle)",
          border: "var(--m-border)",
          "on-accent": "var(--m-on-accent)",
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
