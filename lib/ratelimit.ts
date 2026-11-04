/** Tiny fixed-window in-memory rate limiter. Per serverless instance only; good enough for a demo. */
const buckets = new Map<string, { start: number; count: number }>();

export function rateLimit(key: string, limit: number, windowMs = 60_000, now = Date.now()): { ok: boolean; retryAfter: number } {
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now - b.start > windowMs) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { ok: true, retryAfter: 0 };
  }
  b.count++;
  if (b.count > limit) return { ok: false, retryAfter: Math.ceil((b.start + windowMs - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

/**
 * The visitor's IP, read only from the header the hosting platform itself sets. Other headers can be sent by
 * the client, so trusting them would let one person get a fresh quota on every request.
 */
export function clientIp(headers: Headers, env: Record<string, string | undefined> = process.env): string {
  const first = (h: string) => headers.get(h)?.split(",")[0]?.trim() || "";
  if (env.VERCEL) return first("x-vercel-forwarded-for") || first("x-real-ip") || "unknown";
  if (env.NETLIFY) return first("x-nf-client-connection-ip") || "unknown";
  return first("x-nf-client-connection-ip") || first("x-vercel-forwarded-for") || first("x-forwarded-for") || first("x-real-ip") || "unknown";
}
