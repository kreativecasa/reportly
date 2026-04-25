import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const id = process.argv[2];
  const r = await prisma.report.findUnique({
    where: { id },
    select: {
      status: true, errorMessage: true, pdfUrl: true,
      sections: true, title: true, updatedAt: true,
    },
  });
  if (!r) { console.log("NOT FOUND"); return; }
  const sections = Array.isArray(r.sections) ? r.sections : [];
  console.log(JSON.stringify({
    ...r,
    sections: sections.length ? `[${sections.length} sections]` : r.sections,
    updatedAt: r.updatedAt.toISOString(),
  }, null, 2));
  await prisma.$disconnect();
})();
