import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { fetchGA4Data } from "@/lib/ga4";
import { fetchGSCData } from "@/lib/gsc";
import { generateReportSections } from "@/lib/claude";
import { incrementReportUsage } from "@/lib/plan-limits";

export const generateReport = inngest.createFunction(
  {
    id: "generate-report",
    retries: 2,
    triggers: [{ event: "report/generate.requested" }],
  },
  async ({ event, step }) => {
    const { reportId } = event.data as { reportId: string };

    const report = await step.run("load-report", async () => {
      const r = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          client: true,
          workspace: true,
          dataSources: { include: { dataSource: true } },
        },
      });
      if (!r) throw new Error(`Report ${reportId} not found`);
      return r;
    });

    const ga4Source = report.dataSources.find((rds) => rds.dataSource.type === "GOOGLE_ANALYTICS_4");
    const gscSource = report.dataSources.find((rds) => rds.dataSource.type === "GOOGLE_SEARCH_CONSOLE");

    let ga4Data = null;
    if (ga4Source) {
      ga4Data = await step.run("fetch-ga4", async () => {
        return await fetchGA4Data(
          ga4Source.dataSource.id,
          new Date(report.dateRangeStart),
          new Date(report.dateRangeEnd),
        );
      });
    }

    let gscData = null;
    if (gscSource) {
      gscData = await step.run("fetch-gsc", async () => {
        return await fetchGSCData(
          gscSource.dataSource.id,
          new Date(report.dateRangeStart),
          new Date(report.dateRangeEnd),
        );
      });
    }

    const sections = await step.run("claude-generate", async () => {
      return await generateReportSections({
        clientName: report.client.name,
        industry: report.client.industry,
        dateRangeStart: new Date(report.dateRangeStart),
        dateRangeEnd: new Date(report.dateRangeEnd),
        ga4: ga4Data ?? undefined,
        gsc: gscData ?? undefined,
      });
    });

    await step.run("save-sections", async () => {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          sections: sections as never,
          rawDataSnapshot: { ga4: ga4Data ?? null, gsc: gscData ?? null } as never,
          status: "READY",
          errorMessage: null,
        },
      });
      await incrementReportUsage(report.workspaceId);
      await prisma.reportActivity.create({
        data: { reportId, type: "GENERATED", metadata: { sectionCount: sections.length } },
      });
    });

    await step.sendEvent("queue-pdf", {
      name: "report/pdf.requested",
      data: { reportId },
    });

    return { reportId, sections: sections.length };
  },
);

export const onReportFailure = inngest.createFunction(
  {
    id: "generate-report-failure",
    triggers: [{ event: "inngest/function.failed" }],
  },
  async ({ event }) => {
    const data = event.data as {
      event?: { name?: string; data?: { reportId?: string } };
      error?: { message?: string };
    };
    if (data.event?.name !== "report/generate.requested") return;
    const reportId = data.event.data?.reportId;
    if (!reportId) return;
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "ERROR",
        errorMessage: data.error?.message ?? "Report generation failed",
      },
    });
  },
);
