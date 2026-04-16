import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { ReportDetailClient } from "./report-detail-client";
import type { ReportSection } from "@/components/report/report-view";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");
  const { id } = await params;
  const report = await prisma.report.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { client: true },
  });
  if (!report) notFound();

  const sections = (report.sections as unknown as ReportSection[]) ?? [];

  return (
    <div className="max-w-4xl">
      <Link href="/reports" className="text-sm text-[hsl(var(--muted-foreground))] hover:underline mb-4 inline-block">
        ← Back to reports
      </Link>

      <ReportDetailClient
        reportId={report.id}
        initialStatus={report.status}
        initialSections={sections}
        title={report.title}
        client={{ name: report.client.name }}
        workspace={{ name: workspace.name, brandColor: workspace.brandColor, logoUrl: workspace.logoUrl }}
        dateRange={{
          start: format(report.dateRangeStart, "MMM d, yyyy"),
          end: format(report.dateRangeEnd, "MMM d, yyyy"),
        }}
        pdfUrl={report.pdfUrl}
        shareToken={report.clientViewToken}
        defaultSendEmail={report.client.contactEmail}
        errorMessage={report.errorMessage}
      />
    </div>
  );
}
