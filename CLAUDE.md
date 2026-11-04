# CLAUDE.md — Ask Algeria (software)

Independent Q&A site for Algerian government services (en / fr / ar Fusha / dz Darija). Answers only from official pages, with citations. Password-protected demo on Vercel (was Netlify).
Stack: Next.js 14 App Router + TypeScript + Tailwind, Anthropic SDK, MiniSearch, Vercel (Netlify config kept as fallback). Default branch: `main`.

## Commands
```bash
npm i
npm run dev                         # local; MOCK mode answers without Claude calls
npm test                            # vitest, all
npx vitest run tests/x.test.ts      # one file ← prefer this
npm run lint && npm run typecheck
npm run build                       # prebuild rebuilds data/index.json
npm run refresh                     # check-updates → crossref → index (weekly GitHub Action does this)
node scripts/import-apify.mjs <dataset.json>   # add crawled pages to the corpus (Apify dataset id or local .json)
node scripts/crawl-local.mjs --dry-run          # crawler for running from INSIDE Algeria (no deps); see docs/algeria-developer-guide.md
```

## Layout
- `app/(site)/` — pages (home, ask, translate, services/[slug] guides, embassies, directory, about); `app/api/` — search (free, no AI), ask (Claude), translate, login, logout, feedback
- Free search quality: `lib/synonyms.ts` (en/fr/ar/Darija/Arabizi concepts) + coverage scoring in `lib/search.ts`; gate = `tests/search-eval.test.ts` over `qa/search-eval.json` (≥95% top-3). A missed real query → add it to the eval, then fix synonyms.
- Prepare my file: `/prepare` (components/PrepareClient.tsx, lib/prepare*.ts, lib/packet-html.ts, lib/zip.ts). Personal details never leave the browser: no fetch/log of those fields, ever. Letters are our own neutral template, never an imitation of an official form.
- Answer cache: `lib/answer-cache.ts` (first questions only, 24h; shared via Upstash when configured, else per instance; `ANSWER_CACHE=off` disables, `=memory` forces memory) and `lib/expand-local.ts` (skip the LLM query-rewrite when synonyms already cover the question). Watch `[ask]` log lines for hit rate.
- Spending guard: `lib/spend.ts` (AI_DISABLED kill switch, AI_DAILY_BUDGET_USD, per-IP daily quotas, PDF page cap); every model call goes through `allowAi` and `recordSpend`. Optional shared store `lib/kv.ts` (Upstash REST, 300 ms timeout, falls back to memory; never used by free search). Costs and Console spend limit: docs/cost.md.
- Extra pages: `/status` (lib/portal-status.ts, cached checks from our server + tester notes in sources.json), `/embassies/[id]` (lib/mission-page.ts), `/glossary` (lib/glossary.ts), exemption card (lib/exemption.ts, quotes official pages verbatim). Their strings live in lib/i18n-status.ts, lib/i18n-mission.ts, lib/i18n-extra.ts (key-parity tested).
- Quick answer (free, top of results): `lib/quick-answer.ts`. The person's own office pages first (best lines, cited), else the matching guide's points for their office/location, else the best lines of the top pages.
- Location: `lib/where.ts` — picker options, validation, and the office for a saved place (sent as `where` to /api/search and /api/ask).
- Cost model: the first question gets `/api/search` results (lib/instant.ts: guides, office, contacts, official pages); Claude (`/api/ask`, 2 calls: query expansion + answer) only runs for "Get a written answer", chips and follow-ups.
- `lib/` — `posts.ts` (where the person lives → which consulate/APC), `clarify.ts` (ask-first chips), `prompts.ts`, `search.ts` + `search-core.mjs`, `missions.ts`, `detect.ts` (language/topic), `i18n/*.json` (4 languages, keep keys in sync)
- `data/` — `corpus.json` (pages), `sources.json` (sites), `missions.json` (embassies/consulates), `index.json` (generated)
- `scripts/` — crawl, import, refresh, crossref; `tests/` — vitest

## Conventions
- Match surrounding style; no new dependencies without asking.
- Every user-facing string goes in all 4 `lib/i18n/*.json`. Darija is Algerian, never Moroccan.
- Official sources only. Archived copies keep the original URL plus `archived_url` and `extraction: "archived"`.
- Location matching uses Unicode lookarounds, not `\b` (breaks on Arabic).
- `/api/ask` deadline: 25 s on Vercel (`VERCEL` env), 9 s on Netlify (10 s cap); override with ANSWER_DEADLINE_MS. Thinking stays disabled; keep answers fast anyway.

## Testing
- Behavior change ships with a test change. Bugs: failing test first.
- Answer quality: rerun the QA set (76 questions, all 4 languages) against the deploy after prompt/search changes.

## Done means
lint + typecheck + affected tests pass, build passes, and you've said how you verified.

