const COOKIE_NAME = "pwe_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function base64UrlEncode(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload, secret) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function getSessionSecret(env) {
  return env.SESSION_SECRET || env.ADMIN_PASSWORD || "";
}

export function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export function getClientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "";
}

export function isIpAllowed(request, env) {
  const raw = (env.ALLOWED_ADMIN_IPS || "").trim();
  if (!raw) return true;
  const allowed = raw.split(",").map((item) => item.trim()).filter(Boolean);
  return allowed.includes(getClientIp(request));
}

export async function createSessionCookie(env) {
  const secret = getSessionSecret(env);
  if (!secret) {
    throw new Error("ADMIN_PASSWORD or SESSION_SECRET is required");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(JSON.stringify({
    role: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }));
  const signature = await signPayload(payload, secret);
  const token = `${payload}.${signature}`;
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function requireAdmin(request, env) {
  if (!isIpAllowed(request, env)) {
    return { ok: false, response: jsonResponse({ ok: false, error: "This IP address is not allowed." }, 403) };
  }

  const secret = getSessionSecret(env);
  if (!secret) {
    return { ok: false, response: jsonResponse({ ok: false, error: "Admin authentication is not configured." }, 500) };
  }

  const token = readCookie(request, COOKIE_NAME);
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, response: jsonResponse({ ok: false, error: "Admin login required." }, 401) };
  }

  const [payload, signature] = parts;
  const expectedSignature = await signPayload(payload, secret);
  if (signature !== expectedSignature) {
    return { ok: false, response: jsonResponse({ ok: false, error: "Invalid admin session." }, 401) };
  }

  let session;
  try {
    session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  } catch {
    return { ok: false, response: jsonResponse({ ok: false, error: "Invalid admin session." }, 401) };
  }

  if (session.role !== "admin" || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, response: jsonResponse({ ok: false, error: "Admin session expired." }, 401) };
  }

  return { ok: true, session };
}
