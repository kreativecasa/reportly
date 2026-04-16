import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateReport, onReportFailure } from "@/inngest/generate-report";
import { generatePdf } from "@/inngest/generate-pdf";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateReport, generatePdf, onReportFailure],
});
