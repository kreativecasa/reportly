import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const report = await prisma.report.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { client: true },
    });
    if (!report) throw new ApiError("NOT_FOUND", "Report not found");
    return ok({ report });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const existing = await prisma.report.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new ApiError("NOT_FOUND", "Report not found");
    const input = updateSchema.parse(await req.json().catch(() => null));
    const report = await prisma.report.update({
      where: { id },
      data: {
        title: input.title,
        sections: input.sections as Parameters<typeof prisma.report.update>[0]["data"]["sections"],
        isArchived: input.isArchived,
      },
    });
    await prisma.reportActivity.create({ data: { reportId: id, type: "EDITED", metadata: {} } });
    return ok({ report });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const existing = await prisma.report.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!existing) throw new ApiError("NOT_FOUND", "Report not found");
    await prisma.report.update({ where: { id }, data: { isArchived: true } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
