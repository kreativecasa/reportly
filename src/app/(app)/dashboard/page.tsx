import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { format } from "date-fns";
import { getEffectivePlan, planLimits } from "@/lib/plan-limits";
import { ResendVerificationButton } from "./resend-verification-button";
import Icon from "@mdi/react";
import { mdiHandWave, mdiAlertCircle, mdiAutoFix, mdiPlus, mdiFlash, mdiFileDocument } from "@mdi/js";

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

  const firstName = session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Welcome back, {firstName}
            <Icon path={mdiHandWave} size={0.85} className="text-[hsl(var(--primary))]" />
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Here&apos;s an overview of your workspace.
          </p>
        </div>
        <Link href="/reports/new" className="stappli-button-primary h-10 px-5 text-xs">
          + New report
        </Link>
      </div>

      {/* ── Email verification banner ── */}
      {!session.user.emailVerifiedAt && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Icon path={mdiAlertCircle} size={0.75} />
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900">Verify your email to generate reports</p>
              <p className="text-xs text-amber-700 mt-0.5">Check your inbox for the verification link.</p>
            </div>
          </div>
          <ResendVerificationButton email={session.user.email ?? ""} />
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Clients"
          value={clients}
          limit={limits.clients}
          plan={plan}
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          href="/clients"
          cta="Manage clients"
        />
        <StatCard
          label="Reports this month"
          value={reportsThisMonth}
          limit={limits.reportsPerMonth}
          plan={plan}
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          href="/reports"
          cta="View reports"
        />
        <StatCard
          label="Integrations"
          value={integrations}
          limit={limits.integrations}
          plan={plan}
          icon={
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
            </svg>
          }
          href="/integrations"
          cta="Connect data"
        />
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              href: "/reports/new",
              label: "Generate a report",
              desc: "AI writes the narrative in 60 seconds",
              icon: <Icon path={mdiAutoFix} size={0.8} />,
              accent: "bg-[hsl(var(--primary))/0.06] border-[hsl(var(--primary))/0.15] hover:bg-[hsl(var(--primary))/0.1]",
              iconBg: "bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]",
            },
            {
              href: "/clients/new",
              label: "Add a client",
              desc: "Set up a new client workspace",
              icon: <Icon path={mdiPlus} size={0.8} />,
              accent: "bg-white hover:bg-[hsl(var(--muted))]",
              iconBg: "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
            },
            {
              href: "/integrations",
              label: "Connect GA4",
              desc: "Link Google Analytics data source",
              icon: <Icon path={mdiFlash} size={0.8} />,
              accent: "bg-white hover:bg-[hsl(var(--muted))]",
              iconBg: "bg-amber-50 text-amber-600",
            },
          ].map((a, idx) => (
            <Link
              key={idx}
              href={a.href}
              className={`rounded-2xl border p-4 flex items-center gap-4 transition ${a.accent}`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
                {a.icon}
              </div>
              <div>
                <p className="text-sm font-bold">{a.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent reports ── */}
      <div className="stappli-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">Recent reports</h2>
          <Link href="/reports" className="text-xs font-bold text-[hsl(var(--primary))] hover:underline uppercase tracking-wider">
            View all →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mx-auto mb-4">
              <Icon path={mdiFileDocument} size={1.4} />
            </div>
            <p className="font-bold mb-1">No reports yet</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-xs mx-auto">
              Connect a data source and generate your first AI-written client report.
            </p>
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
                className="flex items-center gap-4 px-6 py-4 hover:bg-[hsl(var(--muted))] transition group"
              >
                <div className="h-9 w-9 rounded-xl bg-[hsl(var(--primary))/0.08] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-[hsl(var(--primary))] transition">{r.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    {r.client.name} · {format(r.dateRangeStart, "MMM d")} – {format(r.dateRangeEnd, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={r.status} />
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, limit, plan, icon, href, cta,
}: {
  label: string; value: number; limit: number; plan: string;
  icon: React.ReactNode; href: string; cta: string;
}) {
  const pct = Math.min((value / limit) * 100, 100);
  const warn = pct >= 80;
  return (
    <div className="stappli-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="h-9 w-9 rounded-xl bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
          {plan}
        </span>
      </div>
      <p className="text-3xl font-bold mb-0.5">{value}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">{label}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${warn ? "bg-amber-400" : "bg-[hsl(var(--primary))]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5">{value} of {limit} used</p>
      </div>

      <Link href={href} className="text-xs font-bold text-[hsl(var(--primary))] hover:underline">
        {cta} →
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string; dot: string }> = {
    READY: { label: "Ready", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    SENT: { label: "Sent", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    GENERATING: { label: "Generating", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-400 animate-pulse" },
    DRAFT: { label: "Draft", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
    ERROR: { label: "Error", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-bold ${c.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
