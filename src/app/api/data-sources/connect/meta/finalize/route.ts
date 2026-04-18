import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { env } from "@/lib/env";
import { ratelimit, redis } from "@/lib/redis";
import { saveMetaAdsDataSource } from "@/lib/meta-ads";

interface Stash {
  accessToken: string;
  expiresAt: string;
  scopes: string[];
  clientId: string | null;
  workspaceId: string;
  accounts: { accountId: string; name: string; currency: string; status: number }[];
}

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  try {
    const session = await requireSession();

    try {
      const { success } = await ratelimit("ga4Finalize").limit(`meta-finalize:${session.user.id}`);
      if (!success) return NextResponse.redirect(`${appUrl}/integrations?error=rate_limited`);
    } catch {
      // Redis unavailable — skip rate limiting
    }

    const accountId = req.nextUrl.searchParams.get("accountId");
    if (!accountId) return NextResponse.redirect(`${appUrl}/integrations?error=missing_account`);

    const raw = await redis().get(`oauth:meta:pending:${session.user.id}`);
    if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=session_expired`);
    const stash = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;
    await redis().del(`oauth:meta:pending:${session.user.id}`);

    const account = stash.accounts.find((a) => a.accountId === accountId);
    if (!account) return NextResponse.redirect(`${appUrl}/integrations?error=account_not_found`);

    await saveMetaAdsDataSource({
      workspaceId: stash.workspaceId,
      clientId: stash.clientId,
      accountId: account.accountId,
      name: account.name,
      currency: account.currency,
      accessToken: stash.accessToken,
      expiresAt: stash.expiresAt ? new Date(stash.expiresAt) : null,
      scopes: stash.scopes,
    });

    return NextResponse.redirect(`${appUrl}/integrations?connected=meta`);
  } catch (err) {
    console.error("[meta-finalize]", err);
    return NextResponse.redirect(`${appUrl}/integrations?error=finalize_failed`);
  }
}
