import { bodyError, readJson } from "@/lib/body";
import { NextResponse } from "next/server";
import { LIMITS, isMock } from "@/lib/config";
import { isLocale, type Locale } from "@/lib/i18n";
import { redact } from "@/lib/redact";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { searchChunks } from "@/lib/search";
import { SOURCES } from "@/lib/sources";
import { answerSystemPrompt, answerUserPrompt, type PromptSource } from "@/lib/prompts";
import { chooseAnswerLang, detectLanguage, glossaryQueries, questionTopics } from "@/lib/detect";
import { anthropic, expandQuery } from "@/lib/llm";
import { MODELS } from "@/lib/config";
import { mockAnswer, streamText } from "@/lib/mock";
import type { AskMeta } from "@/lib/types";
import { freshness } from "@/lib/freshness";
import { checkedDate, verificationNotes } from "@/lib/verification";
import { corpusById } from "@/lib/corpus";
import { detectPost, detectMultiPostCountry, LOCATION_FIRST, postFromGeo, readGeo, type PostHint } from "@/lib/posts";
import { askCity, askCountry, OTHER_PLACE, type Clarify } from "@/lib/clarify";
import { makeScrubber } from "@/lib/scrub";
import { parseWhere, resolveWhere, whereCountry } from "@/lib/where";
import sourcesJson from "@/data/sources.json";
import { followUps } from "@/lib/followups";
import { answerCacheKey, answerStore, corpusVersion, isCacheable } from "@/lib/answer-cache";
import { aiBlockedNow, noteAiError, noteAiOk } from "@/lib/health";
import { count, METRICS, type Metric } from "@/lib/metrics";
import { allowAi, overBudget, recordSpend, spendSettled, type Block } from "@/lib/spend";
import { localExpansion, localExpansionDecision } from "@/lib/expand-local";
import { hostOf, missionHosts, isMissionContactQuestion, locationDependent, matchMissions, missionExcerpt, otherMissionHosts } from "@/lib/missions";
import { coversTopic } from "@/lib/quick-answer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel allows long functions; the answer deadline below decides how long we actually wait.
export const maxDuration = 60;

/**
 * Response: text/plain stream. The first line is a JSON object (AskMeta) followed by "\n";
 * everything after is the Markdown answer as it is generated.
 */
class WrongLanguage extends Error {}

/** Shown instead of a written answer when the spending guard says no (the free results stay on screen). */
const PAUSED: Record<Block, Record<Locale, string>> = {
  disabled: {
    en: "Written answers are switched off for now. The results from official pages above, the guides and the embassy list still work.",
    fr: "Les réponses rédigées sont désactivées pour le moment. Les résultats des pages officielles ci-dessus, les guides et la liste des ambassades restent disponibles.",
    ar: "الإجابات المكتوبة متوقفة حاليًا. ما زالت نتائج الصفحات الرسمية أعلاه والأدلة وقائمة السفارات متاحة.",
    dz: "الأجوبة المكتوبة راهي متوقفة دروك. النتايج تاع الصفحات الرسمية لفوق، الأدلة وليستة السفارات راهم يخدمو.",
  },
  budget: {
    en: "Written answers are paused until tomorrow because of high demand. The results from official pages above, the guides and the embassy list still work.",
    fr: "Les réponses rédigées sont suspendues jusqu'à demain en raison d'une forte demande. Les résultats des pages officielles ci-dessus, les guides et la liste des ambassades restent disponibles.",
    ar: "الإجابات المكتوبة متوقفة حتى الغد بسبب كثرة الطلب. ما زالت نتائج الصفحات الرسمية أعلاه والأدلة وقائمة السفارات متاحة.",
    dz: "الأجوبة المكتوبة حبسناها حتى لغدوة على خاطر كاين بزاف الطلب. النتايج تاع الصفحات الرسمية لفوق، الأدلة وليستة السفارات راهم يخدمو.",
  },
  quota: {
    en: "You've reached today's limit of written answers. Try again tomorrow; the results from official pages, the guides and the embassy list still work.",
    fr: "Vous avez atteint la limite de réponses rédigées pour aujourd'hui. Réessayez demain ; les résultats des pages officielles, les guides et la liste des ambassades restent disponibles.",
    ar: "بلغت الحد اليومي للإجابات المكتوبة. حاول غدًا؛ ما زالت نتائج الصفحات الرسمية والأدلة وقائمة السفارات متاحة.",
    dz: "وصلت للحد تاع اليوم في الأجوبة المكتوبة. عاود غدوة؛ النتايج تاع الصفحات الرسمية، الأدلة وليستة السفارات راهم يخدمو.",
  },
};

