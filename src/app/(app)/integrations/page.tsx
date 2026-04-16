import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { IntegrationsClient } from "./integrations-client";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const [dataSources, clients] = await Promise.all([
    prisma.dataSource.findMany({
      where: { workspaceId: workspace.id },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ where: { workspaceId: workspace.id, isArchived: false }, select: { id: true, name: true } }),
  ]);

  const { connected, error } = await searchParams;

  return (
    <>
      <div className="mb-10">
        <h1 className="stappli-title">Integrations</h1>
        <p className="stappli-subtitle mt-1">Connect your data sources to auto-fill reports.</p>
      </div>

      {connected && (
        <div className="stappli-card p-4 mb-6 border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900">✓ Integration connected successfully.</p>
        </div>
      )}
      {error && (
        <div className="stappli-card p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-900">
            Connection failed: <code>{error}</code>
          </p>
        </div>
      )}

      <IntegrationsClient
        dataSources={dataSources.map((ds) => ({
          id: ds.id,
          type: ds.type,
          name: ds.name,
          clientName: ds.client?.name ?? null,
          isActive: ds.isActive,
          lastSyncedAt: ds.lastSyncedAt?.toISOString() ?? null,
        }))}
        clients={clients}
      />
    </>
  );
}
