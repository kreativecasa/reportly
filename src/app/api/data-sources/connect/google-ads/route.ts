import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireWorkspace } from "@/lib/auth-guard";
import { googleAdsAuthUrl, googleAdsConfigured } from "@/lib/google-ads";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    if (!googleAdsConfigured()) {
      return NextResponse.redirect(`${appUrl}/integrations?error=gads_not_configured`);
    }
    const { session, workspace } = await requireWorkspace();
    const clientId = req.nextUrl.searchParams.get("clientId");
    const state = randomBytes(16).toString("hex");

    await redis().set(
      `oauth:gads:${state}`,
      JSON.stringify({ userId: session.user.id, workspaceId: workspace.id, clientId }),
      { ex: 600 },
    );

    // Reuse the GA4 callback URI — already whitelisted in the Google Cloud OAuth client.
    const redirectUri = `${appUrl}/api/data-sources/callback/ga4`;
    return NextResponse.redirect(googleAdsAuthUrl(redirectUri, state));
  } catch (err) {
    console.error("gads connect error:", err);
    return NextResponse.redirect(`${appUrl}/integrations?error=gads_connect_failed`);
  }
}
