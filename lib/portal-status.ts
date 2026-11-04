import rawSources from "@/data/sources.json";
import type { Locale } from "@/lib/i18n";

/**
 * "Is this portal working?" — the most used official portals, what our tester in Algeria saw (from the
 * `notes` in data/sources.json), and a server-side check from outside Algeria. The check only sends a plain
 * GET with no cookies and nothing from the visitor; results are shared by everyone for TTL_MS.
 */

export type InsideResult = "works" | "not_working" | "login_only" | "unknown";
export interface InsideStatus {
  result: InsideResult;
  /** YYYY-MM-DD of the tester's note, or null when there is none. */
  date: string | null;
}

export type OutsideStatus = "up" | "down" | "blocked_or_timeout";
export type CheckError = "timeout" | "dns" | "tls" | "network" | null;
export interface CheckResult {
  id: string;
  outside: OutsideStatus;
  /** Final HTTP status after redirects, or null when nothing came back. */
  code: number | null;
  /** Time to response headers (or to the failure), in ms. */
  ms: number | null;
  error: CheckError;
}
export interface StatusPayload {
  checkedAt: string;
  results: CheckResult[];
}

export interface Portal {
  id: string;
  url: string;
  domain: string;
  category: string;
  names: Record<Locale, string>;
  purpose: Record<Locale, string>;
  insideAlgeria: InsideStatus;
}

export const TIMEOUT_MS = 6_000;
export const TTL_MS = 10 * 60_000;

type L = Record<Locale, string>;

