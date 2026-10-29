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
node scripts/import-apify.mjs <dataset.json>   # add crawled pages to the corpus
```

## Layout
- `app/(site)/` — pages (home, ask, translate, services/passport, embassies, sources, about); `app/api/` — ask, translate, login, logout, feedback
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
