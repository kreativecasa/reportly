import { google } from "googleapis";
import { env } from "./env";
import { decrypt, encrypt } from "./crypto";
import { prisma } from "./prisma";
import { oauthClient } from "./ga4";

const GSC_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function gscAuthUrl(redirectUri: string, state: string): string {
  const client = oauthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GSC_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeGscCode(redirectUri: string, code: string) {
  const client = oauthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function listSites(accessToken: string) {
  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  const webmasters = google.webmasters({ version: "v3", auth: client });
  const { data } = await webmasters.sites.list({});
  return (data.siteEntry ?? [])
    .filter((s) => s.permissionLevel && s.permissionLevel !== "siteUnverifiedUser")
    .map((s) => ({
      siteUrl: s.siteUrl ?? "",
      permissionLevel: s.permissionLevel ?? "",
    }))
    .filter((s) => s.siteUrl);
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

export interface GSCData {
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  comparison: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages: { page: string; clicks: number; impressions: number }[];
  topCountries: { country: string; clicks: number; impressions: number }[];
  devices: { device: string; clicks: number; impressions: number }[];
  dailyTrend: { date: string; clicks: number; impressions: number }[];
}

export async function fetchGSCData(
  dataSourceId: string,
  startDate: Date,
  endDate: Date,
): Promise<GSCData> {
  const accessToken = await getFreshAccessToken(dataSourceId);
  const ds = await prisma.dataSource.findUniqueOrThrow({ where: { id: dataSourceId } });
  const siteUrl = ds.externalId;

  const client = new google.auth.OAuth2();
  client.setCredentials({ access_token: accessToken });
  const webmasters = google.webmasters({ version: "v3", auth: client });

  const periodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const compStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const compEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const runQuery = async (body: object) => {
    const { data } = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: body,
    });
    return data.rows ?? [];
  };

  const [totalsRows, compRows, queryRows, pageRows, countryRows, deviceRows, trendRows] = await Promise.all([
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: [] }),
    runQuery({ startDate: fmt(compStart), endDate: fmt(compEnd), dimensions: [] }),
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["query"], rowLimit: 10 }),
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["page"], rowLimit: 10 }),
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["country"], rowLimit: 10 }),
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["device"] }),
    runQuery({ startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["date"] }),
  ]);

  const totalsRow = totalsRows[0] ?? {};
  const compRow = compRows[0] ?? {};

  await prisma.dataSource.update({ where: { id: dataSourceId }, data: { lastSyncedAt: new Date() } });

  return {
    totals: {
      clicks: Number(totalsRow.clicks ?? 0),
      impressions: Number(totalsRow.impressions ?? 0),
      ctr: Number(totalsRow.ctr ?? 0),
      position: Number(totalsRow.position ?? 0),
    },
    comparison: {
      clicks: Number(compRow.clicks ?? 0),
      impressions: Number(compRow.impressions ?? 0),
      ctr: Number(compRow.ctr ?? 0),
      position: Number(compRow.position ?? 0),
    },
    topQueries: queryRows.map((r) => ({
      query: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr: Number(r.ctr ?? 0),
      position: Number(r.position ?? 0),
    })),
    topPages: pageRows.map((r) => ({
      page: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
    })),
    topCountries: countryRows.map((r) => ({
      country: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
    })),
    devices: deviceRows.map((r) => ({
      device: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
    })),
    dailyTrend: trendRows.map((r) => ({
      date: r.keys?.[0] ?? "",
      clicks: Number(r.clicks ?? 0),
      impressions: Number(r.impressions ?? 0),
    })),
  };
}