/** Curated: the portals people abroad ask about most. `url` must match an entry in data/sources.json. */
export const CURATED: { id: string; url: string; purpose: L }[] = [
  {
    id: "passport",
    url: "https://passeport.interieur.gov.dz/",
    purpose: {
      en: "Biometric passport and ID card (CNIBE): apply and follow your request.",
      fr: "Passeport et carte d'identité biométriques (CNIBE) : demande et suivi.",
      ar: "جواز السفر وبطاقة التعريف البيومترية: الطلب ومتابعته.",
      dz: "الباسبور ولاكارط ديدونتيتي البيومترية: الطلب وتبّع الدوسي.",
    },
  },
  {
    id: "birth-12s",
    url: "http://demande12s.interieur.gov.dz/",
    purpose: {
      en: "Request the special 12S birth certificate needed for the passport.",
      fr: "Demander l'extrait de naissance spécial 12S exigé pour le passeport.",
      ar: "طلب شهادة الميلاد الخاصة 12خ المطلوبة لجواز السفر.",
      dz: "تطلب شهادة الميلاد 12S لي يطلبوها للباسبور.",
    },
  },
  {
    id: "civil-status",
    url: "https://etatcivil.interieur.gov.dz/ActeNaissance/",
    purpose: {
      en: "Birth, marriage and death certificates online.",
      fr: "Actes de naissance, de mariage et de décès en ligne.",
      ar: "عقود الميلاد والزواج والوفاة عبر الإنترنت.",
      dz: "شهادات الميلاد، الزواج والوفاة من الأنترنت.",
    },
  },
  {
    id: "interior-services",
    url: "https://services.interieur.gov.dz/",
    purpose: {
      en: "Ministry of the Interior e-services: ID card request and tracking, photo upload, 12S for Algerians abroad.",
      fr: "Services en ligne de l'Intérieur : demande et suivi de la CNIBE, envoi de photo, 12S pour la diaspora.",
      ar: "الخدمات الإلكترونية لوزارة الداخلية: طلب بطاقة التعريف ومتابعتها، رفع الصورة، 12خ للجالية.",
      dz: "خدمات وزارة الداخلية من الأنترنت: طلب لاكارط وتبّعها، تبعث التصويرة، 12S للي في الغربة.",
    },
  },
  {
    id: "dzds",
    url: "https://dzds.dz/fr-fr",
    purpose: {
      en: "National services portal: civil status, nationality certificate, criminal record and more.",
      fr: "Portail national : état civil, certificat de nationalité, casier judiciaire, etc.",
      ar: "البوابة الوطنية: الحالة المدنية، شهادة الجنسية، صحيفة السوابق العدلية وغيرها.",
      dz: "البوابة الوطنية: الحالة المدنية، شهادة الجنسية، الكازيي جوديسيير وحوايج أخرين.",
    },
  },
  {
    id: "justice",
    url: "https://portail.mjustice.dz/",
    purpose: {
      en: "Criminal record extract (bulletin n°3), nationality certificate, case tracking.",
      fr: "Casier judiciaire (bulletin n°3), certificat de nationalité, suivi des affaires.",
      ar: "صحيفة السوابق العدلية (البطاقة رقم 3)، شهادة الجنسية، متابعة القضايا.",
      dz: "الكازيي جوديسيير (البيلتان رقم 3)، شهادة الجنسية، تبّع القضايا.",
    },
  },
  {
    id: "mfa",
    url: "https://www.mfa.gov.dz/",
    purpose: {
      en: "Foreign Affairs: consular information, legalisation of documents for use abroad.",
      fr: "Affaires étrangères : informations consulaires, légalisation des documents destinés à l'étranger.",
      ar: "الشؤون الخارجية: معلومات قنصلية، التصديق على الوثائق الموجهة للخارج.",
      dz: "الشؤون الخارجية: معلومات قنصلية، التصديق على الوراق لي رايحين للخارج.",
    },
  },
  {
    id: "cnas",
    url: "https://elhanaa.cnas.dz/",
    purpose: {
      en: "CNAS online space for insured employees: affiliation certificate, sick-leave payments, reimbursements.",
      fr: "Espace en ligne CNAS des assurés : attestation d'affiliation, indemnités, remboursements.",
      ar: "الفضاء الإلكتروني للمؤمَّنين لدى CNAS: شهادة الانتساب، التعويضات، التسديدات.",
      dz: "الفضاء تاع المؤمّنين في الكناس: شهادة الانتساب، التعويضات، الرمبورسمو.",
    },
  },
  {
    id: "casnos",
    url: "https://damancom.casnos.dz/",
    purpose: {
      en: "CASNOS online services for the self-employed: contributions, pension request.",
      fr: "Services en ligne CASNOS des non-salariés : cotisations, demande de retraite.",
      ar: "الخدمات الإلكترونية لـ CASNOS لغير الأجراء: الاشتراكات، طلب التقاعد.",
      dz: "خدمات الكاسنوس للي يخدمو على روحهم: الاشتراكات، طلب الروتريت.",
    },
  },
  {
    id: "cnr",
    url: "https://www.cnr.dz/",
    purpose: {
      en: "Retirement fund: pension rights and income certificates.",
      fr: "Caisse des retraites : droits à pension et attestations de revenus.",
      ar: "صندوق التقاعد: حقوق المعاش وشهادات الدخل.",
      dz: "صندوق الروتريت: حقوق المعاش وشهادات المدخول.",
    },
  },
  {
    id: "aadl",
    url: "https://www.aadl.dz/",
    purpose: {
      en: "AADL rent-to-own housing: subscriber account, payments, follow-up.",
      fr: "Logement AADL (location-vente) : compte souscripteur, paiements, suivi.",
      ar: "سكنات عدل (البيع بالإيجار): حساب المكتتب، الدفع، المتابعة.",
      dz: "سكنات عدل: الكونط تاع المكتتب، الخلاص، تبّع الدوسي.",
    },
  },
  {
    id: "minha",
    url: "https://minha.anem.dz/",
    purpose: {
      en: "Unemployment allowance: application, appointments, renewal.",
      fr: "Allocation chômage : demande, rendez-vous, renouvellement.",
      ar: "منحة البطالة: الطلب، المواعيد، التجديد.",
      dz: "منحة البطالة: الطلب، الرونديفو، التجديد.",
    },
  },
  {
    id: "jibayatic",
    url: "https://jibayatic.mf.gov.dz/",
    purpose: {
      en: "File and pay taxes online.",
      fr: "Déclarer et payer ses impôts en ligne.",
      ar: "التصريح بالضرائب ودفعها عبر الإنترنت.",
      dz: "تصرّح وتخلّص الضرايب من الأنترنت.",
    },
  },
  {
    id: "tabioucom",
    url: "https://tabioucom.mf.gov.dz/",
    purpose: {
      en: "Buy fiscal stamps online (e.g. passport stamp duty).",
      fr: "Acheter des timbres fiscaux en ligne (ex. timbre du passeport).",
      ar: "شراء الطوابع الجبائية عبر الإنترنت (مثل طابع جواز السفر).",
      dz: "تشري التامبر من الأنترنت (كيما تامبر الباسبور).",
    },
  },
  {
    id: "progres",
    url: "https://progres.mesrs.dz/webetu/login.xhtml",
    purpose: {
      en: "University students: records, diploma authentication, housing, grants.",
      fr: "Étudiants : dossier, authentification des diplômes, hébergement, bourses.",
      ar: "الطلبة الجامعيون: الملف، التصديق على الشهادات، الإيواء، المنح.",
      dz: "الطلبة: الدوسي، التصديق على الديبلوم، السكن الجامعي، المنحة.",
    },
  },
  {
    id: "bac",
    url: "https://bac.onec.dz/",
    purpose: {
      en: "Baccalaureate: registration and results.",
      fr: "Baccalauréat : inscription et résultats.",
      ar: "البكالوريا: التسجيل والنتائج.",
      dz: "الباك: التسجيل والنتائج.",
    },
  },
  {
    id: "bem",
    url: "https://bem.onec.dz/",
    purpose: {
      en: "BEM (end of middle school): registration and results.",
      fr: "BEM : inscription et résultats.",
      ar: "شهادة التعليم المتوسط: التسجيل والنتائج.",
      dz: "البيام: التسجيل والنتائج.",
    },
  },
  {
    id: "national-service",
    url: "https://www.mdn.dz/",
    purpose: {
      en: "Ministry of National Defence: national service information.",
      fr: "Ministère de la Défense nationale : informations sur le service national.",
      ar: "وزارة الدفاع الوطني: معلومات عن الخدمة الوطنية.",
      dz: "وزارة الدفاع الوطني: معلومات على الخدمة الوطنية.",
    },
  },
];

