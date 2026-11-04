/**
 * Standalone HTML files for the "Download all" ZIP: one complete, printable page per packet document
 * (own <!doctype html>, UTF-8, lang/dir set, inline CSS, no scripts, no external resources).
 */
import type { Packet, PacketDoc } from "@/lib/prepare";
import type { ZipEntry } from "@/lib/zip";

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Only http(s) links make it into a file. */
export function safeUrl(u: string): string {
  return /^https?:\/\//i.test(u) ? u : "#";
}

const CSS = `
*{box-sizing:border-box}
body{margin:0 auto;max-width:46rem;padding:2rem 1.25rem;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Tahoma,"Noto Sans Arabic",sans-serif;color:#111;background:#fff}
[dir=rtl] body,body[dir=rtl]{line-height:1.85}
.top{font-size:.8rem;color:#555;border-bottom:1px solid #ccc;padding-bottom:.5rem;margin-bottom:1.5rem}
h1{font-size:1.5rem;margin:0 0 .25rem}
h2{font-size:1.1rem;margin:1.5rem 0 .5rem}
.sub{color:#444;margin:0 0 1rem}
ul.check{list-style:none;padding:0;margin:0}
ul.check li{display:flex;gap:.6rem;align-items:flex-start;padding:.4rem 0;border-bottom:1px solid #eee}
ul.check input{margin-top:.35rem;width:1rem;height:1rem;flex:none}
.mine{display:inline-block;font-size:.75rem;font-weight:700;border:1px solid #333;border-radius:.3rem;padding:0 .3rem;margin-inline-end:.3rem}
.nums{font-size:.75rem;color:#555;white-space:nowrap}
.extras{margin-top:1.5rem;border:1px dashed #888;border-radius:.4rem;padding:.25rem .9rem .6rem}
.extras h2{margin-top:.75rem}
.extras .sub{font-size:.9rem}
ol.src{padding-inline-start:1.4rem;font-size:.9rem}
ol.src a,.links a{color:#0b5a32;word-break:break-word}
.url{display:block;font-size:.8rem;color:#555;direction:ltr;text-align:start;word-break:break-all}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #bbb;padding:.5rem .6rem;text-align:start;vertical-align:top}
th{width:40%;font-weight:600}
th small{display:block;font-weight:400;color:#555}
td{min-height:2rem}
.letter p{margin:0 0 .9rem}
.addr{margin-bottom:1.25rem}
.addr b{display:block;font-size:.8rem;color:#555}
.date{text-align:end;margin-bottom:1.25rem}
.sig{margin-top:2.5rem;text-align:end}
.sig .line{display:inline-block;min-width:12rem;border-bottom:1px solid #333;height:3rem}
.foot{margin-top:2rem;border-top:1px solid #ccc;padding-top:.5rem;font-size:.8rem;color:#555}
@page{margin:16mm}
@media print{body{padding:0;max-width:none}a{color:#000}}
`;

export function docBody(doc: PacketDoc): string {
  switch (doc.kind) {
    case "checklist":
      return `<h1>${esc(doc.title)}</h1><p class="sub">${esc(doc.intro)}</p>${doc.groups
        .map(
          (g) =>
            `<h2>${esc(g.title)}</h2><ul class="check">${g.items
              .map(
                (it) =>
                  `<li><label><input type="checkbox"><span>${it.mine ? `<span class="mine">${esc(doc.mineLabel)}</span>` : ""}${esc(it.text)}${
                    it.nums.length ? ` <span class="nums">[${it.nums.join(", ")}]</span>` : ""
                  }</span></label></li>`,
              )
              .join("")}</ul>`,
        )
        .join("")}${
        doc.extras
          ? `<section class="extras"><h2>${esc(doc.extras.title)}</h2><p class="sub">${esc(doc.extras.note)}</p><ul class="check">${doc.extras.items
              .map((x) => `<li><label><input type="checkbox"><span>${esc(x)}</span></label></li>`)
              .join("")}</ul></section>`
          : ""
      }${
        doc.sources.length
          ? `<h2>${esc(doc.sourcesTitle)}</h2><ol class="src">${doc.sources
              .map((s) => `<li><a href="${esc(safeUrl(s.url))}">${esc(s.title)}</a><span class="url">${esc(s.url)}</span></li>`)
              .join("")}</ol>`
          : ""
      }`;
    case "letter":
      return `<div class="letter"><div class="addr"><b>${esc(doc.fromLabel)}</b>${doc.from.map(esc).join("<br>")}</div><div class="addr"><b>${esc(
        doc.toLabel,
      )}</b>${doc.to.map(esc).join("<br>")}</div><p class="date">${esc(doc.placeDate)}</p><p><strong>${esc(doc.subjectLabel)}</strong> ${esc(
        doc.subject,
      )}</p><p>${esc(doc.salutation)}</p>${doc.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}<p>${esc(doc.closing)}</p><div class="sig"><div>${esc(
        doc.signatureLabel,
      )}</div><div class="line"></div><div>${esc(doc.signatureName)}</div></div></div>`;
    case "details":
      return `<h1>${esc(doc.title)}</h1><p class="sub">${esc(doc.intro)}</p><table><tbody>${doc.rows
        .map((r) => `<tr><th scope="row">${esc(r.label)}${r.alt ? `<small>${esc(r.alt)}</small>` : ""}</th><td dir="auto">${esc(r.value)}</td></tr>`)
        .join("")}</tbody></table>`;
    case "links":
      return `<h1>${esc(doc.title)}</h1><p class="sub">${esc(doc.intro)}</p><ul class="links">${doc.links
        .map((l) => `<li><a href="${esc(safeUrl(l.url))}">${esc(l.label)}</a><span class="url">${esc(l.url)}</span></li>`)
        .join("")}</ul>`;
  }
}

export function docHtml(packet: Packet, doc: PacketDoc): string {
  return `<!doctype html>
<html lang="${esc(doc.lang)}" dir="${doc.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(doc.kind === "letter" ? `${doc.title} · ${doc.subject}` : `${doc.title} · ${packet.title}`)}</title>
<style>${CSS}</style>
</head>
<body>
${doc.kind === "letter" ? "" : `<div class="top">${esc(packet.brand)} · ${esc(packet.independent)} — ${esc(packet.title)}</div>\n`}${docBody(doc)}
<p class="foot">${doc.kind === "letter" ? esc(doc.notice) : `${esc(packet.notOfficial)} ${esc(packet.prepared)}`}</p>
</body>
</html>
`;
}

const FILE: Record<PacketDoc["kind"], string> = { checklist: "checklist", letter: "letter", details: "my-details", links: "official-links" };

/** One standalone .html file per document, numbered in packet order. */
export function packetFiles(packet: Packet): ZipEntry[] {
  return packet.docs.map((d, i) => ({ name: `${i + 1}-${FILE[d.kind]}.html`, data: docHtml(packet, d) }));
}
