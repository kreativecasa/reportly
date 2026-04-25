import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const id = process.argv[2];
  if (!id) { console.error("usage: tsx scripts/poll-report.ts <reportId>"); process.exit(1); }
  for (let i = 0; i < 18; i++) {
    const r = await prisma.report.findUnique({
      where: { id },
      select: { status: true, errorMessage: true, updatedAt: true, pdfUrl: true },
    });
    const acts = await prisma.reportActivity.findMany({
      where: { reportId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    console.log(
      `[${i}] status=${r?.status} err=${r?.errorMessage ?? "-"} pdfUrl=${r?.pdfUrl ? "SET" : "null"} acts=[${acts.map(a => a.type).join(",")}]`,
    );
    if (r?.status === "READY" || r?.status === "ERROR") break;
    await new Promise((res) => setTimeout(res, 10000));
  }
  await prisma.$disconnect();
})();
