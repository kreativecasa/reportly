import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { format } from "date-fns";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      dataSources: true,
      reports: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!client) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/clients" className="text-sm text-[hsl(var(--muted-foreground))] hover:underline mb-4 inline-block">
        ← Back to clients
      </Link>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="stappli-title">{client.name}</h1>
          <p className="stappli-subtitle mt-1">
            {client.industry ?? "No industry"} · {client.contactEmail ?? "No contact"}
          </p>
        </div>
        <Link href={`/reports/new?clientId=${client.id}`} className="stappli-button-primary">
          New report
        </Link>
      </div>

      <div className="stappli-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Reports</h2>
        {client.reports.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No reports yet for this client.</p>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {client.reports.map((r) => (
              <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center justify-between py-3 hover:opacity-70">
                <span className="font-medium">{r.title}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {format(r.createdAt, "MMM d, yyyy")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="stappli-card p-6">
        <h2 className="text-lg font-bold mb-4">Connected data sources</h2>
        {client.dataSources.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No data sources connected for this client. <Link href="/integrations" className="text-[hsl(var(--primary))] hover:underline">Connect one</Link>.
          </p>
        ) : (
          <div className="space-y-2">
            {client.dataSources.map((ds) => (
              <div key={ds.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-sm">{ds.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{ds.type.replace(/_/g, " ")}</p>
                </div>
                {ds.isActive ? (
                  <span className="stappli-badge-active">Active</span>
                ) : (
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                    Needs reconnect
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
