import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError } from "@/lib/api-response";

const schema = z.object({
  type: z.enum(["GOOGLE_ADS", "META_ADS"]),
});

export async function POST(req: NextRequest) {
  try {
    const { session, workspace } = await requireWorkspace();
    const { type } = schema.parse(await req.json().catch(() => null));

    await prisma.integrationRequest.upsert({
      where: { workspaceId_type: { workspaceId: workspace.id, type } },
      update: {},
      create: { workspaceId: workspace.id, userId: session.user.id, type },
    });

    return ok({ requested: true });
  } catch (err) {
    return handleError(err);
  }
}
