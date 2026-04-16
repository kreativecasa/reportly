import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { ClientsTable } from "./clients-table";

export default async function ClientsPage() {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.id, isArchived: false },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reports: true } } },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="stappli-title">Clients</h1>
          <p className="stappli-subtitle mt-1">The companies you generate reports for.</p>
        </div>
        <Link href="/clients/new" className="stappli-button-primary">
          New client
        </Link>
      </div>

      <ClientsTable
        clients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          industry: c.industry,
          contactEmail: c.contactEmail,
          reportCount: c._count.reports,
        }))}
      />
    </>
  );
}
