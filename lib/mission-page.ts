/**
 * Pure helpers for /embassies/[id]: find a mission by id, pick the official pages we hold from its
 * own website, and group them by topic. No file or network access (the page passes the corpus in).
 */
import type { CorpusRecord } from "@/lib/search-core.mjs";
import { FAX_NOTE, MISSIONS, PUBLIC_NOTE, missionHosts, type Mission } from "@/lib/missions";

// A Map, not an object: ids like "__proto__" or "constructor" never resolve to prototype keys.
let byId: Map<string, Mission> | null = null;

/** The mission with this id, or undefined. */
export function findMission(id: string, missions: Mission[] = MISSIONS): Mission | undefined {
  if (typeof id !== "string" || !id) return undefined;
  if (missions === MISSIONS) {
    byId ??= new Map(MISSIONS.map((m) => [m.id, m]));
    return byId.get(id);
  }
  return new Map(missions.map((m) => [m.id, m])).get(id);
}

export interface MissionPageLink {
  id: string;
  title: string;
  url: string;
  topic: string;
  /** Date of the archived copy when extraction is "archived", else "". */
  archived: string;
}

/** Corpus records whose domain is one of the mission's own websites. */
export function missionRecords(m: Mission, records: Iterable<CorpusRecord>): CorpusRecord[] {
  const hosts = new Set(missionHosts(m));
  if (!hosts.size) return [];
  const out: CorpusRecord[] = [];
  for (const r of records) {
    const d = (r.domain || "").replace(/^www\./, "").toLowerCase();
    if (hosts.has(d) && /^https?:\/\//i.test(r.url)) out.push(r);
  }
  return out;
}

export function toPageLink(r: CorpusRecord): MissionPageLink {
  return {
    id: r.id,
    title: r.title || r.url,
    url: r.url,
    topic: r.topic || "other",
    archived: r.extraction === "archived" ? r.fetched || "" : "",
  };
}

/** Consular topics first (what people come to a consulate for), then the rest, "general"/"other" last. */
export const TOPIC_ORDER = [
  "consular_registration",
  "passport",
  "cni",
  "birth_certificate",
  "civil_status",
  "nationality",
  "national_service",
  "legalization",
  "criminal_record",
  "consular_visa",
  "justice",
  "contact",
];
const LAST = ["general", "other"];

function topicRank(t: string): number {
  const i = TOPIC_ORDER.indexOf(t);
  if (i !== -1) return i;
  const j = LAST.indexOf(t);
  return j !== -1 ? 1000 + j : 500;
}

export interface TopicGroup {
  topic: string;
  pages: MissionPageLink[];
}

/** Pages grouped by corpus topic; groups in TOPIC_ORDER (unknown topics alphabetically), pages by title. */
export function groupByTopic(pages: MissionPageLink[], sortTag = "en"): TopicGroup[] {
  const groups = new Map<string, MissionPageLink[]>();
  for (const p of pages) {
    const t = p.topic || "other";
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t)!.push(p);
  }
  return [...groups.entries()]
    .map(([topic, list]) => ({ topic, pages: list.sort((a, b) => a.title.localeCompare(b.title, sortTag)) }))
    .sort((a, b) => topicRank(a.topic) - topicRank(b.topic) || a.topic.localeCompare(b.topic));
}

// Laissez-passer / consular pass, in the languages mission pages are written in.
const LAISSEZ_PASSER = /(laissez[\s-]*passer|consular pass|sauf[\s-]*conduit|جواز\s+(?:ال)?مرور)/iu;

/** True when one of the mission's own pages is about the laissez-passer (emergency travel document). */
export function hasLaissezPasser(records: Pick<CorpusRecord, "title" | "text">[]): boolean {
  return records.some((r) => LAISSEZ_PASSER.test(r.title) || LAISSEZ_PASSER.test(r.text));
}

export type MissionBadge = "verified" | "archived" | "website-only" | "unverified";

/** "verified" only when the details come from the live official site; from a Wayback copy they say so. */
export function missionBadge(m: Mission): MissionBadge {
  if (m.status === "verified") return /(?:^|\/\/)web\.archive\.org\//.test(m.source_url ?? "") ? "archived" : "verified";
  return m.status === "website-only" ? "website-only" : "unverified";
}

/** Visitor-facing note, same rule as the /embassies list: fax hint or a public note (closures, appointments). */
export function missionNotes(m: Mission): { faxNote: boolean; note: string } {
  const unverified = missionBadge(m) === "unverified";
  return {
    faxNote: !unverified && m.phones.length > 1 && Boolean(m.note && FAX_NOTE.test(m.note)),
    note: !unverified && m.note && !FAX_NOTE.test(m.note) && PUBLIC_NOTE.test(m.note) ? m.note : "",
  };
}
