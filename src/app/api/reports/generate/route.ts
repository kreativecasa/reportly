import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireVerifiedEmail, requireWorkspace } from "@/lib/auth-guard";
import { assertCanGenerateReport } from "@/lib/plan-limits";
import { ok, handleError, ApiError, fail } from "@/lib/api-response";
import { inngest } from "@/inngest/client";
import { ratelimit } from "@/lib/redis";

const schema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(120),
  dateRangeStart: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  dateRangeEnd: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  dataSourceIds: z.array(z.string()).min(0).max(10),
});

export async function POST(req: NextRequest) {
  try {
    await requireVerifiedEmail();
    const { session, workspace } = await requireWorkspace();

    try {
      const { success } = await ratelimit("generateReport").limit(`gen:${session.user.id}`);
      if (!success) return fail("RATE_LIMITED", "Too many report generations. Try again in an hour.");
    } catch {
      // Redis unavailable — skip rate limiting rather than blocking generation
    }

    await assertCanGenerateReport(workspace.id, session.user.id);

    const input = schema.parse(await req.json().catch(() => null));
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, workspaceId: workspace.id, isArchived: false },
    });
    if (!client) throw new ApiError("NOT_FOUND", "Client not found");

    // Validate data sources belong to this workspace
    const dataSources = await prisma.dataSource.findMany({
      where: { id: { in: input.dataSourceIds }, workspaceId: workspace.id, isActive: true },
    });
    if (dataSources.length !== input.dataSourceIds.length) {
      throw new ApiError("BAD_REQUEST", "One or more data sources are invalid or inactive");
    }

    const report = await prisma.report.create({
      data: {
        workspaceId: workspace.id,
        clientId: client.id,
        title: input.title,
        dateRangeStart: new Date(input.dateRangeStart),
        dateRangeEnd: new Date(input.dateRangeEnd),
        status: "GENERATING",
        dataSources: {
          create: dataSources.map((ds) => ({ dataSourceId: ds.id })),
        },
      },
    });

    await inngest.send({
      name: "report/generate.requested",
      data: { reportId: report.id },
    });

    return ok({ reportId: report.id }, 201);
  } catch (err) {
    return handleError(err);
  }
}
