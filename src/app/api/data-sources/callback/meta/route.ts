import { NextRequest, NextResponse } from "next/server";
import { exchangeMetaCode, swapForLongLivedToken, listAdAccounts } from "@/lib/meta-ads";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";
import { assertCanConnectIntegration } from "@/lib/plan-limits";

interface OAuthState {
  userId: string;
  workspaceId: string;
  clientId: string | null;
}

function classify(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/meta_not_configured/i.test(msg)) return "meta_not_configured";
  if (/meta_token_exchange_failed/i.test(msg)) return "meta_token_exchange_failed";
  if (/meta_long_lived_swap_failed/i.test(msg)) return "meta_long_lived_swap_failed";
  if (/meta_list_adaccounts_failed/i.test(msg)) return "meta_api_denied";
  if (/access_denied|user_denied/i.test(msg)) return "access_denied";
  return "meta_error";
}

export async function GET(req: NextRequest) {
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const errorReason = req.nextUrl.searchParams.get("error_reason");

  if (error || errorReason) {
    return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(errorReason ?? error ?? "access_denied")}`);
  }
  if (!code || !state) return NextResponse.redirect(`${appUrl}/integrations?error=missing_params`);

  try {
    const raw = await redis().get(`oauth:meta:${state}`);
    if (!raw) return NextResponse.redirect(`${appUrl}/integrations?error=expired_state`);
    const oauthState: OAuthState = typeof raw === "string" ? JSON.parse(raw) : (raw as OAuthState);
    await redis().del(`oauth:meta:${state}`);

    try {
      await assertCanConnectIntegration(oauthState.workspaceId, oauthState.userId);
    } catch {
      return NextResponse.redirect(`${appUrl}/integrations?error=plan_limit`);
    }

    const redirectUri = `${appUrl}/api/data-sources/callback/meta`;
    const short = await exchangeMetaCode(redirectUri, code);
    const long = await swapForLongLivedToken(short.access_token);

    const expiresIn = long.expires_in ?? 60 * 24 * 60 * 60; // default 60 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const accounts = await listAdAccounts(long.access_token);
    const activeAccounts = accounts.filter((a) => a.status === 1 || a.status === 2); // 1=ACTIVE, 2=DISABLED but visible

    if (accounts.length === 0) {
      return NextResponse.redirect(`${appUrl}/integrations?error=no_ad_accounts`);
    }

    const stashKey = `oauth:meta:pending:${oauthState.userId}`;
    await redis().set(
      stashKey,
      JSON.stringify({
        accessToken: long.access_token,
        expiresAt: expiresAt.toISOString(),
        scopes: ["ads_read"],
        clientId: oauthState.clientId,
        workspaceId: oauthState.workspaceId,
        accounts: (activeAccounts.length ? activeAccounts : accounts),
      }),
      { ex: 600 },
    );

    const pool = activeAccounts.length ? activeAccounts : accounts;
    if (pool.length === 1) {
      return NextResponse.redirect(
        `${appUrl}/api/data-sources/connect/meta/finalize?accountId=${encodeURIComponent(pool[0].accountId)}`,
      );
    }

    return NextResponse.redirect(`${appUrl}/integrations/select-ad-account`);
  } catch (err) {
    console.error("[meta-callback] unhandled:", err);
    return NextResponse.redirect(`${appUrl}/integrations?error=${classify(err)}`);
  }
}
