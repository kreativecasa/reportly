"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DataSource {
  id: string;
  type: string;
  name: string;
  clientName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
}

interface Client {
  id: string;
  name: string;
}

type IntegrationType = "GOOGLE_ANALYTICS_4" | "GOOGLE_SEARCH_CONSOLE" | "GOOGLE_ADS" | "META_ADS";

interface IntegrationDef {
  type: IntegrationType;
  label: string;
  available: boolean;
  description: string;
  connectPath?: string;
}

function buildCatalog(metaConfigured: boolean, gadsConfigured: boolean): IntegrationDef[] {
  return [
    {
      type: "GOOGLE_ANALYTICS_4",
      label: "Google Analytics 4",
      available: true,
      description: "Sessions, users, pages, sources, conversions.",
      connectPath: "/api/data-sources/connect/ga4",
    },
    {
      type: "GOOGLE_SEARCH_CONSOLE",
      label: "Google Search Console",
      available: true,
      description: "Clicks, impressions, top queries, CTR, and position.",
      connectPath: "/api/data-sources/connect/gsc",
    },
    {
      type: "GOOGLE_ADS",
      label: "Google Ads",
      available: gadsConfigured,
      description: "Spend, conversions, ROAS, and top campaigns.",
      connectPath: gadsConfigured ? "/api/data-sources/connect/google-ads" : undefined,
    },
    {
      type: "META_ADS",
      label: "Meta Ads",
      available: metaConfigured,
      description: "Facebook + Instagram ad spend, reach, conversions.",
      connectPath: metaConfigured ? "/api/data-sources/connect/meta" : undefined,
    },
  ];
}

export function IntegrationsClient({
  dataSources,
  clients,
  metaConfigured,
  gadsConfigured,
}: {
  dataSources: DataSource[];
  clients: Client[];
  metaConfigured: boolean;
  gadsConfigured: boolean;
}) {
  const AVAILABLE = buildCatalog(metaConfigured, gadsConfigured);
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [requesting, setRequesting] = useState<string | null>(null);

  function connect(integration: IntegrationDef) {
    if (!integration.connectPath) return;
    const params = new URLSearchParams();
    if (selectedClientId) params.set("clientId", selectedClientId);
    window.location.href = `${integration.connectPath}?${params.toString()}`;
  }

  async function requestEarlyAccess(type: string) {
    setRequesting(type);
    const res = await fetch("/api/integrations/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setRequesting(null);
    if (res.ok) {
      setRequested((p) => ({ ...p, [type]: true }));
    }
  }

  async function disconnect(id: string) {
    if (!confirm("Disconnect this integration? You can reconnect anytime.")) return;
    await fetch(`/api/data-sources/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const connectReconnectPath = (type: string) =>
    AVAILABLE.find((i) => i.type === type)?.connectPath ?? "/api/data-sources/connect/ga4";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Available integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE.map((integration) => (
            <div key={integration.type} className="stappli-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold">{integration.label}</h3>
                {integration.available ? (
                  <span className="stappli-badge-active">Available</span>
                ) : (
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    Early access
                  </span>
                )}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{integration.description}</p>
              {integration.available ? (
                <div className="space-y-3">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="stappli-input"
                  >
                    <option value="">All clients (default)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => connect(integration)} className="stappli-button-primary w-full">
                    Connect
                  </button>
                </div>
              ) : requested[integration.type] ? (
                <button disabled className="stappli-button-ghost w-full">
                  Requested — we&apos;ll email you
                </button>
              ) : (
                <button
                  onClick={() => requestEarlyAccess(integration.type)}
                  disabled={requesting === integration.type}
                  className="stappli-button-ghost w-full"
                >
                  {requesting === integration.type ? "Saving..." : "Request early access"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Connected sources</h2>
        {dataSources.length === 0 ? (
          <div className="stappli-card p-8 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              You haven&apos;t connected any data sources yet.
            </p>
          </div>
        ) : (
          <div className="stappli-card divide-y divide-[hsl(var(--border))]">
            {dataSources.map((ds) => (
              <div key={ds.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">{ds.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {ds.type.replace(/_/g, " ")}
                    {ds.clientName && ` · ${ds.clientName}`}
                    {ds.lastSyncedAt && ` · synced ${new Date(ds.lastSyncedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {ds.isActive ? (
                    <span className="stappli-badge-active">Active</span>
                  ) : (
                    <button
                      onClick={() => (window.location.href = connectReconnectPath(ds.type))}
                      className="stappli-button-ghost"
                    >
                      Reconnect
                    </button>
                  )}
                  <button onClick={() => disconnect(ds.id)} className="text-sm text-[hsl(var(--destructive))] hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
