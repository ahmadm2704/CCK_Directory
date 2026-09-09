// Uses the Web Crypto API (globalThis.crypto) instead of Node's `crypto` module
// so this also works in the Edge Runtime, where middleware executes.

const COOKIE_NAME = "cck_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmac(issuedAt);
  return `${issuedAt}.${sig}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;

  const expected = await hmac(issuedAt);
  if (!timingSafeEqualHex(sig, expected)) return false;

  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age <= MAX_AGE_MS;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;
