import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { env } from "@/lib/env";
import { ratelimit, redis } from "@/lib/redis";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

async function saveGSCDataSource(
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

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    const session = await requireSession();

    try {
      const { success } = await ratelimit("ga4Finalize").limit(`gsc-finalize:${session.user.id}`);
      if (!success) return NextResponse.redirect(`${appUrl}/integrations?error=rate_limited`);
    } catch {
      // Redis unavailable — skip rate limiting
    }

    const siteUrl = req.nextUrl.searchParams.get("siteUrl");
    if (!siteUrl) return NextResponse.redirect(`${appUrl}/integrations?error=missing_site`);
    const result = await saveGSCDataSource(session.user.id, siteUrl);
    if ("error" in result) {
      return NextResponse.redirect(`${appUrl}/integrations?error=${result.error}`);
    }
    return NextResponse.redirect(`${appUrl}/integrations?connected=gsc`);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=finalize_failed`);
  }
}
