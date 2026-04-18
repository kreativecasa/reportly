import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";
import type { GA4Data } from "./ga4";
import type { GSCData } from "./gsc";

let client: Anthropic | null = null;

function anthropic() {
  if (!client) client = new Anthropic({ apiKey: env.anthropic().ANTHROPIC_API_KEY });
  return client;
}

export interface ReportSection {
  id: string;
  type: "overview" | "traffic" | "engagement" | "conversions" | "paid" | "seo" | "social" | "custom";
  title: string;
  narrative: string;
  keyMetrics: {
    label: string;
    value: string;
    change: number;
    trend: "up" | "down" | "neutral";
  }[];
  insights: { type: "win" | "concern" | "recommendation"; text: string }[];
  chartData?: {
    type: "line" | "bar" | "pie" | "area";
    data: Record<string, unknown>[];
    xKey: string;
    yKey: string | string[];
  };
}

const SYSTEM_PROMPT = `You are an expert digital marketing analyst writing professional client reports.
You write in a clear, confident, positive tone — highlighting wins, explaining concerns constructively, and always providing actionable recommendations.
Never use jargon without explaining it. Write as if the client has marketing knowledge but is not deeply technical.
Return ONLY valid JSON matching the provided schema. No preamble, no prose outside the JSON.`;

interface GenerateInput {
  clientName: string;
  industry: string | null;
  dateRangeStart: Date;
  dateRangeEnd: Date;
  ga4?: GA4Data;
  gsc?: GSCData;
}

function summarizeGA4ForPrompt(data: GA4Data) {
  return {
    totals: data.totals,
    previousPeriod: data.comparison,
    topPages: data.topPages.slice(0, 5),
    topSources: data.trafficSources.slice(0, 5),
    devices: data.devices,
    dailyTrendSample: data.dailyTrend.slice(0, 30),
  };
}

function summarizeGSCForPrompt(data: GSCData) {
  return {
    totals: data.totals,
    previousPeriod: data.comparison,
    topQueries: data.topQueries.slice(0, 10),
    topPages: data.topPages.slice(0, 5),
    topCountries: data.topCountries.slice(0, 5),
    devices: data.devices,
    dailyTrendSample: data.dailyTrend.slice(0, 30),
  };
}

function buildUserPrompt(input: GenerateInput): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const ga4Block = input.ga4 ? JSON.stringify(summarizeGA4ForPrompt(input.ga4), null, 2) : "No GA4 data connected.";
  const gscBlock = input.gsc ? JSON.stringify(summarizeGSCForPrompt(input.gsc), null, 2) : "No Search Console data connected.";

  const hasSeo = Boolean(input.gsc);

  return `Generate a professional marketing report.

Client: ${input.clientName}
Industry: ${input.industry ?? "Unspecified"}
Reporting period: ${fmt(input.dateRangeStart)} to ${fmt(input.dateRangeEnd)}

GA4 DATA:
${ga4Block}

SEARCH CONSOLE DATA:
${gscBlock}

SECTIONS TO GENERATE (as a JSON array in this exact order):
1. overview — Executive summary (1-2 paragraphs) + 4 top-level metrics (sessions, users, conversions, bounce rate)
2. traffic — Traffic breakdown with narrative + top sources + line chart of dailyTrend (xKey:"date", yKey:["sessions","users"])
3. engagement — Top pages, engagement metrics, narrative
4. conversions — Conversion performance, trends, and recommendations${hasSeo ? `
5. seo — SEO performance from Search Console: clicks + impressions trend, top queries (with CTR and average position), content opportunities. Include chartData of dailyTrend (xKey:"date", yKey:["clicks","impressions"]).` : ""}

FORMAT (return ONLY this JSON shape — no markdown, no code fences):
{
  "sections": [
    {
      "id": "overview",
      "type": "overview",
      "title": "Executive Summary",
      "narrative": "2-3 paragraphs in markdown",
      "keyMetrics": [
        { "label": "Sessions", "value": "12,450", "change": 15.3, "trend": "up" }
      ],
      "insights": [
        { "type": "win", "text": "..." },
        { "type": "concern", "text": "..." },
        { "type": "recommendation", "text": "..." }
      ]
    }
  ]
}

RULES:
- keyMetrics values are pre-formatted strings (e.g., "12,450", "3:24", "2.3%")
- change is percentage vs previous period as a number (positive or negative)
- trend is "up" when change > 1, "down" when < -1, else "neutral"
- Include chartData only on traffic section
- 2-3 insights per section, always at least one "recommendation"`;
}

export async function generateReportSections(input: GenerateInput): Promise<ReportSection[]> {
  const { ANTHROPIC_MODEL } = env.anthropic();
  const msg = await anthropic().messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });

  const textBlock = msg.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text response from Claude");

  const parsed = parseJsonLoose(textBlock.text);
  if (!parsed || !Array.isArray(parsed.sections)) {
    throw new Error("Invalid report JSON from Claude");
  }

  // Attach chart data from GA4 if Claude didn't already include it on the traffic section
  const sections = parsed.sections as ReportSection[];
  if (input.ga4) {
    const traffic = sections.find((s) => s.type === "traffic");
    if (traffic && !traffic.chartData) {
      traffic.chartData = {
        type: "line",
        data: input.ga4.dailyTrend.map((d) => ({
          date: d.date,
          sessions: d.sessions,
          users: d.users,
        })),
        xKey: "date",
        yKey: ["sessions", "users"],
      };
    }
  }
  if (input.gsc) {
    const seo = sections.find((s) => s.type === "seo");
    if (seo && !seo.chartData) {
      seo.chartData = {
        type: "line",
        data: input.gsc.dailyTrend.map((d) => ({
          date: d.date,
          clicks: d.clicks,
          impressions: d.impressions,
        })),
        xKey: "date",
        yKey: ["clicks", "impressions"],
      };
    }
  }
  return sections;
}

function parseJsonLoose(text: string): { sections: ReportSection[] } | null {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Fall through
  }
  // Try extracting JSON between first { and last }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {
      return null;
    }
  }
  return null;
}
