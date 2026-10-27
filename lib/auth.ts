/**
 * Session token signing/verification using Web Crypto only, so the same code
 * runs in the Edge middleware, Node route handlers and vitest.
 *
 * Token format: `<expiryEpochSeconds>.<base64url HMAC-SHA256("v1." + expiry)>`
 *
 * Signing key: AUTH_SECRET when set; otherwise a key derived from SITE_PASSWORD
 * (HMAC-SHA256 of the password with a fixed app salt). Changing the password
 * therefore logs everyone out unless AUTH_SECRET is set.
 */

const APP_SALT = "ask-algeria/session-key/v1";
const enc = new TextEncoder();

export interface AuthEnv {
  AUTH_SECRET?: string;
  SITE_PASSWORD?: string;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function hmacKey(raw: Uint8Array, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, usages);
}

/** Returns the raw signing key bytes, or null if neither secret is configured. */
export async function signingKeyBytes(env: AuthEnv): Promise<Uint8Array | null> {
  const secret = env.AUTH_SECRET?.trim();
  if (secret) return enc.encode(secret);
  const pw = env.SITE_PASSWORD;
  if (!pw) return null;
  const k = await hmacKey(enc.encode(APP_SALT), ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(pw)));
}

export async function signToken(env: AuthEnv, maxAgeSeconds: number, now = Date.now()): Promise<string> {
  const raw = await signingKeyBytes(env);
  if (!raw) throw new Error("SITE_PASSWORD is not configured");
  const exp = Math.floor(now / 1000) + maxAgeSeconds;
  const key = await hmacKey(raw, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`v1.${exp}`));
  return `${exp}.${b64url(sig)}`;
}

export async function verifyToken(env: AuthEnv, token: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{20,100})$/.exec(token);
  if (!m) return false;
  const exp = Number(m[1]);
  if (!Number.isFinite(exp) || exp * 1000 < now) return false;
  const sig = fromB64url(m[2]);
  if (!sig) return false;
  const raw = await signingKeyBytes(env);
  if (!raw) return false;
  const key = await hmacKey(raw, ["verify"]);
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", key, sig as BufferSource, enc.encode(`v1.${exp}`));
}

/** Constant-time string equality (compares SHA-256 digests so lengths never leak). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(da);
  const y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
