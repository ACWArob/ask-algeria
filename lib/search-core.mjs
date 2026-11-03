// Shared by the Next.js app (lib/search.ts) and scripts/build-index.mjs.
// Plain ESM JavaScript so the Node build script can import it without a TS step.

export const CHUNK_SIZE = 1200;
export const CHUNK_OVERLAP = 200;
export const INDEX_VERSION = 2;

const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Normalise a token for FR/AR/EN matching: lowercase, strip accents and tashkeel, unify Arabic letter variants. */
export function normalizeTerm(term) {
  let t = term.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  t = t
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
  // Drop the Arabic definite article and common one-letter proclitics on longer words.
  if (/^[؀-ۿ]+$/.test(t)) {
    t = t.replace(/^(وال|بال|كال|فال|لل|ال)(?=[؀-ۿ]{3,})/, "");
  }
  // French elision: l'extrait -> extrait
  t = t.replace(/^(l|d|j|qu|n|s|c|m|t)['’]/, "");
  if (t.length < 2 || STOP.has(t)) return null;
  return stem(t);
}

/**
 * Very light stemming so plural/singular and feminine forms meet (applied to the index and to queries alike):
 * Latin plural -s/-x; Arabic plural -ات / -ين / -ون and the final ه (from ة).
 */
function stem(t) {
  if (/^[a-z0-9]+$/.test(t)) {
    if (t.length > 4 && /[^su]s$/.test(t)) return t.slice(0, -1);
    if (t.length > 4 && /aux$/.test(t)) return t.slice(0, -3) + "al";
    return t;
  }
  if (/^[؀-ۿ]+$/.test(t)) {
    if (t.length >= 5 && t.endsWith("ات")) return t.slice(0, -2);
    if (t.length >= 6 && (t.endsWith("ين") || t.endsWith("ون"))) return t.slice(0, -2);
    if (t.length >= 4 && t.endsWith("ه")) return t.slice(0, -1);
  }
  return t;
}

const STOP = new Set([
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "ou", "en", "au", "aux", "pour", "par", "sur", "dans", "est", "que", "qui", "ce", "se", "il", "je", "mon", "ma", "mes", "comment",
  "the", "of", "and", "to", "in", "is", "for", "on", "how", "do", "can", "my", "an", "or", "what", "with", "at", "be", "it",
  "في", "من", "علي", "الي", "عن", "او", "ما", "هل", "كيف", "واش", "كيفاش",
]);

/** Split text into ~CHUNK_SIZE character windows with CHUNK_OVERLAP overlap, preferring sentence/space boundaries. */
export function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const window = clean.slice(start + Math.floor(size * 0.6), end);
      const m = window.match(/.*[.!?؟।\n]\s/s);
      if (m) end = start + Math.floor(size * 0.6) + m[0].length;
      else {
        const sp = clean.lastIndexOf(" ", end);
        if (sp > start + size * 0.5) end = sp;
      }
    }
    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    let next = end - overlap;
    const sp = clean.indexOf(" ", next);
    if (sp !== -1 && sp < end) next = sp + 1;
    start = Math.max(next, start + 1);
  }
  return chunks.filter(Boolean);
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Accepts anything JSON-ish and returns clean corpus records; tolerant of the real crawled file's quirks. */
export function normalizeCorpus(raw) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.records) ? raw.records : Array.isArray(raw?.items) ? raw.items : [];
  const seen = new Set();
  const out = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    const url = String(r.url ?? r.loadedUrl ?? "").trim();
    const text = String(r.text ?? r.markdown ?? r.content ?? "").trim();
    if (!url || text.length < 40) continue;
    const key = url.replace(/#.*$/, "").replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: String(r.id ?? hash(key)),
      title: String(r.title ?? r.metadata?.title ?? url).trim().slice(0, 300),
      url,
      domain: String(r.domain ?? domainOf(url)).replace(/^www\./, ""),
      lang: String(r.lang ?? r.metadata?.languageCode ?? "").slice(0, 5),
      topic: String(r.topic ?? r.category ?? ""),
      fetched: String(r.fetched ?? r.crawl?.loadedTime ?? ""),
      ...(r.extraction ? { extraction: String(r.extraction) } : {}),
      text,
    });
  }
  return out;
}

/** Turn corpus records into searchable chunks. */
export function buildChunks(records) {
  const chunks = [];
  for (const r of records) {
    chunkText(r.text).forEach((text, i) => {
      chunks.push({ id: `${r.id}#${i}`, docId: r.id, title: r.title, url: r.url, domain: r.domain, lang: r.lang, topic: r.topic, text });
    });
  }
  return chunks;
}

/** MiniSearch options (must be identical at build time and load time). */
export const MINISEARCH_OPTIONS = {
  idField: "id",
  fields: ["title", "text"],
  storeFields: ["docId", "title", "url", "domain", "lang", "topic", "text"],
  processTerm: normalizeTerm,
  searchOptions: {
    boost: { title: 2 },
    // Fuzzy/prefix matching only for longer Latin words: on Arabic and short words it pulls in noise.
    fuzzy: (term) => (term.length >= 6 && /^[a-z]/.test(term) ? 0.15 : false),
    prefix: (term) => term.length >= 4,
    combineWith: "OR",
    processTerm: normalizeTerm,
  },
};
