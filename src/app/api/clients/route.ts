import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { assertCanAddClient } from "@/lib/plan-limits";
import { ok, handleError } from "@/lib/api-response";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  contactName: z.string().max(80).nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  industry: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function GET() {
  try {
    const { workspace } = await requireWorkspace();
    const clients = await prisma.client.findMany({
      where: { workspaceId: workspace.id, isArchived: false },
      orderBy: { createdAt: "desc" },
    });
    return ok({ clients });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, workspace } = await requireWorkspace();
    await assertCanAddClient(workspace.id, session.user.id);
    const input = createSchema.parse(await req.json().catch(() => null));
    const client = await prisma.client.create({
      data: { ...input, workspaceId: workspace.id },
    });
    return ok({ client }, 201);
  } catch (err) {
    return handleError(err);
  }
}
