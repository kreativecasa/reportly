import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { renderReportPdf } from "@/lib/pdf";
import { uploadPdf } from "@/lib/storage";

export const generatePdf = inngest.createFunction(
  {
    id: "generate-pdf",
    retries: 1,
    triggers: [{ event: "report/pdf.requested" }],
  },
  async ({ event, step }) => {
    const { reportId } = event.data as { reportId: string };

    const pdfBuffer = await step.run("render-pdf", async () => {
      const buf = await renderReportPdf(reportId);
      return Buffer.from(buf).toString("base64");
    });

    const pdfUrl = await step.run("upload-pdf", async () => {
      const path = `reports/${reportId}.pdf`;
      return await uploadPdf(path, Buffer.from(pdfBuffer, "base64"));
    });

    await step.run("save-url", async () => {
      await prisma.report.update({
        where: { id: reportId },
        data: { pdfUrl, pdfGeneratedAt: new Date() },
      });
    });

    return { reportId, pdfUrl };
  },
);
