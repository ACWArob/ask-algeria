import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { corpusById } from "@/lib/corpus";

/** Archive links (`archived_url`) of corpus records, which normalizeCorpus does not keep. */
let archives: Map<string, string> | null = null;

function archiveUrls(): Map<string, string> {
  if (archives) return archives;
  archives = new Map();
  const dir = path.join(process.cwd(), "data");
  const file = ["corpus.json", "seed-corpus.json"].map((f) => path.join(dir, f)).find((p) => existsSync(p));
  try {
    const raw: unknown = file ? JSON.parse(readFileSync(file, "utf8")) : [];
    const list = Array.isArray(raw) ? raw : [];
    for (const r of list as { id?: unknown; archived_url?: unknown }[]) {
      if (typeof r?.id === "string" && typeof r.archived_url === "string" && /^https?:\/\//.test(r.archived_url)) archives.set(r.id, r.archived_url);
    }
  } catch (err) {
    console.error("[source-meta] could not read corpus:", err);
  }
  return archives;
}

export interface SourceMeta { id: string; title: string; url: string; domain: string; fetched: string; archived: boolean; archivedUrl?: string }

export function sourceMeta(id: string): SourceMeta | undefined {
  const r = corpusById().get(id);
  if (!r) return undefined;
  const archivedUrl = archiveUrls().get(id);
  return { id, title: r.title, url: r.url, domain: r.domain, fetched: r.fetched.slice(0, 10), archived: r.extraction === "archived", ...(archivedUrl ? { archivedUrl } : {}) };
}
