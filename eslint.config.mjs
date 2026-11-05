// ESLint 9 flat config (Next 16 removed `next lint`). Same rules as before: next/core-web-vitals.
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  { ignores: [".next/**", "node_modules/**", "lib/*.d.mts", "data/**", "next-env.d.ts"] },
  {
    // React Compiler readiness rules (new in eslint-plugin-react-hooks 7). We don't use the compiler, and the flagged
    // patterns (reading localStorage in an effect, refs mirroring state, full-page redirect to /login) are intended.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
];

export default config;
