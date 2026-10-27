import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        surface: v("surface"),
        ink: v("ink"),
        muted: v("muted"),
        line: v("line"),
        brand: v("brand"),
        "brand-ink": v("brand-ink"),
        "brand-soft": v("brand-soft"),
        accent: v("accent"),
        alert: v("alert"),
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: { prose: "44rem" },
    },
  },
  plugins: [],
};
export default config;
