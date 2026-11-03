import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import corpus from "@/data/corpus.json";
import { GUIDES } from "@/lib/guides";
import en from "@/lib/i18n/en.json";
import fr from "@/lib/i18n/fr.json";
import ar from "@/lib/i18n/ar.json";
import dz from "@/lib/i18n/dz.json";
import { docHtml, packetFiles } from "@/lib/packet-html";
import {
  buildPacket,
  cleanDetails,
  emptyDetails,
  mentionsOffice,
  officeWords,
  PROCEDURES,
  type PrepareProcedure,
} from "@/lib/prepare";
import { crc32, zipBytes } from "@/lib/zip";

// ───────── ZIP writer ─────────

describe("zip writer", () => {
  it("computes the standard CRC-32", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  const files = [
    { name: "1-checklist.html", data: "<!doctype html><p>hello</p>" },
    { name: "2-رسالة.html", data: "<!doctype html><html dir=\"rtl\"><p>السلام عليكم — إمضاء</p></html>" },
    { name: "3-empty.txt", data: "" },
  ];
  const bytes = zipBytes(files, new Date(2026, 9, 31, 14, 30, 10));

  it("writes valid local headers, central directory and end record (checked in JS)", () => {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const eocd = bytes.length - 22;
    expect(v.getUint32(eocd, true)).toBe(0x06054b50);
    expect(v.getUint16(eocd + 10, true)).toBe(files.length);
    const cdSize = v.getUint32(eocd + 12, true);
    const cdOff = v.getUint32(eocd + 16, true);
    expect(cdOff + cdSize).toBe(eocd);
    let p = cdOff;
    const dec = new TextDecoder();
    for (const f of files) {
      expect(v.getUint32(p, true)).toBe(0x02014b50);
      expect(v.getUint16(p + 8, true) & 0x0800).toBe(0x0800); // UTF-8 names
      const crc = v.getUint32(p + 16, true);
      const size = v.getUint32(p + 20, true);
      const nameLen = v.getUint16(p + 28, true);
      const local = v.getUint32(p + 42, true);
      expect(dec.decode(bytes.subarray(p + 46, p + 46 + nameLen))).toBe(f.name);
      expect(v.getUint32(local, true)).toBe(0x04034b50);
      const lNameLen = v.getUint16(local + 26, true);
      const data = bytes.subarray(local + 30 + lNameLen, local + 30 + lNameLen + size);
      expect(dec.decode(data)).toBe(f.data);
      expect(crc32(data)).toBe(crc);
      p += 46 + nameLen;
    }
  });

  it("is read back by Python's zipfile with matching CRCs and contents", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "aa-zip-"));
    const file = path.join(dir, "packet.zip");
    writeFileSync(file, bytes);
    const script = [
      "import json, sys, zipfile",
      "z = zipfile.ZipFile(sys.argv[1])",
      "bad = z.testzip()",
      "print(json.dumps({'bad': bad, 'files': {i.filename: [i.compress_type, z.read(i).decode('utf-8')] for i in z.infolist()}}))",
    ].join("\n");
    let out: string;
    try {
      out = execFileSync("python3", ["-I", "-c", script, file], { encoding: "utf8" });
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return; // no python on this machine: the JS check above still ran
      throw e;
    }
    const r = JSON.parse(out) as { bad: string | null; files: Record<string, [number, string]> };
    expect(r.bad).toBeNull();
    expect(Object.keys(r.files)).toEqual(files.map((f) => f.name));
    for (const f of files) expect(r.files[f.name]).toEqual([0, f.data]); // 0 = stored
    expect(readFileSync(file).length).toBe(bytes.length);
  });
});

// ───────── Procedures, checklist and letter ─────────

const ids = new Set((corpus as { id: string }[]).map((r) => r.id));

describe("prepare config", () => {
  it("every procedure is a guide, every section exists, every situation has a label in all 4 languages", () => {
    for (const p of PROCEDURES) {
      const g = GUIDES[p.slug];
      expect(g, p.slug).toBeTruthy();
      for (const s of p.situations) {
        for (const sec of [...p.base, ...s.sections]) expect(g.sections.some((x) => x.id === sec), `${p.slug}/${sec}`).toBe(true);
        for (const d of [en, fr, ar, dz]) expect((d.prepare.situations as Record<string, string>)[s.id], s.id).toBeTruthy();
        // checklist points come from cited corpus records only
        for (const sec of [...p.base, ...s.sections]) for (const pt of g.sections.find((x) => x.id === sec)!.points) expect(pt.cites.some((c) => ids.has(c))).toBe(true);
      }
    }
  });

  it("finds the person's office as a whole word, in Latin or Arabic script", () => {
    expect(officeWords("Consulat général d'Algérie à Lyon")).toContain("lyon");
    expect(officeWords("Consulate General in London")).toEqual(["london"]);
    expect(mentionsOffice("London says you must present a valid ID", ["london"])).toBe(true);
    expect(mentionsOffice("Londonderry office", ["london"])).toBe(false);
    expect(mentionsOffice("تذكر قنصلية لندن أن…", officeWords("القنصلية العامة لندن"))).toBe(true);
    expect(mentionsOffice("anything", [])).toBe(false);
    expect(officeWords("Consulat général d'Algérie à Lyon")).toEqual(["lyon"]);
    expect(officeWords("APC de Bab El Oued")).not.toContain("apc");
    expect(mentionsOffice("تذكر قنصلية لندن أن…", officeWords("سفارة الجزائر بلندن"))).toBe(true);
  });

  it("keeps only known string fields from storage", () => {
    expect(cleanDetails({ firstName: "Amel", evil: "x", phone: 5 })).toEqual({ ...emptyDetails(), firstName: "Amel" });
    expect(cleanDetails(null)).toEqual(emptyDetails());
  });
});

