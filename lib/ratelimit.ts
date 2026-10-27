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

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-nf-client-connection-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
