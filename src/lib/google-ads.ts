import { google } from "googleapis";
import { env } from "./env";
import { decrypt, encrypt } from "./crypto";
import { prisma } from "./prisma";
import { oauthClient } from "./ga4";

const GADS_API_VERSION = "v18";
const GADS_API_BASE = `https://googleads.googleapis.com/${GADS_API_VERSION}`;

const GADS_SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function googleAdsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN);
}

function requireDevToken(): string {
  const token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!token) throw new Error("gads_not_configured");
  return token;
}

export function googleAdsAuthUrl(redirectUri: string, state: string): string {
  const client = oauthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GADS_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeGoogleAdsCode(redirectUri: string, code: string) {
  const client = oauthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens;
}

export interface GoogleAdsCustomer {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isManager: boolean;
}

/**
 * List every Google Ads customer the signed-in user can access.
 * Step 1: listAccessibleCustomers → returns resource names like `customers/1234567890`
 * Step 2: For each, query the Google Ads API for its descriptive_name, currency, timezone.
 */
export async function listAccessibleCustomers(accessToken: string): Promise<GoogleAdsCustomer[]> {
  const devToken = requireDevToken();

  const listRes = await fetch(`${GADS_API_BASE}/customers:listAccessibleCustomers`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      "developer-token": devToken,
      "content-type": "application/json",
    },
  });
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(`gads_list_failed: ${text.slice(0, 400)}`);
  }
  const listJson = (await listRes.json()) as { resourceNames?: string[] };
  const ids = (listJson.resourceNames ?? []).map((rn) => rn.replace("customers/", ""));
  if (ids.length === 0) return [];

  // Hydrate each id with descriptive fields in parallel (best-effort — skip any that fail)
  const hydrated = await Promise.allSettled(
    ids.map(async (id) => {
      const q = `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.manager FROM customer LIMIT 1`;
      const r = await fetch(`${GADS_API_BASE}/customers/${id}/googleAds:searchStream`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "developer-token": devToken,
          "content-type": "application/json",
        },
        body: JSON.stringify({ query: q }),
      });
      if (!r.ok) {
        return { customerId: id, descriptiveName: `Account ${id}`, currencyCode: "USD", timeZone: "UTC", isManager: false };
      }
      const json = (await r.json()) as Array<{ results?: Array<{ customer?: { id?: string; descriptiveName?: string; currencyCode?: string; timeZone?: string; manager?: boolean } }> }>;
      const row = json?.[0]?.results?.[0]?.customer;
      return {
        customerId: id,
        descriptiveName: row?.descriptiveName ?? `Account ${id}`,
        currencyCode: row?.currencyCode ?? "USD",
        timeZone: row?.timeZone ?? "UTC",
        isManager: Boolean(row?.manager),
      };
    }),
  );
  return hydrated
    .filter((r): r is PromiseFulfilledResult<GoogleAdsCustomer> => r.status === "fulfilled")
    .map((r) => r.value);
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

export interface GoogleAdsData {
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    avgCpc: number;
    conversions: number;
    conversionsValue: number;
    roas: number;
    currency: string;
  };
  comparison: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    avgCpc: number;
    conversions: number;
    conversionsValue: number;
  };
  topCampaigns: {
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  }[];
  dailyTrend: {
    date: string;
    spend: number;
    clicks: number;
    impressions: number;
  }[];
}

async function searchStream(accessToken: string, devToken: string, customerId: string, query: string, loginCustomerId?: string) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${accessToken}`,
    "developer-token": devToken,
    "content-type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;

  const res = await fetch(`${GADS_API_BASE}/customers/${customerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`gads_query_failed: ${text.slice(0, 500)}`);
  }
  const json = (await res.json()) as Array<{ results?: Array<Record<string, unknown>> }>;
  const results: Array<Record<string, unknown>> = [];
  for (const chunk of json) {
    if (Array.isArray(chunk.results)) results.push(...chunk.results);
  }
  return results;
}

function microsToNumber(v: unknown): number {
  return Number(v ?? 0) / 1_000_000;
}

