import localFont from "next/font/local";

// Self-hosted via next/font/local from @fontsource packages (no Google Fonts fetch at build time).
export const display = localFont({
  src: [{ path: "../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2", weight: "200 800" }],
  variable: "--font-latin-display",
  display: "swap",
});

export const body = localFont({
  src: [
    { path: "../node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2", weight: "700" },
    { path: "../node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-ext-400-normal.woff2", weight: "400" },
  ],
  variable: "--font-latin-body",
  display: "swap",
});

export const arabicDisplay = localFont({
  src: [{ path: "../node_modules/@fontsource-variable/noto-kufi-arabic/files/noto-kufi-arabic-arabic-wght-normal.woff2", weight: "100 900" }],
  variable: "--font-arabic-display",
  display: "swap",
  // Arabic fonts: not preloaded and limited to Arabic letters, so English and French pages don't download ~250 KB
  // they never use (the browser fetches them only when Arabic text is on screen).
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" }],
});

export const arabicBody = localFont({
  src: [
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-arabic-body",
  display: "swap",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F" }],
});

export const fontVars = [display.variable, body.variable, arabicDisplay.variable, arabicBody.variable].join(" ");
