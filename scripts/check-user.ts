import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const email = "techation@hotmail.com";
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) { console.log("NO USER"); return; }
  const ws = await prisma.workspace.findUnique({ where: { ownerId: u.id } });
  if (!ws) { console.log("NO WORKSPACE"); return; }
  const reports = await prisma.report.findMany({
    where: { workspaceId: ws.id },
    include: { activities: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });
  const dataSources = await prisma.dataSource.findMany({
    where: { workspaceId: ws.id },
    select: { id: true, type: true, name: true, externalId: true, isActive: true, refreshToken: true, tokenExpiresAt: true },
  });
  const result = {
    workspaceId: ws.id,
    reportCount: reports.length,
    dataSources: dataSources.map(d => ({ ...d, refreshToken: d.refreshToken ? "[encrypted]" : null })),
    reports: reports.map(r => ({
      id: r.id,
      title: r.title,
      status: r.status,
      clientId: r.clientId,
      dateRangeStart: r.dateRangeStart?.toISOString(),
      dateRangeEnd: r.dateRangeEnd?.toISOString(),
      pdfUrl: r.pdfUrl,
      clientViewToken: r.clientViewToken,
      errorMessage: r.errorMessage,
      createdAt: r.createdAt?.toISOString(),
      activities: r.activities.map(a => ({ type: a.type, metadata: a.metadata, createdAt: a.createdAt?.toISOString() })),
    })),
  };
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
})();
