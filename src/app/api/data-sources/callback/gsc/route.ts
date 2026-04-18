import { NextRequest, NextResponse } from "next/server";
import { exchangeGscCode, listSites } from "@/lib/gsc";
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

  const raw = await redis().get(`oauth:gsc:${state}`);
  if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=expired_state`);
  const oauthState: OAuthState = typeof raw === "string" ? JSON.parse(raw) : (raw as OAuthState);
  await redis().del(`oauth:gsc:${state}`);

  try {
    await assertCanConnectIntegration(oauthState.workspaceId, oauthState.userId);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=plan_limit`);
  }

  const redirectUri = `${appUrl}/api/data-sources/callback/gsc`;
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

export async function saveGSCDataSource(
  userId: string,
  siteUrl: string,
): Promise<{ id: string } | { error: string }> {
  const stashKey = `oauth:gsc:pending:${userId}`;
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
    sites: { siteUrl: string; permissionLevel: string }[];
  };
  const site = stash.sites.find((p) => p.siteUrl === siteUrl);
  if (!site) return { error: "site_not_found" };

  await redis().del(stashKey);

  const existing = await prisma.dataSource.findFirst({
    where: { workspaceId: stash.workspaceId, type: "GOOGLE_SEARCH_CONSOLE", externalId: site.siteUrl },
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
      type: "GOOGLE_SEARCH_CONSOLE",
      name: site.siteUrl,
      externalId: site.siteUrl,
      accessToken: encrypt(stash.accessToken),
      refreshToken: stash.refreshToken ? encrypt(stash.refreshToken) : null,
      tokenExpiresAt: stash.expiryDate ? new Date(stash.expiryDate) : null,
      scopes: stash.scopes,
      metadata: { permissionLevel: site.permissionLevel },
    },
  });
  return { id: ds.id };
}
