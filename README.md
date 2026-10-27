# Ask Algeria · سقسي على الجزائر

An **independent** web app where people ask questions about Algerian public services in English, French, Modern Standard Arabic or Algerian Darija and get answers drawn **only** from official Algerian government web pages, with numbered citations.

> **This is not a government website.** It is not affiliated with, endorsed by or operated by the Government of Algeria or any ministry, wilaya or public body. See [Independence requirements](#independence--disclaimer-requirements).

Planned domain: AlgeriaGov.online. For now it is a password-protected demo on Netlify.

## Features

| Route | What it does |
|---|---|
| `/` | Ask a question. PII is redacted in the browser, the answer streams in with `[n]` citations, a sources list and next steps. |
| `/translate` | "Understand an official document": paste text or upload a PDF/image (≤ 5 MB) to get a full translation or a plain-language summary with what to do. Nothing is stored. |
| `/directory` | Official sites from `data/sources.json`, grouped by category, with a filter box. |
| `/about` | How it works, independence, privacy and neutrality, in all 4 languages. |
| `/login` | Password gate (all other routes are protected by `middleware.ts`). |

Languages: `en`, `fr`, `ar` (Fusha) and `dz` (Darija in Arabic script; Latin-script Arabizi input is understood). The UI language is stored in the `aa_lang` cookie. If a question is written in a different language from the UI, the answer comes back in the question's language and a short note says so.

## How answering works

1. **Expand** (`claude-haiku-5-5`): detects the question's language and writes search queries in French, Arabic and English, since official pages are mostly FR/AR.
2. **Search**: MiniSearch (BM25-style, fuzzy and prefix matching, Arabic/French normalisation) over ~800-character chunks with 150-character overlap. The top 8 chunks are kept, at most 3 per page.
3. **Answer** (`claude-sonnet-5-5`): a strict system prompt makes it answer only from the excerpts, cite every fact, say plainly when something isn't covered and point to the right official site, never invent fees, documents or deadlines, give no legal, medical or financial advice, and stay politically neutral.
4. **Stream**: `/api/ask` returns `text/plain`. **Line 1 is a JSON object** (`AskMeta`: answer language, detected language and the numbered sources). Everything after it is the Markdown answer as it streams.

Model names live only in `lib/config.ts`, along with the limits: 20 requests/min per IP (in memory, per instance) and 1000 characters per question.

## Local development

```bash
npm install
cp .env.example .env.local     # set SITE_PASSWORD, plus ANTHROPIC_API_KEY or MOCK_LLM=1
npm run dev                    # http://localhost:3000
```

To run without an API key, set `MOCK_LLM=1`. Every route then works with canned answers and the real search/sources pipeline.

```bash
npm run build && npm start     # production build (runs `npm run index` first via prebuild)
npm test                       # vitest: redaction + auth token sign/verify
npm run lint
```

Note: in production mode the session cookie is `Secure`, so on plain `http://localhost` browsers won't send it back. Use `npm run dev`, or set `INSECURE_COOKIE=1` for a local `npm start`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | **yes** (unless `MOCK_LLM=1`) | Claude API key |
| `SITE_PASSWORD` | **yes** | Shared demo password |
| `AUTH_SECRET` | optional | Separate cookie-signing key. If unset, a key is derived from `SITE_PASSWORD` (HMAC-SHA256 with a fixed app salt). |
| `MOCK_LLM` | optional | `1` = canned responses, no Claude calls |
| `APIFY_TOKEN` | crawl only | Used by `npm run crawl` |
| `CRAWL_MAX_PAGES`, `CRAWL_PRIORITY_MAX`, `CRAWL_MAX_DEPTH`, `CRAWL_MAX_PDFS` | optional | Crawl tuning (defaults: 150, 2, 3, 40) |

## Deploying to Netlify

`netlify.toml` already sets the build command, Node 22, the `@netlify/plugin-nextjs` runtime and a `X-Robots-Tag: noindex` header.

**Option A: connect GitHub**
1. Push this folder to a GitHub repo.
2. In Netlify, go to *Add new site → Import from Git* and pick the repo. Build settings come from `netlify.toml`.
3. Under *Site configuration → Environment variables*, add `ANTHROPIC_API_KEY` and `SITE_PASSWORD`. Those are the only two required.
4. Deploy.

**Option B: CLI**
```bash
npm i -g netlify-cli
netlify login
netlify init                       # or: netlify link
netlify env:set SITE_PASSWORD 'your-password'
netlify env:set ANTHROPIC_API_KEY 'sk-ant-...'
netlify deploy --build --prod
```

### Setting or changing the password
Change `SITE_PASSWORD` in Netlify's environment variables and redeploy. Existing sessions stop working at once because the signing key is derived from the password, unless you have set `AUTH_SECRET`. To sign everyone out without changing the password, set or rotate `AUTH_SECRET`.

Sessions last 7 days and use an httpOnly, Secure, SameSite=Lax cookie with an HMAC token checked in Edge middleware via Web Crypto. Sign out is at `/api/logout`.

## Data files

| File | What | Status |
|---|---|---|
| `data/sources.json` | Official sites: `{ name_en, name_fr, name_ar, domain, url, category, languages, description, priority, reachable, pages? }` | **PLACEHOLDER**: 10 real official domains, written by hand, to be replaced by the curated file |
| `data/seed-corpus.json` | Hand-checked pages: `{ id, title, url, domain, lang, topic, fetched, text }` | **PLACEHOLDER**: 3 dummy records marked `[PLACEHOLDER]`, not real content |
| `data/corpus.json` | What the app searches (seed + crawl, de-duplicated by URL) | Currently a copy of the seed |
| `data/index.json` | Prebuilt MiniSearch index (generated) | Rebuilt on every `npm run build` |

### Swapping in real data
1. Replace `data/sources.json` and/or `data/seed-corpus.json` (and `data/corpus.json`) with the real files.
2. Run `npm run index` (or just `npm run build`, which runs it through `prebuild`).

The loaders are lenient. Unknown categories still render. Missing `name_*` fields fall back to another language. Records without `id`, `domain` or `lang` get derived values. Records with fewer than 40 characters of text are skipped, and duplicate URLs are dropped. Raw Apify fields (`loadedUrl`, `markdown`, `metadata.title`) are accepted too. If `index.json` is missing or out of date, the server builds the index lazily from `corpus.json` (then `seed-corpus.json`) on first request.

Optional `pages` (or `page_count`) on a source shows "N pages indexed" in the directory.

## Crawling with Apify, then re-indexing

```bash
export APIFY_TOKEN=apify_api_...
npm run crawl -- --dry-run                 # show which sites would be crawled
npm run crawl                              # priority 1–2 sites, 150 pages each, depth 3
npm run crawl -- --domains=cnas.dz,mjustice.dz
CRAWL_MAX_PAGES=300 CRAWL_PRIORITY_MAX=3 npm run crawl
npm run index
```

`scripts/crawl.mjs` runs `apify/website-content-crawler` once per site (3 sites at a time). Each run starts from the site's `url`, uses its sitemap, and is limited to the same host and its subdomains through `includeUrlGlobs`. It waits for the run, then downloads the dataset and caches it to `data/apify-raw-<domain>.json` (git-ignored).

**PDFs**: the script collects same-host `.pdf` links from the crawled pages and extracts their text locally with `unpdf` (up to `CRAWL_MAX_PDFS` per site, 15 MB each). Scanned PDFs with no text layer are skipped.

Results are normalised to the corpus schema, merged with `seed-corpus.json` (seed wins on duplicate URLs), de-duplicated by URL and written to `data/corpus.json`. Commit the new `corpus.json` and the next deploy picks it up.

## Privacy

- `lib/redact.ts` runs in the browser before sending, and again on the server as a backstop. It removes Algerian NIN (18 digits), RIP/RIB (20 digits), card numbers, CCP account+key, `+213`/`00213`/`05–07…` mobiles and landlines, emails and passport-like codes, and handles Arabic-Indic digits. The user sees a note when anything is removed.
- No database and no conversation history. Uploaded documents are sent to Claude for that one request and never written to disk.
- Feedback (thumbs up/down) only logs the rating, the answer language and the number of sources. It never logs the question.

## Independence / disclaimer requirements

These are product requirements. Keep them if you change the UI:

- The strip at the top of every page reads "Independent · not a government website" in the active language.
- The footer on every page reads "Independent project · not affiliated with the Government of Algeria".
- Every answer ends with "Always confirm on the official page before you act."
- No state emblem, no "République Algérienne…" header and no flag used as a logo. The brand mark is an open arched doorway with a question mark.
- `/about` states clearly that we can't submit applications or look up personal records, give no legal, tax, medical or financial advice, and stay politically neutral.
- The site is not indexed while it is a demo: `robots.txt` disallows everything, plus `X-Robots-Tag: noindex` and a robots meta tag.

## Project layout

```
app/
  (site)/          ask (/), translate, directory, about, plus the shared header/footer layout
  login/           password page (no JS needed: plain form post)
  api/             ask, translate, login, logout, feedback
  fonts.ts         self-hosted fonts via next/font/local (Bricolage Grotesque, Atkinson Hyperlegible, Noto Kufi Arabic, IBM Plex Sans Arabic)
components/        AskClient, TranslateClient, DirectoryClient, Markdown (citation chips), Header…
lib/
  config.ts        model names, limits, cookie names
  auth.ts          HMAC token sign/verify (Web Crypto) + constant-time compare
  redact.ts        PII redaction
  search-core.mjs  chunking, normalisation, MiniSearch options (shared with scripts)
  search.ts        index loading and multi-query search
  prompts.ts       system prompts (answers, query expansion, translation)
  i18n/            en.json, fr.json, ar.json, dz.json + helpers
data/              sources.json, seed-corpus.json, corpus.json, index.json
scripts/           crawl.mjs (Apify), build-index.mjs
tests/             vitest
middleware.ts      password gate + noindex header
netlify.toml
```
