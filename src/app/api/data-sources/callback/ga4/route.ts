import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, listProperties } from "@/lib/ga4";
import { exchangeGscCode, listSites } from "@/lib/gsc";
import { exchangeGoogleAdsCode, listAccessibleCustomers } from "@/lib/google-ads";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { assertCanConnectIntegration } from "@/lib/plan-limits";

interface OAuthState {
  userId: string;
  workspaceId: string;
  clientId: string | null;
}

function classifyGoogleError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/searchconsole\.googleapis\.com|Search Console API has not been used|disabled/i.test(msg)) {
    return "gsc_api_disabled";
  }
  if (/analyticsadmin|Analytics Admin API has not been used/i.test(msg)) {
    return "ga4_api_disabled";
  }
  if (/googleads\.googleapis\.com|Google Ads API has not been used/i.test(msg)) return "gads_api_disabled";
  if (/developer.?token|DEVELOPER_TOKEN/i.test(msg)) return "gads_dev_token_invalid";
  if (/gads_list_failed|gads_query_failed/i.test(msg)) return "gads_api_error";
  if (/invalid_grant|invalid_request/i.test(msg)) return "invalid_auth_code";
  if (/access_denied/i.test(msg)) return "access_denied";
  return "google_error";
}

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(error)}`);
  if (!code || !state) return NextResponse.redirect(`${appUrl}/integrations?error=missing_params`);

  try {
    // The GA4 callback URL is reused for GSC and Google Ads. Dispatch by state-key prefix.
    const gscRaw = await redis().get(`oauth:gsc:${state}`);
    if (gscRaw) {
      const gscState: OAuthState = typeof gscRaw === "string" ? JSON.parse(gscRaw) : (gscRaw as OAuthState);
      await redis().del(`oauth:gsc:${state}`);
      return await handleGscCallback(gscState, code);
    }

    const gadsRaw = await redis().get(`oauth:gads:${state}`);
    if (gadsRaw) {
      const gadsState: OAuthState = typeof gadsRaw === "string" ? JSON.parse(gadsRaw) : (gadsRaw as OAuthState);
      await redis().del(`oauth:gads:${state}`);
      return await handleGoogleAdsCallback(gadsState, code);
    }

    const raw = await redis().get(`oauth:ga4:${state}`);
    if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=expired_state`);
    const oauthState: OAuthState = typeof raw === "string" ? JSON.parse(raw) : (raw as OAuthState);
    await redis().del(`oauth:ga4:${state}`);

    return await handleGa4Callback(oauthState, code);
  } catch (err) {
    console.error("[oauth-callback] unhandled error:", err);
    const code = classifyGoogleError(err);
    return NextResponse.redirect(`${appUrl}/integrations?error=${code}`);
  }
}

async function handleGa4Callback(oauthState: OAuthState, code: string) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;

  try {
    await assertCanConnectIntegration(oauthState.workspaceId, oauthState.userId);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=plan_limit`);
  }

  const redirectUri = `${appUrl}/api/data-sources/callback/ga4`;
  const tokens = await exchangeCode(redirectUri, code);
  if (!tokens.access_token) return NextResponse.redirect(`${appUrl}/integrations?error=no_access_token`);

  const properties = await listProperties(tokens.access_token);
  if (properties.length === 0) {
    return NextResponse.redirect(`${appUrl}/integrations?error=no_properties`);
  }

  const stashKey = `oauth:ga4:pending:${oauthState.userId}`;
  await redis().set(
    stashKey,
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      scopes: (tokens.scope ?? "").split(" ").filter(Boolean),
      clientId: oauthState.clientId,
      workspaceId: oauthState.workspaceId,
      properties,
    }),
    { ex: 600 },
  );

  if (properties.length === 1) {
    return NextResponse.redirect(
      `${appUrl}/api/data-sources/connect/ga4/finalize?propertyId=${properties[0].propertyId}`,
    );
  }

  return NextResponse.redirect(`${appUrl}/integrations/select-property`);
}

async function handleGoogleAdsCallback(oauthState: OAuthState, code: string) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;

  try {
    await assertCanConnectIntegration(oauthState.workspaceId, oauthState.userId);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=plan_limit`);
  }

  const redirectUri = `${appUrl}/api/data-sources/callback/ga4`;
  const tokens = await exchangeGoogleAdsCode(redirectUri, code);
  if (!tokens.access_token) return NextResponse.redirect(`${appUrl}/integrations?error=no_access_token`);

  const customers = await listAccessibleCustomers(tokens.access_token);
  if (customers.length === 0) {
    return NextResponse.redirect(`${appUrl}/integrations?error=no_ad_customers`);
  }

  const stashKey = `oauth:gads:pending:${oauthState.userId}`;
  await redis().set(
    stashKey,
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      scopes: (tokens.scope ?? "").split(" ").filter(Boolean),
      clientId: oauthState.clientId,
      workspaceId: oauthState.workspaceId,
      customers,
    }),
    { ex: 600 },
  );

  // Filter managers out of the auto-select (agencies will want a specific client account)
  const nonManagers = customers.filter((c) => !c.isManager);
  if (nonManagers.length === 1) {
    return NextResponse.redirect(
      `${appUrl}/api/data-sources/connect/google-ads/finalize?customerId=${encodeURIComponent(nonManagers[0].customerId)}`,
    );
  }

  return NextResponse.redirect(`${appUrl}/integrations/select-ad-customer`);
}

