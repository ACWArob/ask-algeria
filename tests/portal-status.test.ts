import { describe, expect, it, vi } from "vitest";
import sources from "@/data/sources.json";
import { STATUS_STRINGS } from "@/lib/i18n-status";
import { LOCALES } from "@/lib/i18n";
import {
  CURATED,
  PORTALS,
  TTL_MS,
  buildPortals,
  checkPortal,
  classifyError,
  classifyResponse,
  createStatusChecker,
  mapLimit,
  parseTesterNote,
} from "@/lib/portal-status";

const ok = (status = 200) => new Response("<html></html>", { status });

/** A fetch that never answers on its own, but rejects like undici when its signal aborts. */
const hangingFetch = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
  new Promise<Response>((_, reject) => {
    init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
  }),
) as unknown as typeof fetch;

const netError = (code: string) => Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error(code), { code }) });

describe("parseTesterNote", () => {
  it("reads works / not working / login with the date", () => {
    expect(parseTesterNote("Tester in Algeria (2026-10-30): works from inside Algeria.")).toEqual({ result: "works", date: "2026-10-30" });
    expect(parseTesterNote("Tester in Algeria (2026-10-30): not working from inside Algeria. WebFetch blocked by robots.txt")).toEqual({ result: "not_working", date: "2026-10-30" });
    expect(parseTesterNote("Tester in Algeria (2026-11-01): redirects to a login page.")).toEqual({ result: "login_only", date: "2026-11-01" });
  });

  it("ignores link corrections, even when the link contains 'login'", () => {
    expect(parseTesterNote("Tester in Algeria (2026-10-29): sheet link was wrong; correct site is https://x.dz/login.xhtml (was https://y.dz/).")).toEqual({ result: "unknown", date: null });
    expect(parseTesterNote("Tester in Algeria (2026-10-30): works from inside Algeria. Tester in Algeria (2026-10-30): correct site is https://www.dcwtiziouzou.dz/fr/ (was https://wilaya-tiziouzou.dz/). confidence medium")).toEqual({ result: "works", date: "2026-10-30" });
  });

  it("keeps the latest dated result", () => {
    expect(parseTesterNote("Tester in Algeria (2026-11-02): not working from inside Algeria. Tester in Algeria (2026-10-30): works from inside Algeria.")).toEqual({ result: "not_working", date: "2026-11-02" });
  });

  it("is unknown without a tester note", () => {
    expect(parseTesterNote("")).toEqual({ result: "unknown", date: null });
    expect(parseTesterNote(undefined)).toEqual({ result: "unknown", date: null });
    expect(parseTesterNote("WebFetch blocked by robots.txt - existence not proven by fetch")).toEqual({ result: "unknown", date: null });
  });
});

describe("curated portals", () => {
  it("are 15–20 entries, every one found in data/sources.json, unique ids", () => {
    expect(CURATED.length).toBeGreaterThanOrEqual(15);
    expect(CURATED.length).toBeLessThanOrEqual(20);
    expect(PORTALS.map((p) => p.id)).toEqual(CURATED.map((c) => c.id));
    expect(new Set(PORTALS.map((p) => p.id)).size).toBe(PORTALS.length);
  });

  it("take names from sources.json, Darija = Arabic name, purpose in 4 languages", () => {
    const byUrl = new Map((sources as { url: string; name_ar: string; name_fr: string }[]).map((s) => [s.url, s]));
    for (const p of PORTALS) {
      expect(p.names.dz).toBe(p.names.ar);
      expect(p.names.ar).toBe(byUrl.get(p.url)!.name_ar);
      expect(p.names.fr).toBe(byUrl.get(p.url)!.name_fr);
      for (const l of LOCALES) {
        expect(p.names[l], `${p.id} name ${l}`).toBeTruthy();
        expect(p.purpose[l], `${p.id} purpose ${l}`).toBeTruthy();
      }
    }
  });

  it("parse the tester result from the matching source's notes", () => {
    const fake = CURATED.map((c, i) => ({ url: c.url, name_en: "E", name_fr: "F", name_ar: "ع", notes: i === 0 ? "Tester in Algeria (2026-10-30): works from inside Algeria." : "" }));
    const built = buildPortals(fake);
    expect(built[0].insideAlgeria).toEqual({ result: "works", date: "2026-10-30" });
    expect(built[1].insideAlgeria.result).toBe("unknown");
  });
});

describe("status strings", () => {
  it("have identical keys (and the same number of tips) in all 4 languages", () => {
    const keys = Object.keys(STATUS_STRINGS.en).sort();
    for (const l of LOCALES) {
      expect(Object.keys(STATUS_STRINGS[l]).sort(), l).toEqual(keys);
      expect(STATUS_STRINGS[l].tips.length, l).toBe(STATUS_STRINGS.en.tips.length);
      for (const k of keys) expect(String(STATUS_STRINGS[l][k as keyof typeof STATUS_STRINGS.en]).length, `${l}.${k}`).toBeGreaterThan(0);
    }
  });

  it("keep the same {placeholders} as English", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const l of LOCALES) {
      for (const [k, v] of Object.entries(STATUS_STRINGS.en)) {
        if (typeof v === "string") expect(ph(STATUS_STRINGS[l][k as keyof typeof STATUS_STRINGS.en] as string), `${l}.${k}`).toEqual(ph(v));
      }
    }
  });

  it("Darija avoids Moroccan markers", () => {
    const all = JSON.stringify(STATUS_STRINGS.dz);
    for (const w of ["ديال", "دابا", "واخا", "غادي", "عافاك"]) expect(all).not.toContain(w);
  });
});

