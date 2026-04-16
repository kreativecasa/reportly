import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "./prisma";
import { format } from "date-fns";

export class PlanLimitError extends Error {
  constructor(public readonly limit: "clients" | "reports" | "integrations", public readonly upgradeUrl = "/billing") {
    super(`Plan limit reached: ${limit}`);
  }
}

interface Limits {
  clients: number;
  reportsPerMonth: number;
  integrations: number;
}

const LIMITS: Record<SubscriptionPlan, Limits> = {
  FREE: { clients: 1, reportsPerMonth: 3, integrations: 1 },
  PAID: { clients: 3, reportsPerMonth: 15, integrations: 2 },
};

function effectivePlan(plan: SubscriptionPlan, trialEnd: Date | null): SubscriptionPlan {
  if (plan === "FREE" && trialEnd && trialEnd.getTime() > Date.now()) return "PAID";
  return plan;
}

export async function getEffectivePlan(userId: string): Promise<SubscriptionPlan> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return "FREE";
  return effectivePlan(sub.plan, sub.trialEnd);
}

export async function assertCanAddClient(workspaceId: string, userId: string) {
  const plan = await getEffectivePlan(userId);
  const count = await prisma.client.count({ where: { workspaceId, isArchived: false } });
  if (count >= LIMITS[plan].clients) throw new PlanLimitError("clients");
}

export async function assertCanConnectIntegration(workspaceId: string, userId: string) {
  const plan = await getEffectivePlan(userId);
  const count = await prisma.dataSource.count({ where: { workspaceId, isActive: true } });
  if (count >= LIMITS[plan].integrations) throw new PlanLimitError("integrations");
}

export async function assertCanGenerateReport(workspaceId: string, userId: string) {
  const plan = await getEffectivePlan(userId);
  const month = format(new Date(), "yyyy-MM");
  const usage = await prisma.usageRecord.findUnique({
    where: { workspaceId_month: { workspaceId, month } },
  });
  const generated = usage?.reportsGenerated ?? 0;
  if (generated >= LIMITS[plan].reportsPerMonth) throw new PlanLimitError("reports");
}

export async function incrementReportUsage(workspaceId: string) {
  const month = format(new Date(), "yyyy-MM");
  await prisma.usageRecord.upsert({
    where: { workspaceId_month: { workspaceId, month } },
    update: { reportsGenerated: { increment: 1 } },
    create: { workspaceId, month, reportsGenerated: 1 },
  });
}

export function planLimits(plan: SubscriptionPlan): Limits {
  return LIMITS[plan];
}