async function handleGscCallback(oauthState: OAuthState, code: string) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;

  try {
    await assertCanConnectIntegration(oauthState.workspaceId, oauthState.userId);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=plan_limit`);
  }

  const redirectUri = `${appUrl}/api/data-sources/callback/ga4`;
  const tokens = await exchangeGscCode(redirectUri, code);
  if (!tokens.access_token) return NextResponse.redirect(`${appUrl}/integrations?error=no_access_token`);

  const sites = await listSites(tokens.access_token);
  if (sites.length === 0) {
    return NextResponse.redirect(`${appUrl}/integrations?error=no_sites`);
  }

  const stashKey = `oauth:gsc:pending:${oauthState.userId}`;
  await redis().set(
    stashKey,
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      scopes: (tokens.scope ?? "").split(" ").filter(Boolean),
      clientId: oauthState.clientId,
      workspaceId: oauthState.workspaceId,
      sites,
    }),
    { ex: 600 },
  );

  if (sites.length === 1) {
    return NextResponse.redirect(
      `${appUrl}/api/data-sources/connect/gsc/finalize?siteUrl=${encodeURIComponent(sites[0].siteUrl)}`,
    );
  }

  return NextResponse.redirect(`${appUrl}/integrations/select-site`);
}

// Exported helper for finalize route
export async function saveGA4DataSource(
  userId: string,
  propertyId: string,
): Promise<{ id: string } | { error: string }> {
  const stashKey = `oauth:ga4:pending:${userId}`;
  const raw = await redis().get(stashKey);
  if (!raw) return { error: "session_expired" };
  const s = typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, unknown>);
  const stash = s as {
    accessToken: string;
    refreshToken: string | null;
    expiryDate: number | null;
    scopes: string[];
    clientId: string | null;
    workspaceId: string;
    properties: { propertyId: string; displayName: string }[];
  };
  const prop = stash.properties.find((p) => p.propertyId === propertyId);
  if (!prop) return { error: "property_not_found" };

  await redis().del(stashKey);

  const existing = await prisma.dataSource.findFirst({
    where: { workspaceId: stash.workspaceId, type: "GOOGLE_ANALYTICS_4", externalId: prop.propertyId },
  });
  if (existing) {
    const updated = await prisma.dataSource.update({
      where: { id: existing.id },
      data: {
        accessToken: encrypt(stash.accessToken),
        refreshToken: stash.refreshToken ? encrypt(stash.refreshToken) : null,
        tokenExpiresAt: stash.expiryDate ? new Date(stash.expiryDate) : null,
        scopes: stash.scopes,
        isActive: true,
        clientId: stash.clientId,
      },
    });
    return { id: updated.id };
  }

  const ds = await prisma.dataSource.create({
    data: {
      workspaceId: stash.workspaceId,
      clientId: stash.clientId,
      type: "GOOGLE_ANALYTICS_4",
      name: prop.displayName,
      externalId: prop.propertyId,
      accessToken: encrypt(stash.accessToken),
      refreshToken: stash.refreshToken ? encrypt(stash.refreshToken) : null,
      tokenExpiresAt: stash.expiryDate ? new Date(stash.expiryDate) : null,
      scopes: stash.scopes,
      metadata: { displayName: prop.displayName },
    },
  });
  return { id: ds.id };
}
