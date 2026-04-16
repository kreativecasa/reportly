import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const ds = await prisma.dataSource.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!ds) throw new ApiError("NOT_FOUND", "Integration not found");
    await prisma.dataSource.delete({ where: { id } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