const TESTER = /Tester in Algeria \((\d{4}-\d{2}-\d{2})\):\s*/gi;

function classifyTesterText(text: string): InsideResult | null {
  // Links in a note ("correct site is https://…/login.xhtml") say nothing about whether it worked.
  const t = text.toLowerCase().replace(/https?:\/\/\S+/g, " ");
  if (/(not|isn't|is not) (working|reachable|loading|opening)|does(?:n't| not) (work|load|open)|times? out|is down/.test(t)) return "not_working";
  if (/redirects? to (?:a |the )?(?:log ?in|sign ?in)|(?:log ?in|sign ?in) (?:page )?only|only (?:a |the )?(?:log ?in|sign ?in)/.test(t)) return "login_only";
  if (/\b(works|working|loads|opens|reachable)\b/.test(t)) return "works";
  return null;
}

/**
 * The tester's latest result in a sources.json `notes` field, e.g.
 * "Tester in Algeria (2026-10-30): works from inside Algeria." Notes that only correct a link are ignored.
 */
export function parseTesterNote(notes: string | null | undefined): InsideStatus {
  if (!notes) return { result: "unknown", date: null };
  const marks = [...notes.matchAll(TESTER)];
  let best: InsideStatus = { result: "unknown", date: null };
  marks.forEach((m, i) => {
    const start = m.index! + m[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index! : notes.length;
    const result = classifyTesterText(notes.slice(start, end));
    if (result && (!best.date || m[1] >= best.date)) best = { result, date: m[1] };
  });
  return best;
}

interface RawSource {
  url?: unknown;
  domain?: unknown;
  category?: unknown;
  name_en?: unknown;
  name_fr?: unknown;
  name_ar?: unknown;
  notes?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function buildPortals(sources: unknown = rawSources): Portal[] {
  const list = (Array.isArray(sources) ? sources : []) as RawSource[];
  const byUrl = new Map(list.filter((s) => typeof s?.url === "string").map((s) => [s.url as string, s]));
  return CURATED.flatMap((c) => {
    const s = byUrl.get(c.url);
    if (!s) return [];
    const fr = str(s.name_fr) || str(s.name_en);
    const ar = str(s.name_ar) || fr;
    let domain = str(s.domain);
    if (!domain) {
      try { domain = new URL(c.url).hostname; } catch { domain = c.url; }
    }
    return [{
      id: c.id,
      url: c.url,
      domain: domain.replace(/^www\./, ""),
      category: str(s.category),
      names: { en: str(s.name_en) || fr, fr, ar, dz: ar },
      purpose: c.purpose,
      insideAlgeria: parseTesterNote(str(s.notes)),
    }];
  });
}

export const PORTALS: Portal[] = buildPortals();

// ---------------------------------------------------------------------------------------------- the check

/** HTTP status after redirects → what we tell people. 403/451 from abroad is usually a geo/WAF block. */
export function classifyResponse(code: number): OutsideStatus {
  if (code === 403 || code === 451) return "blocked_or_timeout";
  if ((code >= 200 && code < 400) || code === 401 || code === 429) return "up";
  return "down";
}

const BLOCKED_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_SOCKET"]);

class CheckTimeout extends Error {
  constructor() {
    super("timeout");
    this.name = "TimeoutError";
  }
}

export function classifyError(err: unknown): { outside: OutsideStatus; error: Exclude<CheckError, null> } {
  const e = err as { name?: string; code?: string; cause?: { code?: string; name?: string } } | null;
  if (e?.name === "AbortError" || e?.name === "TimeoutError" || e?.cause?.name === "AbortError") return { outside: "blocked_or_timeout", error: "timeout" };
  const code = String(e?.cause?.code ?? e?.code ?? "");
  if (code === "ENOTFOUND") return { outside: "down", error: "dns" };
  if (/CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY|ERR_TLS/i.test(code)) return { outside: "down", error: "tls" };
  if (BLOCKED_CODES.has(code)) return { outside: "blocked_or_timeout", error: "network" };
  return { outside: "down", error: "network" };
}

export interface CheckOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  now?: () => number;
}

/** One GET from our server: no cookies, no visitor data, redirects followed, body not downloaded. */
export async function checkPortal(url: string, opts: CheckOptions = {}): Promise<Omit<CheckResult, "id">> {
  const doFetch = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
  const now = opts.now ?? Date.now;
  const started = now();
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      ctrl.abort();
      reject(new CheckTimeout());
    }, timeoutMs);
  });
  try {
    const res = await Promise.race([
      doFetch(url, {
        method: "GET",
        redirect: "follow",
        credentials: "omit",
        cache: "no-store",
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AskAlgeriaStatus/1.0; independent availability check)", Accept: "text/html,*/*;q=0.8" },
      }),
      deadline,
    ]);
    const ms = Math.max(0, Math.round(now() - started));
    res.body?.cancel().catch(() => {});
    return { outside: classifyResponse(res.status), code: res.status, ms, error: null };
  } catch (err) {
    const { outside, error } = classifyError(err);
    return { outside, code: null, ms: Math.max(0, Math.round(now() - started)), error };
  } finally {
    clearTimeout(timer);
  }
}

/** Run `fn` over `items` with at most `limit` in flight; keeps input order. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return out;
}

export interface CheckerOptions extends CheckOptions {
  portals?: { id: string; url: string }[];
  ttlMs?: number;
  concurrency?: number;
}

/**
 * Shared, cached check of every portal. Fresh results are reused for `ttlMs`, and callers that arrive while
 * a check is running wait for that same check, so traffic on the page never multiplies requests to the portals.
 */
export function createStatusChecker(opts: CheckerOptions = {}) {
  const portals = opts.portals ?? PORTALS;
  const ttlMs = opts.ttlMs ?? TTL_MS;
  const now = opts.now ?? Date.now;
  const concurrency = opts.concurrency ?? 8;
  let cache: { at: number; data: StatusPayload } | null = null;
  let inflight: Promise<StatusPayload> | null = null;

  const run = async (): Promise<StatusPayload> => {
    const results = await mapLimit(portals, concurrency, async (p) => ({ id: p.id, ...(await checkPortal(p.url, opts)) }));
    const at = now();
    const data = { checkedAt: new Date(at).toISOString(), results };
    cache = { at, data };
    return data;
  };

  return {
    get(): Promise<StatusPayload> {
      if (cache && now() - cache.at < ttlMs) return Promise.resolve(cache.data);
      inflight ??= run().finally(() => {
        inflight = null;
      });
      return inflight;
    },
    reset() {
      cache = null;
      inflight = null;
    },
  };
}

/**
 * The instance /api/status uses. Netlify functions stop at 10 s, so there every portal is checked at once
 * (one 6 s round); elsewhere at most 8 at a time.
 */
export const portalStatus = createStatusChecker({ concurrency: process.env.NETLIFY ? PORTALS.length : 8 });
