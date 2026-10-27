export interface CorpusRecord {
  id: string;
  title: string;
  url: string;
  domain: string;
  lang: string;
  topic: string;
  fetched: string;
  text: string;
}
export interface Chunk {
  id: string;
  docId: string;
  title: string;
  url: string;
  domain: string;
  lang: string;
  topic: string;
  text: string;
}
export const CHUNK_SIZE: number;
export const CHUNK_OVERLAP: number;
export const INDEX_VERSION: number;
export function normalizeTerm(term: string): string | null;
export function chunkText(text: string, size?: number, overlap?: number): string[];
export function normalizeCorpus(raw: unknown): CorpusRecord[];
export function buildChunks(records: CorpusRecord[]): Chunk[];
import type { Options } from "minisearch";
export const MINISEARCH_OPTIONS: Options<Chunk>;
