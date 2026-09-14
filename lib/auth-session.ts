/**
 * Edge-safe admin session token helpers (usable from proxy/middleware).
 * Cookie read/write lives in `lib/auth.ts` (server-only).
 */

export const ADMIN_SESSION_COOKIE = "gg_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    "dev-only-insecure-auth-secret"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodePayload(value: string): string {
  return toBase64Url(new TextEncoder().encode(value));
}

function decodePayload(value: string): string {
  return new TextDecoder().decode(fromBase64Url(value));
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(new Uint8Array(signature));
}

async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await signPayload(payload, secret);
  if (expected.length !== signature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionToken(
  admin: AdminUser
): Promise<string> {
  const payload: SessionPayload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = encodePayload(JSON.stringify(payload));
  const signature = await signPayload(encoded, getAuthSecret());
  return `${encoded}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<AdminUser | null> {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const valid = await verifySignature(encoded, signature, getAuthSecret());
  if (!valid) return null;

  try {
    const payload = JSON.parse(decodePayload(encoded)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (!payload.sub || !payload.email) return null;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || "Admin",
    };
  } catch {
    return null;
  }
}

export function getAdminSessionMaxAge(): number {
  return SESSION_MAX_AGE_SECONDS;
}

export function getSafeAdminRedirect(
  redirect: string | null | undefined
): string {
  if (!redirect) return "/admin";
  if (!redirect.startsWith("/admin")) return "/admin";
  if (redirect.startsWith("//")) return "/admin";
  if (redirect.includes("://")) return "/admin";
  if (redirect === "/admin/login" || redirect.startsWith("/admin/login?")) {
    return "/admin";
  }
  return redirect;
}
