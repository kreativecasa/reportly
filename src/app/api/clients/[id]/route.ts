import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  contactName: z.string().max(80).nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  industry: z.string().max(80).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  isArchived: z.boolean().optional(),
});

async function getClient(workspaceId: string, id: string) {
  const client = await prisma.client.findFirst({ where: { id, workspaceId } });
  if (!client) throw new ApiError("NOT_FOUND", "Client not found");
  return client;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const client = await getClient(workspace.id, id);
    return ok({ client });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    await getClient(workspace.id, id);
    const input = updateSchema.parse(await req.json().catch(() => null));
    const client = await prisma.client.update({ where: { id }, data: input });
    return ok({ client });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    await getClient(workspace.id, id);
    await prisma.client.update({ where: { id }, data: { isArchived: true } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