describe("classification", () => {
  it("maps HTTP codes", () => {
    expect(classifyResponse(200)).toBe("up");
    expect(classifyResponse(302)).toBe("up");
    expect(classifyResponse(401)).toBe("up");
    expect(classifyResponse(403)).toBe("blocked_or_timeout");
    expect(classifyResponse(451)).toBe("blocked_or_timeout");
    expect(classifyResponse(404)).toBe("down");
    expect(classifyResponse(503)).toBe("down");
  });

  it("maps network errors", () => {
    expect(classifyError(Object.assign(new Error("x"), { name: "AbortError" }))).toEqual({ outside: "blocked_or_timeout", error: "timeout" });
    expect(classifyError(netError("ENOTFOUND"))).toEqual({ outside: "down", error: "dns" });
    expect(classifyError(netError("CERT_HAS_EXPIRED"))).toEqual({ outside: "down", error: "tls" });
    expect(classifyError(netError("ECONNRESET"))).toEqual({ outside: "blocked_or_timeout", error: "network" });
    expect(classifyError(netError("ECONNREFUSED"))).toEqual({ outside: "down", error: "network" });
  });
});

describe("checkPortal", () => {
  it("sends a plain GET that follows redirects, with no cookies, and records code and time", async () => {
    let t = 1000;
    const f = vi.fn(async () => {
      t += 120;
      return ok(200);
    });
    const r = await checkPortal("https://bac.onec.dz/", { fetchImpl: f as unknown as typeof fetch, now: () => t });
    expect(r).toEqual({ outside: "up", code: 200, ms: 120, error: null });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://bac.onec.dz/");
    expect(init.method).toBe("GET");
    expect(init.redirect).toBe("follow");
    expect(init.credentials).toBe("omit");
    const headers = new Headers(init.headers);
    expect(headers.has("cookie")).toBe(false);
    expect(headers.has("authorization")).toBe(false);
    expect(init.body).toBeUndefined();
  });

  it("classifies a portal that never answers as blocked_or_timeout after the timeout", async () => {
    const started = Date.now();
    const r = await checkPortal("https://x.dz/", { fetchImpl: hangingFetch, timeoutMs: 30 });
    expect(r.outside).toBe("blocked_or_timeout");
    expect(r.error).toBe("timeout");
    expect(r.code).toBeNull();
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("times out even if fetch ignores the abort signal", async () => {
    const deaf = (() => new Promise<Response>(() => {})) as unknown as typeof fetch;
    const r = await checkPortal("https://x.dz/", { fetchImpl: deaf, timeoutMs: 30 });
    expect(r).toMatchObject({ outside: "blocked_or_timeout", error: "timeout", code: null });
  });

  it("reports 5xx as down and 403 as blocked", async () => {
    expect(await checkPortal("https://x.dz/", { fetchImpl: (async () => ok(503)) as unknown as typeof fetch })).toMatchObject({ outside: "down", code: 503 });
    expect(await checkPortal("https://x.dz/", { fetchImpl: (async () => ok(403)) as unknown as typeof fetch })).toMatchObject({ outside: "blocked_or_timeout", code: 403 });
    expect(await checkPortal("https://x.dz/", { fetchImpl: (async () => { throw netError("ENOTFOUND"); }) as unknown as typeof fetch })).toMatchObject({ outside: "down", error: "dns", code: null });
  });
});

describe("createStatusChecker", () => {
  const portals = [
    { id: "a", url: "https://a.dz/" },
    { id: "b", url: "https://b.dz/" },
    { id: "c", url: "https://c.dz/" },
  ];

  it("caches results for 10 minutes, then checks again", async () => {
    let t = Date.parse("2026-11-03T12:00:00Z");
    const f = vi.fn(async () => ok(200));
    const checker = createStatusChecker({ portals, fetchImpl: f as unknown as typeof fetch, now: () => t });
    const first = await checker.get();
    expect(first.results.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(first.checkedAt).toBe("2026-11-03T12:00:00.000Z");
    expect(f).toHaveBeenCalledTimes(3);

    t += TTL_MS - 1;
    expect(await checker.get()).toBe(first);
    expect(f).toHaveBeenCalledTimes(3);

    t += 1;
    const second = await checker.get();
    expect(f).toHaveBeenCalledTimes(6);
    expect(second.checkedAt).toBe("2026-11-03T12:10:00.000Z");
  });

  it("shares one running check between simultaneous callers", async () => {
    const f = vi.fn(async () => ok(200));
    const checker = createStatusChecker({ portals, fetchImpl: f as unknown as typeof fetch });
    const all = await Promise.all(Array.from({ length: 50 }, () => checker.get()));
    expect(f).toHaveBeenCalledTimes(3);
    expect(new Set(all).size).toBe(1);
  });

  it("returns every portal even when some time out", async () => {
    const f = ((url: string, init?: RequestInit) => (url.includes("b.dz") ? hangingFetch(url, init) : Promise.resolve(ok(200)))) as unknown as typeof fetch;
    const checker = createStatusChecker({ portals, fetchImpl: f, timeoutMs: 30 });
    const { results } = await checker.get();
    expect(results.map((r) => [r.id, r.outside])).toEqual([["a", "up"], ["b", "blocked_or_timeout"], ["c", "up"]]);
  });
});

describe("mapLimit", () => {
  it("never runs more than the cap at once and keeps order", async () => {
    let running = 0;
    let peak = 0;
    const out = await mapLimit(Array.from({ length: 12 }, (_, i) => i), 4, async (i) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      running--;
      return i * 2;
    });
    expect(peak).toBe(4);
    expect(out).toEqual(Array.from({ length: 12 }, (_, i) => i * 2));
  });
});
