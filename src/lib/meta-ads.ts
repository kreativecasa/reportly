import { env } from "./env";
import { decrypt, encrypt } from "./crypto";
import { prisma } from "./prisma";

const META_GRAPH_API = "https://graph.facebook.com/v20.0";
const META_OAUTH_URL = "https://www.facebook.com/v20.0/dialog/oauth";

export function metaAdsConfigured(): boolean {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

function requireMetaEnv() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("meta_not_configured");
  }
  return { appId, appSecret };
}

export function metaAdsAuthUrl(redirectUri: string, state: string): string {
  const { appId } = requireMetaEnv();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: "ads_read,business_management",
    response_type: "code",
    auth_type: "rerequest",
  });
  return `${META_OAUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export async function exchangeMetaCode(redirectUri: string, code: string): Promise<TokenResponse> {
  const { appId, appSecret } = requireMetaEnv();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${META_GRAPH_API}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`meta_token_exchange_failed: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function swapForLongLivedToken(shortLivedToken: string): Promise<TokenResponse> {
  const { appId, appSecret } = requireMetaEnv();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${META_GRAPH_API}/oauth/access_token?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`meta_long_lived_swap_failed: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as TokenResponse;
}

export interface AdAccount {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  status: number;
}

export async function listAdAccounts(accessToken: string): Promise<AdAccount[]> {
  const url = `${META_GRAPH_API}/me/adaccounts?fields=id,account_id,name,currency,account_status&limit=100&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`meta_list_adaccounts_failed: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { data: Array<{ id: string; account_id: string; name: string; currency: string; account_status: number }> };
  return (json.data ?? []).map((a) => ({
    id: a.id,
    accountId: a.account_id,
    name: a.name,
    currency: a.currency,
    status: a.account_status,
  }));
}

async function ensureActiveToken(dataSourceId: string): Promise<string> {
  const ds = await prisma.dataSource.findUnique({ where: { id: dataSourceId } });
  if (!ds) throw new Error("data_source_not_found");
  if (!ds.accessToken) throw new Error("no_access_token");
  // Meta long-lived tokens last 60 days. If expired or close to expiring, reconnect required.
  if (ds.tokenExpiresAt && ds.tokenExpiresAt.getTime() < Date.now() + 24 * 60 * 60 * 1000) {
    await prisma.dataSource.update({ where: { id: ds.id }, data: { isActive: false } });
    throw new Error("meta_token_expired_reconnect_required");
  }
  return decrypt(ds.accessToken);
}

export interface MetaAdsData {
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    currency: string;
  };
  comparison: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
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

async function fetchInsights(
  accessToken: string,
  accountId: string,
  startDate: string,
  endDate: string,
  dimensions: { level?: string; breakdowns?: string[]; time_increment?: string | number } = {},
): Promise<Array<Record<string, string>>> {
  const params = new URLSearchParams({
    access_token: accessToken,
    time_range: JSON.stringify({ since: startDate, until: endDate }),
    fields: "spend,impressions,clicks,ctr,cpc,actions,campaign_name,date_start",
    limit: "100",
  });
  if (dimensions.level) params.set("level", dimensions.level);
  if (dimensions.time_increment) params.set("time_increment", String(dimensions.time_increment));

  const url = `${META_GRAPH_API}/act_${accountId}/insights?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`meta_insights_failed: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { data: Array<Record<string, string>> };
  return json.data ?? [];
}

function sumConversions(actions: string | undefined | Array<{ action_type: string; value: string }>): number {
  if (!actions) return 0;
  const list = typeof actions === "string" ? safeJsonArray(actions) : actions;
  return list
    .filter((a) => /purchase|complete_registration|lead|subscribe/i.test(a.action_type))
    .reduce((sum, a) => sum + Number(a.value ?? 0), 0);
}

function safeJsonArray(s: string): Array<{ action_type: string; value: string }> {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchMetaAdsData(
  dataSourceId: string,
  startDate: Date,
  endDate: Date,
): Promise<MetaAdsData> {
  const accessToken = await ensureActiveToken(dataSourceId);
  const ds = await prisma.dataSource.findUniqueOrThrow({ where: { id: dataSourceId } });
  const accountId = ds.externalId;
  const currency = (ds.metadata as { currency?: string } | null)?.currency ?? "USD";

  const periodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
  const compStart = new Date(startDate.getTime() - periodDays * 86_400_000);
  const compEnd = new Date(startDate.getTime() - 86_400_000);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [totalRows, compRows, campaignRows, dailyRows] = await Promise.all([
    fetchInsights(accessToken, accountId, fmt(startDate), fmt(endDate), { level: "account" }),
    fetchInsights(accessToken, accountId, fmt(compStart), fmt(compEnd), { level: "account" }),
    fetchInsights(accessToken, accountId, fmt(startDate), fmt(endDate), { level: "campaign" }),
    fetchInsights(accessToken, accountId, fmt(startDate), fmt(endDate), { level: "account", time_increment: 1 }),
  ]);

  const total = totalRows[0] ?? {};
  const cmp = compRows[0] ?? {};

  const num = (v: unknown) => Number(v ?? 0);

  await prisma.dataSource.update({ where: { id: dataSourceId }, data: { lastSyncedAt: new Date() } });

  return {
    totals: {
      spend: num(total.spend),
      impressions: num(total.impressions),
      clicks: num(total.clicks),
      ctr: num(total.ctr),
      cpc: num(total.cpc),
      conversions: sumConversions(total.actions),
      currency,
    },
    comparison: {
      spend: num(cmp.spend),
      impressions: num(cmp.impressions),
      clicks: num(cmp.clicks),
      ctr: num(cmp.ctr),
      cpc: num(cmp.cpc),
      conversions: sumConversions(cmp.actions),
    },
    topCampaigns: campaignRows
      .map((r) => ({
        name: r.campaign_name ?? "(unnamed)",
        spend: num(r.spend),
        impressions: num(r.impressions),
        clicks: num(r.clicks),
        ctr: num(r.ctr),
        conversions: sumConversions(r.actions),
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10),
    dailyTrend: dailyRows.map((r) => ({
      date: r.date_start ?? "",
      spend: num(r.spend),
      clicks: num(r.clicks),
      impressions: num(r.impressions),
    })),
  };
}

export async function saveMetaAdsDataSource(input: {
  workspaceId: string;
  clientId: string | null;
  accountId: string;
  name: string;
  currency: string;
  accessToken: string;
  expiresAt: Date | null;
  scopes: string[];
}): Promise<{ id: string }> {
  const existing = await prisma.dataSource.findFirst({
    where: { workspaceId: input.workspaceId, type: "META_ADS", externalId: input.accountId },
  });
  if (existing) {
    const updated = await prisma.dataSource.update({
      where: { id: existing.id },
      data: {
        accessToken: encrypt(input.accessToken),
        tokenExpiresAt: input.expiresAt,
        scopes: input.scopes,
        isActive: true,
        clientId: input.clientId,
        name: input.name,
        metadata: { currency: input.currency },
      },
    });
    return { id: updated.id };
  }
  const ds = await prisma.dataSource.create({
    data: {
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      type: "META_ADS",
      name: input.name,
      externalId: input.accountId,
      accessToken: encrypt(input.accessToken),
      tokenExpiresAt: input.expiresAt,
      scopes: input.scopes,
      metadata: { currency: input.currency },
    },
  });
  return { id: ds.id };
}

// Suppress unused warnings on env export
export const _envHintForMetaAds = () => env.core();
