import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer-core";

const REPORT_ID = process.argv[2];
if (!REPORT_ID) { console.error("usage: tsx scripts/force-pdf.ts <reportId>"); process.exit(1); }

const prisma = new PrismaClient();

async function run() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const token = process.env.PDF_RENDER_SECRET!;
  const url = `${appUrl}/report-render/${REPORT_ID}?token=${encodeURIComponent(token)}`;
  console.log("Rendering:", url);

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    defaultViewport: { width: 1200, height: 1600 },
    executablePath,
    headless: true,
  });
  let pdf: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
    pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="font-size:9px;color:#94a3b8;width:100%;text-align:center;padding:0 10mm;">Reportly · Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    });
    console.log("PDF bytes:", pdf.length);
  } finally {
    await browser.close();
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "reports";
  const path = `reports/${REPORT_ID}.pdf`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, Buffer.from(pdf), {
    contentType: "application/pdf", upsert: true,
  });
  if (upErr) throw new Error("upload: " + upErr.message);

  const { data: signed, error: signErr } = await supabase.storage.from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signErr || !signed) throw new Error("sign: " + (signErr?.message || "no url"));

  await prisma.report.update({
    where: { id: REPORT_ID },
    data: { pdfUrl: signed.signedUrl, pdfGeneratedAt: new Date() },
  });
  console.log("✅ pdfUrl saved:", signed.signedUrl);
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
