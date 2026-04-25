import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const id = process.argv[2];
  if (!id) { console.error("usage: tsx scripts/fix-report.ts <reportId>"); process.exit(1); }
  const r = await prisma.report.findUnique({ where: { id }, select: { sections: true } });
  if (!r) { console.log("NOT FOUND"); return; }
  const sections = Array.isArray(r.sections) ? r.sections : [];
  if (sections.length === 0) {
    console.log("No sections — cannot mark READY. Needs fresh generate.");
    return;
  }
  await prisma.report.update({
    where: { id },
    data: { status: "READY", errorMessage: null },
  });
  console.log(`✅ Report ${id} fixed: READY, ${sections.length} sections, error cleared`);
  await prisma.$disconnect();
})();