## Git (only when I ask)
Conventional commits: `feat|fix|refactor|test|docs: what + why`. Never commit secrets (ANTHROPIC_API_KEY, SITE_PASSWORD, Apify token).

## Lessons
<!-- date — what broke — the rule. Newest at top. Prune past ~25 lines. -->
- 2026-11-03 — free results showed only links and the user said it didn't help — always lead with the facts themselves (quick answer), links second.
- 2026-11-03 — clientIp trusted `x-nf-client-connection-ip` first, which a client can send on Vercel → unlimited per-IP quota — read only the header the current platform sets.
- 2026-10-31 — "unemployment benefit" found nothing (pages are French), "hajj registration" returned consular registration — cross-language synonyms + rare-word-weighted coverage; measure every search change on the eval (baseline was 86% top-3).
- 2026-10-31 — guessing location from words/connection gave mixed offices — ask "in Algeria (wilaya) / outside (country → consulate)" first (lib/where.ts, saved in the browser); a place or country named in the question still wins.
- 2026-10-31 — every question cost 2 Claude calls even when a guide or official page already answered it — first question = free search results; AI only on request or follow-up. Measure with the `[search]` vs `/api/ask` log lines.
- 2026-10-30 — 15 of our site links were wrong (old/renamed ministry domains) — the tester in Algeria is the check; take her corrected links, keep archived pages under their original URL.
- 2026-10-28 — Lyon passport answer cited Médéa wilaya pages — someone living abroad gets no wilaya-portal sources (category "wilayas" in sources.json).
- 2026-10-28 — guide pages were prebuilt (generateStaticParams) and would ignore the language cookie — pages that read cookies must be `dynamic = "force-dynamic"`.
- 2026-10-28 — follow-up detection matched "son" inside "person" — keyword regexes use Unicode word lookarounds, always.
- 2026-10-28 — user said "France" but got an answer for the connection's city (Ohio) — a named country disables geo; ask which city.
- 2026-10-28 — "hours of the consulate in Beijing" answered for the user's connection city (Ohio) — a mission named in a contact question beats geo; only for contact questions, or "France" would skip the city question.
- 2026-10-28 — "register my marriage in Algeria" (said from abroad) was read as living in Algeria — plain "in Algeria/في الجزائر" is not a residence; only "I live in / ساكن في / j'habite en" counts.
- 2026-10-28 — moved Netlify → Vercel — geo comes from x-vercel-ip-country/-region/-city; data/*.json must stay in outputFileTracingIncludes.
- 2026-10-28 — "register at the consulate" / "apostille" weren't detected as topics in any language, so the bot never asked where you live — test every LOCATION_FIRST topic in en/fr/ar/dz.
- 2026-10-28 — short Arabic follow-ups ("باريس") got English/French answers copied from French sources — check the script of the first ~120 chars and retry once with a language instruction.
- 2026-10-28 — follow-up answers contradicted earlier ones (photo count, phone, office) — send the start of the previous answer with each question and tell the model to stay consistent.
- 2026-10-28 — "in Toronto… go to Montreal?" picked Montreal (longest name won) — pick the place the person lives in ("live in/moved to/ساكن في"), else the first mentioned.
- 2026-10-28 — France/UK/Canada offices pointed at invented `cg<city>.mfa.gov.dz` domains, so boosting did nothing and the bot invented URLs — take every office domain from data/missions.json, never guess a pattern.
- 2026-10-28 — Lyon users got US rules (USPS, 2x2 photos) — exclude other countries' mission domains from search once the country is known.
- 2026-10-28 — "where do you live?" repeated 3× when the user didn't answer — ask once per conversation, then answer generally.
- 2026-10-28 — answer said "the excerpts don't list" — the `<official_excerpts>` tag primed the word; name prompt tags in words the model may repeat to users.
- 2026-10-28 — mfa.gov.dz mission sites time out from outside Algeria — use Wayback `web/2026id_/<url>` via Apify; fill empty fields only, source = archive URL.
- 2026-10-28 — tester headers pasted as one string landed in a single cell — check pasted ranges cell by cell after writing to a Sheet.
- 2026-10-27 — mixed London/NY/DC answer when location was unknown — location-dependent topics ask "where do you live?" first (chips), no LLM call.
- 2026-10-27 — "I think you mean Denver" hedging — state the detected office as fact; banned hedge phrases per language.
- 2026-10-27 — Arabic place names never matched — `\b` is ASCII-only; use `(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])` with `iu`.
- 2026-10-27 — NY/SF consulates missing from answers — boost the person's own office domains in search; check main diaspora posts first.
- 2026-10-26 — "Something went wrong" on Netlify — extended thinking + long answers blew the 10 s limit; keep thinking off, cap tokens.
- 2026-10-26 — streams dropped in Chrome at ~4.5 s — don't tie the stream to `req.signal`; client retries once buffered.
- 2026-10-26 — said an `sk-ant-usr` key wouldn't work; it did — test before claiming a credential is invalid.
