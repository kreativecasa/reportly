import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { ReportView, type ReportSection } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await prisma.report.findUnique({
    where: { clientViewToken: token },
    include: { client: true, workspace: true },
  });
  if (!report || report.isArchived || report.status === "GENERATING" || report.status === "ERROR") {
    notFound();
  }

  // Track view (best-effort; ignore errors)
  prisma.report
    .update({ where: { id: report.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});
  prisma.reportActivity
    .create({ data: { reportId: report.id, type: "VIEWED_BY_CLIENT", metadata: {} } })
    .catch(() => {});

  const sections = (report.sections as unknown as ReportSection[]) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
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
        {report.pdfUrl && (
          <div className="text-center mt-8">
            <a href={report.pdfUrl} target="_blank" rel="noreferrer" className="stappli-button-ghost">
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
