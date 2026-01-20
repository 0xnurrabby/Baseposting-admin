export type SessionPayload = {
  username: string;
  issuedAt: number;
  nonce: string;
};

const encoder = new TextEncoder();

const toBase64 = (input: Uint8Array) => {
  let binary = "";
  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (input: string) => {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const base64UrlEncodeBytes = (input: Uint8Array) =>
  toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const base64UrlEncodeText = (input: string) =>
  btoa(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const base64UrlDecodeText = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
  const normalized = padded + "=".repeat(padLength);
  return atob(normalized);
};

const base64UrlDecodeBytes = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
  const normalized = padded + "=".repeat(padLength);
  return fromBase64(normalized);
};

const getSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }
  return secret;
};

export const getSessionCookieName = () =>
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";

export const signSession = async (payload: SessionPayload) => {
  const body = `${payload.username}:${payload.issuedAt}:${payload.nonce}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const signed = `${base64UrlEncodeText(body)}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
  return signed;
};

export const verifySession = async (token: string | undefined) => {
  if (!token) return null;
  const [bodyB64, sigB64] = token.split(".");
  if (!bodyB64 || !sigB64) return null;
  const body = base64UrlDecodeText(bodyB64);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signature = base64UrlDecodeBytes(sigB64);
  const valid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(body));
  if (!valid) return null;
  const [username, issuedAt, nonce] = body.split(":");
  if (!username || !issuedAt || !nonce) return null;
  return { username, issuedAt: Number(issuedAt), nonce } satisfies SessionPayload;
};
