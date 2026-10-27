"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface CiteTarget {
  n: number;
  title: string;
  url: string;
  domain: string;
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Turns [1], [1][2], [1, 2] and [١] into markdown links "#cite-n" that the renderer swaps for chips. */
export function linkCitations(md: string): string {
  return md.replace(/\[([0-9٠-٩]{1,2}(?:\s*[,،]\s*[0-9٠-٩]{1,2})*)\](?!\()/g, (_m, inner: string) =>
    inner
      .split(/\s*[,،]\s*/)
      .map((d) => {
        const n = d.replace(/[٠-٩]/g, (c) => String(AR_DIGITS.indexOf(c)));
        return `[${n}](#cite-${n})`;
      })
      .join(""),
  );
}

export function Markdown({ text, cites = [] }: { text: string; cites?: CiteTarget[] }) {
  const byN = new Map(cites.map((c) => [c.n, c]));
  return (
    <div className="answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const m = href?.match(/^#cite-(\d+)$/);
            if (m) {
              const c = byN.get(Number(m[1]));
              if (!c) return <sup className="text-muted">[{m[1]}]</sup>;
              return (
                <a className="cite" href={c.url} target="_blank" rel="noopener noreferrer" title={`${c.title} — ${c.domain}`} aria-label={`[${c.n}] ${c.title}`}>
                  {c.n}
                </a>
              );
            }
            const external = href && /^https?:/.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
          img: () => null,
        }}
      >
        {linkCitations(text)}
      </ReactMarkdown>
    </div>
  );
}
