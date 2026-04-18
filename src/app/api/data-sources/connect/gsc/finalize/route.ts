import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { saveGSCDataSource } from "../../../callback/gsc/route";
import { env } from "@/lib/env";
import { ratelimit } from "@/lib/redis";

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
