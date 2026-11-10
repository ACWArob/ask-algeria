/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Make sure the corpus/index ship with the serverless functions.
  outputFileTracingIncludes: {
    // Server code reads these at runtime (corpus, index, page-state, accuracy report).
    "/api/ask": ["./data/*.json"],
    "/api/search": ["./data/*.json"],
    "/prepare": ["./data/*.json"],
    "/embassies/[id]": ["./data/*.json"],
    "/glossary": ["./data/*.json"],
    "/status": ["./data/*.json"],
    "/services/passport": ["./data/*.json"],
    "/services/[slug]": ["./data/*.json"],
    "/directory": ["./data/*.json"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Private demo only; PUBLIC_SITE=1 (set before the build) lets search engines index the site.
          ...(process.env.PUBLIC_SITE === "1" || process.env.PUBLIC_SITE === "true" ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
          // Basic hardening: no framing (clickjacking), no MIME sniffing, no full URLs leaked to other sites.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Scripts, styles, fonts and API calls only from this site ('unsafe-inline' is needed by Next's inline bootstrap).
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
