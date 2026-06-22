import { createSessionCookie, isIpAllowed, jsonResponse } from "../_lib/admin-auth.js";

export async function onRequestPost({ request, env }) {
  if (!isIpAllowed(request, env)) {
    return jsonResponse({ ok: false, error: "This IP address is not allowed." }, 403);
  }

  if (!env.ADMIN_PASSWORD) {
    return jsonResponse({ ok: false, error: "ADMIN_PASSWORD is not configured." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON request." }, 400);
  }

  if (!body.password || body.password !== env.ADMIN_PASSWORD) {
    return jsonResponse({ ok: false, error: "Incorrect password." }, 401);
  }

  const cookie = await createSessionCookie(env);
  return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookie });
}
