import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, listProperties } from "@/lib/ga4";
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

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(error)}`);
  if (!code || !state) return NextResponse.redirect(`${appUrl}/integrations?error=missing_params`);

  const raw = await redis().get(`oauth:ga4:${state}`);
  if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=expired_state`);
  const oauthState: OAuthState = typeof raw === "string" ? JSON.parse(raw) : (raw as OAuthState);
  await redis().del(`oauth:ga4:${state}`);

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

  // Stash tokens + properties for property-selection step
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

  // If only one property, auto-select
  if (properties.length === 1) {
    return NextResponse.redirect(
      `${appUrl}/api/data-sources/connect/ga4/finalize?propertyId=${properties[0].propertyId}`,
    );
  }

  return NextResponse.redirect(`${appUrl}/integrations/select-property`);
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
