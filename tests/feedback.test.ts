import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/feedback/route";

const req = (body: unknown, ip = "203.0.113.7") =>
  new Request("http://x/api/feedback", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify(body) });

afterEach(() => vi.restoreAllMocks());

describe("contact us", () => {
  it("logs the message redacted, keeps the reply address only from its own field", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await POST(req({ kind: "contact", message: "Broken link on the status page, call me on +213 555 12 34 56", replyTo: "amel@example.com", lang: "fr" }));
    expect(r.status).toBe(200);
    const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.startsWith("[contact]"))!;
    const entry = JSON.parse(line.slice("[contact] ".length));
    expect(entry).toMatchObject({ kind: "contact", replyTo: "amel@example.com", lang: "fr" });
    expect(entry.message).toContain("Broken link");
    expect(entry.message).not.toContain("555 12 34 56");
  });

  it("refuses an empty message and drops a malformed reply address", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect((await POST(req({ kind: "contact", message: " " }, "203.0.113.8"))).status).toBe(400);
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await POST(req({ kind: "contact", message: "Great site", replyTo: "not an email" }, "203.0.113.9"));
    const line = log.mock.calls.map((c) => String(c[0])).find((l) => l.startsWith("[contact]"))!;
    expect(JSON.parse(line.slice(10)).replyTo).toBeUndefined();
  });

  it("answer feedback still needs a rating", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect((await POST(req({ comment: "x" }, "203.0.113.10"))).status).toBe(400);
  });
});
