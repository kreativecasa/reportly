import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { env } from "@/lib/env";
import { ratelimit, redis } from "@/lib/redis";
import { saveGoogleAdsDataSource } from "@/lib/google-ads";

interface Stash {
  accessToken: string;
  refreshToken: string | null;
  expiryDate: number | null;
  scopes: string[];
  clientId: string | null;
  workspaceId: string;
  customers: { customerId: string; descriptiveName: string; currencyCode: string; timeZone: string; isManager: boolean }[];
}

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    const session = await requireSession();

    try {
      const { success } = await ratelimit("ga4Finalize").limit(`gads-finalize:${session.user.id}`);
      if (!success) return NextResponse.redirect(`${appUrl}/integrations?error=rate_limited`);
    } catch {
      // Redis unavailable — skip rate limiting
    }

    const customerId = req.nextUrl.searchParams.get("customerId");
    const loginCustomerId = req.nextUrl.searchParams.get("loginCustomerId") ?? undefined;
    if (!customerId) return NextResponse.redirect(`${appUrl}/integrations?error=missing_customer`);

    const raw = await redis().get(`oauth:gads:pending:${session.user.id}`);
    if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=session_expired`);
    const stash = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;
    await redis().del(`oauth:gads:pending:${session.user.id}`);

    const customer = stash.customers.find((c) => c.customerId === customerId);
    if (!customer) return NextResponse.redirect(`${appUrl}/integrations?error=customer_not_found`);

    await saveGoogleAdsDataSource({
      workspaceId: stash.workspaceId,
      clientId: stash.clientId,
      customerId: customer.customerId,
      name: customer.descriptiveName,
      currency: customer.currencyCode,
      loginCustomerId,
      accessToken: stash.accessToken,
      refreshToken: stash.refreshToken,
      expiryDate: stash.expiryDate,
      scopes: stash.scopes,
    });

    return NextResponse.redirect(`${appUrl}/integrations?connected=gads`);
  } catch (err) {
    console.error("[gads-finalize]", err);
    return NextResponse.redirect(`${appUrl}/integrations?error=finalize_failed`);
  }
}
