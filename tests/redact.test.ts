import { describe, expect, it } from "vitest";
import { redact, REMOVED } from "@/lib/redact";

describe("redact", () => {
  it("removes an 18-digit NIN", () => {
    const r = redact("Mon NIN est 109876543210987654 merci");
    expect(r.text).toBe(`Mon NIN est ${REMOVED} merci`);
    expect(r.removed).toBe(1);
  });

  it("removes a 20-digit RIP, also when grouped", () => {
    expect(redact("RIP 00799999001234567890").text).toBe(`RIP ${REMOVED}`);
    expect(redact("RIP 0079 9999 0012 3456 7890").text).toBe(`RIP ${REMOVED}`);
  });

  it("removes Algerian mobile numbers in local and international form", () => {
    expect(redact("appelez 0551234567").text).toBe(`appelez ${REMOVED}`);
    expect(redact("call 05 51 23 45 67 now").text).toBe(`call ${REMOVED} now`);
    expect(redact("+213 551 23 45 67").text).toBe(REMOVED);
    expect(redact("00213661234567").text).toBe(REMOVED);
  });

  it("removes emails", () => {
    const r = redact("write to karim.b@example.dz please");
    expect(r.text).toBe(`write to ${REMOVED} please`);
    expect(r.kinds).toContain("email");
  });

  it("removes card numbers", () => {
    expect(redact("carte 6280 1234 5678 9012").text).toBe(`carte ${REMOVED}`);
  });

  it("removes passport-like codes and keyword-tagged numbers", () => {
    expect(redact("passeport AB1234567").text).toBe(`passeport ${REMOVED}`);
    expect(redact("رقم جواز السفر 123456789").text).toBe(`رقم جواز السفر ${REMOVED}`);
  });

  it("handles Arabic-Indic digits", () => {
    expect(redact("رقمي ٠٥٥١٢٣٤٥٦٧").text).toBe(`رقمي ${REMOVED}`);
  });

  it("leaves ordinary text, years, fees and short numbers alone", () => {
    const s = "Le timbre coûte 6000 DA, délai 15 jours, loi 2023-12, formulaire 12S.";
    const r = redact(s);
    expect(r.text).toBe(s);
    expect(r.removed).toBe(0);
  });
});
