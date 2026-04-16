"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  workspace: { id: string; name: string; brandColor: string; logoUrl: string | null };
  user: { email: string; name: string };
}

export function SettingsForm({ workspace, user }: Props) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [brandColor, setBrandColor] = useState(workspace.brandColor);
  const [logoUrl, setLogoUrl] = useState(workspace.logoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, brandColor, logoUrl: logoUrl || null }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) {
      setMsg(json.error?.message ?? "Save failed");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="stappli-card p-6 space-y-5">
        <h2 className="text-lg font-bold">Workspace</h2>
        <Field label="Workspace name">
          <input className="stappli-input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Brand color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-11 w-16 rounded-xl border border-[hsl(var(--border))] cursor-pointer"
            />
            <input className="stappli-input flex-1" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
          </div>
        </Field>
        <Field label="Logo URL">
          <input className="stappli-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Used on client-facing reports and emails.</p>
        </Field>
        {msg && <p className="text-sm text-[hsl(var(--muted-foreground))]">{msg}</p>}
        <button onClick={save} disabled={saving} className="stappli-button-primary">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="stappli-card p-6">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">Name</dt>
            <dd className="font-medium">{user.name || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[hsl(var(--muted-foreground))]">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
