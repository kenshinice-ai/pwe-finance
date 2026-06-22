import { clearSessionCookie, jsonResponse } from "../_lib/admin-auth.js";

export function onRequestPost() {
  return jsonResponse({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
