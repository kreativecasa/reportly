import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/reports", "/integrations", "/settings", "/billing", "/onboarding"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);

  if (!isProtected && !isAuthPage) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    salt: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
  });

  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Auth pages are always accessible (so users can switch accounts).
  // The page itself shows a "currently signed in as ..." banner if a session exists.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp)$).*)"],
};
