import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.report.findMany({
    where: { createdAt: { gte: cutoff } },
    include: {
      workspace: { select: { id: true, name: true, owner: { select: { email: true } } } },
      activities: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  console.log(`Reports in last 24h: ${recent.length}`);
  for (const r of recent) {
    console.log(JSON.stringify({
      id: r.id,
      owner: r.workspace.owner.email,
      workspace: r.workspace.name,
      title: r.title,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      errorMessage: r.errorMessage,
      pdfUrl: r.pdfUrl ? "SET" : null,
      activities: r.activities.map(a => ({ type: a.type, at: a.createdAt.toISOString() })),
    }, null, 2));
  }
  await prisma.$disconnect();
})();
