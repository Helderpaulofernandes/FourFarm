import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config — no Prisma adapter, no bcrypt.
 * Middleware runs on the Edge runtime and has a 1MB bundle limit, so it must
 * import only this file, never the full config in auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
