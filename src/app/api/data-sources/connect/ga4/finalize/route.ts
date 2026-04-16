import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { saveGA4DataSource } from "../../../callback/ga4/route";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    const session = await requireSession();
    const propertyId = req.nextUrl.searchParams.get("propertyId");
    if (!propertyId) return NextResponse.redirect(`${appUrl}/integrations?error=missing_property`);
    const result = await saveGA4DataSource(session.user.id, propertyId);
    if ("error" in result) {
      return NextResponse.redirect(`${appUrl}/integrations?error=${result.error}`);
    }
    return NextResponse.redirect(`${appUrl}/integrations?connected=ga4`);
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=finalize_failed`);
  }
}
