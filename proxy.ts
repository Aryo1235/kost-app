import { NextResponse, type NextRequest } from "next/server";

// Penjaga ringan: hanya memeriksa keberadaan cookie sesi (TECH-SPEC 6.1).
// Otorisasi sebenarnya ada di backend. Cookie yang palsu tetap ditolak di setiap prosedur.
const SESSION_COOKIES = ["kost_session", "__Host-kost_session"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Rute API, aset Next, dan file statis di public/ (apa pun yang berekstensi, mis. /images/x.webp)
  // tidak lewat proxy. Tanpa ini foto halaman login ikut dialihkan ke /login.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
