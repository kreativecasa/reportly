import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const reportId = "cmo61ajbn0002l504zaz5i9ol";
  for (let i = 0; i < 18; i++) {
    const r = await prisma.report.findUnique({
      where: { id: reportId },
      select: { pdfUrl: true, pdfGeneratedAt: true, status: true, errorMessage: true },
    });
    console.log(
      `[${i}] status=${r?.status} pdfUrl=${r?.pdfUrl ? "SET" : "null"} at=${r?.pdfGeneratedAt?.toISOString() ?? "-"} err=${r?.errorMessage ?? "-"}`,
    );
    if (r?.pdfUrl) {
      console.log("PDF URL:", r.pdfUrl);
      break;
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
  await prisma.$disconnect();
})();
