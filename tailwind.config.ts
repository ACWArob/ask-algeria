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
        door: v("door"),
        "door-ink": v("door-ink"),
        ochre: v("ochre"),
        "ochre-soft": v("ochre-soft"),
        alert: v("alert"),
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: { prose: "44rem" },
      borderRadius: { arch: "10rem 10rem 1.25rem 1.25rem" },
    },
  },
  plugins: [],
};
export default config;
