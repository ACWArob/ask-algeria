/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Make sure the corpus/index ship with the serverless function on Netlify.
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
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          // Basic hardening: no framing (clickjacking), no MIME sniffing, no full URLs leaked to other sites.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