export async function fetchGoogleAdsData(
  dataSourceId: string,
  startDate: Date,
  endDate: Date,
): Promise<GoogleAdsData> {
  const devToken = requireDevToken();
  const accessToken = await getFreshAccessToken(dataSourceId);
  const ds = await prisma.dataSource.findUniqueOrThrow({ where: { id: dataSourceId } });
  const customerId = ds.externalId;
  const metadata = (ds.metadata as { currency?: string; loginCustomerId?: string } | null) ?? null;
  const currency = metadata?.currency ?? "USD";
  const loginCustomerId = metadata?.loginCustomerId;

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const periodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
  const compStart = new Date(startDate.getTime() - periodDays * 86_400_000);
  const compEnd = new Date(startDate.getTime() - 86_400_000);

  const totalsQ = `SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.conversions_value FROM customer WHERE segments.date BETWEEN '${fmt(startDate)}' AND '${fmt(endDate)}'`;
  const compQ = `SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.conversions_value FROM customer WHERE segments.date BETWEEN '${fmt(compStart)}' AND '${fmt(compEnd)}'`;
  const campaignsQ = `SELECT campaign.name, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.conversions FROM campaign WHERE segments.date BETWEEN '${fmt(startDate)}' AND '${fmt(endDate)}' ORDER BY metrics.cost_micros DESC LIMIT 10`;
  const dailyQ = `SELECT segments.date, metrics.cost_micros, metrics.clicks, metrics.impressions FROM customer WHERE segments.date BETWEEN '${fmt(startDate)}' AND '${fmt(endDate)}' ORDER BY segments.date`;

  const [totalRows, compRows, campaignRows, dailyRows] = await Promise.all([
    searchStream(accessToken, devToken, customerId, totalsQ, loginCustomerId),
    searchStream(accessToken, devToken, customerId, compQ, loginCustomerId),
    searchStream(accessToken, devToken, customerId, campaignsQ, loginCustomerId),
    searchStream(accessToken, devToken, customerId, dailyQ, loginCustomerId),
  ]);

  const pickMetrics = (row: Record<string, unknown>) => (row.metrics ?? {}) as Record<string, unknown>;

  const sumMicros = (rows: Array<Record<string, unknown>>, key: string) =>
    rows.reduce((sum, r) => sum + Number(pickMetrics(r)[key] ?? 0), 0);
  const sumNumber = (rows: Array<Record<string, unknown>>, key: string) =>
    rows.reduce((sum, r) => sum + Number(pickMetrics(r)[key] ?? 0), 0);

  const spend = sumMicros(totalRows, "costMicros") / 1_000_000;
  const impressions = sumNumber(totalRows, "impressions");
  const clicks = sumNumber(totalRows, "clicks");
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const avgCpc = clicks > 0 ? spend / clicks : 0;
  const conversions = sumNumber(totalRows, "conversions");
  const conversionsValue = sumNumber(totalRows, "conversionsValue");
  const roas = spend > 0 ? conversionsValue / spend : 0;

  const compSpend = sumMicros(compRows, "costMicros") / 1_000_000;
  const compImpressions = sumNumber(compRows, "impressions");
  const compClicks = sumNumber(compRows, "clicks");

  await prisma.dataSource.update({ where: { id: dataSourceId }, data: { lastSyncedAt: new Date() } });

  return {
    totals: {
      spend,
      impressions,
      clicks,
      ctr,
      avgCpc,
      conversions,
      conversionsValue,
      roas,
      currency,
    },
    comparison: {
      spend: compSpend,
      impressions: compImpressions,
      clicks: compClicks,
      ctr: compImpressions > 0 ? compClicks / compImpressions : 0,
      avgCpc: compClicks > 0 ? compSpend / compClicks : 0,
      conversions: sumNumber(compRows, "conversions"),
      conversionsValue: sumNumber(compRows, "conversionsValue"),
    },
    topCampaigns: campaignRows.map((r) => {
      const m = pickMetrics(r);
      const c = (r.campaign ?? {}) as Record<string, unknown>;
      return {
        name: String(c.name ?? "(unnamed)"),
        spend: microsToNumber(m.costMicros),
        impressions: Number(m.impressions ?? 0),
        clicks: Number(m.clicks ?? 0),
        ctr: Number(m.ctr ?? 0),
        conversions: Number(m.conversions ?? 0),
      };
    }),
    dailyTrend: dailyRows.map((r) => {
      const m = pickMetrics(r);
      const segments = (r.segments ?? {}) as Record<string, unknown>;
      return {
        date: String(segments.date ?? ""),
        spend: microsToNumber(m.costMicros),
        clicks: Number(m.clicks ?? 0),
        impressions: Number(m.impressions ?? 0),
      };
    }),
  };
}

export async function saveGoogleAdsDataSource(input: {
  workspaceId: string;
  clientId: string | null;
  customerId: string;
  name: string;
  currency: string;
  loginCustomerId?: string;
  accessToken: string;
  refreshToken: string | null;
  expiryDate: number | null;
  scopes: string[];
}): Promise<{ id: string }> {
  const existing = await prisma.dataSource.findFirst({
    where: { workspaceId: input.workspaceId, type: "GOOGLE_ADS", externalId: input.customerId },
  });
  const payload = {
    accessToken: encrypt(input.accessToken),
    refreshToken: input.refreshToken ? encrypt(input.refreshToken) : null,
    tokenExpiresAt: input.expiryDate ? new Date(input.expiryDate) : null,
    scopes: input.scopes,
    isActive: true,
    clientId: input.clientId,
    name: input.name,
    metadata: { currency: input.currency, loginCustomerId: input.loginCustomerId ?? null },
  };
  if (existing) {
    const updated = await prisma.dataSource.update({ where: { id: existing.id }, data: payload });
    return { id: updated.id };
  }
  const ds = await prisma.dataSource.create({
    data: {
      workspaceId: input.workspaceId,
      type: "GOOGLE_ADS",
      externalId: input.customerId,
      ...payload,
    },
  });
  return { id: ds.id };
}

// Suppress unused warnings on imports
export const _google_ads_env_hint = () => [env.core(), google];
