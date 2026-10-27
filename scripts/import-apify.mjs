#!/usr/bin/env node
/**
 * Import Apify website-content-crawler datasets into data/corpus.json.
 *
 *   APIFY_TOKEN=... node scripts/import-apify.mjs <datasetId> [<datasetId> ...]
 *
 * - Live pages keep their official URL.
 * - Wayback Machine pages (web.archive.org/web/<ts>/<url>) are stored under the
 *   ORIGINAL official URL, with `archived_url`, `fetched` = snapshot date and
 *   `extraction: "archived"`, so answers can say the text comes from an archived copy.
 * - Only domains listed in data/sources.json are accepted.
 * - Existing corpus records always win on duplicate URLs.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const token = process.env.APIFY_TOKEN;
const ids = process.argv.slice(2);
if (!token || ids.length === 0) {
  console.error("Usage: APIFY_TOKEN=... node scripts/import-apify.mjs <datasetId> [...]");
  process.exit(1);
}

const corpusPath = path.join(root, "data/corpus.json");
const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(root, "data/sources.json"), "utf8"));
const bare = (d) => d.toLowerCase().replace(/^www\./, "");
const official = new Set(sources.map((s) => bare(s.domain)));
const isOfficial = (host) => {
  const h = bare(host);
  for (const d of official) if (h === d || h.endsWith("." + d)) return true;
  return false;
};

const normUrl = (u) => {
  try {
    const x = new URL(u);
    x.hash = "";
    x.hostname = x.hostname.toLowerCase();
    return x.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
};
const seen = new Set(corpus.map((r) => normUrl(r.url).replace(/^https?:\/\/(www\.)?/, "")));
const ids0 = new Set(corpus.map((r) => r.id));

const WAYBACK = /^https?:\/\/web\.archive\.org\/web\/(\d{8,14})[a-z_]*\/(.+)$/i;
const detectLang = (t) => {
  const ar = (t.match(/[؀-ۿ]/g) || []).length;
  if (ar > t.length * 0.2) return "ar";
  const fr = (t.match(/\b(le|la|les|des|du|une|est|pour|vous|avec)\b/gi) || []).length;
  const en = (t.match(/\b(the|and|for|you|with|are|this|your)\b/gi) || []).length;
  return fr >= en ? "fr" : "en";
};
const topicOf = (t) => {
  const s = t.toLowerCase();
  const rules = [
    ["passport", /passeport|passport|جواز/],
    ["cni", /carte d'identit|identity card|بطاقة التعريف/],
    ["birth_certificate", /12s|acte de naissance|birth certificate|شهادة الميلاد/],
    ["civil_status", /état civil|etat civil|civil status|الحالة المدنية|livret de famille/],
    ["criminal_record", /casier judiciaire|criminal record|صحيفة السوابق/],
    ["nationality", /nationalit|الجنسية/],
    ["driving_vehicle", /permis de conduire|carte grise|immatriculation|driving|رخصة السياقة/],
    ["tax", /impôt|impot|fiscal|tax|جباي|ضريب/],
    ["social_security", /cnas|casnos|retraite|sécurité sociale|chifa|الضمان الاجتماعي/],
    ["employment", /emploi|chômage|chomage|recrutement|job|تشغيل/],
    ["housing", /logement|aadl|housing|سكن/],
    ["education", /bac|bem|université|universite|étudiant|education|scolar|تعليم/],
    ["health", /santé|sante|health|médicament|vaccin|صحة/],
    ["business", /entreprise|startup|registre de commerce|auto-entrepreneur|investissement/],
    ["utilities", /électricité|electricite|gaz|eau|facture|internet|poste/],
    ["justice", /justice|tribunal|cour|juridique/],
  ];
  for (const [k, re] of rules) if (re.test(s)) return k;
  return "general";
};
const slug = (s) => s.toLowerCase().replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

/** Drop pages that are mostly navigation/boilerplate. */
const looksUseful = (text) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 80) return false;
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const longLines = lines.filter((l) => l.split(/\s+/).length >= 8).length;
  return longLines >= 3;
};

async function fetchAll(datasetId) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&offset=${offset}&limit=1000&fields=url,loadedUrl,text,metadata&token=${token}`,
    );
    if (!r.ok) throw new Error(`Dataset ${datasetId}: HTTP ${r.status}`);
    const items = await r.json();
    out.push(...items);
    if (items.length < 1000) break;
  }
  return out;
}

const added = [];
const stats = { total: 0, live: 0, archived: 0, dupe: 0, offsite: 0, thin: 0 };
for (const ds of ids) {
  const items = await fetchAll(ds);
  for (const it of items) {
    stats.total++;
    const raw = it.loadedUrl || it.url;
    const text = (it.text || "").replace(/\n{3,}/g, "\n\n").trim();
    let url = raw;
    let archived_url;
    let fetched = new Date().toISOString().slice(0, 10);
    const m = WAYBACK.exec(raw);
    if (m) {
      archived_url = raw;
      url = m[2].replace(/^(https?):\/(?!\/)/, "$1://");
      const ts = m[1];
      fetched = `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
    }
    let host;
    try {
      host = new URL(url).hostname;
    } catch {
      stats.offsite++;
      continue;
    }
    if (!isOfficial(host)) { stats.offsite++; continue; }
    const key = normUrl(url).replace(/^https?:\/\/(www\.)?/, "");
    if (seen.has(key)) { stats.dupe++; continue; }
    if (!looksUseful(text)) { stats.thin++; continue; }
    seen.add(key);
    let id = slug(url);
    while (ids0.has(id)) id += "-x";
    ids0.add(id);
    const title = (it.metadata?.title || "").replace(/\s+/g, " ").trim() || host;
    const rec = {
      id,
      title,
      url,
      domain: host.toLowerCase(),
      lang: it.metadata?.languageCode?.slice(0, 2) || detectLang(text),
      topic: topicOf(`${title} ${text.slice(0, 2000)}`),
      fetched,
      text: text.split(/\s+/).slice(0, 2500).join(" ").length < text.length ? text.slice(0, 16000) : text,
      extraction: archived_url ? "archived" : "verbatim",
    };
    if (!["fr", "ar", "en"].includes(rec.lang)) rec.lang = detectLang(text);
    if (archived_url) rec.archived_url = archived_url;
    added.push(rec);
    archived_url ? stats.archived++ : stats.live++;
  }
}

fs.writeFileSync(corpusPath, JSON.stringify([...corpus, ...added], null, 1));
console.log(JSON.stringify({ ...stats, added: added.length, corpus: corpus.length + added.length }));