/** Wilaya (province) portals: local procedures inside Algeria. */
const WILAYA_PORTALS = (sourcesJson as { domain: string; category?: string }[])
  .filter((x) => x.category === "wilayas")
  .map((x) => x.domain.replace(/^www\./, "").toLowerCase());

/** True when the start of an answer is in the wrong script for the reply language. */
function wrongScript(text: string, lang: Locale): boolean {
  const arabic = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  if (arabic + latin < 40) return false;
  const share = arabic / (arabic + latin);
  return lang === "ar" || lang === "dz" ? share < 0.4 : share > 0.6;
}

const LANG_RETRY: Record<Locale, string> = {
  en: "IMPORTANT: write the whole answer in English.",
  fr: "IMPORTANT : rédigez toute la réponse en français.",
  ar: "مهم جدًا: اكتب الإجابة كاملة باللغة العربية الفصحى، حتى لو كانت المصادر بالفرنسية أو الإنجليزية.",
  dz: "مهم بزاف: اكتب الجواب كامل بالدارجة الجزائرية بالحروف العربية، حتى لو المصادر بالفرنسية ولا بالإنجليزية.",
};

export async function POST(req: Request) {
  const rl = rateLimit(`ask:${clientIp(req.headers)}`, LIMITS.rateLimitPerMinute);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let body: { question?: unknown; lang?: unknown; context?: unknown; prevAnswer?: unknown; buffer?: unknown; where?: unknown };
  try {
    body = await readJson(req, 64_000);
  } catch (e) {
    const { error, status } = bodyError(e);
    return NextResponse.json({ error }, { status });
  }
  const rawQ = typeof body.question === "string" ? body.question.trim() : "";
  if (!rawQ) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (rawQ.length > LIMITS.questionMaxChars) return NextResponse.json({ error: "too_long" }, { status: 413 });
  const selected: Locale = isLocale(body.lang) ? body.lang : "fr";

  // Defence in depth: the browser already redacts, but never trust the client.
  const { text: question, removed } = redact(rawQ);
  // Optional previous question in the same conversation, so short follow-ups ("and for minors?") can be searched.
  const context = typeof body.context === "string" ? redact(body.context.trim().slice(0, 500)).text : "";
  // Start of the bot's previous answer (no sources/links needed), so follow-ups don't contradict it.
  const prevAnswer =
    typeof body.prevAnswer === "string" ? redact(body.prevAnswer.replace(/\u0000ERROR/g, "").trim().slice(0, 700)).text : "";

  const started = Date.now();
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  // One line per request, to measure cost: cache hit/miss/skip, how the query was expanded, model calls made.
  const logAsk = (cache: "hit" | "miss" | "skip", expand: "llm" | "local" | "none", calls: number, extra: Record<string, unknown> = {}) => {
    console.log(`[ask] ${JSON.stringify({ cache, expand, calls, ms: Date.now() - started, ...extra })}`);
    // Daily usage counts for the metrics check (lib/metrics.ts): counts only, nothing about the question.
    count("ask");
    const blocked = typeof extra.blocked === "string" ? (`ask_blocked_${extra.blocked}` as Metric) : null;
    if (cache === "hit") count("ask_cached");
    else if (blocked && (METRICS as readonly string[]).includes(blocked)) count(blocked);
    else if (extra.ok === false) count("ask_failed");
    else if (calls > 0 || extra.mock) count("ask_answered");
  };
  // A mission named in the question ("the consulate in Beijing") is the office they mean, even if that city
  // isn't in the place tables; it also beats the connection's location.
  const namedMission = !detectPost(question) && isMissionContactQuestion(question) ? matchMissions(question, [], 1)[0] : undefined;
  const missionPost: PostHint | null = namedMission
    ? { place: namedMission.city, post: namedMission.name_en, site: namedMission.website || undefined, domains: missionHosts(namedMission) }
    : null;
  // Saved "where do you live?" (in Algeria → wilaya, abroad → country/city): beats the context and the connection.
  // A country named in the question ("passport for France") still beats the saved place.
  const where = detectMultiPostCountry(question) ? null : parseWhere(body.where);
  const statedPost = detectPost(question) ?? missionPost ?? resolveWhere(where) ?? detectPost(context);
  // Fall back to the approximate location of the connection (e.g. Netlify geo), but say so in the answer.
  // Never when they named a country ("France"): then we ask which city instead of using where the connection is.
  const namedCountry = detectMultiPostCountry(`${context} ${question}`) ?? whereCountry(where);
  const topics = questionTopics(`${context} ${question}`);
  // Only for procedures that depend on the office (a stolen SIM or a divorce question isn't "for Boulder, Colorado").
  const geoPost = statedPost || namedCountry || !locationDependent(topics, question) ? null : postFromGeo(readGeo(req.headers));
  const post = statedPost ?? geoPost;
  const multiPostCountry = post ? null : namedCountry;

  const quickLang = chooseAnswerLang(selected, detectLanguage(question), question);
  // Location-dependent procedure but we don't know where they are: ask first (no mixed answer from random consulates).
  // Ask at most once per question type: if an earlier turn was already location-dependent, we already asked;
  // when the person carries on without answering, answer in general terms instead of asking again.
  const countryNow = detectMultiPostCountry(question);
  const alreadyAsked = Boolean(context) && questionTopics(context).some((t) => LOCATION_FIRST.includes(t));
  const shouldAsk = countryNow ? !detectMultiPostCountry(context) : !alreadyAsked;
  // "Where is the consulate / what's its phone?" with no place named anywhere: ask instead of guessing an office.
  const contactNoPlace = isMissionContactQuestion(question) && matchMissions(question, [], 1, context).length === 0;
  if (!post && shouldAsk && (contactNoPlace || topics.some((t) => LOCATION_FIRST.includes(t))) && !OTHER_PLACE.test(question)) {
    const c: Clarify | null = multiPostCountry ? askCity(multiPostCountry, quickLang) : askCountry(quickLang);
    if (c) {
      logAsk("skip", "none", 0, { clarify: true });
      const meta: AskMeta = { type: "meta", answerLang: quickLang, detectedLang: detectLanguage(question), sources: [], chips: c.chips, redactedServer: removed };
      return new Response(`${JSON.stringify(meta)}\n${c.text}`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
    }
  }

  const mock = isMock();

  // Answer cache (lib/answer-cache.ts): first questions only; a follow-up depends on the conversation so far.
  const cache = !context && !prevAnswer ? answerStore() : null;
  const office = post
    ? `${post.inAlgeria ? "dz" : "abroad"}:${post.post}:${post.place}${geoPost ? ":geo" : ""}`
    : multiPostCountry
      ? `country:${multiPostCountry}`
      : "none";
  const cacheKey = cache ? answerCacheKey({ question, lang: quickLang, office, version: `${corpusVersion()}${mock ? ":mock" : ""}` }) : "";
  if (cache) {
    const hit = await cache.get(cacheKey).catch(() => null);
    if (hit) {
      logAsk("hit", "none", 0);
      const meta: AskMeta = { ...hit.meta, redactedServer: removed };
      return new Response(`${JSON.stringify(meta)}\n${hit.text}`, { headers });
    }
  }

  // Spending guard (lib/spend.ts): kill switch, daily budget, per-visitor quota. Cached answers above stay free.
  if (!mock) {
    // Out of API credit or a bad key a moment ago: no slow failing call, the free results stay on screen.
    if (aiBlockedNow()) {
      logAsk("skip", "none", 0, { blocked: "ai_unavailable" });
      const meta: AskMeta = { type: "meta", answerLang: quickLang, detectedLang: detectLanguage(question), sources: [], redactedServer: removed };
      return new Response(`${JSON.stringify(meta)}\n${PAUSED.disabled[quickLang]}`, { headers });
    }
    const allowed = await allowAi(clientIp(req.headers), "ask");
    if (!allowed.ok) {
      logAsk("skip", "none", 0, { blocked: allowed.reason });
      const meta: AskMeta = { type: "meta", answerLang: quickLang, detectedLang: detectLanguage(question), sources: [], redactedServer: removed };
      return new Response(`${JSON.stringify(meta)}\n${PAUSED[allowed.reason][quickLang]}`, { headers });
    }
  }

  // Skip the expansion model call for short questions the synonym list/glossary already understands (lib/expand-local.ts).
  const decision = localExpansionDecision(question, context);
  const expandMode: "llm" | "local" = decision.local ? "local" : "llm";
  const expansion: { lang: Locale | null; queries: string[]; topic: string; fellBack?: boolean } = decision.local
    ? localExpansion(question, decision)
    : mock
      ? {
          lang: detectLanguage(question),
          queries: [question, ...glossaryQueries(context ? `${context} ${question}` : question)],
          topic: "",
        }
      : await expandQuery(question, context);
  const expandCalls = expandMode === "llm" && !mock ? 1 : 0;
  const answerLang = chooseAnswerLang(selected, expansion.lang, question);

  const base = [...new Set([...expansion.queries, ...glossaryQueries(`${context} ${question}`)])];
  const queries = post && !post.inAlgeria ? [...base, ...base.slice(0, 3).map((q) => `${q} ${post.place}`)] : base;
  const abroad = post ? !post.inAlgeria : Boolean(multiPostCountry);
  const excludeDomains = [
    // Other countries' consulates, also when the person's own mission has no website (lib/missions otherMissionHosts).
    ...otherMissionHosts(post?.domains ?? null, Boolean(post?.inAlgeria), multiPostCountry ?? namedCountry),
    // Someone living abroad goes through a consulate: a wilaya's local procedure would mislead them.
    ...(abroad ? WILAYA_PORTALS : []),
  ];
  const found = searchChunks(queries, LIMITS.topChunks, { boostDomains: post?.domains ?? [], topics, excludeDomains });
  // Same off-topic filter as free search: a page that only uses the subject word in passing (the Startup label is a
  // "passeport") is not a source. Kept when it would leave nothing, so a follow-up still gets its pages.
  const corpusMap = corpusById();
  const onTopic = found.filter((h) => coversTopic(question, h.title, corpusMap.get(h.docId)?.text ?? h.text));
  const hits = onTopic.length ? onTopic : found;

  // Group chunks by page so each page gets one citation number.
  const byDoc = new Map<string, PromptSource>();
  for (const h of hits) {
    let s = byDoc.get(h.docId);
    if (!s) {
      s = { n: byDoc.size + 1, docId: h.docId, title: h.title, url: h.url, domain: h.domain, excerpts: [] };
      byDoc.set(h.docId, s);
    }
    s.excerpts.push(h.text);
  }
  let promptSources = [...byDoc.values()];

  // "Where is / phone of / hours of the consulate": add the matching mission record(s) as citable sources, first.
  const missionHits =
    isMissionContactQuestion(question) && !post?.inAlgeria
      ? matchMissions(question, post?.domains ?? [], 2, context).filter((m) => m.source_url || m.website)
      : [];
  if (missionHits.length) {
    const missionSources: PromptSource[] = missionHits.map((m) => {
      const url = m.source_url || m.website;
      return { n: 0, docId: `mission:${m.id}`, title: `${m.name_en}: contact details`, url, domain: hostOf(url), excerpts: [missionExcerpt(m)], checked: m.checked || null };
    });
    promptSources = [...missionSources, ...promptSources.filter((p) => !missionSources.some((ms) => ms.url === p.url))]
      .slice(0, LIMITS.topChunks + missionSources.length)
      .map((p, i) => ({ ...p, n: i + 1 }));
  }

  // Freshness + cross-source accuracy notes from the weekly refresh job (optional files).
  const { state, report } = freshness();
  const corpus = corpusById();
  for (const s of promptSources) {
    if (s.docId?.startsWith("mission:")) continue; // checked date comes from missions.json
    const rec = corpus.get(s.docId ?? "");
    s.checked = checkedDate(rec?.fetched, state[s.url]);
    if (rec?.extraction === "archived") s.archived = rec.fetched || "unknown date";
  }
  const notes = verificationNotes(
    report,
    // When we know their office, only flag disagreements between that office's own pages.
    new Map(
      promptSources
        .filter((s) => !post || post.inAlgeria || post.domains.some((d) => s.domain.replace(/^www\./, "") === d))
        .map((s) => [s.docId ?? "", s.n]),
    ),
    (id) => corpus.get(id)?.domain,
  );

  const meta: AskMeta = {
    type: "meta",
    answerLang,
    detectedLang: expansion.lang,
    sources: promptSources.map(({ n, title, url, domain, checked, archived }) => ({ n, title, url, domain, checked, archived })),
    notes: notes.length,
    redactedServer: removed,
    followups: followUps(topics, `${context} ${question}`, answerLang),
  };

  const enc = new TextEncoder();
  // Cache only answers in the key's language, built on a successful expansion.
  const mayStore = Boolean(cache) && answerLang === quickLang && !expansion.fellBack;
  // Shared-store writes (cache set, spend totals) are awaited before the stream closes, so the platform doesn't
  // freeze the function with them unsent; each is bounded by the store's short timeout (lib/kv.ts).
  const writes: Promise<unknown>[] = [];
  const store = (text: string, finishedNormally: boolean): boolean => {
    if (!cache || !mayStore) return false;
    const outcome = { finishedNormally, text, meta, wrongLanguage: wrongScript(text.slice(0, 400), answerLang) };
    if (!isCacheable(outcome)) return false;
    writes.push(cache.set(cacheKey, { meta, text }).catch((err) => console.error("[ask] cache set failed:", err instanceof Error ? err.message : err)));
    return true;
  };
  const settle = () => Promise.all([...writes, spendSettled()]).catch(() => undefined);

  if (mock) {
    const answer = streamText(mockAnswer(answerLang, promptSources.length));
    const out = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(enc.encode(JSON.stringify(meta) + "\n"));
        const reader = answer.getReader();
        const dec = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += dec.decode(value, { stream: true });
          controller.enqueue(value);
        }
        const stored = store(full, true);
        await settle();
        controller.close();
        logAsk(cache ? "miss" : "skip", expandMode, 0, { mock: true, stored });
      },
    });
    return new Response(out, { headers });
  }

  const MUST = ["mjustice.dz", "marw.gov.dz", "aadl.dz", "interieur.gov.dz", "mfdgi.gov.dz", "cnas.dz", "casnos.dz", "anem.dz", "onec.dz", "poste.dz", "dzds.dz", "mfa.gov.dz"];
  const fallbackList = [
    ...SOURCES.filter((s) => MUST.includes(s.domain.replace(/^www\./, ""))),
    ...[...SOURCES].sort((a, b) => a.priority - b.priority),
  ];
  const fallbackSites = [...new Map(fallbackList.map((s) => [s.domain, s])).values()]
    .slice(0, 30)
    .map((s) => `- ${s.name_fr} (${s.name_en}): ${s.url}`)
    .join("\n");

  // Clarifying questions only where they change the answer (decided here, not left to the model).
  const LOCATION_TOPICS = ["passport", "cni", "birth_certificate", "civil_status", "criminal_record", "nationality", "consular_registration", "legalization", "national_service", "consular_visa"];
  const words = question.trim().split(/\s+/).length;
  const mentionsChild = /child|son|daughter|kid|minor|enfant|fils|fille|mineur|ولد|بنت|طفل|ابني|ابنتي|صغير|قاصر|wlid|bent/i.test(`${context} ${question}`);
  const hasAge = /\b\d{1,2}\b|[٠-٩]{1,2}|ans|years?|عام|سنة|سنين|عمر/i.test(`${context} ${question}`);
  const allowClarify =
    (words <= 2 && !context) ||
    Boolean(multiPostCountry) ||
    (!post && topics.some((t) => LOCATION_TOPICS.includes(t))) ||
    (mentionsChild && !hasAge && topics.some((t) => ["passport", "cni"].includes(t)));
  const system = answerSystemPrompt(answerLang, fallbackSites, { post, multiPostCountry, allowClarify, fromGeo: Boolean(geoPost) });
  const REPLY_IN: Record<Locale, string> = {
    en: "Reply only in English. If something isn't covered, say it about the office (\"X's page doesn't list…\"), never \"the pages I have/provided\".",
    fr: "Réponds uniquement en français. Si un point manque, dis-le à propos de l'organisme (« la page du consulat ne précise pas… »), jamais « les pages consultées » ni « les extraits ».",
    ar: "أجب باللغة العربية الفصحى فقط. إذا نقصت معلومة فانسبها إلى الجهة («صفحة القنصلية لا تذكر…»)، ولا تقل أبدًا «المصادر المتوفرة لدي» أو «الصفحات المتاحة لي».",
    dz: "جاوب غير بالدارجة الجزائرية بالحروف العربية. إذا كاش حاجة ناقصة قولها على الإدارة («صفحة القنصلية ما تذكرش…»)، وما تقولش أبدًا «الصفحات اللي عندي» ولا «المصادر اللي عندي».",
  };
  const userPrompt = `${answerUserPrompt(question, promptSources, context, notes, prevAnswer)}\n\n${REPLY_IN[answerLang]}`;
  // Netlify cuts synchronous functions at ~10 s. Stop generating before that and close cleanly.
  // Netlify cuts functions at 10 s; Vercel allows minutes, so answers there can take longer instead of being shortened.
  const DEADLINE_MS = Number(process.env.ANSWER_DEADLINE_MS) || (process.env.VERCEL ? 25000 : 9000);
  const SHORTENED: Record<Locale, string> = {
    en: "\n\n_(Answer shortened to keep it fast. Ask a follow-up for more detail.)_",
    fr: "\n\n_(Réponse raccourcie pour rester rapide. Posez une question de suivi pour plus de détails.)_",
    ar: "\n\n_(تم اختصار الإجابة للسرعة. اطرح سؤالًا آخر لمزيد من التفاصيل.)_",
    dz: "\n\n_(قصّرنا الجواب باش يكون سريع. سقسي سؤال آخر باش تعرف كثر.)_",
  };

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(enc.encode(JSON.stringify(meta) + "\n"));
      // Everything sent after the meta line, for the cache; only set on the normal, complete path.
      let full = "";
      let finishedNormally = false;
      let calls = expandCalls;
      const emit = (t: string) => {
        full += t;
        controller.enqueue(enc.encode(t));
      };
      let wrote = 0;
      const models = [MODELS.answer, MODELS.answer, MODELS.fallback];
      let langRetry = false;
      try {
        for (let attempt = 0; attempt < models.length; attempt++) {
          const remaining = DEADLINE_MS - (Date.now() - started);
          if (remaining < 2500) break;
          if (attempt > 0 && overBudget()) break; // no retries (or Sonnet fallback) once today's budget is spent
          const stream = anthropic().messages.stream(
            {
              model: models[attempt],
              max_tokens: LIMITS.answerMaxTokens,
              thinking: { type: "disabled" },
              system,
              messages: [{ role: "user", content: langRetry ? `${userPrompt}\n\n${LANG_RETRY[answerLang]}` : userPrompt }],
            },
            { maxRetries: 0, timeout: remaining },
          );
          calls++;
          const timer = setTimeout(() => stream.abort(), remaining);
          const scrub = makeScrubber(answerLang);
          // Hold the first ~120 characters to check the script: a short Arabic follow-up sometimes gets an
          // English/French answer (copied from the sources). Wrong script → drop this attempt and retry once.
          let held = "";
          let checked = false;
          const send = (t: string) => {
            if (!t) return;
            if (!checked) {
              held += t;
              if (held.length < 120) return;
              checked = true;
              if (!langRetry && wrongScript(held, answerLang) && DEADLINE_MS - (Date.now() - started) > 5000) {
                throw new WrongLanguage();
              }
              t = held;
            }
            emit(t);
          };
          const flushHeld = () => {
            if (!checked && held) emit(held);
            checked = true;
          };
          try {
            for await (const ev of stream) {
              if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                send(scrub.push(ev.delta.text));
                wrote += ev.delta.text.length;
              }
            }
            clearTimeout(timer);
            send(scrub.flush());
            flushHeld();
            const fin = await stream.finalMessage().catch(() => null);
            // Real usage when the API returns it; otherwise a rough estimate (~3 characters per token).
            recordSpend(models[attempt], fin?.usage ?? { input_tokens: Math.ceil((system.length + userPrompt.length) / 3), output_tokens: Math.ceil(wrote / 3) });
            noteAiOk();
            if (fin?.stop_reason === "max_tokens") emit(SHORTENED[answerLang]);
            else finishedNormally = true;
            return; // finished normally
          } catch (err) {
            clearTimeout(timer);
            // A failed or aborted attempt is still billed for its prompt (and whatever was generated).
            recordSpend(models[attempt], { input_tokens: Math.ceil((system.length + userPrompt.length) / 3), output_tokens: Math.ceil(Math.max(wrote, 120) / 3) });
            if (err instanceof WrongLanguage) {
              stream.abort();
              langRetry = true;
              wrote = 0;
              console.warn(`[ask] wrong-language start for ${answerLang}; retrying`);
              continue;
            }
            try {
              send(scrub.flush());
            } catch {
              /* a late language check can't retry any more */
            }
            flushHeld();
            const kind = noteAiError(err);
            // No credit or a bad key: the fallback model would fail the same way; say written answers are off.
            if ((kind === "credit" || kind === "auth") && wrote === 0) {
              emit(PAUSED.disabled[answerLang]);
              return;
            }
            const timedOut = Date.now() - started >= DEADLINE_MS - 50;
            console.error(`[ask] attempt ${attempt + 1} (${models[attempt]}) failed after ${Date.now() - started}ms:`, err instanceof Error ? err.message : err);
            if (wrote > 0) {
              // Something already reached the user: never restart, just close politely.
              emit(SHORTENED[answerLang]);
              return;
            }
            if (timedOut) break;
            await new Promise((r) => setTimeout(r, 250));
          }
        }
        emit("\n\n\u0000ERROR");
      } finally {
        const stored = store(full, finishedNormally);
        await settle();
        controller.close();
        logAsk(cache ? "miss" : "skip", expandMode, calls, { stored, ...(finishedNormally ? {} : { ok: false }) });
      }
    },
  });
  if (body.buffer === true) {
    // Non-streaming fallback: some hosts occasionally drop long streamed responses.
    const full = await new Response(out).text();
    return new Response(full, { headers });
  }
  return new Response(out, { headers });
}
