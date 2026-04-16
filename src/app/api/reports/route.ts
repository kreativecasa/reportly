import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const { workspace } = await requireWorkspace();
    const reports = await prisma.report.findMany({
      where: { workspaceId: workspace.id, isArchived: false },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ reports });
  } catch (err) {
    return handleError(err);
  }
}
