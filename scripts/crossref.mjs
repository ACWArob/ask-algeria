#!/usr/bin/env node
/**
 * Accuracy cross-check between official sources.
 *
 *   npm run crossref                 # needs ANTHROPIC_API_KEY
 *   npm run crossref -- --dry-run    # print the groups that would be sent; no API calls, nothing written
 *   npm run crossref -- --max-groups=10
 *
 * Groups records by topic (split into small batches), plus one group per consular post that has
 * several pages (to catch a consulate contradicting itself). Each group goes to claude-haiku-5-5
 * (thinking disabled, JSON schema output) which lists factual conflicts and classifies each as
 * real_conflict / post_specific / outdated. Stale-date flags are computed locally.
 *
 * Writes data/accuracy-report.json (read by the app) and ACCURACY_REPORT.md (for humans / the PR body).
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { today, yearsMentioned } from "./lib/refresh-core.mjs";

const MODEL = "claude-haiku-5-5"; // keep in sync with MODELS.expand in lib/config.ts
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const DRY = Boolean(args["dry-run"]);
const MAX_GROUPS = Number(args["max-groups"] ?? process.env.CROSSREF_MAX_GROUPS ?? 40);
const MAX_RECORDS_PER_GROUP = 8;
const MAX_CHARS_PER_RECORD = 1800;
const MAX_CHARS_PER_GROUP = 14_000;
const STALE_YEARS = 2;
const NOW = new Date();
const DAY = today(NOW);

const readJson = async (f, d) => (existsSync(path.join(dataDir, f)) ? JSON.parse(await readFile(path.join(dataDir, f), "utf8")) : d);
const corpus = await readJson("corpus.json", []);
const state = await readJson("page-state.json", {});

/* ───────── grouping ───────── */
const CONSULAR = /(^|\.)mfa\.gov\.dz$|^algeria-cgny\.org$/;
const isPost = (domain) => {
  const d = String(domain).replace(/^www\./, "");
  return CONSULAR.test(d) && d !== "mfa.gov.dz";
};
const postName = (domain) => String(domain).replace(/^www\./, "").replace(/\.mfa\.gov\.dz$/, "");

