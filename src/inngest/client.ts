import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "reportly" });

export type GenerateReportEvent = { name: "report/generate.requested"; data: { reportId: string } };
export type GeneratePdfEvent = { name: "report/pdf.requested"; data: { reportId: string } };
