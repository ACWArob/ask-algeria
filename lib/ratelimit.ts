/** Tiny fixed-window in-memory rate limiter. Per serverless instance only; good enough for a demo. */
const buckets = new Map<string, { start: number; count: number }>();

let lastSweep = 0;
const MAX_BUCKETS = 20_000;

export function rateLimit(key: string, limit: number, windowMs = 60_000, now = Date.now()): { ok: boolean; retryAfter: number } {
  // Sweep expired windows at most once per window (not on every call), then hard-cap the map: a flood of unique
  // addresses can't make each call loop over everything or grow memory without bound.
  if (buckets.size > 5000 && now - lastSweep > windowMs) {
    lastSweep = now;
    for (const [k, b] of buckets) if (now - b.start > windowMs) buckets.delete(k);
  }
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
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
  let ip: string;
  if (env.VERCEL) ip = first("x-vercel-forwarded-for") || first("x-real-ip");
  else if (env.NETLIFY) ip = first("x-nf-client-connection-ip");
  // Elsewhere (local dev, another host) forwarding headers are only trusted behind a known proxy.
  else if (env.TRUST_PROXY === "1") ip = first("x-forwarded-for") || first("x-real-ip");
  else ip = "";
  return ip ? ipKey(ip) : "unknown";
}

/**
 * One key per connection: IPv4 as is, IPv6 cut to its /64 network. One home connection gets a whole /64, so a
 * full IPv6 address would give a fresh quota on every request.
 */
export function ipKey(ip: string): string {
  const v = ip.replace(/^\[|\]$/g, "").split("%")[0];
  if (!v.includes(":")) return v;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  const [head, tail = ""] = v.toLowerCase().split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const full = v.includes("::") ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t] : h;
  return `${full.slice(0, 4).map((x) => x.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}
