import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";

const schema = z.object({
  workspaceName: z.string().min(2).max(50),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#3475ef"),
  logoUrl: z.string().url().nullable().optional(),
  clientName: z.string().min(1).max(80),
  clientContactEmail: z.string().email().nullable().optional(),
  clientIndustry: z.string().max(80).nullable().optional(),
});

const TRIAL_DAYS = 14;

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const input = schema.parse(await req.json().catch(() => null));

    const existing = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
    if (existing) throw new ApiError("BAD_REQUEST", "Workspace already exists");

    const trialStart = new Date();
    const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          ownerId: session.user.id,
          name: input.workspaceName,
          brandColor: input.brandColor,
          logoUrl: input.logoUrl ?? null,
          onboardingCompleted: true,
        },
      });
      const client = await tx.client.create({
        data: {
          workspaceId: workspace.id,
          name: input.clientName,
          contactEmail: input.clientContactEmail ?? null,
          industry: input.clientIndustry ?? null,
        },
      });
      await tx.subscription.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          userId: session.user.id,
          plan: "FREE",
          status: "TRIALING",
          trialStart,
          trialEnd,
        },
      });
      return { workspace, client };
    });

    return ok({ workspaceId: result.workspace.id, clientId: result.client.id });
  } catch (err) {
    return handleError(err);
  }
}
