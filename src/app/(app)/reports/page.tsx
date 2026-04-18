import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import Icon from "@mdi/react";
import { mdiFileDocument } from "@mdi/js";

export default async function ReportsPage() {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const reports = await prisma.report.findMany({
    where: { workspaceId: workspace.id, isArchived: false },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="stappli-title">Reports</h1>
          <p className="stappli-subtitle mt-1">All reports across all clients.</p>
        </div>
        <Link href="/reports/new" className="stappli-button-primary">
          New report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="stappli-card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] flex items-center justify-center mx-auto mb-4">
            <Icon path={mdiFileDocument} size={1.2} />
          </div>
          <p className="font-bold mb-1">No reports yet</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
            Reports are AI-written summaries of your client&apos;s marketing performance. You&apos;ll need at least one client and one connected data source.
          </p>
          <Link href="/reports/new" className="stappli-button-primary">
            Generate your first report
          </Link>
        </div>
      ) : (
        <div className="stappli-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="stappli-table-header text-left px-6 py-4">Title</th>
                <th className="stappli-table-header text-left px-6 py-4">Client</th>
                <th className="stappli-table-header text-left px-6 py-4">Period</th>
                <th className="stappli-table-header text-left px-6 py-4">Status</th>
                <th className="stappli-table-header text-right px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="stappli-table-row border-b last:border-0 border-[hsl(var(--border))]">
                  <td className="px-6 py-4">
                    <Link href={`/reports/${r.id}`} className="font-medium hover:text-[hsl(var(--primary))]">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">{r.client.name}</td>
                  <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                    {format(r.dateRangeStart, "MMM d")} – {format(r.dateRangeEnd, "MMM d")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-[hsl(var(--muted-foreground))]">
                    {format(r.createdAt, "MMM d")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    READY: "bg-emerald-100 text-emerald-700",
    SENT: "bg-emerald-100 text-emerald-700",
    GENERATING: "bg-amber-100 text-amber-700",
    DRAFT: "bg-slate-100 text-slate-700",
    ERROR: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
