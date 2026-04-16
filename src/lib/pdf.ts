import { env } from "./env";

/**
 * Renders a report to PDF using Puppeteer.
 *
 * Two paths:
 *   - Serverless (Vercel): @sparticuz/chromium + puppeteer-core
 *   - Local dev: uses puppeteer-core with a system Chrome via PUPPETEER_EXECUTABLE_PATH
 */
export async function renderReportPdf(reportId: string): Promise<Uint8Array> {
  const { NEXT_PUBLIC_APP_URL, PDF_RENDER_SECRET } = env.core();
  const url = `${NEXT_PUBLIC_APP_URL}/report-render/${reportId}?token=${encodeURIComponent(PDF_RENDER_SECRET)}`;

  const puppeteer = await import("puppeteer-core");
  const chromium = (await import("@sparticuz/chromium")).default;

  const isLocal = process.env.NODE_ENV !== "production";
  const executablePath = isLocal
    ? process.env.PUPPETEER_EXECUTABLE_PATH ?? (await systemChromePath())
    : await chromium.executablePath();

  const browser = await puppeteer.default.launch({
    args: isLocal ? ["--no-sandbox"] : chromium.args,
    defaultViewport: { width: 1200, height: 1600 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate:
        '<div style="font-size:9px;color:#94a3b8;width:100%;text-align:center;padding:0 10mm;">Reportly · Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

async function systemChromePath(): Promise<string> {
  // Common macOS path for local dev; override via PUPPETEER_EXECUTABLE_PATH if needed
  return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
}
