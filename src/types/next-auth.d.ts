import type { SubscriptionPlan, UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: SubscriptionPlan;
      workspaceId: string | null;
      onboardingCompleted: boolean;
      emailVerifiedAt: string | null;
      trialEnd: string | null;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    plan?: SubscriptionPlan;
    workspaceId?: string | null;
    onboardingCompleted?: boolean;
    emailVerified?: string | null;
    trialEnd?: string | null;
    role?: UserRole;
  }
}
