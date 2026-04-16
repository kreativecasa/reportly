import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireWorkspace } from "@/lib/auth-guard";
import { ga4AuthUrl } from "@/lib/ga4";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { session, workspace } = await requireWorkspace();
    const clientId = req.nextUrl.searchParams.get("clientId");
    const state = randomBytes(16).toString("hex");

    await redis().set(
      `oauth:ga4:${state}`,
      JSON.stringify({ userId: session.user.id, workspaceId: workspace.id, clientId }),
      { ex: 600 },
    );

    const redirectUri = `${env.core().NEXT_PUBLIC_APP_URL}/api/data-sources/callback/ga4`;
    return NextResponse.redirect(ga4AuthUrl(redirectUri, state));
  } catch (err) {
    console.error("ga4 connect error:", err);
    return NextResponse.redirect(new URL("/integrations?error=ga4_connect_failed", req.url));
  }
}