const proc: PrepareProcedure = {
  slug: "passport",
  title: "Biometric passport",
  guideHref: "/services/passport",
  portals: [{ label: "Portal", url: "https://passeport.interieur.gov.dz" }],
  situations: [
    {
      id: "passport-first",
      label: "First passport",
      office: "consulate",
      groups: [{ title: "Documents", points: [
        { text: "Valid consular card.", match: "Valid consular card.", nums: [1] },
        { text: "London asks for four photos.", match: "London asks for four photos.", nums: [2] },
      ] }],
      sources: [{ n: 1, title: "A", url: "https://a.example/x", domain: "a.example" }, { n: 2, title: "B", url: "https://b.example/y", domain: "b.example" }],
      letterSubject: { en: "Biometric passport — First passport", fr: "Passeport — Premier passeport", ar: "جواز السفر — أول جواز سفر" },
    },
    { id: "cni", label: "ID card (online)", office: "online", groups: [], sources: [], letterSubject: { en: "x", fr: "x", ar: "x" } },
  ],
};

function packet(situation = 0, letterLang: "en" | "fr" | "ar" = "fr", details = {}) {
  return buildPacket({
    procedure: proc,
    situation: proc.situations[situation],
    details: { ...emptyDetails(), ...details },
    uiLang: "en",
    uiDir: "ltr",
    text: {
      brand: en.brand.name, independent: en.strip.independent, notOfficial: en.prepare.notOfficial, prepared: en.prepare.prepared,
      docs: en.prepare.docs, checklistIntro: en.prepare.checklistIntro, mine: en.prepare.mine, sources: en.prepare.sources,
      detailsIntro: en.prepare.detailsIntro, linksIntro: en.prepare.linksIntro, fields: en.prepare.fields,
    },
    letterLang,
    letter: { en: en.prepare.letter, fr: fr.prepare.letter, ar: ar.prepare.letter }[letterLang],
    formLabels: { fr: fr.prepare.fields, ar: ar.prepare.fields },
    today: new Date(2026, 9, 31),
    formatDate: (d) => d.toISOString().slice(0, 10),
  });
}

describe("packet", () => {
  it("builds checklist, letter, details and links; the person's office goes first", () => {
    const p = packet(0, "fr", { lastName: "Benali", firstName: "Amel", office: "Consulat général à Londres, London", city: "London", nin: "1234" });
    expect(p.docs.map((d) => d.kind)).toEqual(["checklist", "letter", "details", "links"]);
    const c = p.docs[0];
    if (c.kind !== "checklist") throw new Error();
    expect(c.groups[0].items[0]).toMatchObject({ mine: true, text: "London asks for four photos." });
    const l = p.docs[1];
    if (l.kind !== "letter") throw new Error();
    expect(l.lang).toBe("fr");
    expect(l.to[0]).toBe(fr.prepare.letter.addressee.consulate);
    expect(l.paragraphs[0]).toContain("BENALI Amel");
    expect(l.paragraphs[0]).toContain(fr.prepare.letter.blank); // empty fields become blanks to fill by hand
    expect(l.paragraphs.join(" ")).toContain("1234");
    expect(l.subject).toBe("Passeport — Premier passeport");
  });

  it("Arabic letter is RTL and uses the Arabic name; online situations have no letter", () => {
    const l = packet(0, "ar", { lastName: "Benali", nameAr: "أمال بن علي" }).docs[1];
    expect(l).toMatchObject({ kind: "letter", dir: "rtl", lang: "ar" });
    if (l.kind === "letter") expect(l.paragraphs[0]).toContain("أمال بن علي");
    expect(packet(1).docs.map((d) => d.kind)).toEqual(["checklist", "details", "links"]);
  });

  it("standalone HTML files: doctype, UTF-8, dir, escaping, independence notice", () => {
    const p = packet(0, "ar", { firstName: "<script>alert(1)</script>" });
    const files = packetFiles(p);
    expect(files.map((f) => f.name)).toEqual(["1-checklist.html", "2-letter.html", "3-my-details.html", "4-official-links.html"]);
    for (const f of files) {
      const html = String(f.data);
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).toContain('<meta charset="utf-8">');
      // every file says it's independent and not an official form (the letter in its own language)
      expect(html).toContain(f.name.includes("letter") ? ar.prepare.letter.notice : en.strip.independent);
      expect(html).not.toContain("<script>");
    }
    expect(String(files[1].data)).toContain('dir="rtl"');
    expect(String(files[0].data)).toContain('dir="ltr"');
    expect(docHtml(p, p.docs[2])).toContain("&lt;script&gt;");
  });
});
