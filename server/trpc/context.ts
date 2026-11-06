import { authService, SESSION_COOKIE, type SessionContext } from "@/server/auth";

export type Context = {
  requestId: string;
  session: SessionContext | null;
};

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

// Dibuat per permintaan. Sesi dibaca dari cookie di server, tidak dari input klien.
export async function createContext(req: Request): Promise<Context> {
  const token = readCookie(req.headers.get("cookie"), SESSION_COOKIE);
  return {
    requestId: crypto.randomUUID(),
    session: await authService.resolveSession(token),
  };
}
