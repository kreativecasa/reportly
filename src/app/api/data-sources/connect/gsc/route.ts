import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireWorkspace } from "@/lib/auth-guard";
import { gscAuthUrl } from "@/lib/gsc";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { session, workspace } = await requireWorkspace();
    const clientId = req.nextUrl.searchParams.get("clientId");
    const state = randomBytes(16).toString("hex");

    await redis().set(
      `oauth:gsc:${state}`,
      JSON.stringify({ userId: session.user.id, workspaceId: workspace.id, clientId }),
      { ex: 600 },
    );

    const redirectUri = `${env.core().NEXT_PUBLIC_APP_URL}/api/data-sources/callback/gsc`;
    return NextResponse.redirect(gscAuthUrl(redirectUri, state));
  } catch (err) {
    console.error("gsc connect error:", err);
    return NextResponse.redirect(new URL("/integrations?error=gsc_connect_failed", req.url));
  }
}