function batches(records, label, kind) {
  // Prefer mixing different domains in each batch: that's where conflicts are interesting.
  const sorted = [...records].sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));
  const out = [];
  let cur = [];
  let chars = 0;
  for (const r of sorted) {
    const len = Math.min(r.text.length, MAX_CHARS_PER_RECORD);
    if (cur.length && (cur.length >= MAX_RECORDS_PER_GROUP || chars + len > MAX_CHARS_PER_GROUP)) {
      out.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(r);
    chars += len;
  }
  if (cur.length) out.push(cur);
  return out.map((recs, i) => ({ id: `${kind}:${label}${out.length > 1 ? `#${i + 1}` : ""}`, kind, label, records: recs }));
}

const byTopic = new Map();
for (const r of corpus) {
  const t = r.topic || "other";
  if (!byTopic.has(t)) byTopic.set(t, []);
  byTopic.get(t).push(r);
}
let groups = [];
for (const [topic, recs] of byTopic) {
  if (recs.length < 2) continue;
  if (new Set(recs.map((r) => r.domain.replace(/^www\./, ""))).size < 2 && !recs.some((r) => isPost(r.domain))) {
    // same single site: still worth checking for internal contradictions if it has several pages
    if (recs.length < 3) continue;
  }
  groups.push(...batches(recs, topic, "topic"));
}
const byPost = new Map();
for (const r of corpus) {
  if (!isPost(r.domain)) continue;
  const p = postName(r.domain);
  if (!byPost.has(p)) byPost.set(p, []);
  byPost.get(p).push(r);
}
for (const [post, recs] of byPost) {
  if (new Set(recs.map((r) => r.topic)).size >= 2 && recs.length >= 3) groups.push(...batches(recs, post, "post"));
}
// Priority: cross-site topic groups (where conflicts matter most) by number of distinct sites,
// then up to a quarter of the budget for consular posts (self-consistency), then single-site topics.
const sites = (g) => new Set(g.records.map((r) => r.domain.replace(/^www\./, ""))).size;
const cross = groups.filter((g) => g.kind === "topic" && sites(g) >= 2).sort((a, b) => sites(b) - sites(a) || b.records.length - a.records.length);
const posts = groups.filter((g) => g.kind === "post").sort((a, b) => b.records.length - a.records.length);
const single = groups.filter((g) => g.kind === "topic" && sites(g) < 2).sort((a, b) => b.records.length - a.records.length);
const postBudget = Math.min(posts.length, Math.ceil(MAX_GROUPS / 4));
const crossTake = cross.slice(0, MAX_GROUPS - postBudget);
const postTake = posts.slice(0, MAX_GROUPS - crossTake.length);
const picked = [...crossTake, ...postTake];
const all = groups.length;
groups = [...picked, ...single.slice(0, Math.max(0, MAX_GROUPS - picked.length))];
const skippedGroups = all - groups.length;

/* ───────── local stale-date flags ───────── */
const checkedOf = (r) => {
  const s = state[r.url];
  return s && (s.status === "ok" || s.status === "changed") ? s.lastChecked : r.fetched?.slice(0, 10) || null;
};
const stale = [];
for (const r of corpus) {
  const { newest } = yearsMentioned(`${r.title}\n${r.text}`, NOW);
  if (newest && newest < NOW.getUTCFullYear() - STALE_YEARS) {
    stale.push({
      id: r.id,
      url: r.url,
      title: r.title,
      newestYear: newest,
      lastChanged: state[r.url]?.lastChanged ?? null,
      reason: `Newest year mentioned is ${newest} (more than ${STALE_YEARS} years ago).`,
    });
  }
}

/* ───────── dry run ───────── */
if (DRY) {
  console.log(`Dry run: ${groups.length} group(s) would be sent to ${MODEL}${skippedGroups ? ` (${skippedGroups} more skipped by the cap of ${MAX_GROUPS})` : ""}.`);
  let total = 0;
  for (const g of groups) {
    const chars = g.records.reduce((a, r) => a + Math.min(r.text.length, MAX_CHARS_PER_RECORD), 0);
    total += chars;
    console.log(`  ${g.id.padEnd(34)} ${String(g.records.length).padStart(2)} records  ${String(chars).padStart(6)} chars  ${[...new Set(g.records.map((r) => r.domain))].slice(0, 4).join(", ")}`);
  }
  console.log(`  ≈ ${total.toLocaleString()} input chars (~${Math.round(total / 3.5).toLocaleString()} tokens) in total.`);
  console.log(`Local stale-date flags: ${stale.length} record(s).`);
  for (const s of stale.slice(0, 15)) console.log(`  stale ${s.newestYear}  ${s.id}`);
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.log("ANTHROPIC_API_KEY is not set: skipping the accuracy cross-check (nothing written). Use --dry-run to preview groups.");
  process.exit(0);
}

/* ───────── Claude calls ───────── */
const { default: Anthropic } = await import("@anthropic-ai/sdk");
const client = new Anthropic();

const SYSTEM = `You audit official Algerian government web pages for factual consistency. You will get several excerpts (each with an id, site, fetched date and last-changed date).
List every FACTUAL CONFLICT between two excerpts about the same procedure: fees/amounts, required documents, validity periods, deadlines/delays, age thresholds, eligibility, office hours, URLs/portals or contact channels.
For each conflict classify it:
- "real_conflict": the two pages describe the same procedure for the same people/place and cannot both be right.
- "post_specific": a legitimate difference because the pages belong to different consulates/offices/countries (e.g. fees in different currencies, different districts) or to different procedures.
- "outdated": one page is likely superseded; say which one using the dates and any years in the text.
Only report differences actually stated in the excerpts. NEVER list two excerpts that say the same thing (same amount, same rule, same number in a different format): agreement is not a conflict. Do not report a missing detail as a conflict. Quote values briefly and exactly as written. If there are no conflicts return an empty list.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["conflicts"],
  properties: {
    conflicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field", "a", "b", "values_differ", "classification", "explanation"],
        properties: {
          field: { type: "string", description: "fee, documents, validity, deadline, age, eligibility, url, contact, other" },
          a: { type: "object", additionalProperties: false, required: ["id", "value"], properties: { id: { type: "string" }, value: { type: "string" } } },
          b: { type: "object", additionalProperties: false, required: ["id", "value"], properties: { id: { type: "string" }, value: { type: "string" } } },
          values_differ: { type: "boolean", description: "true only if value A and value B state different facts" },
          classification: { type: "string", enum: ["real_conflict", "post_specific", "outdated"] },
          outdatedId: { type: "string", description: "id of the likely outdated record, when classification is outdated" },
          explanation: { type: "string" },
        },
      },
    },
  },
};

function groupPrompt(g) {
  return g.records
    .map((r) => {
      const s = state[r.url] ?? {};
      const text = r.text.length > MAX_CHARS_PER_RECORD ? r.text.slice(0, MAX_CHARS_PER_RECORD) + " …[truncated]" : r.text;
      return `<record id="${r.id}" site="${r.domain}" fetched="${(r.fetched || "").slice(0, 10)}" last_changed="${s.lastChanged ?? "unknown"}">\n${r.title}\n${text}\n</record>`;
    })
    .join("\n\n");
}

async function callGroup(g) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 3500,
    thinking: { type: "disabled" },
    system: SYSTEM,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `Group: ${g.kind} "${g.label}"\n\n${groupPrompt(g)}` }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return { conflicts: Array.isArray(json.conflicts) ? json.conflicts : [], usage: res.usage };
}

const ids = new Set(corpus.map((r) => r.id));
const AGREE = /\b(no (real |actual |direct |numeric )?(conflict|contradiction|discrepancy)|not a (real |direct )?conflict|(are|is|values|they|both) (fully )?(consistent|compatible)|(they|both|values) agree|consistent rather than)\b/i;
const conflicts = [];
const errors = [];
let inTok = 0;
let outTok = 0;
let n = 0;
const queue = [...groups];
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const g = queue.shift();
      try {
        const { conflicts: cs, usage } = await callGroup(g);
        inTok += usage?.input_tokens ?? 0;
        outTok += usage?.output_tokens ?? 0;
        for (const c of cs) {
          if (!ids.has(c.a?.id) || !ids.has(c.b?.id) || c.a.id === c.b.id) continue; // drop hallucinated ids
          if (c.values_differ === false || AGREE.test(c.explanation ?? "")) continue; // agreement is not a conflict
          conflicts.push({ id: `c${++n}`, group: g.id, topic: g.kind === "topic" ? g.label : null, ...c });
        }
        console.log(`  ✓ ${g.id}: ${cs.length} conflict(s)`);
      } catch (err) {
        errors.push({ group: g.id, error: String(err?.message ?? err).slice(0, 200) });
        console.warn(`  ✗ ${g.id}: ${err?.message ?? err}`);
      }
    }
  }),
);

// De-duplicate the same pair+field found by both a topic group and a post group.
const seen = new Set();
const unique = conflicts.filter((c) => {
  const k = [c.field, ...[c.a.id, c.b.id].sort()].join("|");
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

const byId = new Map(corpus.map((r) => [r.id, r]));
const report = {
  generatedAt: new Date().toISOString(),
  model: MODEL,
  groupsChecked: groups.length,
  groupsSkipped: skippedGroups,
  usage: { inputTokens: inTok, outputTokens: outTok },
  counts: {
    real_conflict: unique.filter((c) => c.classification === "real_conflict").length,
    outdated: unique.filter((c) => c.classification === "outdated").length,
    post_specific: unique.filter((c) => c.classification === "post_specific").length,
    stale: stale.length,
  },
  conflicts: unique,
  stale,
  errors,
};
await writeFile(path.join(dataDir, "accuracy-report.json"), JSON.stringify(report, null, 1) + "\n");

/* ───────── Markdown ───────── */
const link = (id) => {
  const r = byId.get(id);
  return r ? `[${r.title.replace(/[[\]|]/g, "")}](${r.url})` : id;
};
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const md = [];
md.push(`# Accuracy report`, ``, `Generated ${DAY} by \`scripts/crossref.mjs\` with ${MODEL}. ${groups.length} groups checked${skippedGroups ? `, ${skippedGroups} skipped by the cap` : ""}.`, ``);
md.push(`| Real conflicts | Outdated | Post-specific differences | Stale-date pages |`, `|---:|---:|---:|---:|`);
md.push(`| ${report.counts.real_conflict} | ${report.counts.outdated} | ${report.counts.post_specific} | ${report.counts.stale} |`, ``);
const section = (title, cls) => {
  const list = unique.filter((c) => c.classification === cls);
  md.push(`## ${title} (${list.length})`, ``);
  if (!list.length) return md.push(`None found.`, ``);
  md.push(`| Field | Source A | Value A | Source B | Value B | Note |`, `|---|---|---|---|---|---|`);
  for (const c of list) md.push(`| ${cell(c.field)} | ${link(c.a.id)} | ${cell(c.a.value)} | ${link(c.b.id)} | ${cell(c.b.value)} | ${cell(c.explanation)}${c.outdatedId ? ` (likely outdated: \`${c.outdatedId}\`)` : ""} |`);
  md.push(``);
};
section("Real conflicts: review these", "real_conflict");
section("Likely outdated pages", "outdated");
section("Post-specific differences (expected)", "post_specific");
md.push(`## Pages that mention only old dates (${stale.length})`, ``);
if (stale.length) {
  md.push(`| Page | Newest year in text |`, `|---|---:|`);
  for (const s of stale) md.push(`| ${link(s.id)} | ${s.newestYear} |`);
} else md.push(`None.`);
md.push(``);
if (errors.length) md.push(`## Errors`, ``, ...errors.map((e) => `- \`${e.group}\`: ${e.error}`), ``);
md.push(`_Automated check: always confirm on the official page. Token usage: ${inTok.toLocaleString()} in / ${outTok.toLocaleString()} out._`, ``);
await writeFile(path.join(root, "ACCURACY_REPORT.md"), md.join("\n"));
console.log(`\nWrote data/accuracy-report.json and ACCURACY_REPORT.md: ${report.counts.real_conflict} real, ${report.counts.outdated} outdated, ${report.counts.post_specific} post-specific, ${stale.length} stale.`);
