import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { ReportView, type ReportSection } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export default async function ReportRenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);

  // Authenticate via PDF_RENDER_SECRET — this route is only accessible by our Puppeteer worker
  if (token !== env.core().PDF_RENDER_SECRET) notFound();

  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: true, workspace: true },
  });
  if (!report) notFound();

  const sections = (report.sections as unknown as ReportSection[]) ?? [];

  return (
    <div className="bg-white">
      <ReportView
        brandColor={report.workspace.brandColor}
        workspaceName={report.workspace.name}
        workspaceLogoUrl={report.workspace.logoUrl}
        clientName={report.client.name}
        title={report.title}
        dateRangeStart={format(report.dateRangeStart, "MMM d, yyyy")}
        dateRangeEnd={format(report.dateRangeEnd, "MMM d, yyyy")}
        sections={sections}
      />
    </div>
  );
}
