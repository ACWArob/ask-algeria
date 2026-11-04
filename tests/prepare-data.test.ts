import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { prepareProcedures } = await import("@/lib/prepare-data");

describe("Prepare my file data for someone living in Algeria", () => {
  it("has no consulate pages or consulate rules in any in-Algeria checklist", () => {
    for (const p of prepareProcedures("en"))
      for (const s of p.situations.filter((x) => x.place === "algeria")) {
        for (const g of s.groups) for (const pt of g.points) expect(pt.offices ?? [], `${p.slug}/${s.id}: ${pt.text}`).toEqual([]);
        for (const src of s.sources) expect(src.domain, `${p.slug}/${s.id}`).not.toMatch(/\.mfa\.gov\.dz$|consulat|consulate|embassy|ambassade/i);
        expect(s.groups.some((g) => g.points.length), `${p.slug}/${s.id} has points`).toBe(true);
      }
  });
});
