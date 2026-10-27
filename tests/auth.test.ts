import { describe, expect, it } from "vitest";
import { safeEqual, signToken, verifyToken } from "@/lib/auth";

const DAY = 86400;

describe("auth tokens", () => {
  const env = { AUTH_SECRET: "test-secret-abc", SITE_PASSWORD: "pw" };

  it("signs and verifies", async () => {
    const t = await signToken(env, 7 * DAY);
    expect(await verifyToken(env, t)).toBe(true);
  });

  it("rejects tampered, expired, and foreign tokens", async () => {
    const t = await signToken(env, 7 * DAY);
    const [exp, sig] = t.split(".");
    expect(await verifyToken(env, `${Number(exp) + 1000}.${sig}`)).toBe(false);
    expect(await verifyToken(env, `${exp}.${sig.slice(0, -2)}xx`)).toBe(false);
    expect(await verifyToken(env, t, Date.now() + 8 * DAY * 1000)).toBe(false);
    expect(await verifyToken({ AUTH_SECRET: "other" }, t)).toBe(false);
    expect(await verifyToken(env, "")).toBe(false);
    expect(await verifyToken(env, "garbage")).toBe(false);
  });

  it("derives a key from SITE_PASSWORD when AUTH_SECRET is unset", async () => {
    const a = { SITE_PASSWORD: "hunter2" };
    const t = await signToken(a, DAY);
    expect(await verifyToken(a, t)).toBe(true);
    expect(await verifyToken({ SITE_PASSWORD: "hunter3" }, t)).toBe(false);
    // Using AUTH_SECRET changes the key
    expect(await verifyToken({ SITE_PASSWORD: "hunter2", AUTH_SECRET: "x" }, t)).toBe(false);
  });

  it("refuses to sign with no secret configured", async () => {
    await expect(signToken({}, DAY)).rejects.toThrow();
    expect(await verifyToken({}, "123.abc")).toBe(false);
  });

  it("safeEqual compares correctly", async () => {
    expect(await safeEqual("abc", "abc")).toBe(true);
    expect(await safeEqual("abc", "abd")).toBe(false);
    expect(await safeEqual("abc", "abcd")).toBe(false);
  });
});
