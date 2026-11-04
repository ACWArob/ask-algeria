import { NextResponse } from "next/server";
import { portalStatus } from "@/lib/portal-status";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Availability of the main official portals as seen from our server (outside Algeria). One shared check per
 * 10 minutes per instance, whatever the traffic; nothing from the visitor is sent to the portals.
 */
export async function GET(req: Request) {
  const rl = rateLimit(`status:${clientIp(req.headers)}`, 20);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }
  const data = await portalStatus.get();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
