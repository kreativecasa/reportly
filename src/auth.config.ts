import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clients",
  "/reports",
  "/integrations",
  "/settings",
  "/billing",
  "/onboarding",
];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some(
        (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(`${p}/`),
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = nextUrl.clone();
        redirectUrl.pathname = "/login";
        redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(redirectUrl);
      }

      return true;
    },
  },
};
