import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { NewReportForm } from "./new-report-form";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const [clients, dataSources] = await Promise.all([
    prisma.client.findMany({
      where: { workspaceId: workspace.id, isArchived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.dataSource.findMany({
      where: { workspaceId: workspace.id, isActive: true },
      select: { id: true, name: true, type: true, clientId: true },
    }),
  ]);

  const { clientId } = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">New report</h1>
      <p className="stappli-subtitle mb-8">
        Pick a client, date range, and data sources. Claude will write the narrative.
      </p>
      <NewReportForm clients={clients} dataSources={dataSources} preselectClientId={clientId} />
    </div>
  );
}
