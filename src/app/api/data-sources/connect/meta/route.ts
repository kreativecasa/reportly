import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireWorkspace } from "@/lib/auth-guard";
import { metaAdsAuthUrl, metaAdsConfigured } from "@/lib/meta-ads";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    if (!metaAdsConfigured()) {
      return NextResponse.redirect(`${appUrl}/integrations?error=meta_not_configured`);
    }
    const { session, workspace } = await requireWorkspace();
    const clientId = req.nextUrl.searchParams.get("clientId");
    const state = randomBytes(16).toString("hex");

    await redis().set(
      `oauth:meta:${state}`,
      JSON.stringify({ userId: session.user.id, workspaceId: workspace.id, clientId }),
      { ex: 600 },
    );

    const redirectUri = `${appUrl}/api/data-sources/callback/meta`;
    return NextResponse.redirect(metaAdsAuthUrl(redirectUri, state));
  } catch (err) {
    console.error("meta connect error:", err);
    return NextResponse.redirect(`${appUrl}/integrations?error=meta_connect_failed`);
  }
}
