import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ReportView, type ReportSection } from "@/components/report/report-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const report = await prisma.report.findUnique({
    where: { clientViewToken: token },
    include: { client: true, workspace: true },
  });
  if (!report) return { title: "Report not found" };
  const title = `${report.title} · ${report.workspace.name}`;
  const description = `${report.client.name} performance report · ${format(report.dateRangeStart, "MMM d, yyyy")} – ${format(report.dateRangeEnd, "MMM d, yyyy")}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: false, follow: false }, // share links shouldn't be indexed
  };
}

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
