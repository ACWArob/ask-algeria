/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Make sure the corpus/index ship with the serverless function on Netlify.
    outputFileTracingIncludes: {
      // Server code reads these at runtime (corpus, index, page-state, accuracy report).
      "/api/ask": ["./data/*.json"],
      "/services/passport": ["./data/*.json"],
      "/services/[slug]": ["./data/*.json"],
      "/directory": ["./data/*.json"],
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
