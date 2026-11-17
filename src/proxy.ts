// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Giriş yapmamış kullanıcıların açabildiği sayfalar
const AUTH_PAGES = ["/giris-yap", "/kayit-ol", "/sifremi-unuttum"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token");
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/giris-yap", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // public klasöründeki dosyalar (logo.png, görseller vb.) proxy'den geçmesin
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};