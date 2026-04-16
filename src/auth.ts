import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import { authConfig } from "./auth.config";
import type { SubscriptionPlan } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.hashedPassword) return null;

        const valid = await bcrypt.compare(password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      if (token.uid && !token.plan) {
        const sub = await prisma.subscription.findUnique({
          where: { userId: token.uid as string },
          select: { plan: true, trialEnd: true },
        });
        const workspace = await prisma.workspace.findUnique({
          where: { ownerId: token.uid as string },
          select: { id: true, onboardingCompleted: true },
        });
        const userRecord = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { emailVerified: true, role: true },
        });
        token.plan = sub?.plan ?? "FREE";
        token.trialEnd = sub?.trialEnd?.toISOString() ?? null;
        token.workspaceId = workspace?.id ?? null;
        token.onboardingCompleted = workspace?.onboardingCompleted ?? false;
        token.emailVerifiedAt = userRecord?.emailVerified?.toISOString() ?? null;
        token.role = userRecord?.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) {
        const u = session.user as typeof session.user & {
          id: string;
          plan: SubscriptionPlan;
          workspaceId: string | null;
          onboardingCompleted: boolean;
          emailVerifiedAt: string | null;
          trialEnd: string | null;
          role: "USER" | "ADMIN";
        };
        u.id = token.uid as string;
        u.plan = (token.plan as SubscriptionPlan) ?? "FREE";
        u.workspaceId = (token.workspaceId as string | null) ?? null;
        u.onboardingCompleted = Boolean(token.onboardingCompleted);
        u.emailVerifiedAt = (token.emailVerifiedAt as string | null) ?? null;
        u.trialEnd = (token.trialEnd as string | null) ?? null;
        u.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
});
