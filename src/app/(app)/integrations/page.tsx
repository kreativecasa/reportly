import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { IntegrationsClient } from "./integrations-client";
import { metaAdsConfigured } from "@/lib/meta-ads";
import { googleAdsConfigured } from "@/lib/google-ads";
import Icon from "@mdi/react";
import { mdiCheckCircle, mdiInformationOutline } from "@mdi/js";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const [dataSources, clients] = await Promise.all([
    prisma.dataSource.findMany({
      where: { workspaceId: workspace.id },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ where: { workspaceId: workspace.id, isArchived: false }, select: { id: true, name: true } }),
  ]);

  const { connected, error } = await searchParams;

  const ERROR_COPY: Record<string, { title: string; body: string }> = {
    gsc_api_disabled: {
      title: "Search Console API isn't enabled yet",
      body: "Go to the Google Cloud project behind your OAuth client and enable the Search Console API, then try again. https://console.cloud.google.com/apis/library/searchconsole.googleapis.com",
    },
    ga4_api_disabled: {
      title: "Google Analytics Admin API isn't enabled yet",
      body: "Enable it at https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com and retry.",
    },
    access_denied: {
      title: "Access was denied",
      body: "You cancelled the Google consent screen. Click Connect to try again.",
    },
    expired_state: {
      title: "This connection request expired",
      body: "OAuth flows are valid for 10 minutes. Click Connect to start fresh.",
    },
    no_properties: {
      title: "No Analytics properties found",
      body: "The Google account you signed in with doesn't have any GA4 properties. Try a different account or create a property first.",
    },
    no_sites: {
      title: "No Search Console sites found",
      body: "The Google account you signed in with has no verified sites in Search Console. Verify a site at https://search.google.com/search-console and try again.",
    },
    no_ad_accounts: {
      title: "No Meta Ads accounts found",
      body: "The Facebook account you signed in with doesn't have any ad accounts, or didn't grant the ads_read permission. Re-authorize and make sure to allow access to your ad accounts.",
    },
    no_ad_customers: {
      title: "No Google Ads accounts found",
      body: "The Google account you signed in with doesn't have access to any Google Ads customer. Sign in with the account that has access and retry.",
    },
    gads_not_configured: {
      title: "Google Ads isn't configured yet",
      body: "The app owner needs to set GOOGLE_ADS_DEVELOPER_TOKEN in Vercel before Google Ads can be connected. Apply for a developer token at https://ads.google.com/home/tools/manager-accounts/",
    },
    gads_api_disabled: {
      title: "Google Ads API isn't enabled",
      body: "Enable the Google Ads API in your Google Cloud project: https://console.cloud.google.com/apis/library/googleads.googleapis.com and retry.",
    },
    gads_dev_token_invalid: {
      title: "Google Ads developer token is invalid",
      body: "The configured token was rejected by Google. Check the token is correct in Vercel env and that the token's Manager account has access to the customer you're trying to connect.",
    },
    gads_api_error: {
      title: "Google Ads API returned an error",
      body: "Something went wrong talking to Google Ads. If it persists, verify your developer token is approved for Basic access (not Test-only).",
    },
    meta_not_configured: {
      title: "Meta Ads isn't configured yet",
      body: "The app owner needs to set the META_APP_ID and META_APP_SECRET env vars in Vercel before Meta Ads can be connected.",
    },
    meta_token_exchange_failed: {
      title: "Meta token exchange failed",
      body: "Double-check the Valid OAuth Redirect URI in your Facebook app matches /api/data-sources/callback/meta exactly.",
    },
    meta_long_lived_swap_failed: {
      title: "Couldn't upgrade Meta access token",
      body: "Retry the connection. If the problem persists, verify the Facebook App Secret is correct in Vercel.",
    },
    meta_api_denied: {
      title: "Meta denied ads_read access",
      body: "For users who aren't admins of the Facebook app, ads_read requires App Review. In the meantime, add the Facebook account as a tester under your app's Roles page.",
    },
    meta_error: {
      title: "Meta connection failed",
      body: "Something went wrong talking to Facebook. Try again; if it keeps happening, contact support.",
    },
    plan_limit: {
      title: "Plan integration limit reached",
      body: "Upgrade your plan to add more data sources.",
    },
    rate_limited: {
      title: "Too many attempts",
      body: "Slow down a little and try again in a minute.",
    },
  };
  const errCopy = error ? ERROR_COPY[error] : null;

  return (
    <>
      <div className="mb-8">
        <h1 className="stappli-title">Integrations</h1>
        <p className="stappli-subtitle mt-1">Connect your data sources to auto-fill reports.</p>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white px-5 py-4 mb-8 flex items-start gap-3">
        <span className="h-7 w-7 rounded-lg bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon path={mdiInformationOutline} size={0.7} />
        </span>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          <p className="text-[hsl(var(--foreground))] font-medium mb-1">How integrations work</p>
          Reportly connects to each client&apos;s analytics via OAuth — no passwords or copy-paste. When you generate a report, Claude fetches the latest 30-day metrics from every connected source and writes the narrative. You can attach one source to all clients, or a dedicated source per client.
        </div>
      </div>

      {connected && (
        <div className="stappli-card p-4 mb-6 border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900 flex items-center gap-1.5">
            <Icon path={mdiCheckCircle} size={0.65} />
            Integration connected successfully.
          </p>
        </div>
      )}
      {error && (
        <div className="stappli-card p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-sm font-bold text-red-900">
            {errCopy?.title ?? "Connection failed"}
          </p>
          <p className="text-sm text-red-900/90 mt-1 break-words">
            {errCopy?.body ?? `Error code: ${error}. Try again, or contact support if it keeps happening.`}
          </p>
        </div>
      )}

      <IntegrationsClient
        dataSources={dataSources.map((ds) => ({
          id: ds.id,
          type: ds.type,
          name: ds.name,
          clientName: ds.client?.name ?? null,
          isActive: ds.isActive,
          lastSyncedAt: ds.lastSyncedAt?.toISOString() ?? null,
        }))}
        clients={clients}
        metaConfigured={metaAdsConfigured()}
        gadsConfigured={googleAdsConfigured()}
      />
    </>
  );
}
