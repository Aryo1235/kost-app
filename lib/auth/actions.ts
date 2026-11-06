// Panggilan ke route autentikasi biasa (bukan tRPC), sesuai TECH-SPEC 3.4.

type JsonResult = { ok: true; data: Record<string, unknown> } | { ok: false; code: string | null };

async function postJson(url: string, body?: unknown): Promise<JsonResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data };
    return { ok: false, code: typeof data.code === "string" ? data.code : null };
  } catch {
    return { ok: false, code: null };
  }
}

export function login(username: string, password: string) {
  return postJson("/api/auth/login", { username, password });
}

export function logout() {
  return postJson("/api/auth/logout");
}

export function changePassword(currentPassword: string, newPassword: string) {
  return postJson("/api/auth/change-password", { currentPassword, newPassword });
}
