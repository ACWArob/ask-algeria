# Cost and spending protection

Prices checked 2026-11-03 on the Claude pricing page (per million tokens): Claude Haiku 5.5 $0.10 in / $0.50 out
(×5 above 100k prompt tokens), Claude Sonnet 5.5 $2 in / $10 out. Token counts below are estimates from our prompt
sizes (~3 characters per token, more for Arabic); the real numbers are in the `[ask]` / `[spend]` logs.

## What each action costs

| Action | Model calls | Estimated cost |
|---|---|---|
| Search, guides, embassies, Prepare my file | none | $0 (Vercel only) |
| Written answer, cache hit | none | $0 |
| Written answer | Haiku: ~7k tokens in (rules ~2.3k + 8 page excerpts ~3–5k), ~400–900 out; plus a ~0.5k-token query rewrite for ~30% of questions | ≈ $0.001 (max ≈ $0.0016) |
| Written answer, worst case (2 Haiku failures → Sonnet fallback) | Sonnet | ≈ $0.03 (rare) |
| Translate a photo / short text | Haiku: ~1.6k image tokens + up to 1.8k out | ≈ $0.001 |
| Translate a PDF (capped at 10 pages) | Haiku: ~1.5–3k tokens per page | ≈ $0.003–0.004 |

## Average visitor (assumptions: 2 searches, 40% ask for written answers, 1.5 answers each, 10% translate one document)

≈ $0.0007–0.001 in Claude per visitor → about **$1 per 1,000 visitors**, **~$100 per 100,000 visitors**.
Vercel: the free Hobby tier is for non-commercial use; a paid plan (about $20/month plus usage at the time of writing — check vercel.com/pricing) may cost more than the AI at this scale.

## Protection (lib/spend.ts)

| Layer | Setting | Default |
|---|---|---|
| Kill switch (AI off, free search keeps working) | `AI_DISABLED=1` | off |
| Daily budget (from real token usage; per instance unless the shared store is set up) | `AI_DAILY_BUDGET_USD` | 5 |
| Written answers per visitor per day | `AI_DAILY_PER_IP` | 40 |
| Document translations per visitor per day | `TRANSLATE_DAILY_PER_IP` | 10 |
| PDF pages per translation (PDFs whose pages can't be counted: max 1.5 MB) | `TRANSLATE_MAX_PDF_PAGES` | 10 |
| Requests per minute per visitor (existing) | `RATE_LIMIT_PER_MIN` | 20 |
| Upload size / question length / answer length (existing) | lib/config.ts | 5 MB / 1,000 chars / 1,400 tokens |
| Site password (existing) | `SITE_PASSWORD` | on |

The visitor's IP is read only from the header Vercel sets (`x-vercel-forwarded-for`), so quotas can't be reset by faking headers. No retry or Sonnet fallback runs once the day's budget is spent.

Without a shared store, counters are in memory, so each Vercel instance has its own budget — a few instances can spend
a few × $5/day. With the optional shared store (below) the budget and quotas are global.
**The hard ceiling must be set in the Claude Console:** Settings → Workspaces → (the site's workspace, not the
default one) → Spend limits → Monthly limit, plus an email notification at e.g. 50% and 80%. Use an API key from that
workspace only for this site.

Before going public without the password: add Vercel Firewall rate-limiting / bot protection, and set up the shared
store below so the daily budget is global.

## Shared store (optional)

`lib/kv.ts` is a tiny Upstash Redis REST client (fetch only, no SDK). When configured, the daily spend total, the
per-visitor daily quotas and the answer cache are shared by all instances. Not configured → everything stays in memory,
exactly as before. The per-minute rate limit always stays in memory.

Setup: Vercel → the project → **Storage** (Marketplace) → **Upstash Redis** → create/connect a database to the project.
The env vars are added automatically (`KV_REST_API_URL` + `KV_REST_API_TOKEN`; `UPSTASH_REDIS_REST_URL` +
`UPSTASH_REDIS_REST_TOKEN` also work). Redeploy. Optional: `KV_TIMEOUT_MS` (default 300), `ANSWER_CACHE=memory` to keep
the answer cache per instance.

Keys: `aa:spend:<day>` (expires after 2 days), `aa:quota:<kind>:<day>:<hashed IP>` (2 days; raw IPs are never stored),
`aa:ans:<hash>` (answer cache TTL, 24 h).

Fail-safe: each store request times out after ~300 ms and never throws. If the store is down, AI requests use the
in-memory counters (budget and quotas still apply per instance — never unlimited), the answer cache uses memory only,
and the store is skipped for 15 s before trying again. Free search never touches the store.

Commands (each command in a pipeline counts): only `/api/ask` and `/api/translate` use the store.

| Request | Commands (HTTP requests) |
|---|---|
| Search, guides, embassies | 0 |
| Written answer, cache miss | ~7: cache GET 1 + guard 3 (GET total, INCR + EXPIRE quota) + spend 2 (INCRBYFLOAT + EXPIRE) + cache SET 1; +2 when the query rewrite runs (~30%) → ~7.6 (4–5 requests) |
| Follow-up answer (not cached) | ~7: guard 3 + spend 2 per model call (rewrite + answer) |
| Written answer, cache hit | 0 (this instance's memory) or 1 (GET) |
| Already blocked visitor | 0 |
| Document translation | 5 (guard 3 + spend 2) |

With the visitor assumptions above (0.6 written answers and 0.1 translations per visitor), 10,000 visitors ≈ 6,000 × 7.6
+ 1,000 × 5 ≈ **50,000 commands**. Upstash's free tier should cover that; check the current limits on Upstash's pricing
page before relying on it.
