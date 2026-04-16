import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const report = await prisma.report.findFirst({
      where: { id, workspaceId: workspace.id },
      select: { id: true, status: true, errorMessage: true, pdfUrl: true },
    });
    if (!report) throw new ApiError("NOT_FOUND", "Report not found");
    return ok({
      status: report.status,
      errorMessage: report.errorMessage,
      pdfReady: Boolean(report.pdfUrl),
    });
  } catch (err) {
    return handleError(err);
  }
}
