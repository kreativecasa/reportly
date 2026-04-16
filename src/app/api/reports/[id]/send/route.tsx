import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { ClientReportEmail } from "@/emails/client-report";
import { env } from "@/lib/env";

const schema = z.object({
  toEmail: z.string().email(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspace();
    const { id } = await ctx.params;
    const input = schema.parse(await req.json().catch(() => null));
    const report = await prisma.report.findFirst({
      where: { id, workspaceId: workspace.id },
      include: { client: true },
    });
    if (!report) throw new ApiError("NOT_FOUND", "Report not found");
    if (report.status !== "READY" && report.status !== "SENT") {
      throw new ApiError("BAD_REQUEST", "Report is not ready to send");
    }

    const shareUrl = `${env.core().NEXT_PUBLIC_APP_URL}/r/${report.clientViewToken}`;

    await sendEmail({
      to: input.toEmail,
      subject: `${report.title} — your report from ${workspace.name}`,
      react: (
        <ClientReportEmail
          reportTitle={report.title}
          workspaceName={workspace.name}
          clientName={report.client.name}
          message={input.message}
          shareUrl={shareUrl}
          pdfUrl={report.pdfUrl}
        />
      ),
    });

    await prisma.report.update({
      where: { id: report.id },
      data: { status: "SENT", sentAt: new Date(), sentToEmail: input.toEmail },
    });
    await prisma.reportActivity.create({
      data: { reportId: report.id, type: "SENT", metadata: { to: input.toEmail } },
    });

    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
