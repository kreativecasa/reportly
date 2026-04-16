import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { format } from "date-fns";
import { getEffectivePlan, planLimits } from "@/lib/plan-limits";

export default async function DashboardPage() {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const [clients, integrations, reportsThisMonth, recentReports] = await Promise.all([
    prisma.client.count({ where: { workspaceId: workspace.id, isArchived: false } }),
    prisma.dataSource.count({ where: { workspaceId: workspace.id, isActive: true } }),
    prisma.usageRecord
      .findUnique({ where: { workspaceId_month: { workspaceId: workspace.id, month: format(new Date(), "yyyy-MM") } } })
      .then((r) => r?.reportsGenerated ?? 0),
    prisma.report.findMany({
      where: { workspaceId: workspace.id, isArchived: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  const plan = await getEffectivePlan(session.user.id);
  const limits = planLimits(plan);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between mb-10 gap-4">
        <div>
          <h1 className="stappli-title">Dashboard</h1>
          <p className="stappli-subtitle mt-1">
            {workspace.name} · {session.user.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/reports/new" className="stappli-button-primary">
            New report
          </Link>
        </div>
      </div>

      {!session.user.emailVerifiedAt && (
        <div className="stappli-card p-5 mb-8 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            <strong>Verify your email</strong> to unlock report generation. Check your inbox for the link.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Clients" value={clients} sub={`of ${limits.clients} on ${plan}`} />
        <StatCard label="Reports this month" value={reportsThisMonth} sub={`of ${limits.reportsPerMonth} on ${plan}`} />
        <StatCard label="Integrations" value={integrations} sub={`of ${limits.integrations} on ${plan}`} />
      </div>

      <div className="stappli-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recent reports</h2>
          <Link href="/reports" className="text-sm text-[hsl(var(--primary))] font-medium hover:underline">
            View all
          </Link>
        </div>
        {recentReports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">No reports yet.</p>
            <Link href="/reports/new" className="stappli-button-primary">
              Generate your first report
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {recentReports.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="flex items-center justify-between py-4 hover:bg-[hsl(var(--muted))] -mx-2 px-2 rounded-xl transition"
              >
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {r.client.name} · {format(r.dateRangeStart, "MMM d")} – {format(r.dateRangeEnd, "MMM d")}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="stappli-card p-6">
      <p className="stappli-table-header mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{sub}</p>
    </div>
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
