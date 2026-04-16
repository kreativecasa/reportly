import { google, Auth } from "googleapis";
import { env } from "./env";
import { decrypt, encrypt } from "./crypto";
import { prisma } from "./prisma";

const GA4_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function oauthClient(redirectUri: string): Auth.OAuth2Client {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env.google();
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
}

export function ga4AuthUrl(redirectUri: string, state: string): string {
  const client = oauthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GA4_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCode(redirectUri: string, code: string) {
  const client = oauthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function listProperties(accessToken: string) {
  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  const admin = google.analyticsadmin({ version: "v1beta", auth: client });
  const { data } = await admin.accountSummaries.list({ pageSize: 200 });
  const properties: { accountName: string; propertyId: string; displayName: string }[] = [];
  for (const acc of data.accountSummaries ?? []) {
    for (const p of acc.propertySummaries ?? []) {
      if (p.property && p.displayName) {
        properties.push({
          accountName: acc.displayName ?? acc.account ?? "",
          propertyId: p.property.replace("properties/", ""),
          displayName: p.displayName,
        });
      }
    }
  }
  return properties;
}

async function getFreshAccessToken(dataSourceId: string): Promise<string> {
  const ds = await prisma.dataSource.findUnique({ where: { id: dataSourceId } });
  if (!ds) throw new Error("Data source not found");
  if (!ds.refreshToken) throw new Error("No refresh token. Reconnect required.");
  const needsRefresh = !ds.tokenExpiresAt || ds.tokenExpiresAt.getTime() - Date.now() < 60_000;
  if (!needsRefresh) return decrypt(ds.accessToken);

  const client = oauthClient("http://ignored");
  client.setCredentials({ refresh_token: decrypt(ds.refreshToken) });
  try {
    const { credentials } = await client.refreshAccessToken();
    if (!credentials.access_token) throw new Error("No access token returned");
    await prisma.dataSource.update({
      where: { id: ds.id },
      data: {
        accessToken: encrypt(credentials.access_token),
        tokenExpiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        isActive: true,
      },
    });
    return credentials.access_token;
  } catch (err) {
    await prisma.dataSource.update({ where: { id: ds.id }, data: { isActive: false } });
    throw err;
  }
}

export interface GA4Data {
  totals: {
    sessions: number;
    activeUsers: number;
    newUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
  };
  comparison: {
    sessions: number;
    activeUsers: number;
    newUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
  };
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; sessions: number }[];
  devices: { category: string; sessions: number }[];
  dailyTrend: { date: string; sessions: number; users: number }[];
}

export async function fetchGA4Data(
  dataSourceId: string,
  startDate: Date,
  endDate: Date,
): Promise<GA4Data> {
  const accessToken = await getFreshAccessToken(dataSourceId);
  const ds = await prisma.dataSource.findUniqueOrThrow({ where: { id: dataSourceId } });
  const propertyId = ds.externalId;

  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  const analytics = google.analyticsdata({ version: "v1beta", auth: client });

  const periodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const compStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const compEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const property = `properties/${propertyId}`;

  const reqs = await Promise.all([
    analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [
          { startDate: fmt(startDate), endDate: fmt(endDate), name: "current" },
          { startDate: fmt(compStart), endDate: fmt(compEnd), name: "previous" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
        ],
      },
    }),
    analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      },
    }),
    analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      },
    }),
    analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      },
    }),
    analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
    }),
  ]);

  const [totalsResp, topPagesResp, sourcesResp, devicesResp, trendResp] = reqs;

  const row0 = totalsResp.data.rows?.find((r) => r.dimensionValues?.[0]?.value === "current") ?? totalsResp.data.rows?.[0];
  const rowCmp = totalsResp.data.rows?.find((r) => r.dimensionValues?.[0]?.value === "previous") ?? totalsResp.data.rows?.[1];
  const num = (r: typeof row0, i: number) => Number(r?.metricValues?.[i]?.value ?? 0);

  await prisma.dataSource.update({ where: { id: dataSourceId }, data: { lastSyncedAt: new Date() } });

  return {
    totals: {
      sessions: num(row0, 0),
      activeUsers: num(row0, 1),
      newUsers: num(row0, 2),
      bounceRate: num(row0, 3),
      avgSessionDuration: num(row0, 4),
      conversions: num(row0, 5),
    },
    comparison: {
      sessions: num(rowCmp, 0),
      activeUsers: num(rowCmp, 1),
      newUsers: num(rowCmp, 2),
      bounceRate: num(rowCmp, 3),
      avgSessionDuration: num(rowCmp, 4),
      conversions: num(rowCmp, 5),
    },
    topPages: (topPagesResp.data.rows ?? []).map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "",
      views: Number(r.metricValues?.[0]?.value ?? 0),
    })),
    trafficSources: (sourcesResp.data.rows ?? []).map((r) => ({
      source: r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    })),
    devices: (devicesResp.data.rows ?? []).map((r) => ({
      category: r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    })),
    dailyTrend: (trendResp.data.rows ?? []).map((r) => ({
      date: r.dimensionValues?.[0]?.value ?? "",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      users: Number(r.metricValues?.[1]?.value ?? 0),
    })),
  };
}
